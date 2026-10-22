export type FramePhoto = {
  name: string;
  city: string;
  src: string;
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
    name: "Davido, Oriade residency",
    city: "Lagos",
    src: "/landmarks/oriade-residency.jpg",
    credit: "Image on the organiser's page. https://www.dmwhq.com/residency",
    creditUrl: "https://www.dmwhq.com/residency",
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
];
