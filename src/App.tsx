import { About } from './components/About'
import { Background } from './components/Background'
import { SiteHeader } from './components/SiteHeader'

export default function App() {
  return (
    <div className="relative min-h-dvh bg-cream px-2 md:px-3">
      <Background />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <SiteHeader />

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-16 pt-10 md:px-6 md:pb-24 md:pt-14">
          <About />
        </main>
      </div>
    </div>
  )
}
