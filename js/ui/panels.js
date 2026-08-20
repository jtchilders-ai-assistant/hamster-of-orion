/* Hamster of Orion — sidebar context panels (star systems, colonies, fleets) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;

  var pendingDeploy = null;   // legacy
  var pendingTransport = null; // {fromStarId, pop}
  var pendingReloc = null;    // {starId}
  var currentSel = null;      // {fleet, counts[]} — live deployment context for direct map clicks

  function sidebar() { return HOO.UI.sidebarEl(); }

  function section(title, children, extraHead) {
    var s = el('div', { cls: 'side-section' });
    if (title) {
      var head = el('div', { cls: 'side-title' }, [el('h2', { text: title })]);
      if (extraHead) head.appendChild(extraHead);
      s.appendChild(head);
    }
    (children || []).forEach(function (c) { if (c) s.appendChild(c); });
    return s;
  }

  function kv(k, v, cls) {
    return el('div', { cls: 'kv' }, [
      el('span', { cls: 'k', text: k }),
      el('span', { cls: 'v ' + (cls || ''), html: v })
    ]);
  }

  // ---------------- star / colony panel ----------------

  function showBlank() {
    var sb = sidebar();
    U.clearEl(sb);
    currentSel = null;
    sb.appendChild(section('Command Deck', [
      el('p', { cls: 'muted-t', style: 'font-size:12.5px;', text: 'Click a star to inspect it, or a fleet triangle to command it. Drag to pan, scroll to zoom.' }),
      el('p', { cls: 'dim-t', style: 'font-size:11.5px; margin-top:8px;', text: 'Shortcuts: Enter — end cycle · Tab — cycle colonies · F — cycle fleets · H — home · 1-6 — stations · Esc — cancel' })
    ]));
  }

  function showStar(starId) {
    var g = HOO.game;
    var s = g.stars[starId];
    HOO.Map.select(starId);
    currentSel = null;
    var sb = sidebar();
    U.clearEl(sb);

    var eyebrow = el('div', { cls: 'eyebrow', text: s.orion ? 'The Galactic Core' : (s.color + ' star') });
    if (!s.explored[0]) {
      sb.appendChild(section(s.name === undefined ? 'Unknown' : (s.explored[0] ? s.name : 'Uncharted System'), [
        eyebrow,
        el('p', { cls: 'muted-t', style: 'margin-top:8px', text: 'This system has not been explored. Send a ship to chart it.' })
      ]));
      appendFleetList(sb, s);
      return;
    }

    if (!s.planet) {
      sb.appendChild(section(s.name, [
        eyebrow,
        el('p', { cls: 'muted-t', style: 'margin-top:8px', text: 'No planets capable of supporting life orbit this star.' })
      ]));
      appendFleetList(sb, s);
      return;
    }

    var p = s.planet;
    var def = HOO.CONST.PLANET_TYPES[p.type];
    var sp = HOO.CONST.SPECIALS[p.special];

    if (p.colony && p.colony.empire === 0) {
      showOwnColony(sb, s);
    } else {
      var bits = [eyebrow];
      bits.push(kv('Environment', def.name + (def.hostility ? ' <span class="bad">(hostile)</span>' : '')));
      bits.push(kv('Size', String(Math.round(p.size))));
      if (sp.name) bits.push(kv('Special', sp.name, 'gold'));
      if (s.inNebula) bits.push(kv('Region', 'Nebula — shields fail here', 'bad'));
      if (s.orion && g.guardian.alive) {
        bits.push(el('div', { cls: 'narrative', html: '<span class="speaker">Deep Scan</span>Something vast moves in orbit. A signal repeats on a frequency that causes physical pain. No fleet has returned from Orion.' }));
      }
      if (p.colony) {
        var emp = g.empires[p.colony.empire];
        var race = HOO.DATA.raceById[emp.raceId];
        bits.push(el('hr', { cls: 'hr' }));
        bits.push(kv('Colony', '<span style="color:' + emp.color + '">' + U.esc(race.name) + '</span>'));
        bits.push(kv('Population', String(Math.round(p.colony.pop))));
        if (p.colony.bases) bits.push(kv('Missile bases', String(p.colony.bases)));
      } else {
        var pl = g.empires[0];
        var canland = HOO.Ground.canColonize(g, pl, s);
        bits.push(el('p', {
          cls: canland ? 'good' : 'muted-t', style: 'margin-top:8px; font-size:12.5px;',
          text: canland ? 'Colonization possible with a colony ship.' :
            (def.hostility > pl.derived.maxHostility ? 'Environment too hostile for our colony technology.' : 'Uncolonized.')
        }));
        // colonize button if colony ship in orbit
        var fleet = HOO.Fleet.fleetAt(g, 0, s.id);
        var hasColShip = fleet && pl.designs.some(function (d, i) { return d && d.hasColonyBase && fleet.ships[i] > 0; });
        if (canland && hasColShip) {
          bits.push(el('button', {
            cls: 'btn primary', style: 'margin-top:10px; width:100%;', text: 'Found Colony',
            onclick: function () {
              if (HOO.Ground.colonize(g, 0, s.id, fleet)) {
                HOO.UI.dialog('A New Beginning',
                  '<div class="narrative"><span class="speaker">' + U.esc(pl.leaderName) + '</span>The first burrows are dug at ' + U.esc(s.name) + '. Another world joins the ' + U.esc(HOO.DATA.raceById[pl.raceId].name) + '. The Wheel turns.</div>');
                showStar(s.id);
                HOO.UI.refreshTopbar();
              }
            }
          }));
        }
      }
      sb.appendChild(section(s.name, bits));
      appendFleetList(sb, s);
      // enemy colony actions: bombard
      if (p.colony && p.colony.empire !== 0) {
        var myFleet = HOO.Fleet.fleetAt(g, 0, s.id);
        if (myFleet) {
          sb.appendChild(section('Orbital Operations', [
            el('button', {
              cls: 'btn danger', style: 'width:100%;', text: 'Bombard Colony',
              onclick: function () { confirmBombard(s); }
            })
          ]));
        }
      }
    }
  }

  function confirmBombard(s) {
    var g = HOO.game;
    HOO.UI.dialog('Bombard ' + s.name + '?',
      'Orbital bombardment will kill colonists and destroy industry. The galaxy will remember.',
      [
        {
          label: 'Commence Bombardment', cls: 'danger', fn: function () {
            var rep = HOO.Ground.bombard(g, 0, s);
            if (rep) {
              var txt = 'Bombardment of ' + U.esc(s.name) + ': ' + Math.round(rep.popKilled) + ' million dead, ' +
                Math.round(rep.factoriesLost) + ' factories destroyed' + (rep.basesLost ? ', ' + rep.basesLost + ' bases levelled' : '') + '.';
              if (rep.destroyed) txt += ' The colony has been wiped out.';
              HOO.UI.dialog('Bombardment Report', txt);
              showStar(s.id);
            }
          }
        },
        { label: 'Stand Down', cls: '' }
      ]);
  }

  function showOwnColony(sb, s) {
    var g = HOO.game;
    var emp = g.empires[0];
    var c = s.planet.colony;
    var p = s.planet;
    var def = HOO.CONST.PLANET_TYPES[p.type];
    var sp = HOO.CONST.SPECIALS[p.special];
    var mp = HOO.Colony.maxPop(emp, s);
    var raw = HOO.Colony.rawProduction(emp, s);
    var spend = raw * (emp.economy ? emp.economy.ratio : 1);

    var head = [];
    head.push(el('div', { cls: 'eyebrow', text: def.name + (sp.name ? ' · ' + sp.name : '') + (s.inNebula ? ' · nebula' : '') }));
    head.push(kv('Population', Math.round(c.pop) + ' / ' + Math.round(mp) + (c.lastGrowth ? ' <span class="' + (c.lastGrowth > 0 ? 'good' : 'bad') + '">(' + (c.lastGrowth > 0 ? '+' : '') + Math.round(c.lastGrowth) + ')</span>' : '')));
    head.push(kv('Factories', Math.round(c.factories) + (c.controls < emp.derived.controls ? ' <span class="muted-t">(refit pending)</span>' : '')));
    head.push(kv('Missile bases', String(c.bases) + (c.shield ? ' · shield ' + U.roman(c.shield) : '')));
    if (p.waste > 0) head.push(kv('Industrial waste', String(Math.round(p.waste)), 'bad'));
    head.push(kv('Production', '<b>' + U.fmt(spend) + '</b> (' + U.fmt(raw) + ') BC'));
    if (c.inRebellion) head.push(el('div', { cls: 'narrative bad', html: '<span class="speaker">Rebellion</span>The colony is in open revolt. Transport loyal citizens here to restore order.' }));
    if (c.quarantine) head.push(el('div', { cls: 'narrative bad', html: '<span class="speaker">Quarantine</span>Plague grips the colony. All research is diverted to the cure.' }));
    if (c.novaThreat) head.push(el('div', { cls: 'narrative bad', html: '<span class="speaker">Stellar Instability</span>The primary threatens to go nova. Research teams race for an answer.' }));

    sb.appendChild(section(s.name, head));

    // ---- production ratio bars ----
    var barsWrap = el('div', {});
    var rows = {};
    var labels = { ship: 'Ship', def: 'Def', ind: 'Ind', eco: 'Eco', tech: 'Tech' };
    var noteFns = {
      ship: function () { return shipNote(emp, s, c); },
      def: function () { return defNote(emp, s, c); },
      ind: function () { return indNote(emp, s, c); },
      eco: function () { return ecoNote(emp, s, c); },
      tech: function () { return Math.round(c.alloc.tech) + '%'; }
    };
    Object.keys(labels).forEach(function (key) {
      rows[key] = HOO.UI.ratioRow({
        label: labels[key], cls: 'r-' + key,
        get: function () { return c.alloc[key]; },
        set: function (v) {
          HOO.UI.rebalance(c.alloc, key, v, c.locks);
          Object.keys(rows).forEach(function (k2) { rows[k2]._update(); });
        },
        note: noteFns[key],
        lockable: true,
        locked: function () { return !!c.locks[key]; },
        toggleLock: function () { c.locks[key] = !c.locks[key]; }
      });
      barsWrap.appendChild(rows[key]);
    });

    // allocation presets
    var presetRow = el('div', { cls: 'preset-row' });
    [['develop', 'Develop'], ['defend', 'Defend'], ['research', 'Research'], ['shipyard', 'Shipyard']].forEach(function (pdef) {
      presetRow.appendChild(el('button', {
        cls: 'btn small', text: pdef[1], title: 'Set allocation preset (Shift-click: apply to all colonies)',
        onclick: function (ev) {
          if (ev && ev.shiftKey) {
            HOO.Colony.colonies(g, 0).forEach(function (e2) { applyPreset(emp, e2.star, e2.colony, pdef[0]); });
            HOO.UI.toast({ tag: 'Colonial Administration', text: '"' + pdef[1] + '" allocation applied to all colonies.', kind: 'gold', timeout: 6000 });
          } else {
            applyPreset(emp, s, c, pdef[0]);
          }
          showStar(s.id);
        }
      }));
    });
    presetRow.appendChild(el('span', { cls: 'dim-t', style: 'font-size:10px; align-self:center;', text: '⇧click = all' }));

    // ship being built + reloc + transport buttons
    var dsg = emp.designs[c.buildDesign];
    var shipRow = el('div', { style: 'display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;' });
    shipRow.appendChild(el('button', {
      cls: 'btn small', text: '⚙ ' + (c.buildingStargate ? 'Star Gate' : (dsg ? dsg.name : '—')),
      title: 'Change ship under construction',
      onclick: function () { cycleShip(c, emp, s); }
    }));
    shipRow.appendChild(el('button', {
      cls: 'btn small' + (c.reloc !== null && c.reloc !== undefined ? ' active' : ''), text: 'Reloc',
      title: 'Send newly built ships to another system',
      onclick: function () {
        pendingReloc = { starId: s.id };
        HOO.Map.setRelocMode(pendingReloc);
        instruction('Select a destination system for newly built ships. Click the map.');
      }
    }));
    shipRow.appendChild(el('button', {
      cls: 'btn small', text: 'Trans',
      title: 'Transport colonists to another colony',
      onclick: function () { askTransport(s); }
    }));
    if (emp.reserve >= 1) {
      shipRow.appendChild(el('button', {
        cls: 'btn small', text: 'Fund',
        title: 'Transfer reserve BC to this colony',
        onclick: function () { askTransfer(s); }
      }));
    }

    sb.appendChild(section('Production', [barsWrap, presetRow, shipRow]));
    appendFleetList(sb, s);
  }

  // one-click allocation presets (respects the ecology-clean minimum, like the manual's auto-eco)
  function applyPreset(emp, star, c, kind) {
    var g = HOO.game;
    var race = HOO.DATA.raceById[emp.raceId];
    var d = emp.derived;
    var working = Math.min(c.factories, c.pop * Math.min(d.controls, c.controls));
    var raw = Math.max(1, HOO.Colony.rawProduction(emp, star) * (emp.economy ? emp.economy.ratio : 1));
    var ecoNeed = race.wasteImmune ? 4 :
      U.clamp(Math.ceil((star.planet.waste + working * d.wastePct) / d.wastePerBC / raw * 100) + 4, 6, 45);

    var w = { ship: 0, def: 0, ind: 0, eco: ecoNeed, tech: 0 };
    var rest = 100 - ecoNeed;
    var mp = HOO.Colony.maxPop(emp, star);
    var maxFact = mp * Math.min(d.controls, c.controls);
    var needsInd = c.factories < maxFact;

    if (kind === 'develop') {
      w.ind = needsInd ? Math.round(rest * 0.8) : 0;
      w.tech = rest - w.ind;
    } else if (kind === 'defend') {
      w.def = Math.round(rest * 0.5);
      w.ind = needsInd ? Math.round(rest * 0.3) : 0;
      w.tech = rest - w.def - w.ind;
    } else if (kind === 'research') {
      w.tech = rest;
    } else { // shipyard
      w.ship = Math.round(rest * 0.85);
      w.tech = rest - w.ship;
    }
    c.alloc = w;
    c.locks = {};
  }

  function shipNote(emp, s, c) {
    if (c.alloc.ship <= 0) return '—';
    var raw = HOO.Colony.rawProduction(emp, s) * (emp.economy ? emp.economy.ratio : 1);
    var bc = raw * c.alloc.ship / 100 * HOO.Colony.mineralMult(s);
    if (c.buildingStargate) {
      var need = HOO.Colony.STARGATE_COST - c.stargateProgress;
      return Math.max(1, Math.ceil(need / Math.max(1, bc))) + ' yr';
    }
    var dsg = emp.designs[c.buildDesign];
    if (!dsg || bc <= 0) return '—';
    var remaining = dsg.cost - c.shipProgress;
    if (bc >= dsg.cost) return Math.floor(bc / dsg.cost) + '/yr';
    return Math.max(1, Math.ceil(remaining / bc)) + ' yr';
  }

  function defNote(emp, s, c) {
    if (c.alloc.def <= 0) return c.bases ? String(c.bases) + ' base' + (c.bases > 1 ? 's' : '') : '—';
    var best = HOO.Colony.bestMissileLevel(emp);
    if (c.bases > 0 && c.baseMissileLevel < best) return 'UPGRD';
    if (emp.derived.planetShield > c.shield && !s.inNebula) return 'SHIELD';
    var raw = HOO.Colony.rawProduction(emp, s) * (emp.economy ? emp.economy.ratio : 1);
    var bc = raw * c.alloc.def / 100 * HOO.Colony.mineralMult(s);
    if (bc <= 0) return '—';
    return Math.max(1, Math.ceil((HOO.Colony.MISSILE_BASE_COST - c.baseProgress) / bc)) + ' yr';
  }

  function indNote(emp, s, c) {
    var mp = HOO.Colony.maxPop(emp, s);
    var maxFact = mp * Math.min(emp.derived.controls, c.controls);
    if (c.factories >= maxFact) return c.alloc.ind > 0 ? 'RESERVE' : 'MAX';
    if (c.controls < emp.derived.controls && !HOO.DATA.raceById[emp.raceId].freeRefit) return 'REFIT';
    return Math.round(c.factories) + '/' + Math.round(maxFact);
  }

  function ecoNote(emp, s, c) {
    var status = c.ecoStatus || (s.planet.waste > 0 ? 'WASTE' : 'CLEAN');
    var race = HOO.DATA.raceById[emp.raceId];
    if (race.wasteImmune) return status;
    var minPct = HOO.Colony.ecoCleanPct(emp, s);
    if (minPct > 0 && (status === 'WASTE' || Math.round(c.alloc.eco) < minPct)) {
      return status + ' · min ' + Math.min(100, minPct) + '%';
    }
    return status;
  }

  function cycleShip(c, emp, s) {
    // cycle through designs (+ stargate option)
    var opts = [];
    emp.designs.forEach(function (d, i) { if (d) opts.push(i); });
    if (emp.derived.hasStargate && !c.stargate) opts.push('stargate');
    if (!opts.length) return;
    var cur = c.buildingStargate ? opts.indexOf('stargate') : opts.indexOf(c.buildDesign);
    var next = opts[(cur + 1) % opts.length];
    if (next === 'stargate') { c.buildingStargate = true; }
    else { c.buildingStargate = false; c.buildDesign = next; }
    showStar(s.id);
  }

  function instruction(text) {
    var sb = sidebar();
    var note = el('div', { cls: 'side-section', style: 'background:rgba(227,179,76,0.06);' }, [
      el('div', { cls: 'eyebrow', text: 'Awaiting Orders' }),
      el('p', { style: 'margin-top:6px; font-size:13px;', text: text }),
      el('button', { cls: 'btn small', style: 'margin-top:8px', text: 'Cancel', onclick: function () { HOO.Map.cancelModes(); } })
    ]);
    sb.insertBefore(note, sb.firstChild);
  }

  // ---------------- transports ----------------

  function askTransport(s) {
    var g = HOO.game;
    var c = s.planet.colony;
    var max = Math.floor(c.pop / 2) - (c.transported || 0);
    if (max <= 0) {
      HOO.UI.dialog('No Colonists Available', 'No more than half of a colony\'s population may be transported in a single cycle.');
      return;
    }
    var val = Math.min(5, max);
    var input = el('input', {
      type: 'range', min: '1', max: String(max), value: String(val), style: 'width:100%;',
      oninput: function () { val = parseInt(this.value, 10); lbl.textContent = val + ' million colonists'; }
    });
    var lbl = el('div', { cls: 'mono', style: 'margin:6px 0;', text: val + ' million colonists' });
    HOO.UI.dialog('Transport Colonists from ' + s.name, el('div', {}, [lbl, input]), [
      {
        label: 'Choose Destination', fn: function () {
          pendingTransport = { fromStarId: s.id, pop: val };
          HOO.Map.setTransportMode(pendingTransport);
          instruction('Select a destination for ' + val + ' million colonists. Click a colonized world (yours to reinforce, or an enemy\'s to invade).');
        }
      },
      { label: 'Cancel', cls: '' }
    ]);
  }

  function transportTo(destStar) {
    var g = HOO.game;
    var pt = pendingTransport;
    if (!pt) return;
    var emp = g.empires[0];
    var from = g.stars[pt.fromStarId];
    if (destStar.id === pt.fromStarId) { HOO.Map.cancelModes(); return; }
    if (!HOO.Fleet.inRange(g, emp, destStar, null)) {
      HOO.UI.toast({ tag: 'Transport Command', text: destStar.name + ' lies beyond our fuel range of ' + emp.derived.range + ' parsecs.', kind: 'red', timeout: 7000 });
      return;
    }
    if (!destStar.planet || !destStar.planet.colony) {
      HOO.UI.toast({ tag: 'Transport Command', text: 'Colonists can only be sent to established colonies. Send a colony ship first.', kind: 'red', timeout: 7000 });
      return;
    }
    var def = HOO.CONST.PLANET_TYPES[destStar.planet.type];
    if (def.hostility > emp.derived.maxHostility) {
      HOO.UI.toast({ tag: 'Transport Command', text: 'Our people cannot survive on ' + destStar.name + ' without better environmental technology.', kind: 'red', timeout: 7000 });
      return;
    }
    HOO.Fleet.sendTransports(g, 0, pt.fromStarId, destStar.id, pt.pop);
    var hostile = destStar.planet.colony.empire !== 0;
    HOO.UI.toast({
      tag: 'Transport Command', kind: hostile ? 'gold' : 'green', timeout: 6000, starId: destStar.id,
      text: pt.pop + 'M colonists underway to ' + destStar.name + (hostile ? ' — invasion force.' : '.')
    });
    pendingTransport = null;
    HOO.Map.cancelModes();
    showStar(from.id);
  }

  function relocTo(destStar) {
    var g = HOO.game;
    if (!pendingReloc) return;
    var s = g.stars[pendingReloc.starId];
    if (destStar.id === s.id) {
      s.planet.colony.reloc = null;
      HOO.UI.toast({ tag: 'Shipyards', text: s.name + ' will keep its new ships in orbit.', timeout: 5000 });
    } else if (destStar.planet && destStar.planet.colony && destStar.planet.colony.empire === 0) {
      s.planet.colony.reloc = destStar.id;
      HOO.UI.toast({ tag: 'Shipyards', text: 'New ships from ' + s.name + ' will relocate to ' + destStar.name + '.', kind: 'green', timeout: 5000 });
    } else {
      HOO.UI.toast({ tag: 'Shipyards', text: 'Ships can only be relocated to your own colonies.', kind: 'red', timeout: 6000 });
      return;
    }
    pendingReloc = null;
    HOO.Map.cancelModes();
    showStar(s.id);
  }

  function askTransfer(s) {
    var g = HOO.game;
    var emp = g.empires[0];
    var max = Math.floor(emp.reserve);
    if (max < 1) return;
    var val = Math.min(100, max);
    var lbl = el('div', { cls: 'mono', style: 'margin:6px 0;', text: val + ' BC' });
    var input = el('input', {
      type: 'range', min: '1', max: String(max), value: String(val), style: 'width:100%;',
      oninput: function () { val = parseInt(this.value, 10); lbl.textContent = val + ' BC'; }
    });
    HOO.UI.dialog('Transfer Reserve to ' + s.name,
      el('div', {}, [el('p', { cls: 'muted-t', text: 'A colony can absorb up to its own annual production in extra funds each year.' }), lbl, input]), [
      {
        label: 'Transfer', fn: function () {
          emp.reserve -= val;
          s.planet.colony.transferFund = (s.planet.colony.transferFund || 0) + val;
          HOO.UI.refreshTopbar();
          showStar(s.id);
        }
      },
      { label: 'Cancel', cls: '' }
    ]);
  }

  // ---------------- fleets ----------------

  function appendFleetList(sb, s) {
    var g = HOO.game;
    var fleets = HOO.Fleet.fleetsAt(g, s.id);
    if (!fleets.length) return;
    var visible = fleets.filter(function (f) {
      return f.empire === 0 || s.explored[0] || HOO.Fleet.scannerSees(g, g.empires[0], s.x, s.y);
    });
    if (!visible.length) return;
    var items = [];
    visible.forEach(function (f) {
      var emp = g.empires[f.empire];
      var race = HOO.DATA.raceById[emp.raceId];
      var summary = [];
      f.ships.forEach(function (n, slot) {
        if (n > 0 && emp.designs[slot]) summary.push(n + '× ' + emp.designs[slot].name);
      });
      items.push(el('div', {
        cls: 'kv', style: 'cursor:pointer;',
        onclick: function () { showFleet(f); }
      }, [
        el('span', { cls: 'k', html: '<span style="color:' + emp.color + '">▲</span> ' + U.esc(race.name) }),
        el('span', { cls: 'v muted-t', text: summary.join(', ') || '?' })
      ]));
    });
    sb.appendChild(section('Fleets in Orbit', items));
  }

  function showFleet(f) {
    var g = HOO.game;
    var sb = sidebar();
    U.clearEl(sb);
    currentSel = null;
    HOO.Map.selectFleet(f);
    var emp = g.empires[f.empire];
    var race = HOO.DATA.raceById[emp.raceId];

    var head = [el('div', { cls: 'eyebrow', style: 'color:' + emp.color, text: race.name + ' fleet' })];
    if (f.at !== null) head.push(kv('Position', 'Orbiting ' + g.stars[f.at].name));
    else head.push(kv('In transit', g.stars[f.from] ? (g.stars[f.from].name + ' → ' + g.stars[f.to].name + ' · ' + HOO.Fleet.eta(g, f) + ' yr') : ('→ ' + g.stars[f.to].name)));

    if (f.empire !== 0) {
      // enemy fleet scan
      var rows = [];
      f.ships.forEach(function (n, slot) {
        if (n > 0 && emp.designs[slot]) rows.push(kv(emp.designs[slot].name, String(n)));
      });
      if (f.at === null && g.empires[0].derived.scanShowsDest) head.push(kv('Destination', g.stars[f.to].name));
      sb.appendChild(section('Fleet Scan', head.concat(rows)));
      return;
    }

    // own fleet: deployment controls
    var counts = f.ships.slice();
    var rows2 = [head[0], head[1] || null];
    var countEls = {};
    f.ships.forEach(function (n, slot) {
      if (n <= 0 || !emp.designs[slot]) return;
      var dsg = emp.designs[slot];
      var row = el('div', { style: 'display:grid; grid-template-columns: 1fr auto; gap:6px; align-items:center; margin:6px 0;' });
      var lab = el('div', {}, [
        el('div', { style: 'font-size:13px;', text: dsg.name }),
        el('div', { cls: 'dim-t mono', style: 'font-size:10px;', text: 'warp ' + dsg.warp + ' · ' + n + ' in fleet' })
      ]);
      var ctl = el('div', { style: 'display:flex; gap:3px; align-items:center;' });
      var num = el('span', { cls: 'mono', style: 'width:38px; text-align:center;', text: String(counts[slot]) });
      countEls[slot] = num;
      function setC(v) { counts[slot] = U.clamp(v, 0, f.ships[slot]); num.textContent = String(counts[slot]); }
      var step = Math.max(1, Math.round(f.ships[slot] * 0.05));
      ctl.appendChild(el('button', { cls: 'btn small', text: '«', onclick: function () { setC(0); } }));
      ctl.appendChild(el('button', { cls: 'btn small', text: '‹', onclick: function () { setC(counts[slot] - step); } }));
      ctl.appendChild(num);
      ctl.appendChild(el('button', { cls: 'btn small', text: '›', onclick: function () { setC(counts[slot] + step); } }));
      ctl.appendChild(el('button', { cls: 'btn small', text: '»', onclick: function () { setC(f.ships[slot]); } }));
      row.appendChild(lab);
      row.appendChild(ctl);
      rows2.push(row);
    });

    // direct orders: this fleet is now the live deployment context
    currentSel = { fleet: f, counts: counts };

    if (f.at !== null) {
      rows2.push(el('div', {
        cls: 'narrative', style: 'margin-top:10px;',
        html: '<span class="speaker">Helm</span>Click a destination star on the map to get underway. Adjust ship counts above to split the fleet. <span class="dim-t">Esc deselects.</span>'
      }));
    } else if (g.empires[0].derived.hasHypercomm) {
      rows2.push(el('div', {
        cls: 'narrative', style: 'margin-top:10px;',
        html: '<span class="speaker">Hyperspace Comms</span>This fleet is in transit. Click a new destination star to redirect it.'
      }));
    } else {
      rows2.push(el('p', { cls: 'dim-t', style: 'margin-top:10px; font-size:12px;', text: 'In transit. Fleets cannot change course without Hyperspace Communications technology.' }));
      currentSel = null;
    }
    sb.appendChild(section('Fleet Deployment', rows2));
  }

  function getCurrentSel() { return currentSel; }

  // issue a movement order directly from a map click
  function directDeploy(destStar) {
    var g = HOO.game;
    if (!currentSel) return;
    var emp = g.empires[0];
    var f = currentSel.fleet;

    // in-transit redirect via hyperspace comms
    if (f.at === null) {
      if (!HOO.Fleet.inRange(g, emp, destStar, f)) {
        HOO.UI.toast({ tag: 'Helm', text: destStar.name + ' is beyond fuel range.', kind: 'red', timeout: 6000 });
        return;
      }
      f.to = destStar.id;
      HOO.UI.toast({ tag: 'Helm', text: 'Fleet redirected to ' + destStar.name + ' — ETA ' + HOO.Fleet.eta(g, f) + ' yr.', kind: 'green', timeout: 6000 });
      showFleet(f);
      return;
    }

    if (destStar.id === f.at) return;
    var probe = { ships: currentSel.counts };
    if (!HOO.Fleet.inRange(g, emp, destStar, probe)) {
      HOO.UI.toast({
        tag: 'Helm', kind: 'red', timeout: 7000,
        text: destStar.name + ' is beyond fuel range (' + emp.derived.range + ' pc from friendly colonies; reserve tanks add 3).'
      });
      return;
    }
    var fromId = f.at;
    var sent = HOO.Fleet.sendFleet(g, 0, f.at, destStar.id, currentSel.counts);
    if (sent) {
      HOO.UI.toast({
        tag: 'Helm', kind: 'green', timeout: 6000, starId: destStar.id,
        text: HOO.Fleet.shipCount(sent) + ' ship(s) underway to ' + destStar.name + ' — ETA ' + HOO.Fleet.eta(g, sent) + ' yr.'
      });
      // if ships remain in orbit, keep commanding them; else follow the departing fleet
      var remaining = HOO.Fleet.fleetAt(g, 0, fromId);
      if (remaining) showFleet(remaining);
      else showFleet(sent);
    }
  }

  // kept for compatibility with older callers
  function deployTo(destStar) { directDeploy(destStar); }

  HOO.Panels = {
    showStar: showStar, showFleet: showFleet, showBlank: showBlank,
    deployTo: deployTo, directDeploy: directDeploy, getCurrentSel: getCurrentSel,
    transportTo: transportTo, relocTo: relocTo
  };
})();
