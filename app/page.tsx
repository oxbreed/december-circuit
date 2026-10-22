import { GuideSearch } from "./components/guide-search";
import { HomeBands } from "./components/home-bands";
import { MyTrip } from "./components/my-trip";
import { SponsorSpot } from "./components/sponsor-spot";
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
      <SponsorSpot />
      <MyTrip />
      <StayGuide />
      <HomeBands />
    </main>
  );
}
