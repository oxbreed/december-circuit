import { disclaimer } from "../brand";

export function Hero() {
  return (
    <section className="px-4 pb-8 pt-[4.25rem] sm:px-6 lg:px-8 lg:pb-10 lg:pt-[8.5rem]">
      <div className="mx-auto grid max-w-6xl items-end gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:pb-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-lagoon">
            The season
          </p>
          <h1 className="mt-3 font-display text-[3.15rem] leading-[0.84] tracking-tight text-ink sm:text-7xl lg:text-[5.6rem]">
            Detty
            <span className="mt-1 block italic text-oxide">December</span>
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-14 bg-gold" />
            <span className="h-px w-6 bg-oxide" />
          </div>
          <p className="mt-4 max-w-sm font-display text-[1.35rem] leading-snug text-ink sm:text-[1.65rem]">
            The definitive guide to Lagos nights
          </p>
          <a
            href="#events"
            className="mt-6 inline-flex w-fit items-center gap-3 bg-lagoon px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-chart"
          >
            Explore the guide
            <span aria-hidden="true">→</span>
          </a>
          <p className="mt-5 max-w-sm text-[11px] leading-5 text-muted">{disclaimer}</p>
        </div>
        <figure className="lg:col-span-7">
          <div className="bg-chart p-1.5 shadow-[8px_8px_0_0_#b8432f] ring-1 ring-ink sm:p-2 lg:p-2.5">
            <div className="ring-1 ring-gold">
              <img
                src="/hero-lagos-night.jpg"
                alt="Illuminated bridge and city skyline at night"
                className="h-44 w-full object-cover object-[62%_center] sm:h-64 lg:h-[25rem]"
              />
            </div>
          </div>
          <figcaption className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <span>Illuminated bridge and city skyline at night</span>
            <span className="shrink-0 text-gold">Lagos</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
