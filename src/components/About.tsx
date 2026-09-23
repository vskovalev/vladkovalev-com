export function About() {
  return (
    <section
      id="about"
      className="flex w-full flex-col gap-5 rounded-[14px] bg-black/25 px-5 py-6 backdrop-blur-[2px] md:gap-8 md:rounded-[20px] md:px-7 md:py-8"
    >
      <h2 className="font-mono text-2xl font-medium tracking-wide text-cream md:text-3xl">About</h2>

      <div className="space-y-5 font-mono text-[14px] leading-relaxed text-cream/90 md:text-[15px] md:leading-7">
        <p>
          Hey, I&apos;m Vlad — a Senior Platform Engineer. I build analytics and
          ML-ready platforms on GCP and AWS, the kind of systems that turn noisy production data into
          something teams can actually trust and ship on.
        </p>
        <p>
          Right now I work at Conrad Electronics on data platform engineering. Before that I was a Senior Data
          Engineer at SOL-X, where fault tolerance mattered in a very literal way: ships at sea
          don&apos;t get a second chance at a clean deploy.
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
