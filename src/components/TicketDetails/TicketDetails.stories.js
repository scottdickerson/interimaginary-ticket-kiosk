import TicketDetails from './TicketDetails';

// Unfortunately since this is a story running in the browser I don't have access to the fs APIs
const destinations = [
  {
    DESTINATION: 'Abame',
    URL: 'http://interimaginarydepartures.com/abame/',
  },
  {
    DESTINATION: 'Airstrip One',
    URL: 'http://interimaginarydepartures.com/airstripone/',
  },
  {
    DESTINATION: 'All-World',
    URL: 'http://interimaginarydepartures.com/allworld/',
  },
  {
    DESTINATION: 'Alphabet Island',
    URL: 'http://interimaginarydepartures.com/alphabetisland/',
  },
  {
    DESTINATION: 'Anarres',
    URL: 'http://interimaginarydepartures.com/anarres/',
  },
  {
    DESTINATION: 'Ankh-Morpork',
    URL: 'http://interimaginarydepartures.com/ankhmorpork/',
  },
  {
    DESTINATION: 'Arrakis',
    URL: 'http://interimaginarydepartures.com/arrakis/',
  },
  {
    DESTINATION: 'Asteroid B-612',
    URL: 'http://interimaginarydepartures.com/asteroidb612/',
  },
  {
    DESTINATION: 'Atlantis',
    URL: 'http://interimaginarydepartures.com/atlantis/',
  },
  {
    DESTINATION: 'Avonlea',
    URL: 'http://interimaginarydepartures.com/avonlea/',
  },
  {
    DESTINATION: 'Azeroth',
    URL: 'http://interimaginarydepartures.com/azeroth/',
  },
  {
    DESTINATION: 'Blazing-World',
    URL: 'http://interimaginarydepartures.com/blazingworld/',
  },
  {
    DESTINATION: 'Bottle City of Kandor',
    URL: 'http://interimaginarydepartures.com/bottlecityofkandor/',
  },
  {
    DESTINATION: 'Brigadoon',
    URL: 'http://interimaginarydepartures.com/brigadoon/',
  },
  {
    DESTINATION: 'Busytown',
    URL: 'http://interimaginarydepartures.com/busytown/',
  },
  {
    DESTINATION: 'Camazotz',
    URL: 'http://interimaginarydepartures.com/camazotz/',
  },
  {
    DESTINATION: 'Camelot',
    URL: 'http://interimaginarydepartures.com/camelot/',
  },
  {
    DESTINATION: 'Candy Land',
    URL: 'http://interimaginarydepartures.com/candyland/',
  },
  {
    DESTINATION: 'Celesteville',
    URL: 'http://interimaginarydepartures.com/celesteville/',
  },
  {
    DESTINATION: 'Chewandswallow',
    URL: 'http://interimaginarydepartures.com/chewandswallow/',
  },
  {
    DESTINATION: 'ChiChi Raha',
    URL: 'http://interimaginarydepartures.com/chichiraha/',
  },
  {
    DESTINATION: 'Cimmeria',
    URL: 'http://interimaginarydepartures.com/cimmeria/',
  },
  {
    DESTINATION: 'Cittagazze',
    URL: 'http://interimaginarydepartures.com/cittagazze/',
  },
  {
    DESTINATION: 'City of Brass',
    URL: 'http://interimaginarydepartures.com/cityofbrass/',
  },
  {
    DESTINATION: 'City of Glass',
    URL: 'http://interimaginarydepartures.com/cityofglass/',
  },
  {
    DESTINATION: 'Cloudcuckooland',
    URL: 'http://interimaginarydepartures.com/cloudcuckooland/',
  },
  {
    DESTINATION: 'Co-pern-ica',
    URL: 'http://interimaginarydepartures.com/copernica/',
  },
  {
    DESTINATION: 'Crusoe’s Island',
    URL: 'http://interimaginarydepartures.com/crusoesisland/',
  },
  {
    DESTINATION: 'Cyberspace',
    URL: 'http://interimaginarydepartures.com/cyberspace/',
  },
  {
    DESTINATION: 'Delmak-O',
    URL: 'http://interimaginarydepartures.com/delmako/',
  },
  {
    DESTINATION: 'Delta-Quadrant',
    URL: 'http://interimaginarydepartures.com/deltaquadrant/',
  },
  {
    DESTINATION: 'Digitopolis',
    URL: 'http://interimaginarydepartures.com/digitopolis/',
  },
  {
    DESTINATION: 'Equestria',
    URL: 'http://interimaginarydepartures.com/equestria/',
  },
  {
    DESTINATION: 'Erewhon',
    URL: 'http://interimaginarydepartures.com/erewhon/',
  },
  {
    DESTINATION: 'Fantastica',
    URL: 'http://interimaginarydepartures.com/fantastica/',
  },
  {
    DESTINATION: 'Fillory',
    URL: 'http://interimaginarydepartures.com/fillory/',
  },
  {
    DESTINATION: 'Flatland',
    URL: 'http://interimaginarydepartures.com/flatland/',
  },
  {
    DESTINATION: 'Fraggle Rock',
    URL: 'http://interimaginarydepartures.com/fragglerock/',
  },
  {
    DESTINATION: 'Freedonia',
    URL: 'http://interimaginarydepartures.com/freedonia/',
  },
  {
    DESTINATION: 'Galactic Sector ZZ9 Plural Z Alpha',
    URL: 'http://interimaginarydepartures.com/galacticsector/',
  },
  {
    DESTINATION: 'Gallifrey',
    URL: 'http://interimaginarydepartures.com/gallifrey/',
  },
  {
    DESTINATION: 'Genovia',
    URL: 'http://interimaginarydepartures.com/genovia/',
  },
  {
    DESTINATION: 'Gethen',
    URL: 'http://interimaginarydepartures.com/gethen/',
  },
  {
    DESTINATION: 'Gormenghast Castle',
    URL: 'http://interimaginarydepartures.com/gormenghastcastle1/',
  },
  {
    DESTINATION: 'Gramble-Blamble',
    URL: 'http://interimaginarydepartures.com/gramble-blamble/',
  },
  {
    DESTINATION: 'Grover’s Corners',
    URL: 'http://interimaginarydepartures.com/groverscorners/',
  },
  {
    DESTINATION: 'Herland',
    URL: 'http://interimaginarydepartures.com/herland/',
  },
  {
    DESTINATION: 'Hill Valley',
    URL: 'http://interimaginarydepartures.com/hillvalley/',
  },
  {
    DESTINATION: 'Hogwarts',
    URL: 'http://interimaginarydepartures.com/hogwarts/',
  },
  {
    DESTINATION: 'Howls Moving Castle',
    URL: 'http://interimaginarydepartures.com/howlsmovingcastle/',
  },
  {
    DESTINATION: 'Hundred Acre Wood',
    URL: 'http://interimaginarydepartures.com/hundredacrewood/',
  },
  {
    DESTINATION: 'Hyperborea',
    URL: 'http://interimaginarydepartures.com/hyperborea/',
  },
  {
    DESTINATION: 'Isla Nublar',
    URL: 'https://interimaginarydepartures.com/islanublar/',
  },
  {
    DESTINATION: 'Lilliput',
    URL: 'http://interimaginarydepartures.com/lilliput/',
  },
  {
    DESTINATION: 'Macondo',
    URL: 'http://interimaginarydepartures.com/macondo/',
  },
  {
    DESTINATION: 'Metaverse',
    URL: 'http://interimaginarydepartures.com/metaverse/',
  },
  {
    DESTINATION: 'Metropolis',
    URL: 'http://interimaginarydepartures.com/metropolis/',
  },
  {
    DESTINATION: 'Middle-earth',
    URL: 'http://interimaginarydepartures.com/middleearth/',
  },
  {
    DESTINATION: 'MoodyLand',
    URL: 'http://interimaginarydepartures.com/moodyland/',
  },
  {
    DESTINATION: 'Moomin Valley',
    URL: 'http://interimaginarydepartures.com/moominvalley/',
  },
  {
    DESTINATION: 'Moosylvania',
    URL: 'http://interimaginarydepartures.com/moosylvania/',
  },
  {
    DESTINATION: 'Mount Kunlun',
    URL: 'http://interimaginarydepartures.com/mountkunlun/',
  },
  {
    DESTINATION: 'Mushroom Kingdom',
    URL: 'http://interimaginarydepartures.com/mushroomkingdom/',
  },
  {
    DESTINATION: 'Na-Nupp',
    URL: 'http://interimaginarydepartures.com/nanupp/',
  },
  {
    DESTINATION: 'Narnia',
    URL: 'http://interimaginarydepartures.com/narnia/',
  },
  {
    DESTINATION: 'Neo Tokyo',
    URL: 'http://interimaginarydepartures.com/neotokyo/',
  },
  {
    DESTINATION: 'Nessus',
    URL: 'http://interimaginarydepartures.com/nessus/',
  },
  {
    DESTINATION: 'Neverland',
    URL: 'http://interimaginarydepartures.com/neverland/',
  },
  {
    DESTINATION: 'Neverwhere',
    URL: 'http://interimaginarydepartures.com/neverwhere/',
  },
  {
    DESTINATION: 'New Crobuzon',
    URL: 'http://interimaginarydepartures.com/newcrobuzon/',
  },
  {
    DESTINATION: 'Night Vale',
    URL: 'http://interimaginarydepartures.com/nightvale/',
  },
  {
    DESTINATION: 'NightKitchen',
    URL: 'http://interimaginarydepartures.com/nightkitchen/',
  },
  {
    DESTINATION: 'Olinka',
    URL: 'http://interimaginarydepartures.com/olinka/',
  },
  {
    DESTINATION: 'Oomza Uni',
    URL: 'http://interimaginarydepartures.com/oomzauni/',
  },
  {
    DESTINATION: 'Orbitsville',
    URL: 'http://interimaginarydepartures.com/orbitsville/',
  },
  {
    DESTINATION: 'Panem',
    URL: 'http://interimaginarydepartures.com/panem/',
  },
  {
    DESTINATION: 'Pegana',
    URL: 'http://interimaginarydepartures.com/pegana/',
  },
  {
    DESTINATION: 'Pellucidar',
    URL: 'http://interimaginarydepartures.com/pellucidar/',
  },
  {
    DESTINATION: 'Pemberley',
    URL: 'http://interimaginarydepartures.com/pemberley/',
  },
  {
    DESTINATION: 'Pern',
    URL: 'http://interimaginarydepartures.com/pern/',
  },
  {
    DESTINATION: 'Peyton Place',
    URL: 'http://interimaginarydepartures.com/peytonplace/',
  },
  {
    DESTINATION: 'Rhyonon',
    URL: 'http://interimaginarydepartures.com/rhyonon/',
  },
  {
    DESTINATION: 'Sam-sam-sa-mara',
    URL: 'http://interimaginarydepartures.com/samsamsamara/',
  },
  {
    DESTINATION: 'San Junipero',
    URL: 'http://interimaginarydepartures.com/sanjunipero/',
  },
  {
    DESTINATION: 'Shangri-La',
    URL: 'http://interimaginarydepartures.com/shangrila/',
  },
  {
    DESTINATION: 'SimCity',
    URL: 'http://interimaginarydepartures.com/simcity/',
  },
  {
    DESTINATION: 'Slumberland',
    URL: 'http://interimaginarydepartures.com/slumberland/',
  },
  {
    DESTINATION: 'Snark Island',
    URL: 'http://interimaginarydepartures.com/snarkisland/',
  },
  {
    DESTINATION: 'Solaris',
    URL: 'http://interimaginarydepartures.com/solaris/',
  },
  {
    DESTINATION: 'Tatooine',
    URL: 'http://interimaginarydepartures.com/tatooine/',
  },
  {
    DESTINATION: 'The Dreamlands',
    URL: 'http://interimaginarydepartures.com/thedreamlands/',
  },
  {
    DESTINATION: 'The Emerald City',
    URL: 'http://interimaginarydepartures.com/theemeraldcity/',
  },
  {
    DESTINATION: 'The Island of Myst',
    URL: 'http://interimaginarydepartures.com/theislandofmyst/',
  },
  {
    DESTINATION: 'The Matrix',
    URL: 'http://interimaginarydepartures.com/thematrix/',
  },
  {
    DESTINATION: 'The Stillness',
    URL: 'http://interimaginarydepartures.com/thestillness/',
  },
  {
    DESTINATION: 'Themyscira',
    URL: 'http://interimaginarydepartures.com/themyscira/',
  },
  {
    DESTINATION: 'Tlon',
    URL: 'http://interimaginarydepartures.com/tlon/',
  },
  {
    DESTINATION: 'Toad Hall',
    URL: 'http://interimaginarydepartures.com/toadhall/',
  },
  {
    DESTINATION: 'Tralfamadore',
    URL: 'http://interimaginarydepartures.com/tralfamadore/',
  },
  {
    DESTINATION: 'Trantor',
    URL: 'http://interimaginarydepartures.com/trantor/',
  },
  {
    DESTINATION: 'Treasure Island',
    URL: 'http://interimaginarydepartures.com/treasureisland/',
  },
  {
    DESTINATION: 'Trisolaris',
    URL: 'http://interimaginarydepartures.com/trisolaris/',
  },
  {
    DESTINATION: 'Trude',
    URL: 'http://interimaginarydepartures.com/trude/',
  },
  {
    DESTINATION: 'Truffula Valley',
    URL: 'http://interimaginarydepartures.com/truffulavalley/',
  },
  {
    DESTINATION: 'Villa Villekulla',
    URL: 'http://interimaginarydepartures.com/villavillekulla/',
  },
  {
    DESTINATION: 'Wakanda',
    URL: 'http://interimaginarydepartures.com/wakanda/',
  },
  {
    DESTINATION: 'Waterdeep',
    URL: 'http://interimaginarydepartures.com/waterdeep/',
  },
  {
    DESTINATION: 'Watership Down',
    URL: 'http://interimaginarydepartures.com/watershipdown/',
  },
  {
    DESTINATION: 'Westeros',
    URL: 'http://interimaginarydepartures.com/westeros/',
  },
  {
    DESTINATION: 'Wonderland',
    URL: 'http://interimaginarydepartures.com/wonderland/',
  },
  {
    DESTINATION: 'Yoknapatawpha County',
    URL: 'http://interimaginarydepartures.com/yoknapatawpha-county/',
  },
  {
    DESTINATION: 'Zembla',
    URL: 'http://interimaginarydepartures.com/zembla/',
  },
];
const story = {
  title: 'components/TicketDetails',
  component: TicketDetails,
};

export const Default = () => (
  <TicketDetails
    ticketDestination="Abame"
    ticketURL="http://interimaginarydepartures.com/hyperborea/"
  />
);

// Show all the possible ticket images on one screen
export const AllTicketScreens = () => {
  return destinations.map(ticket => (
    <TicketDetails ticketDestination={ticket.DESTINATION} ticketURL={ticket.URL} />
  ));
};

export default story;
