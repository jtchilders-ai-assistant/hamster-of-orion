# AI Implementation Guide

## Overview

The AI system for Hamster of Orion implements asymmetric personalities, strategic planning, and tactical decision-making. This guide covers the complete AI architecture.

---

## AI Architecture

### Core AI Loop

```javascript
class AIEmpire extends Empire {
  constructor(raceId, difficulty) {
    super(raceId);

    this.personality = PersonalityFactory.create(raceId);
    this.strategy = new Strategy();
    this.memory = new AIMemory();
    this.difficulty = difficulty;

    // AI systems
    this.strategicAI = new StrategicAI(this);
    this.economyAI = new EconomyAI(this);
    this.militaryAI = new MilitaryAI(this);
    this.researchAI = new ResearchAI(this);
    this.diplomacyAI = new DiplomacyAI(this);
  }

  /**
   * Main AI turn processing
   */
  async takeTurn(gameState) {
    // 1. Assess situation
    const situation = this.assessSituation(gameState);

    // 2. Update strategy if needed
    if (this.shouldReEvaluateStrategy(gameState.turn)) {
      this.strategy = this.strategicAI.planStrategy(situation);
    }

    // 3. Make all decisions
    const decisions = {
      // Economy
      production: await this.economyAI.planProduction(gameState, this.strategy),

      // Research
      research: await this.researchAI.selectTechnology(gameState, this.strategy),

      // Military
      fleetOrders: await this.militaryAI.issueFleetOrders(gameState, this.strategy),
      shipDesigns: await this.militaryAI.updateShipDesigns(gameState),

      // Diplomacy
      diplomacy: await this.diplomacyAI.conductDiplomacy(gameState, this.strategy)
    };

    // 4. Apply difficulty modifiers
    this.applyDifficultyBonuses(decisions);

    return decisions;
  }

  /**
   * Situational awareness
   */
  assessSituation(gameState) {
    const empires = Object.values(gameState.empires.byId);

    return {
      // Own strength
      myFleetPower: this.calculateFleetPower(),
      myProduction: this.calculateProduction(),
      myTechLevel: this.completedTechs.size,
      myPopulation: this.calculatePopulation(),

      // Relative position
      rank: this.calculateRank(empires),
      isLeader: this.isStrongest(empires),
      isWeakest: this.isWeakest(empires),

      // Threats
      immediateThreats: this.identifyThreats(empires, 'immediate'),
      longTermThreats: this.identifyThreats(empires, 'longTerm'),

      // Opportunities
      expansionOpportunities: this.findExpansionTargets(gameState),
      diplomaticOpportunities: this.findDiplomaticOptions(empires),
      victoryProgress: this.assessVictoryProgress(gameState),

      // Resources
      economyHealth: this.assessEconomy(),
      militaryReadiness: this.assessMilitary(),
      techProgress: this.assessResearch()
    };
  }
}
```

---

## Personality System

### Personality Definition

