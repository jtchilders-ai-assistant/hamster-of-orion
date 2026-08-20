/* Hamster of Orion — crises and disasters (manual p.50) */
globalThis.HOO = globalThis.HOO || {};
HOO.DATA = HOO.DATA || {};

/*
  Each event: id, name, good (bool), weight, gnn headline template.
  Runtime behavior implemented in js/game/events_run.js.
  {colony} {race} {star} placeholders filled at fire time.
*/
HOO.DATA.EVENTS = [
  {
    id: 'derelict', good: true, weight: 8, name: 'Ancient Derelict',
    text: 'Salvage crews at {colony} have boarded a drifting hulk of the Ancient Ones. Its hold contains intact field and weapons technology, sealed as if yesterday.'
  },
  {
    id: 'climate', good: true, weight: 8, name: 'Climate Shift',
    text: 'A sudden axial shift on {colony} has warmed the plains and filled the old waterways. The soil breathes again. Population growth surges.'
  },
  {
    id: 'comet', good: false, weight: 8, name: 'Comet',
    text: 'Deep scanners confirm a comet on direct collision course with {colony}. Fleet Command advises: mass warships in the system to break it apart before impact.'
  },
  {
    id: 'virus', good: false, weight: 8, name: 'Computer Virus',
    text: 'A destructive machine-plague has swept the research archives of the {race}. Years of accumulated work in one field are gone.'
  },
  {
    id: 'blunder', good: false, weight: 7, name: 'Diplomatic Blunder',
    text: 'An ambassador of the {race} has caused a catastrophic insult at a foreign court. Relations plunge.'
  },
  {
    id: 'donation', good: true, weight: 8, name: 'Donation',
    text: 'A merchant magnate of {colony}, moved by the cause, has signed over a lifetime of trade profits to the treasury of the {race}.'
  },
  {
    id: 'earthquake', good: false, weight: 8, name: 'Earthquake',
    text: 'A great quake has torn through {colony}. Casualties number in the millions, and the industrial districts lie broken.'
  },
  {
    id: 'accident', good: false, weight: 8, name: 'Industrial Accident',
    text: 'Containment failure at the {colony} manufacturing arcologies has flooded the lowlands with radioactive waste. The cleanup will be long.'
  },
  {
    id: 'mineral_rich', good: true, weight: 6, name: 'Mineral Discovery',
    text: 'Deep-bore surveys beneath {colony} reveal a vast neutronium seam. The colony is now assessed Mineral Rich.'
  },
  {
    id: 'mineral_poor', good: false, weight: 5, name: 'Mineral Depletion',
    text: 'The last great veins beneath {colony} have run dry. The colony is now assessed Mineral Poor.'
  },
  {
    id: 'piracy', good: false, weight: 8, name: 'Piracy',
    text: 'Raiders have begun preying on the trade lanes near {star}. Until a fleet patrols the system, trade revenues will suffer.'
  },
  {
    id: 'plague', good: false, weight: 8, name: 'Plague',
    text: 'A deadly contagion has broken out on {colony}. The colony is quarantined; every laboratory on the planet has turned to the cure.'
  },
  {
    id: 'rebellion', good: false, weight: 6, name: 'Rebellion',
    text: '{colony} has risen in open revolt. Loyalist forces must be transported in to restore order.'
  },
  {
    id: 'monster', good: false, weight: 4, name: 'Space Monster',
    text: 'Something vast has entered known space near {star}. It does not answer hails. It is moving from system to system, and nothing survives behind it.'
  },
  {
    id: 'supernova', good: false, weight: 5, name: 'Super Nova',
    text: 'The primary of {star} has become unstable and threatens to go nova. Research teams at {colony} race for a scientific solution.'
  }
];
