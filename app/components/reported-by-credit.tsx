import { publicationNameFromUrl } from "../event-view";

/** Quiet citation for a news-sourced event. Not a primary leave-site CTA. */
export function ReportedByCredit({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  const name = publicationNameFromUrl(url);
  return (
    <p className={`font-mono text-[11px] leading-6 tracking-[0.02em] text-muted ${className}`.trim()}>
      Reported by{" "}
      <a
        href={url}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="text-muted underline decoration-ink/25 underline-offset-4 hover:text-oxide"
      >
        {name}
      </a>
    </p>
  );
}