```javascript
class AIPersonality {
  constructor(type, raceId) {
    this.type = type;
    this.raceId = raceId;

    // Core traits (0-100)
    this.aggression = 50;
    this.expansionism = 50;
    this.diplomacy = 50;
    this.research = 50;

    // Behavioral modifiers
    this.honorable = false;       // Keeps treaties
    this.backstabber = false;     // Breaks treaties opportunistically
    this.logical = false;         // Pure optimization
    this.xenophobic = false;      // Dislikes all aliens
    this.techTrader = false;      // Willing to trade tech
    this.warMonger = false;       // Loves war
    this.peaceful = false;        // Avoids war

    this.applyRacePersonality(raceId);
  }

  applyRacePersonality(raceId) {
    switch (raceId) {
      case 'hamsters':
        this.diplomacy = 80;
        this.research = 65;
        this.aggression = 30;
        this.honorable = true;
        this.techTrader = true;
        break;

      case 'guinea_pigs':
        this.aggression = 90;
        this.expansionism = 85;
        this.diplomacy = 20;
        this.warMonger = true;
        break;

      case 'rats':
        this.research = 95;
        this.aggression = 40;
        this.techTrader = true;
        this.logical = true;
        break;

      case 'chameleons':
        this.aggression = 70;
        this.backstabber = true;  // NEVER TRUST
        this.diplomacy = 60;
        break;

      case 'ants':
        this.logical = true;
        this.expansionism = 70;
        this.xenophobic = true;   // Hive-mind isolationism
        break;

      // ... other races
    }
  }

  /**
   * Decision modifier based on personality
   */
  modifyDecision(baseValue, traitType) {
    switch (traitType) {
      case 'declare_war':
        return baseValue * (this.aggression / 50);
      case 'research_priority':
        return baseValue * (this.research / 50);
      case 'break_treaty':
        if (this.honorable) return baseValue * 0.1;
        if (this.backstabber) return baseValue * 3.0;
        return baseValue;
      default:
        return baseValue;
    }
  }
}

/**
 * Personality Factory
 */
class PersonalityFactory {
  static create(raceId) {
    const personality = new AIPersonality(this.getType(raceId), raceId);

    // Add some randomization (±10%)
    personality.aggression += (Math.random() - 0.5) * 20;
    personality.expansionism += (Math.random() - 0.5) * 20;
    personality.diplomacy += (Math.random() - 0.5) * 20;
    personality.research += (Math.random() - 0.5) * 20;

    // Clamp to 0-100
    personality.aggression = Math.max(0, Math.min(100, personality.aggression));
    personality.expansionism = Math.max(0, Math.min(100, personality.expansionism));
    personality.diplomacy = Math.max(0, Math.min(100, personality.diplomacy));
    personality.research = Math.max(0, Math.min(100, personality.research));

    return personality;
  }

  static getType(raceId) {
    const typeMap = {
      'hamsters': 'diplomatic',
      'guinea_pigs': 'aggressive',
      'rats': 'scientific',
      'mice': 'builder',
      'chameleons': 'backstabber',
      'ants': 'expansionist',
      // etc.
    };
    return typeMap[raceId] || 'balanced';
  }
}
```

---

## Strategic AI

### Strategy Planning

```javascript
class StrategicAI {
  constructor(empire) {
    this.empire = empire;
  }

  /**
   * High-level strategy determination
   */
  planStrategy(situation) {
    const strategy = new Strategy();

    // Determine primary goal
    strategy.primary = this.selectPrimaryGoal(situation);
    strategy.secondary = this.selectSecondaryGoal(situation, strategy.primary);

    // Set focus areas
    strategy.economicFocus = this.determineEconomicFocus(situation);
    strategy.militaryStance = this.determineMilitaryStance(situation);
    strategy.diplomaticGoal = this.determineDiplomaticGoal(situation);

    // Identify targets
    strategy.targetEmpires = this.prioritizeTargets(situation);
    strategy.targetSystems = this.prioritizeExpansion(situation);

    strategy.lastEvaluation = situation.turn;
    strategy.nextEvaluation = situation.turn + 10;  // Re-evaluate every 10 turns

    return strategy;
  }

  selectPrimaryGoal(situation) {
    const personality = this.empire.personality;
    const scores = {};

    // Score each victory path
    scores.survival = this.scoreGoal('survival', situation);
    scores.expansion = this.scoreGoal('expansion', situation);
    scores.tech_advantage = this.scoreGoal('tech_advantage', situation);
    scores.military_supremacy = this.scoreGoal('military_supremacy', situation);
    scores.diplomatic_victory = this.scoreGoal('diplomatic_victory', situation);
    scores.discovery = this.scoreGoal('discovery', situation);

    // Apply personality modifiers
    scores.military_supremacy *= (personality.aggression / 50);
    scores.tech_advantage *= (personality.research / 50);
    scores.diplomatic_victory *= (personality.diplomacy / 50);

    // Choose highest scoring goal
    let bestGoal = 'survival';
    let bestScore = 0;
    for (const [goal, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestGoal = goal;
      }
    }

    return bestGoal;
  }

  scoreGoal(goal, situation) {
    switch (goal) {
      case 'survival':
        // Prioritize if under threat
        return situation.immediateThreats.length * 50;

      case 'expansion':
        // Good if space available and not too many enemies
        const spaceAvailable = situation.expansionOpportunities.length;
        const enemies = situation.immediateThreats.length;
        return spaceAvailable * 10 - enemies * 5;

      case 'tech_advantage':
        // Prioritize if already ahead in research
        return situation.myTechLevel - situation.averageTechLevel + 50;

      case 'military_supremacy':
        // Good if strong military and aggressive
        return (situation.myFleetPower / situation.averageFleetPower) * 50;

      case 'diplomatic_victory':
        // Requires high relations and council formed
        if (!situation.councilFormed) return 0;
        return situation.myVoteShare * 100;

      case 'discovery':
        // Only viable if Orion location known and fleet strong enough
        if (!situation.orionRevealed) return 0;
        return situation.guardianDefeatable ? 80 : 20;

      default:
        return 0;
    }
  }

  /**
   * Threat assessment
   */
  identifyThreats(empires, timeframe) {
    const threats = [];

    for (const empire of empires) {
      if (empire.id === this.empire.id) continue;

      const threatLevel = this.evaluateThreat(empire, timeframe);

      if (threatLevel > 30) {  // Threshold
        threats.push({ empire, level: threatLevel });
      }
    }

    // Sort by threat level
    threats.sort((a, b) => b.level - a.level);

    return threats;
  }

  evaluateThreat(empire, timeframe) {
    let threat = 0;

    // Military power
    const fleetRatio = empire.fleetPower / this.empire.fleetPower;
    threat += fleetRatio * 40;

    // Production capacity
    const prodRatio = empire.production / this.empire.production;
    threat += prodRatio * 20;

    // Technology level
    const techRatio = empire.techLevel / this.empire.techLevel;
    threat += techRatio * 15;

    // Proximity
    const proximity = this.calculateProximity(empire);
    threat += (1 - proximity) * 10;  // Closer = more threatening

    // Relations
    const relations = this.empire.diplomacy.getRelations(empire.id);
    threat -= relations * 0.3;  // Good relations reduce threat

    // Immediate factors
    if (timeframe === 'immediate') {
      // At war
      if (relations < -50) {
        threat += 30;
      }

      // Fleets near borders
      const nearbyFleets = this.countNearbyEnemyFleets(empire);
      threat += nearbyFleets * 5;
    }

    return Math.max(0, threat);
  }
}
```

