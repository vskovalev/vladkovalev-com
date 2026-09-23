export function About() {
  return (
    <section
      id="about"
      className="mx-auto flex w-[80%] flex-col gap-4 rounded-[11px] bg-black/25 px-4 py-5 backdrop-blur-[2px] md:gap-6 md:rounded-[16px] md:px-[1.4rem] md:py-6"
    >
      <h2 className="font-mono text-xl font-medium tracking-wide text-cream md:text-2xl">About</h2>

      <div className="space-y-4 font-mono text-[11px] leading-relaxed text-cream/90 md:text-[12px] md:leading-6">
        <p>
          Hey, I&apos;m Vlad — a Senior Platform Engineer. I build analytics and ML-ready platforms
          on GCP and AWS, the kind of systems that turn noisy production data into something teams
          can actually trust and ship on.
        </p>
        <p>
          Right now I work at Conrad Electronics on data platform engineering. Before that I was a
          Senior Data Engineer at SOL-X, where fault tolerance mattered in a very literal way: ships
          at sea don&apos;t get a second chance at a clean deploy.
        </p>
        <p>
          Day to day I live in Python, SQL, Java, dbt — pipelines, warehouses, quality checks, and
          the glue that keeps high-load backends and Big Data platforms moving. I care a lot about
          reliability, maintainability, and making complex data flows feel simple for the people
          downstream.
        </p>
        <p>
          If you want to talk platforms, pipelines, or high-load design —{' '}
          <a
            href="https://www.linkedin.com/in/kovalev-vlad/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
          >
            find me on LinkedIn
          </a>
          .
        </p>
      </div>
    </section>
  )
}
