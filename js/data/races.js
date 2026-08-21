/* Hamster of Orion — the ten sentient races (MOO 1993 race mechanics, Awakening lore) */
globalThis.HOO = globalThis.HOO || {};
HOO.DATA = HOO.DATA || {};

/*
  Mechanics fields follow the original manual exactly:
  shipDefense/+init (Alkari), groundBonus (Bulrathi), spy* (Darlok),
  trade/diplomacy (Human), workerOutput (Klackon), factoryControlBonus (Meklar),
  shipAttack/firstStrike (Mrrshan), 0.8 researchCosts + extraTechChoices (Psilon),
  popGrowth (Sakkra), wasteImmune/landAnywhere/growthHalved (Silicoid).
  researchCosts: multiplier per field (0.6 excellent / 0.8 good / 1.0 std / 1.25 poor).
*/

HOO.DATA.RACES = [
  {
    id: 'budgies', name: 'Budgies', adj: 'Budgie', glyph: '🦜', color: '#E8C64C', color2: '#8f7620',
    trait: 'Superior pilots',
    lore: 'Avian acrobats whose mastery of three-dimensional flight was written into their bones long before the Awakening. A Budgie helm officer treats a mile-long warship like a body extension.',
    bonusText: '+3 ship defense, +3 initiative in combat',
    shipDefense: 3, initBonus: 3,
    personality: 'honorable', objective: 'militarist',
    researchCosts: { computers: 1, construction: 1, forceFields: 1.25, planetology: 1, propulsion: 0.6, weapons: 1 }
  },
  {
    id: 'guineapigs', name: 'Guinea Pigs', adj: 'Guinea Pig', glyph: '🦫', color: '#C96A3B', color2: '#7e3f20',
    trait: 'Unmatched ground troops',
    lore: 'Stocky philosopher-warriors who hold that honor is proven claw to claw, on the ground, where the Ancient Ones can see. Their boarding chants are audible through hull plating.',
    bonusText: '+25 bonus in all ground combat',
    groundBonus: 25,
    personality: 'aggressive', objective: 'ecologist',
    researchCosts: { computers: 1.25, construction: 0.8, forceFields: 1, planetology: 1, propulsion: 1, weapons: 0.8 }
  },
  {
    id: 'chameleons', name: 'Chameleons', adj: 'Chameleon', glyph: '🦎', color: '#7FBF6A', color2: '#44702f',
    trait: 'Master spies',
    lore: 'Color-shifting infiltrators whose true allegiance no census has ever recorded. It is said every court in the galaxy employs a Chameleon advisor. It is also said none of them knows it.',
    bonusText: 'Spy networks cost half; +30 espionage, +20 security',
    spyCostHalf: true, spyBonus: 30, securityBonus: 20,
    personality: 'aggressive', objective: 'diplomat',
    researchCosts: { computers: 0.8, construction: 1, forceFields: 1, planetology: 1, propulsion: 1, weapons: 1 }
  },
  {
    id: 'hamsters', name: 'Hamsters', adj: 'Hamster', glyph: '🐹', color: '#E3B34C', color2: '#93712a',
    trait: 'Diplomats and traders',
    lore: 'Adaptable, patient, and quietly relentless, the Hamsters believe the Wheel turns for those who keep running. Their trade caravans and treaty archives bind half the galaxy together.',
    bonusText: '+25% trade income, doubled goodwill, +5 council sway',
    tradeBonus: 0.25, diplomacyDouble: true, councilBonus: 5,
    personality: 'honorable', objective: 'diplomat',
    researchCosts: { computers: 1, construction: 1, forceFields: 0.6, planetology: 0.8, propulsion: 0.8, weapons: 1 }
  },
  {
    id: 'ants', name: 'Ants', adj: 'Ant', glyph: '🐜', color: '#B0524B', color2: '#6e2f2a',
    trait: 'Perfect industrial workers',
    lore: 'Continent-spanning hive-minds fused into a single industrious will. An Ant colony does not hold meetings. It simply proceeds, and the output charts bend upward forever.',
    bonusText: 'Each worker produces double output',
    workerOutput: 2,
    personality: 'xenophobic', objective: 'industrialist',
    researchCosts: { computers: 1, construction: 0.6, forceFields: 1, planetology: 1, propulsion: 1.25, weapons: 1 }
  },
  {
    id: 'mice', name: 'Mice', adj: 'Mouse', glyph: '🐭', color: '#9AA6BF', color2: '#5b657c',
    trait: 'Cybernetic automation',
    lore: 'Cybernetically-enhanced technologists who ceded nothing to their small stature and everything to the machine. Mouse foundries hum in the dark, tended by no visible hand.',
    bonusText: 'Operate +2 factories per colonist',
    factoryControlBonus: 2,
    personality: 'erratic', objective: 'industrialist',
    researchCosts: { computers: 0.6, construction: 1, forceFields: 1, planetology: 1.25, propulsion: 1, weapons: 1 }
  },
  {
    id: 'ferrets', name: 'Ferrets', adj: 'Ferret', glyph: '🦦', color: '#C9705C', color2: '#7d4234',
    trait: 'Deadly gunners',
    lore: 'Sleek predators whose gunnery officers regard a target lock as a formality. The Ferret war-creed is short: patience, position, and one perfect strike.',
    bonusText: '+4 to ship attack rolls; ships fire first',
    shipAttack: 4, firstStrike: true,
    personality: 'ruthless', objective: 'militarist',
    researchCosts: { computers: 1, construction: 1.25, forceFields: 1, planetology: 1, propulsion: 1, weapons: 0.6 }
  },
  {
    id: 'rats', name: 'Rats', adj: 'Rat', glyph: '🐀', color: '#A98BE8', color2: '#6a53a0',
    trait: 'Brilliant researchers',
    lore: 'Hyper-intelligent researchers devoted to pure science, who publish their war declarations with citations. The Rat academies believe Orion is simply a problem set no one has finished.',
    bonusText: 'All research at 80% cost; wider choice of techs',
    extraTechChoices: 1,
    personality: 'pacifist', objective: 'technologist',
    researchCosts: { computers: 0.8, construction: 0.8, forceFields: 0.8, planetology: 0.8, propulsion: 0.8, weapons: 0.8 }
  },
  {
    id: 'rabbits', name: 'Rabbits', adj: 'Rabbit', glyph: '🐇', color: '#6FBF7A', color2: '#3d7145',
    trait: 'Prolific breeders',
    lore: 'Prolific beyond actuarial belief, the Rabbits measure history in generations per decade. Their census bureau is the largest single building in known space, and it is behind.',
    bonusText: '+50% population growth',
    popGrowthBonus: 0.5,
    personality: 'aggressive', objective: 'expansionist',
    researchCosts: { computers: 1, construction: 1, forceFields: 1, planetology: 0.6, propulsion: 1, weapons: 1 }
  },
  {
    id: 'hermitcrabs', name: 'Hermit Crabs', adj: 'Hermit Crab', glyph: '🦀', color: '#6BD9EC', color2: '#3a7d8a',
    trait: 'Immune to hostile worlds',
    lore: 'Crystalline-shelled contemplatives who colonize radioactive wastelands the way others settle meadows. They are in no hurry. Equilibrium, they say, arrives on its own schedule.',
    bonusText: 'Ignore waste and hostile worlds; half growth, no fertile/gaia benefit',
    wasteImmune: true, landAnywhere: true, growthHalved: true, noFertileBenefit: true,
    personality: 'xenophobic', objective: 'expansionist',
    researchCosts: { computers: 0.8, construction: 1.25, forceFields: 1.25, planetology: 1.25, propulsion: 1.25, weapons: 1.25 }
  }
];

