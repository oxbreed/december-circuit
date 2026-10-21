import { disclaimer } from "../brand";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <img
        src="/hero-lagos-night.jpg"
        alt="Illuminated bridge and city skyline at night"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
      <div className="relative z-10 flex min-h-[100svh] flex-col px-5 pb-40 pt-24 md:px-16 md:pb-12 md:pt-36">
        <div className="mt-auto max-w-3xl md:mt-10">
          <h1 className="font-display text-[clamp(4rem,11vw,7.75rem)] leading-[0.86] tracking-tight text-[#e7d3a1]">
            Detty
            <span className="block">December</span>
          </h1>
          <p className="mt-5 max-w-md text-xl leading-8 text-white md:text-2xl">
            The definitive guide to Lagos nights
          </p>
          <a
            href="#events"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-gold/80 bg-black/30 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm"
          >
            Explore the guide
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <p className="mt-8 max-w-xl text-xs leading-5 text-white/80 md:mt-auto">
          {disclaimer}
        </p>
      </div>
    </section>
  );
}
