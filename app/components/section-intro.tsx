export const sectionClass =
  "scroll-mt-36 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32";

/** When breadcrumbs / SEO chrome already sit above the section. */
export const sectionClassCompact =
  "scroll-mt-36 mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pb-20";

export function SectionIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-lagoon">
          {kicker}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-oxide/80 to-transparent" />
      </div>
      <h2 className="mt-4 font-display text-4xl leading-none tracking-tight text-ink md:text-6xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{lede}</p>
    </div>
  );
}
