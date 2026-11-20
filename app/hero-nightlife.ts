/**
 * Homepage night frames. Each file is a Wikimedia Commons photograph
 * under CC BY-SA 4.0, saved in /public/hero (not hotlinked).
 * Captions follow the file title or description. No event, fare, or date.
 */
export type HeroNightSlide = {
  kind?: "photo";
  src: string;
  alt: string;
  place: string;
  city: string;
  width: number;
  height: number;
  /** Tailwind object-position so a wide banner keeps the subject. */
  focus: string;
  author: string;
  sourceUrl: string;
};

/**
 * An official event poster or key visual from landmarks.ts, shown whole
 * (object-contain) over a blurred copy of itself. Built in home-hero-slides.ts.
 */
export type HeroPosterSlide = {
  kind: "poster";
  src: string;
  alt: string;
  place: string;
  city: string;
  /** The night shown in the caption, e.g. "21 December". */
  date: string;
  /** Internal event page. */
  href: string;
  /** e.g. "Image on the organiser's page". */
  credit?: string;
  creditUrl?: string;
};

export type HeroSlide = HeroNightSlide | HeroPosterSlide;

const license = "CC BY-SA 4.0";

export const heroNightLicense = license;
export const heroNightLicenseUrl = "https://creativecommons.org/licenses/by-sa/4.0";

export const heroNightSlides: HeroNightSlide[] = [
  {
    src: "/hero/bloombar-accra-night.jpg",
    alt: "Bloombar at night, Accra",
    place: "Bloombar at night",
    city: "Accra",
    width: 1920,
    height: 1282,
    focus: "object-[center_45%]",
    author: "TheBrandmeister",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bloombar.jpg",
  },
  {
    src: "/hero/agege-lagos-nightlife.jpg",
    alt: "Night market and buses in Agege, Lagos",
    place: "Night market and buses in Agege",
    city: "Lagos",
    width: 1920,
    height: 2560,
    focus: "object-[center_68%]",
    author: "Mir koks",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nightlife_at_Agege,Lagos._04.jpg",
  },
  {
    src: "/hero/osu-accra-night.jpg",
    alt: "Osu at night, Accra",
    place: "Osu at night",
    city: "Accra",
    width: 1920,
    height: 1440,
    focus: "object-[center_50%]",
    author: "Mwintirew",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Osu_at_night.jpg",
  },
  {
    src: "/hero/maryland-ikeja-night.jpg",
    alt: "Maryland at night in Ikeja, Lagos",
    place: "Maryland at night in Ikeja",
    city: "Lagos",
    width: 1827,
    height: 1158,
    focus: "object-[center_46%]",
    author: "Omoeko Media",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Maryland_at_Night_in_Ikeja,_Lagos_State-Nigeria.jpg",
  },
];
