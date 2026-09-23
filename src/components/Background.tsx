import { useEffect, useRef } from 'react'

const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]()=<>+-*/&|!?:;,.@#$%'

const BASE_LAYER = {
  enabled: true,
  threshold: 0.55,
  color: 'rgba(255, 249, 217, 0.9)',
} as const

const CURSOR_LAYER = {
  enabled: true,
  threshold: 0.4,
  color: 'rgba(197, 255, 219, 0.9)',
  cursorRadius: 100,
  trailFade: 0.05,
} as const

const VIDEO_FILTER = 'brightness(0.7) contrast(1) saturate(1)'
const FONT_SIZE = 6
const ROW_HEIGHT = 8

/**
 * ASCII overlay sampled from the background video luminance.
 * Media uses object-fit: cover so the frame fills the viewport evenly.
 */
export function Background() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const container = containerRef.current
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!container || !video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sampleCanvas = document.createElement('canvas')
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
    if (!sampleCtx) return

    const trailCanvas = document.createElement('canvas')
    const trailCtx = trailCanvas.getContext('2d')
    const cursorCanvas = document.createElement('canvas')
    const cursorCtx = cursorCanvas.getContext('2d')
    if (!trailCtx || !cursorCtx) return

    const pointer = { x: -1, y: -1 }
    let cursorEnergy = 0
    let cols = 0
    let rows = 0
    let viewWidth = 0
    let viewHeight = 0
    let fontsReady = false
    let disposed = false
    let frameHandle = 0
    let lastFrameTime = 0
    const supportsVideoFrameCallback = 'requestVideoFrameCallback' in HTMLVideoElement.prototype

    const resize = () => {
      viewWidth = container.clientWidth
      viewHeight = container.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(viewWidth * dpr)
      canvas.height = Math.round(viewHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const font = `${FONT_SIZE}px "Fragment Mono", ui-monospace, monospace`
      ctx.font = font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = BASE_LAYER.color
      const charWidth = Math.max(ctx.measureText('M').width, 1)
      cols = Math.max(Math.ceil(viewWidth / charWidth), 1)
      rows = Math.max(Math.ceil(viewHeight / ROW_HEIGHT), 1)
      sampleCanvas.width = cols
      sampleCanvas.height = rows

      if (CURSOR_LAYER.enabled) {
        cursorCanvas.width = canvas.width
        cursorCanvas.height = canvas.height
        cursorCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        cursorCtx.font = font
        cursorCtx.textBaseline = 'middle'
        cursorCtx.fillStyle = CURSOR_LAYER.color
        trailCanvas.width = Math.max(64, Math.round(0.25 * viewWidth))
        trailCanvas.height = Math.max(64, Math.round(0.25 * viewHeight))
      }
    }

    const render = () => {
      if (
        !viewWidth ||
        !viewHeight ||
        !fontsReady ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        return
      }

      const sourceWidth = video.videoWidth
      const sourceHeight = video.videoHeight
      if (!sourceWidth || !sourceHeight) return

      // Same cover crop as CSS object-fit: cover — fills the frame evenly.
      const coverScale = Math.max(viewWidth / sourceWidth, viewHeight / sourceHeight)
      const cropWidth = viewWidth / coverScale
      const cropHeight = viewHeight / coverScale

      sampleCtx.drawImage(
        video,
        (sourceWidth - cropWidth) / 2,
        (sourceHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        cols,
        rows,
      )

      const pixels = sampleCtx.getImageData(0, 0, cols, rows).data
      let showCursorLayer = false

      if (CURSOR_LAYER.enabled) {
        trailCtx.globalCompositeOperation = 'destination-out'
        trailCtx.fillStyle = `rgba(0, 0, 0, ${CURSOR_LAYER.trailFade})`
        trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
        trailCtx.globalCompositeOperation = 'source-over'

        if (pointer.x >= 0) {
          cursorEnergy = 1
          const trailX = (pointer.x / viewWidth) * trailCanvas.width
          const trailY = (pointer.y / viewHeight) * trailCanvas.height
          const radius = 0.25 * CURSOR_LAYER.cursorRadius
          const gradient = trailCtx.createRadialGradient(
            trailX,
            trailY,
            0.5 * radius,
            trailX,
            trailY,
            radius,
          )
          gradient.addColorStop(0, 'white')
          gradient.addColorStop(1, 'rgba(255,255,255,0)')
          trailCtx.fillStyle = gradient
          trailCtx.beginPath()
          trailCtx.arc(trailX, trailY, radius, 0, Math.PI * 2)
          trailCtx.fill()
        } else {
          cursorEnergy *= 1 - CURSOR_LAYER.trailFade
        }

        showCursorLayer = cursorEnergy > 0.01
      }

      ctx.clearRect(0, 0, viewWidth, viewHeight)
      if (showCursorLayer) cursorCtx.clearRect(0, 0, viewWidth, viewHeight)

      const baseRow = Array<string>(cols)
      const cursorRow = Array<string>(cols)

      for (let row = 0; row < rows; row += 1) {
        let hasBase = false
        let hasCursor = false

        for (let col = 0; col < cols; col += 1) {
          const offset = (row * cols + col) * 4
          const red = pixels[offset] ?? 0
          const green = pixels[offset + 1] ?? 0
          const blue = pixels[offset + 2] ?? 0
          const luminance =
            (((0.299 * red + 0.587 * green + 0.114 * blue) / 255) * 0.7 - 0.5) * 1 + 0.5
          const glyph = CHARSET[(7 * col + 13 * row) % CHARSET.length] ?? ' '

          if (BASE_LAYER.enabled && luminance > BASE_LAYER.threshold) {
            baseRow[col] = glyph
            hasBase = true
          } else {
            baseRow[col] = ' '
          }

          if (showCursorLayer) {
            if (luminance > CURSOR_LAYER.threshold) {
              cursorRow[col] = glyph
              hasCursor = true
            } else {
              cursorRow[col] = ' '
            }
          }
        }

        if (hasBase) {
          ctx.fillStyle = BASE_LAYER.color
          ctx.fillText(baseRow.join(''), 0, (row + 0.5) * ROW_HEIGHT)
        }

        if (hasCursor) {
          cursorCtx.fillStyle = CURSOR_LAYER.color
          cursorCtx.fillText(cursorRow.join(''), 0, (row + 0.5) * ROW_HEIGHT)
        }
      }

      if (showCursorLayer) {
        cursorCtx.globalCompositeOperation = 'destination-in'
        cursorCtx.drawImage(trailCanvas, 0, 0, viewWidth, viewHeight)
        cursorCtx.globalCompositeOperation = 'source-over'
        ctx.drawImage(cursorCanvas, 0, 0, viewWidth, viewHeight)
      }
    }

    const schedule = () => {
      if (disposed) return

      if (supportsVideoFrameCallback) {
        frameHandle = video.requestVideoFrameCallback(() => {
          render()
          schedule()
        })
        return
      }

      frameHandle = requestAnimationFrame((time) => {
        if (time - lastFrameTime >= 1000 / 24) {
          lastFrameTime = time
          render()
        }
        schedule()
      })
    }

    void Promise.all([
      document.fonts.ready,
      document.fonts.load(`${FONT_SIZE}px "Fragment Mono"`),
    ]).then(() => {
      if (disposed) return
      fontsReady = true
      resize()
      render()
    })

    const resizeObserver = new ResizeObserver(() => {
      resize()
      render()
    })
    resizeObserver.observe(container)

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
    }

    const onPointerLeave = () => {
      pointer.x = -1
      pointer.y = -1
    }

    if (CURSOR_LAYER.enabled) {
      window.addEventListener('pointermove', onPointerMove)
      document.documentElement.addEventListener('mouseleave', onPointerLeave)
    }

    const onVisibility = () => {
      if (document.hidden) {
        video.pause()
        return
      }
      void video.play().catch(() => undefined)
    }
    document.addEventListener('visibilitychange', onVisibility)

    let resumeTimer = 0
    const onPause = () => {
      if (document.hidden || video.ended) return
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        if (!disposed && !document.hidden && video.paused) {
          void video.play().catch(() => undefined)
        }
      }, 1000)
    }
    video.addEventListener('pause', onPause)
    video.muted = true
    void video.play().catch(() => undefined)
    schedule()

    return () => {
      disposed = true
      window.clearTimeout(resumeTimer)
      if (CURSOR_LAYER.enabled) {
        window.removeEventListener('pointermove', onPointerMove)
        document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      }
      video.removeEventListener('pause', onPause)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      if (supportsVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameHandle)
      } else {
        cancelAnimationFrame(frameHandle)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-2 z-0 overflow-hidden rounded-[20px] bg-[#24332d] md:inset-3 md:rounded-[24px]"
    >
      <img
        src="/glass-poster.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: VIDEO_FILTER }}
      />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: VIDEO_FILTER }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/glass-poster.webp"
      >
        <source src="/glass-bg.mp4" type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full font-mono"
      />
    </div>
  )
}
