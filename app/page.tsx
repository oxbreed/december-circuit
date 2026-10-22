import { GuideSearch } from "./components/guide-search";
import { HomeBands } from "./components/home-bands";
import { StayGuide } from "./components/stay-guide";
import { defaultDescription, pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "December 2026 directory",
  description: defaultDescription,
  path: "/",
});

export default function Home() {
  return (
    <main id="top">
      <GuideSearch />
      <StayGuide />
      <HomeBands />
    </main>
  );
}