// starting diplomacy matrix (manual p.40): values on the -100..100 scale
// relaxed=+20, neutral=0, unease=-10, restless=-25, wary=-30
(function () {
  var R = 20, N = 0, U = -10, RS = -25, W = -30;
  // order: budgies(alkari), ferrets(mrrshan), hamsters(human), ants(klackon), mice(meklar),
  //        rats(psilon), chameleons(darlok), rabbits(sakkra), hermitcrabs(silicoid), guineapigs(bulrathi)
  var order = ['budgies', 'ferrets', 'hamsters', 'ants', 'mice', 'rats', 'chameleons', 'rabbits', 'hermitcrabs', 'guineapigs'];
  var m = [
    /* budgies   */[null, RS, R, U, N, N, U, U, N, N],
    /* ferrets   */[RS, null, R, U, N, N, U, W, N, U],
    /* hamsters  */[R, R, null, R, R, R, R, R, R, R],
    /* ants      */[U, U, R, null, N, N, U, U, U, N],
    /* mice      */[N, N, R, N, null, N, U, U, R, N],
    /* rats      */[N, N, R, N, N, null, U, N, N, N],
    /* chameleons*/[U, U, R, U, U, U, null, U, U, U],
    /* rabbits   */[U, W, R, U, U, N, U, null, N, N],
    /* hermits   */[N, N, R, R, R, N, U, N, null, N],
    /* guineapigs*/[N, U, R, N, N, N, U, N, N, null]
  ];
  var matrix = {};
  order.forEach(function (a, i) {
    matrix[a] = {};
    order.forEach(function (b, j) { if (i !== j) matrix[a][b] = m[i][j]; });
  });
  HOO.DATA.START_RELATIONS = matrix;
})();

