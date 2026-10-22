import { Suspense } from "react";
import { Discovery } from "./components/discovery";
import { HomeBands } from "./components/home-bands";
import { LoadingLines } from "./components/states";
import { defaultDescription, pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "December 2026 directory",
  description: defaultDescription,
  path: "/",
});

export default function Home() {
  return (
    <main id="top">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-5 pt-28">
            <LoadingLines label="Loading what is on file." />
          </div>
        }
      >
        <Discovery home />
      </Suspense>
      <HomeBands />
    </main>
  );
}
