const NAV = [
  { label: 'About', href: '#about' },
  {
    label: 'CV',
    href: 'https://docs.google.com/document/d/e/2PACX-1vR0OOc8LVvB_mkvluDBLg10ZpsKPf01akT7OCdxOh_PWvzvMyM1gf6ipANGLlPbKQKs80TQC1kVriyO/pub',
    external: true,
  },
] as const

export function SiteHeader() {
  return (
    <header className="relative z-10 px-3 pt-10 md:px-6 md:pt-14">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center md:gap-5">
        <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-wide text-cream text-shadow-title md:text-5xl lg:text-[3.25rem]">
          Vlad Kovalev
        </h1>

        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-display text-lg font-bold tracking-wide text-cream/85 md:text-2xl"
        >
          {NAV.map((item, index) => (
            <span key={item.label} className="inline-flex items-center gap-x-2">
              {index > 0 ? (
                <span className="text-cream/35" aria-hidden>
                  /
                </span>
              ) : null}
              <a
                href={item.href}
                className="transition-colors hover:text-cream"
                {...('external' in item && item.external
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
                {item.label}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}