---

## Economy AI

### Production Planning

```javascript
class EconomyAI {
  constructor(empire) {
    this.empire = empire;
  }

  /**
   * Plan production for all planets
   */
  planProduction(gameState, strategy) {
    const decisions = {};

    for (const planetId of this.empire.planetIds) {
      const planet = gameState.galaxy.planets.byId[planetId];
      decisions[planetId] = this.planPlanetProduction(planet, strategy, gameState);
    }

    return decisions;
  }

  planPlanetProduction(planet, strategy, gameState) {
    // Initialize sliders
    const sliders = {
      ship: 0,
      defense: 0,
      industry: 0,
      ecology: 0,
      research: 0
    };

    // Calculate priorities
    const priorities = this.calculatePriorities(planet, strategy, gameState);

    // Allocate based on priorities
    this.allocateProduction(sliders, priorities, planet);

    // Adjust for special cases
    this.applySpecialCases(sliders, planet, gameState);

    return sliders;
  }

  calculatePriorities(planet, strategy, gameState) {
    const personality = this.empire.personality;
    const priorities = {};

    // Ship production priority
    priorities.ship = 40 * (personality.aggression / 50);
    if (strategy.militaryStance === 'aggressive') {
      priorities.ship += 20;
    }
    if (planet.isHomeworld || planet.hasSpaceyard) {
      priorities.ship += 10;  // Build ships at shipyards
    }

    // Defense priority
    priorities.defense = 20;
    if (this.isFrontlinePlanet(planet, gameState)) {
      priorities.defense += 30;  // Fortify borders
    }
    if (planet.missileBases >= planet.maxMissileBases) {
      priorities.defense = 0;  // Already maxed
    }

    // Industry priority
    priorities.industry = 30;
    if (strategy.economicFocus === 'production') {
      priorities.industry += 20;
    }
    if (planet.factories >= planet.maxFactories) {
      priorities.industry = 0;  // Already maxed
    }

    // Ecology priority
    priorities.ecology = planet.waste > 0 ? planet.waste * 2 : 0;
    if (planet.waste > planet.population * 0.5) {
      priorities.ecology = 50;  // Emergency cleanup
    }

    // Research priority
    priorities.research = 30 * (personality.research / 50);
    if (strategy.primary === 'tech_advantage') {
      priorities.research += 25;
    }
    if (planet.hasArtifacts) {
      priorities.research += 20;  // +50% research bonus!
    }

    return priorities;
  }

  allocateProduction(sliders, priorities, planet) {
    // Normalize priorities to sum to 100
    const total = Object.values(priorities).reduce((sum, val) => sum + val, 0);

    for (const [key, value] of Object.entries(priorities)) {
      sliders[key] = Math.round((value / total) * 100);
    }

    // Ensure sum = 100 (rounding errors)
    const sum = Object.values(sliders).reduce((s, v) => s + v, 0);
    if (sum !== 100) {
      sliders.industry += (100 - sum);  // Adjust industry
    }
  }

  applySpecialCases(sliders, planet, gameState) {
    // If planet just colonized, focus on growth
    if (planet.population < 10) {
      sliders.industry = 80;
      sliders.ecology = 10;
      sliders.research = 10;
      sliders.ship = 0;
      sliders.defense = 0;
      return;
    }

    // If under attack, focus on defense
    if (this.isUnderAttack(planet, gameState)) {
      sliders.ship = 50;
      sliders.defense = 40;
      sliders.industry = 10;
      sliders.ecology = 0;
      sliders.research = 0;
      return;
    }

    // If building specific project, allocate heavily
    if (planet.buildQueue.length > 0) {
      const project = planet.buildQueue[0];
      if (project.type === 'ship') {
        sliders.ship = Math.max(sliders.ship, 40);
      }
    }
  }

  /**
   * Building construction decisions
   */
  selectBuilding(planet, strategy) {
    const availableBuildings = this.getAvailableBuildings(planet);

    // Score each building
    const scored = availableBuildings.map(building => ({
      building,
      score: this.scoreBuilding(building, planet, strategy)
    }));

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.building || null;
  }

  scoreBuilding(building, planet, strategy) {
    let score = 0;

    switch (building.category) {
      case 'production':
        score += strategy.economicFocus === 'production' ? 50 : 20;
        score += planet.factories / planet.maxFactories * 30;  // Build if have factories
        break;

      case 'research':
        score += strategy.primary === 'tech_advantage' ? 60 : 25;
        score += planet.hasArtifacts ? 30 : 0;  // Synergy!
        break;

      case 'defense':
        score += this.isFrontlinePlanet(planet) ? 50 : 10;
        score += strategy.militaryStance === 'defensive' ? 20 : 0;
        break;

      case 'growth':
        score += planet.population < planet.maxPopulation * 0.5 ? 40 : 10;
        break;

      case 'morale':
        score += planet.morale < 'content' ? 50 : 5;
        break;
    }

    // Cost efficiency
    score -= building.cost / 100;  // Penalize expensive buildings

    return score;
  }
}
```

