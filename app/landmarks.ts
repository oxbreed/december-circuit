export type FramePhoto = {
  name: string;
  city: string;
  src: string;
  /** Descriptive alt text. Falls back to "name, city — dirtydecember.info". */
  alt?: string;
  credit?: string;
  creditUrl?: string;
};

const commons = "Wikimedia Commons";
const bySa = "CC BY-SA 4.0";

function credit(author: string) {
  return `Photo: ${author}, ${bySa}, ${commons}`;
}

export const landmarks: FramePhoto[] = [
  {
    name: "Lekki-Ikoyi Link Bridge",
    city: "Lagos",
    src: "/landmarks/lekki-ikoyi-link-bridge.jpg",
  },
  {
    name: "Detty December Fest",
    city: "Lagos",
    src: "/landmarks/detty-december-fest-2026.jpg",
    credit:
      "Image on the organiser's page. https://dettydecfest.com/wizkid-opens-detty-december-fest-at-the-grand-opening-concert-day-1-of-13/",
    creditUrl:
      "https://dettydecfest.com/wizkid-opens-detty-december-fest-at-the-grand-opening-concert-day-1-of-13/",
  },
  {
    // Organiser's night poster: https://dettydecfest.com/wp-content/uploads/2026/11/DDF_DOT-LAURYN-HILL-1200-x-800-scaled.webp
    // Listed on https://dettydecfest.com/events/
    name: "Lauryn Hill, Detty December Fest",
    city: "Lagos",
    src: "/landmarks/detty-december-fest-lauryn-hill-2026.jpg",
    alt: "Detty December Fest poster for Ms. Lauryn Hill with YG Marley and Zion Marley, 21 December 2026, Lagos",
    credit: "Image on the organiser's page. https://dettydecfest.com/events/",
    creditUrl: "https://dettydecfest.com/events/",
  },
  {
    // Organiser's night poster: https://dettydecfest.com/wp-content/uploads/2026/11/DDF_DOT-SUMMER-WALKER-AND-FRIDAYY-1200-x-800.webp
    // Listed on https://dettydecfest.com/events/
    name: "Summer Walker, Detty December Fest",
    city: "Lagos",
    src: "/landmarks/detty-december-fest-summer-walker-2026.jpg",
    alt: "Detty December Fest poster for Summer Walker and Fridayy, 27 December 2026, Lagos",
    credit: "Image on the organiser's page. https://dettydecfest.com/events/",
    creditUrl: "https://dettydecfest.com/events/",
  },
  {
    // Organiser's night poster: https://dettydecfest.com/wp-content/uploads/2026/11/DDF_DOT-YOUNG-THUG-1200-x-800--scaled.webp
    // Listed on https://dettydecfest.com/events/
    name: "Young Thug, Detty December Fest",
    city: "Lagos",
    src: "/landmarks/detty-december-fest-young-thug-2026.jpg",
    alt: "Detty December Fest poster for Young Thug, 28 December 2026, Lagos",
    credit: "Image on the organiser's page. https://dettydecfest.com/events/",
    creditUrl: "https://dettydecfest.com/events/",
  },
  {
    name: "Davido, Oriade residency",
    city: "Lagos",
    src: "/landmarks/oriade-residency.jpg",
    credit: "Image on the organiser's page. https://www.dmwhq.com/residency",
    creditUrl: "https://www.dmwhq.com/residency",
  },
  {
    name: "Coca-Cola Rhythm Unplugged",
    city: "Lagos",
    src: "/landmarks/coca-cola-rhythm-unplugged-2026.jpg",
    alt: "Coca-Cola Rhythm Unplugged poster featuring Lil Baby on a red and black background, Eko Convention Centre, Lagos",
  },
  {
    name: "Carnival Calabar",
    city: "Calabar",
    src: "/landmarks/carnival-calabar-2026.jpg",
    credit:
      "Photo: Iwai-Dialax, CC BY 4.0, Wikimedia Commons. https://commons.wikimedia.org/wiki/File:Unveiling_Carnival_Calabar_2026-13.jpg",
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Unveiling_Carnival_Calabar_2026-13.jpg",
  },
  {
    name: "Nightlife in Agege",
    city: "Lagos",
    src: "/landmarks/agege-night-market.jpg",
    credit: credit("Mir koks"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Nightlife_at_Agege,Lagos._04.jpg",
  },
  {
    name: "Night scene of a monument in Victoria Island",
    city: "Lagos",
    src: "/landmarks/victoria-island-night.jpg",
    credit: credit("Diadem Imagery"),
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Night_Scene_Monument_In_Victoria_Island,_Lagos_(1).jpg",
  },
  {
    name: "National Theatre",
    city: "Lagos",
    src: "/landmarks/national-theatre-lagos.jpg",
  },
  {
    name: "Carnival costume",
    city: "Calabar",
    src: "/landmarks/calabar-carnival.jpg",
    credit: credit("Teemages"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Calabar_carnival_3.jpg",
  },
  {
    name: "Cape Coast Castle",
    city: "Cape Coast",
    src: "/landmarks/cape-coast-castle.jpg",
  },
  {
    name: "Stilt walkers at Fetu Afahye",
    city: "Cape Coast",
    src: "/landmarks/cape-coast-fetu.jpg",
    credit: credit("Fiifiabban"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Above_The_Crowd.jpg",
  },
  {
    name: "Basilique Notre Dame de la Paix",
    city: "Yamoussoukro",
    src: "/landmarks/basilique-yamoussoukro.jpg",
  },
  {
    name: "Berger roundabout at night",
    city: "Abuja",
    src: "/landmarks/abuja-night.jpg",
    credit: credit("OtuNwachinemere"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Abuja_at_night_%2BStreetShoot.jpg",
  },
  {
    name: "Aso Rock",
    city: "Abuja",
    src: "/landmarks/aso-rock-abuja.jpg",
  },
  {
    name: "Bloombar at night",
    city: "Accra",
    src: "/landmarks/accra-bloombar.jpg",
    credit: credit("TheBrandmeister"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bloombar.jpg",
  },
  {
    name: "Black Star Gate",
    city: "Accra",
    src: "/landmarks/black-star-gate-accra.jpg",
  },
  {
    name: "National Cultural Centre",
    city: "Kumasi",
    src: "/landmarks/kumasi-cultural-centre.jpg",
    credit: credit("Jude Hammond"),
    creditUrl: "https://commons.wikimedia.org/wiki/File:Culture_Centre_at_Kumasi.jpg",
  },
  {
    name: "Manhyia Palace",
    city: "Kumasi",
    src: "/landmarks/manhyia-palace-kumasi.jpg",
  },
  // Event pictures appended last so city fallbacks (first photo per city) stay the same.
  {
    // Organiser's poster: https://www.iconiqfest.com/images/save_the_date.jpg
    name: "ICONIQ FEST Lagos",
    city: "Lagos",
    src: "/landmarks/iconiq-fest-lagos-2026.jpg",
    credit: "Image on the organiser's page. https://www.iconiqfest.com/",
    creditUrl: "https://www.iconiqfest.com/",
  },
  {
    // Organiser's poster: https://www.iconiqfest.com/images/2026/Fola_ABUJA.jpg
    name: "ICONIQ FEST Abuja",
    city: "Abuja",
    src: "/landmarks/iconiq-fest-abuja-2026.jpg",
    credit: "Image on the organiser's page. https://www.iconiqfest.com/",
    creditUrl: "https://www.iconiqfest.com/",
  },
  {
    // Organiser's Future Club poster on the announcement:
    // https://www.afrofuture.com/article/afrofuture-announces-future-club-membership-experience-for-detty-december-2026
    name: "AfroFuture Residency",
    city: "Accra",
    src: "/landmarks/afrofuture-future-club-2026.jpg",
    credit:
      "Image on the organiser's page. https://www.afrofuture.com/article/afrofuture-announces-future-club-membership-experience-for-detty-december-2026",
    creditUrl:
      "https://www.afrofuture.com/article/afrofuture-announces-future-club-membership-experience-for-detty-december-2026",
  },
  {
    // Photo of Stonebwoy on the organiser's home page: https://bhimfestival.com/
    name: "Stonebwoy's BHIM Festival",
    city: "Accra",
    src: "/landmarks/bhim-festival-2026.jpg",
    credit: "Image on the organiser's page. https://bhimfestival.com/",
    creditUrl: "https://bhimfestival.com/",
  },
  {
    // Official ticket-page poster: https://wizkid.tix.africa/assets/images/banner-mobile.jpg
    name: "Live Out Loud Music Festival, Wizkid",
    city: "Abuja",
    src: "/landmarks/live-out-loud-wizkid-abuja-2026.jpg",
    credit: "Image on the official ticket page. https://wizkid.tix.africa/",
    creditUrl: "https://wizkid.tix.africa/",
  },
  {
    // Organiser's flyer: https://www.apitix.com/wp-content/uploads/2026/11/seyi-vibez-live-in-abuja-flyer.jpg
    name: "Apitainment Music Festival, Seyi Vibez",
    city: "Abuja",
    src: "/landmarks/apitainment-seyi-vibez-abuja-2026.jpg",
    credit:
      "Image on the organiser's page. https://www.apitix.com/product/seyi-vibez-live-in-abuja/",
    creditUrl: "https://www.apitix.com/product/seyi-vibez-live-in-abuja/",
  },
  {
    // Official tour banner on the ticket pages:
    // https://mainlandblockparty.com/wp-content/uploads/2026/11/4h6uXfd8.jpeg
    name: "Victony, The Bonfire Experience",
    city: "Lagos",
    src: "/landmarks/victony-bonfire-experience-2026.jpg",
    credit:
      "Image on the organiser's ticket page. https://mainlandblockparty.com/event/island-blockparty-the-bonfire-experience",
    creditUrl:
      "https://mainlandblockparty.com/event/island-blockparty-the-bonfire-experience",
  },
  {
    // Organiser's banner on the ticket page:
    // https://oauwyfki5yxftdbf.public.blob.vercel-storage.com/uploads/mvpm5x04-dc847ae2c3f3.webp
    name: "ÀLÓ: Once Upon a Song",
    city: "Lagos",
    src: "/landmarks/alo-once-upon-a-song-2026.jpg",
    credit:
      "Image on the organiser's page. https://tix.dot360.co/event/a-lo-once-upon-a-song",
    creditUrl: "https://tix.dot360.co/event/a-lo-once-upon-a-song",
  },
  {
    // Organiser's key visual (og:image): https://futurefest.live/assets/kv/og-hero.jpg
    // Festival site: https://futurefest.live/ (FutureFest '26, Lagos, 11-20 December 2026)
    name: "Future Fest '26",
    city: "Lagos",
    src: "/landmarks/future-fest-2026.jpg",
    alt: "Future Fest '26 key visual: a chrome figure with open hands behind the Future Fest '26 logo, Lagos",
    credit: "Image on the organiser's page. https://futurefest.live/",
    creditUrl: "https://futurefest.live/",
  },
  {
    // Organiser's artwork (og:image): https://www.zaamadisco.com/zaama/og.jpg
    // Credited as official artwork by Ghanamotion:
    // https://www.ghanamotion.com/black-sherif-zaama-disco-2026-legon-21-december/
    name: "Black Sherif's Zaama Disco",
    city: "Accra",
    src: "/landmarks/zaama-disco-2026.jpg",
    alt: "Zaama Disco 2026 artwork: the logo inside a ring of fire, Legon Sports Stadium, Accra",
    credit: "Image on the organiser's page. https://www.zaamadisco.com/",
    creditUrl: "https://www.zaamadisco.com/",
  },
  {
    // Poster supplied by Oxbreed Studio. No public official source URL found for this image.
    name: "Asake, M$NEY in Lagos",
    city: "Lagos",
    src: "/landmarks/asake-money-in-lagos-2026.jpg",
    alt: "M$NEY in Lagos poster for Asake, 20 December, The Oasis, Lagos",
    credit: "Poster supplied by Oxbreed Studio",
  },
];
