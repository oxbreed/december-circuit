import { Suspense } from "react";
import { Discovery } from "../components/discovery";
import { LoadingLines } from "../components/states";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Events",
  description: "Confirmed December 2026 events already on file.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-5 pt-28">
            <LoadingLines label="Loading what is on file." />
          </div>
        }
      >
        <Discovery />
      </Suspense>
    </main>
  );
}