---

## Military AI

### Fleet Management

```javascript
class MilitaryAI {
  constructor(empire) {
    this.empire = empire;
  }

  /**
   * Issue orders to all fleets
   */
  issueFleetOrders(gameState, strategy) {
    const orders = {};

    for (const fleetId of this.empire.fleetIds) {
      const fleet = gameState.fleets.byId[fleetId];
      orders[fleetId] = this.decideFleetAction(fleet, strategy, gameState);
    }

    return orders;
  }

  decideFleetAction(fleet, strategy, gameState) {
    // Check if fleet is already engaged
    if (fleet.isInCombat) {
      return this.decideCombatAction(fleet, gameState);
    }

    // Evaluate fleet role
    const role = this.determineFleetRole(fleet);

    switch (role) {
      case 'scout':
        return this.orderScout(fleet, gameState);

      case 'patrol':
        return this.orderPatrol(fleet, gameState);

      case 'attack':
        return this.orderAttack(fleet, strategy, gameState);

      case 'defend':
        return this.orderDefend(fleet, gameState);

      case 'invade':
        return this.orderInvasion(fleet, gameState);

      default:
        return { type: 'none' };
    }
  }

  determineFleetRole(fleet) {
    // Analyze fleet composition
    const ships = fleet.shipIds.map(id => this.getShipDesign(id));

    const scoutCount = ships.filter(s => s.class === 'scout').length;
    const fighterCount = ships.filter(s => s.class === 'fighter').length;
    const capitalShips = ships.filter(s =>
      ['cruiser', 'battle_cruiser', 'dreadnought', 'titan'].includes(s.class)
    ).length;

    // Majority determines role
    if (scoutCount > fleet.shipIds.length * 0.7) {
      return 'scout';
    }

    if (capitalShips >= 3) {
      return 'attack';  // Offensive fleet
    }

    if (fighterCount > capitalShips) {
      return 'patrol';  // Light patrol
    }

    return 'defend';  // Default to defense
  }

  orderAttack(fleet, strategy, gameState) {
    // Find highest value target
    const targets = this.findAttackTargets(gameState, strategy);

    if (targets.length === 0) {
      return { type: 'patrol', systems: this.getBorderSystems(gameState) };
    }

    // Score targets
    const scored = targets.map(target => ({
      target,
      score: this.scoreAttackTarget(target, fleet, gameState)
    }));

    scored.sort((a, b) => b.score - a.score);

    const bestTarget = scored[0].target;

    // Decide: invade or just attack
    if (bestTarget.type === 'planet' && this.canInvade(fleet)) {
      return { type: 'invade', target: bestTarget.id };
    } else {
      return { type: 'attack', target: bestTarget.id };
    }
  }

  scoreAttackTarget(target, fleet, gameState) {
    let score = 0;

    if (target.type === 'planet') {
      // Value of planet
      score += target.production * 2;
      score += target.population * 1;
      score += target.isHomeworld ? 100 : 0;

      // Defense strength
      const defenseStrength = this.estimateDefenseStrength(target);
      const fleetStrength = this.calculateFleetStrength(fleet);

      if (fleetStrength < defenseStrength * 0.8) {
        score *= 0.1;  // Too strong, avoid
      } else if (fleetStrength > defenseStrength * 2) {
        score *= 1.5;  // Easy target, prioritize
      }

      // Distance
      const distance = this.calculateDistance(fleet.systemId, target.systemId);
      score -= distance * 5;  // Prefer closer targets
    }

    if (target.type === 'fleet') {
      // Enemy fleet threat
      score += this.calculateFleetStrength(target) * 0.5;

      // Can we win?
      const myStrength = this.calculateFleetStrength(fleet);
      const theirStrength = this.calculateFleetStrength(target);

      if (myStrength < theirStrength) {
        score = 0;  // Don't attack superior fleets
      }
    }

    return score;
  }

  /**
   * Combat tactics
   */
  decideCombatAction(fleet, combat) {
    // Evaluate situation
    const myStrength = this.calculateCombatStrength(fleet, combat);
    const enemyStrength = this.calculateEnemyStrength(combat);

    const ratio = myStrength / enemyStrength;

    // Retreat if losing badly
    if (ratio < 0.4 || myStrength < myStrength * 0.3) {
      return { type: 'retreat' };
    }

    // Focus fire tactics
    const targets = this.prioritizeCombatTargets(combat);

    return {
      type: 'attack',
      strategy: 'focus_fire',
      targets: targets
    };
  }

  prioritizeCombatTargets(combat) {
    const enemies = combat.getEnemyShips(this.empire.id);

    // Score each enemy
    const scored = enemies.map(ship => ({
      ship,
      score: this.scoreCombatTarget(ship, combat)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => s.ship.id);
  }

  scoreCombatTarget(ship, combat) {
    let score = 0;

    // Prioritize damaged ships (finish them off)
    const hpRatio = ship.hp / ship.maxHp;
    score += (1 - hpRatio) * 50;

    // Prioritize dangerous ships
    score += ship.weapons.totalDamage * 0.5;

    // Prioritize close ships (can be killed this turn)
    const distance = this.calculateDistanceToShip(ship, combat);
    score -= distance * 5;

    return score;
  }
}
```