// the fifteen levels of diplomatic relations (manual p.25)
HOO.DATA.RELATION_LEVELS = [
  { min: -200, name: 'Feud' }, { min: -85, name: 'Hate' }, { min: -70, name: 'Discord' },
  { min: -55, name: 'Troubled' }, { min: -45, name: 'Tense' }, { min: -35, name: 'Restless' },
  { min: -25, name: 'Wary' }, { min: -15, name: 'Unease' }, { min: -5, name: 'Neutral' },
  { min: 5, name: 'Relaxed' }, { min: 15, name: 'Amiable' }, { min: 25, name: 'Calm' },
  { min: 40, name: 'Affable' }, { min: 60, name: 'Peaceful' }, { min: 80, name: 'Harmony' }
];

HOO.DATA.PERSONALITIES = {
  ruthless: { name: 'Ruthless', warThreshold: -20, peaceWill: 0.3, tributeEffect: 1.0 },
  erratic: { name: 'Erratic', warThreshold: -35, peaceWill: 0.5, tributeEffect: 1.0, erratic: true },
  aggressive: { name: 'Aggressive', warThreshold: -30, peaceWill: 0.4, tributeEffect: 1.0 },
  pacifist: { name: 'Pacifistic', warThreshold: -60, peaceWill: 0.9, tributeEffect: 1.2 },
  honorable: { name: 'Honourable', warThreshold: -50, peaceWill: 0.6, tributeEffect: 1.1, grudge: 2 },
  xenophobic: { name: 'Xenophobic', warThreshold: -40, peaceWill: 0.4, tributeEffect: 0.5, hostileDouble: true }
};

HOO.DATA.OBJECTIVES = {
  diplomat: { name: 'Diplomat', research: { computers: 1.2, construction: 1, forceFields: 1, planetology: 1, propulsion: 1, weapons: 0.8 } },
  militarist: { name: 'Militarist', research: { computers: 1, construction: 1, forceFields: 1.1, planetology: 0.7, propulsion: 1, weapons: 1.6 }, fleetHunger: 1.5 },
  technologist: { name: 'Technologist', research: { computers: 1.1, construction: 1.1, forceFields: 1.1, planetology: 1.1, propulsion: 1.1, weapons: 1.1 }, techFocus: 1.4 },
  ecologist: { name: 'Ecologist', research: { computers: 0.8, construction: 1.2, forceFields: 1, planetology: 1.6, propulsion: 0.9, weapons: 0.8 } },
  industrialist: { name: 'Industrialist', research: { computers: 1.3, construction: 1.5, forceFields: 0.9, planetology: 1, propulsion: 0.8, weapons: 0.9 } },
  expansionist: { name: 'Expansionist', research: { computers: 0.8, construction: 0.9, forceFields: 0.8, planetology: 1.4, propulsion: 1.5, weapons: 0.9 }, expandHunger: 1.6 }
};

HOO.DATA.raceById = {};
HOO.DATA.RACES.forEach(function (r) { HOO.DATA.raceById[r.id] = r; });
