export const sectionClass =
  "scroll-mt-32 mx-auto w-full max-w-6xl px-5 py-14 md:px-8";

export function SectionIntro({
  index,
  title,
  lede,
}: {
  index: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4 md:gap-6">
      <span className="pt-2 font-display text-2xl italic leading-none text-oxide md:text-3xl">
        {index}
      </span>
      <div>
        <h2 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{lede}</p>
      </div>
    </div>
  );
}