---

## Research AI

```javascript
class ResearchAI {
  constructor(empire) {
    this.empire = empire;
  }

  selectTechnology(gameState, strategy) {
    const personality = this.empire.personality;

    // Get available techs in each field
    const available = gameState.research.availableTechs;

    // Score each tech
    const allTechs = Object.values(available).flat();
    const scored = allTechs.map(tech => ({
      tech,
      score: this.scoreTechnology(tech, strategy, personality)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.tech || null;
  }

  scoreTechnology(tech, strategy, personality) {
    let score = 50;  // Base

    // Field preferences
    const fieldScores = {
      weapons: personality.aggression,
      propulsion: personality.expansionism * 0.8,
      construction: personality.expansionism * 0.6,
      computers: 50,
      force_fields: 50,
      biotechnology: 60
    };

    score += (fieldScores[tech.field] || 50) * 0.5;

    // Strategy alignment
    if (strategy.primary === 'tech_advantage') {
      score += tech.tier * 10;  // Prefer advanced techs
    }

    if (strategy.primary === 'military_supremacy') {
      if (tech.field === 'weapons' || tech.field === 'force_fields') {
        score += 40;
      }
    }

    if (strategy.primary === 'discovery') {
      // Need strong fleet for Guardian
      if (tech.field === 'weapons' || tech.field === 'propulsion') {
        score += 30;
      }
    }

    // Racial synergies
    if (tech.racialBonuses && tech.racialBonuses[this.empire.raceId]) {
      score += 25;  // Exploit racial advantages
    }

    // Cost efficiency
    score -= tech.baseCost / 20;

    return score;
  }
}
```

---

## Diplomacy AI

```javascript
class DiplomacyAI {
  constructor(empire) {
    this.empire = empire;
  }

  conductDiplomacy(gameState, strategy) {
    const actions = [];

    for (const empireId in gameState.empires.byId) {
      if (empireId === this.empire.id) continue;

      const otherEmpire = gameState.empires.byId[empireId];
      const action = this.decideDiplomaticAction(otherEmpire, strategy, gameState);

      if (action) {
        actions.push(action);
      }
    }

    return actions;
  }

  decideDiplomaticAction(otherEmpire, strategy, gameState) {
    const relations = this.empire.diplomacy.getRelations(otherEmpire.id);
    const personality = this.empire.personality;

    // War decision
    if (this.shouldDeclareWar(otherEmpire, relations, strategy)) {
      return { type: 'declare_war', target: otherEmpire.id };
    }

    // Peace offer (if at war)
    if (relations.state === 'war' && this.shouldOfferPeace(otherEmpire, gameState)) {
      return { type: 'offer_peace', target: otherEmpire.id };
    }

    // Alliance proposal
    if (this.shouldProposeAlliance(otherEmpire, relations, strategy)) {
      return { type: 'propose_alliance', target: otherEmpire.id };
    }

    // Trade agreement
    if (this.shouldProposeTrade(otherEmpire, relations)) {
      return { type: 'propose_trade', target: otherEmpire.id };
    }

    // Demand tribute (if much stronger)
    if (this.shouldDemandTribute(otherEmpire, gameState)) {
      return { type: 'demand_tribute', target: otherEmpire.id, amount: 500 };
    }

    return null;
  }

  shouldDeclareWar(otherEmpire, relations, strategy) {
    // Never declare war if personality is peaceful
    if (this.empire.personality.peaceful) {
      return false;
    }

    // Warmongers need little reason
    if (this.empire.personality.warMonger) {
      return Math.random() < 0.3;  // 30% chance each turn
    }

    // Check if beneficial
    const myStrength = this.empire.calculateFleetPower();
    const theirStrength = otherEmpire.calculateFleetPower();

    if (myStrength < theirStrength * 1.5) {
      return false;  // Only attack if significantly stronger
    }

    // Consider strategic goals
    if (strategy.primary === 'military_supremacy') {
      return relations.value < -20;  // Attack unfriendly empires
    }

    if (strategy.targetEmpires[otherEmpire.id] === 'critical') {
      return true;  // Strategic target
    }

    return false;
  }
}
```

---

## Difficulty Scaling

```javascript
/**
 * Apply difficulty bonuses/penalties
 */
function applyDifficultyModifiers(empire, difficulty) {
  const modifiers = {
    easy: {
      production: 0.75,
      research: 0.75,
      combat: 0.80
    },
    normal: {
      production: 1.0,
      research: 1.0,
      combat: 1.0
    },
    hard: {
      production: 1.25,
      research: 1.25,
      combat: 1.15
    },
    impossible: {
      production: 1.50,
      research: 1.50,
      combat: 1.30
    }
  };

  const mod = modifiers[difficulty];

  empire.productionModifier = mod.production;
  empire.researchModifier = mod.research;
  empire.combatModifier = mod.combat;
}
```

---

AI system complete! Provides challenging opponents with distinct personalities. Next: `development-roadmap.md` for implementation phases.
