/* Hamster of Orion — station screens: Game, Design, Fleet, Races, Planets, Tech, Status */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;

  function open(name) {
    switch (name) {
      case 'game': return gameMenu();
      case 'design': return designScreen();
      case 'fleet': return fleetScreen();
      case 'races': return racesScreen();
      case 'planets': return planetsScreen();
      case 'tech': return techScreen();
      case 'status': return statusScreen();
      case 'help': return helpScreen();
    }
  }

  // ================= GAME MENU =================
  var SAVE_SLOTS = [1, 2, 3, 4, 5, 6]; // MOO 1993 offered six save slots

  function doSave(slot) {
    if (HOO.State.save(slot)) {
      HOO.UI.closeAll();
      HOO.UI.toast({ tag: 'Imperial Archives', text: 'Game saved to slot ' + slot + '.', kind: 'green', timeout: 5000 });
    } else {
      HOO.UI.dialog('Archive Failure',
        'The game could <b>not</b> be saved — browser storage is full or blocked (private browsing?). ' +
        'Use <b>Export Save</b> to download a backup file instead.');
    }
  }

  function doLoad(slot) {
    if (HOO.State.load(slot)) { HOO.UI.closeAll(); HOO.Main.rebuild(); }
    else HOO.UI.dialog('Archive Damaged', 'Save slot ' + slot + ' could not be read — it may be corrupt or from a newer build.');
  }

  function deleteSave(slot) {
    try {
      localStorage.removeItem('hoo_save_' + slot);
      localStorage.removeItem('hoo_save_' + slot + '_meta');
    } catch (e) { /* blocked storage — nothing to delete anyway */ }
  }

  function gameMenu() {
    var content = el('div', { style: 'display:flex; flex-direction:column; gap:8px; max-width:420px;' });
    SAVE_SLOTS.forEach(function (slot) {
      var meta = HOO.State.saveMeta(slot);
      var lbl = 'Slot ' + slot + (meta ? ' — cycle ' + meta.year + ' (' + meta.race + ')' : ' — empty');
      var row = el('div', { style: 'display:flex; gap:6px;' });
      row.appendChild(el('button', {
        cls: 'btn', style: 'flex:1; text-align:left;', text: 'Save · ' + lbl,
        onclick: function () {
          if (meta) {
            HOO.UI.dialog('Overwrite Slot ' + slot + '?',
              'The archived game from cycle ' + meta.year + ' (' + meta.race + ') will be replaced.', [
              { label: 'Overwrite', cls: 'danger', fn: function () { doSave(slot); } },
              { label: 'Cancel', cls: '' }
            ]);
          } else {
            doSave(slot);
          }
        }
      }));
      if (meta) {
        row.appendChild(el('button', {
          cls: 'btn', text: 'Load',
          onclick: function () {
            HOO.UI.dialog('Load Slot ' + slot + '?',
              'Unsaved progress in the current game (orders, diplomacy, battles since the last autosave) will be lost.', [
              { label: 'Load', cls: 'danger', fn: function () { doLoad(slot); } },
              { label: 'Cancel', cls: '' }
            ]);
          }
        }));
        row.appendChild(el('button', {
          cls: 'btn danger', text: '✕', title: 'Delete this save',
          onclick: function () {
            HOO.UI.dialog('Delete Slot ' + slot + '?', 'The archived game from cycle ' + meta.year + ' will be erased.', [
              { label: 'Delete', cls: 'danger', fn: function () { deleteSave(slot); HOO.UI.closeAll(); gameMenu(); } },
              { label: 'Cancel', cls: '' }
            ]);
          }
        }));
      }
      content.appendChild(row);
    });

    // file backup: export / import the versioned save JSON
    var fileIn = el('input', { type: 'file', accept: '.json,application/json', style: 'display:none;' });
    fileIn.addEventListener('change', function () {
      var file = fileIn.files && fileIn.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        if (HOO.State.importString(String(reader.result))) { HOO.UI.closeAll(); HOO.Main.rebuild(); }
        else HOO.UI.dialog('Import Failed', 'That file is not a valid Hamster of Orion save (or comes from a newer build).');
      };
      reader.readAsText(file);
    });
    var xfer = el('div', { style: 'display:flex; gap:6px;' }, [fileIn]);
    xfer.appendChild(el('button', {
      cls: 'btn', style: 'flex:1;', text: 'Export Save (file)',
      onclick: function () {
        var json = HOO.State.exportString();
        if (!json) { HOO.UI.dialog('Export Failed', 'There is no game running to export.'); return; }
        var blob = new Blob([json], { type: 'application/json' });
        var a = el('a', { href: URL.createObjectURL(blob), download: 'hoo_save_' + HOO.game.year + '.json' });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      }
    }));
    xfer.appendChild(el('button', {
      cls: 'btn', style: 'flex:1;', text: 'Import Save (file)',
      onclick: function () {
        HOO.UI.dialog('Import Save?', 'The imported game will replace the current one. Unsaved progress will be lost.', [
          { label: 'Choose File', fn: function () { fileIn.click(); } },
          { label: 'Cancel', cls: '' }
        ]);
      }
    }));
    content.appendChild(xfer);

    content.appendChild(el('hr', { cls: 'hr' }));
    var rangeOn = !HOO.Map.getShowRanges || HOO.Map.getShowRanges();
    content.appendChild(el('button', {
      cls: 'btn', text: 'Fuel Range Rings: ' + (rangeOn ? 'ON' : 'OFF'),
      onclick: function () {
        if (HOO.Map.setShowRanges) HOO.Map.setShowRanges(!rangeOn);
        HOO.UI.closeAll();
        gameMenu();
      }
    }));
    content.appendChild(el('button', { cls: 'btn', text: 'Message Log', onclick: function () { messageLog(); } }));
    content.appendChild(el('button', { cls: 'btn', text: 'Help & Shortcuts', onclick: function () { helpScreen(); } }));

    content.appendChild(el('hr', { cls: 'hr' }));
    content.appendChild(el('button', {
      cls: 'btn danger', text: 'Abandon Game (Main Menu)',
      onclick: function () {
        HOO.UI.dialog('Abandon this galaxy?', 'The current game will be autosaved.', [
          {
            label: 'Main Menu', cls: 'danger', fn: function () {
              var saved = HOO.State.save('auto');
              HOO.UI.closeAll();
              HOO.NewGame.showTitle();
              if (!saved) {
                HOO.UI.dialog('Archive Failure', 'The autosave failed — browser storage is full or blocked. The abandoned game was NOT preserved.');
              }
            }
          },
          { label: 'Keep Playing', cls: '' }
        ]);
      }
    }));
    HOO.UI.modal(content, { title: 'Imperial Archives', width: 500 });
  }

  // ================= MESSAGE LOG =================
  function messageLog() {
    var hist = (HOO.Notices && HOO.Notices.getHistory) ? HOO.Notices.getHistory() : [];
    var content = el('div', {});
    if (!hist.length) {
      content.appendChild(el('p', { cls: 'muted-t', text: 'No reports this session yet. Turn reports and dispatches are archived here, even after their toasts fade.' }));
    }
    var list = el('div', { cls: 'picker-list' });
    hist.slice().reverse().forEach(function (h) {
      list.appendChild(el('div', { cls: 'gnn', style: 'margin-bottom:6px;' }, [
        el('span', { cls: 'gnn-tag', text: 'Cycle ' + h.year + (h.name ? ' — ' + h.name : '') }),
        el('div', { style: 'font-size:12.5px;', html: U.esc(h.text) })
      ]));
    });
    content.appendChild(list);
    HOO.UI.modal(content, { title: 'Message Log — this session', width: 700 });
  }

  // ================= HELP =================
  function helpScreen() {
    var content = el('div', {});
    function h(t) { content.appendChild(el('div', { cls: 'eyebrow', style: 'margin-top:12px; display:block;', text: t })); }
    function kv2(k, v) {
      content.appendChild(el('div', { cls: 'kv' }, [
        el('span', { cls: 'k mono', text: k }),
        el('span', { cls: 'v', text: v })
      ]));
    }
    h('Keyboard');
    kv2('Enter', 'End the cycle (turn)');
    kv2('Esc', 'Close screen · cancel order · deselect');
    kv2('1-6', 'Stations: Design, Fleet, Races, Planets, Tech, Status');
    kv2('G', 'Game menu — saves, settings, this help');
    kv2('Tab / ⇧Tab', 'Cycle your colonies');
    kv2('F', 'Cycle your fleets');
    kv2('H', 'Center on your home world');
    kv2('?', 'This help screen');
    h('Running the Empire');
    [
      'Sliders: each colony splits its output between Ship, Def, Ind, Eco, and Tech. Eco snaps to the waste-cleanup minimum — click a bar\'s label to lock it.',
      'Range: fleets can travel only within fuel range (rings on the map) of your colonies. Better fuel cells extend it; reserve tanks add 3 parsecs.',
      'Contact: you meet an empire when colonies or fleets come close. Diplomacy, trade, and espionage all require contact.',
      'Council: once two-thirds of the galaxy is settled, the High Council convenes to elect a Master of Orion. Two-thirds of all votes wins.',
      'Victory: win the council vote, or be the last empire standing.'
    ].forEach(function (t) {
      content.appendChild(el('p', { cls: 'muted-t', style: 'font-size:12.5px; margin:4px 0;', text: t }));
    });
    h('About');
    content.appendChild(el('p', {
      cls: 'dim-t mono', style: 'font-size:11px;',
      text: 'Hamster of Orion' + (HOO.VERSION ? ' · v' + HOO.VERSION : '') + ' — a from-scratch homage to Master of Orion (1993).'
    }));
    HOO.UI.modal(content, { title: 'Help — Commander\'s Primer', width: 640 });
  }

  // ================= SHIP DESIGN =================
  function designScreen() {
    var g = HOO.game;
    var emp = g.empires[0];
    var SD = HOO.ShipDesign;

    // working spec starts from last design or defaults
    var eng = SD.bestOf(emp, SD.engines(emp));
    var arm = SD.armors(emp)[0];
    var spec = emp.lastSpec ? JSON.parse(JSON.stringify(emp.lastSpec)) : {
      name: 'New Design', hullId: 'medium', engineId: eng.id,
      computerId: null, shieldId: null, ecmId: null,
      armorId: arm.id, doubleArmor: false, weapons: [], specials: []
    };
    // drop unknown techs from a stale lastSpec
    if (!emp.techFlags[spec.engineId]) spec.engineId = eng.id;
    if (!emp.techFlags[spec.armorId]) spec.armorId = arm.id;

    var wrap = el('div', { cls: 'design-grid' });
    var left = el('div', {});
    var right = el('div', {});
    wrap.appendChild(left);
    wrap.appendChild(right);

    var statsBox = el('div', {});
    var slotsBox = el('div', {});
    right.appendChild(slotsBox);

    function computed() { return SD.compute(emp, spec); }

    function render() {
      var d = computed();
      U.clearEl(left);
      U.clearEl(slotsBox);

      // name + hull
      left.appendChild(el('div', { cls: 'eyebrow', text: 'Class Name' }));
      var nameIn = el('input', {
        value: spec.name, style: 'width:100%; background:var(--void-2); border:1px solid var(--line-2); color:var(--ink); padding:6px 8px; border-radius:4px; font-family:var(--font-display); margin:4px 0 12px;',
        oninput: function () { spec.name = this.value; }
      });
      left.appendChild(nameIn);

      left.appendChild(el('div', { cls: 'eyebrow', text: 'Hull' }));
      var hullRow = el('div', { cls: 'opt-row', style: 'margin:4px 0 12px;' });
      HOO.DATA.HULLS.forEach(function (h) {
        hullRow.appendChild(el('button', {
          cls: 'btn small' + (spec.hullId === h.id ? ' active' : ''), text: h.name,
          onclick: function () { spec.hullId = h.id; render(); }
        }));
      });
      left.appendChild(hullRow);

      // stats
      U.clearEl(statsBox);
      var stats = el('div', { cls: 'panel', style: 'padding:10px 12px;' });
      function sv(k, v, cls) {
        stats.appendChild(el('div', { cls: 'kv' }, [
          el('span', { cls: 'k', text: k }), el('span', { cls: 'v ' + (cls || ''), html: v })
        ]));
      }
      if (d) {
        sv('Space', Math.round(d.spaceUsed) + ' / ' + d.spaceTotal, d.valid ? 'good' : 'bad');
        sv('Cost', U.fmt(d.cost) + ' BC');
        sv('Hits', String(d.hits));
        sv('Warp', String(d.warp));
        sv('Combat speed', String(d.combatSpeed));
        sv('Attack level', String(d.attack));
        sv('Defense', String(d.defense));
        sv('Initiative', String(d.initiative));
      }
      left.appendChild(statsBox);
      statsBox.appendChild(stats);

      var actions = el('div', { style: 'display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;' });
      actions.appendChild(el('button', {
        cls: 'btn primary', text: 'Commission Design',
        onclick: function () {
          var dd = computed();
          if (!dd || !dd.valid) { HOO.UI.dialog('Invalid Design', 'The design exceeds available hull space.'); return; }
          var slot = -1;
          for (var i = 0; i < 6; i++) if (!emp.designs[i]) { slot = i; break; }
          if (slot < 0) { HOO.UI.dialog('Shipyards Full', 'Six designs are already in commission. Scrap one from the Fleet screen first.'); return; }
          dd.name = spec.name || dd.name;
          emp.designs[slot] = dd;
          emp.lastSpec = JSON.parse(JSON.stringify(spec));
          HOO.UI.closeAll();
        }
      }));
      actions.appendChild(el('button', {
        cls: 'btn', text: 'Clear', onclick: function () {
          spec = { name: 'New Design', hullId: 'small', engineId: eng.id, computerId: null, shieldId: null, ecmId: null, armorId: arm.id, doubleArmor: false, weapons: [], specials: [] };
          render();
        }
      }));
      left.appendChild(actions);

      // ---- right: component slots ----
      slotsBox.appendChild(el('div', { cls: 'eyebrow', text: 'Systems' }));
      slot('Engines', HOO.DATA.techById[spec.engineId].name, 'warp ' + HOO.DATA.techById[spec.engineId].effect.warp, function () {
        pickFrom('Engines', SD.engines(emp), function (t) { return 'warp ' + t.effect.warp; }, function (t) { spec.engineId = t.id; });
      });
      slot('Computer', spec.computerId ? HOO.DATA.techById[spec.computerId].name : 'None', spec.computerId ? '+' + HOO.DATA.techById[spec.computerId].effect.mark + ' attack' : '', function () {
        pickFrom('Battle Computers', SD.computers(emp), function (t) { return 'mark ' + t.effect.mark + ' · ' + SD.compSize(emp, t, spec.hullId) + ' tons'; }, function (t) { spec.computerId = t ? t.id : null; }, true);
      });
      slot('Shield', spec.shieldId ? HOO.DATA.techById[spec.shieldId].name : 'None', spec.shieldId ? 'absorbs ' + HOO.DATA.techById[spec.shieldId].effect.cls : '', function () {
        pickFrom('Deflector Shields', SD.shields(emp), function (t) { return 'class ' + U.roman(t.effect.cls) + ' · ' + SD.shieldSize(emp, t, spec.hullId) + ' tons'; }, function (t) { spec.shieldId = t ? t.id : null; }, true);
      });
      slot('ECM', spec.ecmId ? HOO.DATA.techById[spec.ecmId].name : 'None', '', function () {
        pickFrom('ECM Jammers', SD.ecms(emp), function (t) { return 'mark ' + t.effect.mark; }, function (t) { spec.ecmId = t ? t.id : null; }, true);
      });
      slot('Armor', HOO.DATA.techById[spec.armorId].name + (spec.doubleArmor ? ' II' : ''), 'hits ×' + HOO.DATA.techById[spec.armorId].effect.mult * (spec.doubleArmor ? 1.5 : 1), function () {
        var list = [];
        SD.armors(emp).forEach(function (t) {
          list.push({ t: t, dbl: false });
          list.push({ t: t, dbl: true });
        });
        var content = el('div', { cls: 'picker-list' });
        list.forEach(function (item) {
          content.appendChild(el('div', {
            cls: 'design-slot', onclick: function () { spec.armorId = item.t.id; spec.doubleArmor = item.dbl; HOO.UI.close(); render(); }
          }, [
            el('div', { cls: 'ds-value', text: item.t.name + (item.dbl ? ' II' : '') }),
            el('div', { cls: 'ds-stat', text: 'hit points ×' + (item.t.effect.mult * (item.dbl ? 1.5 : 1)).toFixed(2) }),
            el('div', {})
          ]));
        });
        HOO.UI.modal(content, { title: 'Armor', width: 520 });
      });

      slotsBox.appendChild(el('div', { cls: 'eyebrow', style: 'margin-top:12px; display:block;', text: 'Weapons (4 slots)' }));
      for (var wi = 0; wi < 4; wi++) weaponSlot(wi);
      slotsBox.appendChild(el('div', { cls: 'eyebrow', style: 'margin-top:12px; display:block;', text: 'Special Devices (3 slots)' }));
      for (var si = 0; si < 3; si++) specialSlot(si);
    }

    function slot(label, value, stat, onclick) {
      slotsBox.appendChild(el('div', { cls: 'design-slot', onclick: onclick }, [
        el('div', { cls: 'ds-label', text: label }),
        el('div', { cls: 'ds-value', text: value }),
        el('div', { cls: 'ds-stat', text: stat })
      ]));
    }

    function weaponSlot(idx) {
      var w = spec.weapons[idx];
      var t = w ? HOO.DATA.techById[w.id] : null;
      var row = el('div', { cls: 'design-slot' });
      row.appendChild(el('div', { cls: 'ds-label', text: 'Weapon ' + (idx + 1) }));
      row.appendChild(el('div', {
        cls: 'ds-value', style: 'cursor:pointer;', text: t ? t.name : 'None',
        onclick: function () {
          pickFrom('Weapons', SD.weapons(emp), function (wt) {
            var e = wt.effect;
            return e.wclass + ' · ' + e.dmin + '-' + e.dmax + ' dmg · ' + SD.weaponSize(emp, wt) + 't · ' + U.fmt(SD.weaponCost(emp, wt), 1) + 'BC';
          }, function (wt) {
            if (wt) spec.weapons[idx] = { id: wt.id, count: (w && w.count) || 1 };
            else spec.weapons.splice(idx, 1);
          }, true);
        }
      }));
      var ctl = el('div', { style: 'display:flex; gap:4px; align-items:center;' });
      if (t) {
        // MOO: missiles mount on a light 2-shot rack or a heavy 5-shot rack
        // (the 2-rack is a third smaller and cheaper); compute() reads w.rack
        if (t.effect.wclass === 'missile') {
          var rk = w.rack === 2 ? 2 : 5;
          ctl.appendChild(el('button', {
            cls: 'btn small', text: rk + '-rack',
            title: 'Missile rack: 5 shots per launcher, or 2 shots at 2/3 the size and cost',
            onclick: function () { w.rack = rk === 2 ? 5 : 2; render(); }
          }));
        }
        ctl.appendChild(el('button', { cls: 'btn small', text: '−', onclick: function () { if (w.count > 1) w.count--; else spec.weapons.splice(idx, 1); render(); } }));
        ctl.appendChild(el('span', { cls: 'mono', text: String(w.count) }));
        ctl.appendChild(el('button', { cls: 'btn small', text: '+', onclick: function () { w.count++; render(); } }));
      }
      row.appendChild(ctl);
      slotsBox.appendChild(row);
    }

    function specialSlot(idx) {
      var sid = spec.specials[idx];
      var t = sid ? HOO.DATA.techById[sid] : null;
      slotsBox.appendChild(el('div', {
        cls: 'design-slot',
        onclick: function () {
          var avail = SD.specials(emp).filter(function (st) {
            return spec.specials.indexOf(st.id) < 0 || st.id === sid;
          });
          pickFrom('Special Devices', avail, function (st) {
            var stats = SD.specialStats(emp, st);
            return HOO.DATA.SPECIAL_STATS[st.effect.special].desc + ' · ' + stats.size + 't';
          }, function (st) {
            if (st) spec.specials[idx] = st.id;
            else spec.specials.splice(idx, 1);
          }, true);
        }
      }, [
        el('div', { cls: 'ds-label', text: 'Special ' + (idx + 1) }),
        el('div', { cls: 'ds-value', text: t ? t.name : 'None' }),
        el('div', { cls: 'ds-stat', text: '' })
      ]));
    }

    function pickFrom(title, list, statFn, setFn, allowNone) {
      var content = el('div', { cls: 'picker-list' });
      if (allowNone) {
        content.appendChild(el('div', {
          cls: 'design-slot', onclick: function () { setFn(null); HOO.UI.close(); render(); }
        }, [el('div', { cls: 'ds-value muted-t', text: 'None' }), el('div', {}), el('div', {})]));
      }
      list.forEach(function (t) {
        content.appendChild(el('div', {
          cls: 'design-slot', onclick: function () { setFn(t); HOO.UI.close(); render(); }
        }, [
          el('div', { cls: 'ds-value', text: t.name }),
          el('div', { cls: 'ds-stat', text: statFn(t) }),
          el('div', { cls: 'ds-stat', text: 'lv ' + t.level })
        ]));
      });
      HOO.UI.modal(content, { title: title, width: 620 });
    }

    render();
    HOO.UI.modal(wrap, { title: 'Ship Design Bureau', width: 980 });
  }

  // ================= SHIP CLASS SPECS =================
  function designSpecs(emp, d, activeCount) {
    var content = el('div', {});
    function section(title) {
      content.appendChild(el('div', { cls: 'eyebrow', style: 'margin-top:10px; display:block;', text: title }));
    }
    function row(k, v, sub) {
      content.appendChild(el('div', { cls: 'kv' }, [
        el('span', { cls: 'k', text: k }),
        el('span', { cls: 'v', text: v + (sub ? ' · ' + sub : '') })
      ]));
    }
    var T = HOO.DATA.techById;
    var hullName = HOO.ShipDesign.hull(d.hullId).name;

    content.appendChild(el('div', { cls: 'dim-t mono', style: 'font-size:11px;', text: hullName + ' hull · ' + U.fmt(d.cost) + ' BC' + (activeCount != null ? ' · ' + activeCount + ' in service' : '') }));

    section('Systems');
    row('Engines', T[d.engineId].name, 'warp ' + d.warp);
    row('Computer', d.computerId ? T[d.computerId].name : 'None', d.computerId ? '+' + T[d.computerId].effect.mark + ' attack' : '');
    row('Shield', d.shieldId ? T[d.shieldId].name : 'None', d.shieldId ? 'absorbs ' + d.shieldCls : '');
    row('ECM', d.ecmId ? T[d.ecmId].name : 'None', d.ecmId ? 'mark ' + d.ecmMark : '');
    row('Armor', T[d.armorId].name + (d.doubleArmor ? ' II' : ''), d.hits + ' hit points');

    section('Weapons');
    if (!d.weapons.length) {
      content.appendChild(el('div', { cls: 'muted-t', style: 'font-size:12px;', text: 'None — this class is unarmed and cannot attack.' }));
    }
    d.weapons.forEach(function (w) {
      var e = T[w.id].effect;
      row(w.count + '× ' + T[w.id].name + (w.rack === 2 ? ' (2-rack)' : ''), e.wclass, e.dmin + '-' + e.dmax + ' dmg · range ' + (e.range || 1));
    });

    section('Special Devices');
    if (!d.specials.length) content.appendChild(el('div', { cls: 'muted-t', style: 'font-size:12px;', text: 'None' }));
    d.specials.forEach(function (sid) {
      row(T[sid].name, HOO.DATA.SPECIAL_STATS[T[sid].effect.special].desc);
    });

    section('Performance');
    row('Attack level', String(d.attack));
    row('Defense', String(d.defense));
    row('Initiative', String(d.initiative));
    row('Combat speed', String(d.combatSpeed));
    if (d.extraRange) row('Fuel range', '+' + d.extraRange + ' pc', 'reserve tanks');

    HOO.UI.modal(content, { title: d.name + ' — Class Specifications', width: 560 });
  }

  // ================= FLEET SCREEN =================
  function fleetScreen() {
    var g = HOO.game;
    var emp = g.empires[0];
    var content = el('div', {});

    // designs summary with scrap buttons
    var dRow = el('div', { style: 'display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;' });
    emp.designs.forEach(function (d, slot) {
      var count = 0;
      g.fleets.forEach(function (f) { if (f.empire === 0) count += f.ships[slot]; });
      var card = el('div', { cls: 'panel', style: 'padding:8px 10px;' });
      if (d) {
        card.appendChild(el('div', { style: 'font-family:var(--font-display); font-weight:600;', text: d.name }));
        card.appendChild(el('div', { cls: 'dim-t mono', style: 'font-size:11px;', text: d.hullId + ' · warp ' + d.warp + ' · ' + U.fmt(d.cost) + ' BC · ' + count + ' active' }));
        var wl = d.weapons.map(function (w) { return w.count + '× ' + HOO.DATA.techById[w.id].name; }).join(', ');
        card.appendChild(el('div', { cls: 'muted-t', style: 'font-size:11px; margin:3px 0;', text: wl || 'Unarmed' }));
        var btns = el('div', { style: 'display:flex; gap:6px;' });
        btns.appendChild(el('button', {
          cls: 'btn small', text: 'Specs',
          onclick: function () { designSpecs(emp, d, count); }
        }));
        btns.appendChild(el('button', {
          cls: 'btn small danger', text: 'Scrap Class',
          onclick: function () {
            HOO.UI.dialog('Scrap ' + d.name + '?', 'All ' + count + ' ships of this class will be decommissioned. 25% of their cost returns to the Planetary Reserve.', [
              { label: 'Scrap', cls: 'danger', fn: function () { HOO.ShipDesign.scrapDesign(g, emp, slot); HOO.UI.closeAll(); fleetScreen(); } },
              { label: 'Cancel', cls: '' }
            ]);
          }
        }));
        card.appendChild(btns);
      } else {
        card.appendChild(el('div', { cls: 'dim-t', text: 'Empty berth' }));
      }
      dRow.appendChild(card);
    });
    content.appendChild(dRow);

    // fleets table — count columns and their design-name headers share the
    // same right alignment so a number reads under its own header
    var tbl = el('table', { cls: 'data' });
    var hdr = el('tr', {});
    hdr.appendChild(el('th', { text: 'Station' }));
    hdr.appendChild(el('th', { cls: 'r', text: 'ETA' }));
    emp.designs.forEach(function (d) {
      hdr.appendChild(el('th', { cls: 'r', text: d ? d.name : '—' }));
    });
    tbl.appendChild(hdr);
    g.fleets.filter(function (f) { return f.empire === 0; }).forEach(function (f) {
      var tr = el('tr', {
        cls: 'click', onclick: function () {
          HOO.UI.closeAll();
          HOO.Panels.showFleet(f);
          if (f.at !== null) HOO.Map.select(f.at);
        }
      });
      tr.appendChild(el('td', { text: f.at !== null ? g.stars[f.at].name : (g.stars[f.from] ? g.stars[f.from].name + '→' + g.stars[f.to].name : '→' + g.stars[f.to].name) }));
      tr.appendChild(el('td', { cls: 'r', text: f.at !== null ? '—' : String(HOO.Fleet.eta(g, f)) }));
      f.ships.forEach(function (n) { tr.appendChild(el('td', { cls: 'r', text: n ? String(n) : '' })); });
      tbl.appendChild(tr);
    });
    content.appendChild(tbl);
    HOO.UI.modal(content, { title: 'Fleet Command', width: 980 });
  }

  // ================= RACES / DIPLOMACY =================
  function racesScreen() {
    var g = HOO.game;
    var player = g.empires[0];
    var content = el('div', {});

    var head = el('div', { style: 'display:flex; gap:8px; margin-bottom:12px; align-items:center;' });
    head.appendChild(el('button', { cls: 'btn small', text: 'Galactic Status', onclick: function () { statusScreen(); } }));
    head.appendChild(el('div', { cls: 'spacer', style: 'flex:1;' }));
    // internal security slider (wider label column so "Security" isn't clipped)
    var secWrap = el('div', { style: 'width:340px;' });
    var secRow = HOO.UI.ratioRow({
      label: 'Security', cls: 'r-def',
      get: function () { return (player.securityAlloc || 0) * 5; },
      set: function (v) { player.securityAlloc = Math.round(v / 5); },
      pctLabel: function () { return (player.securityAlloc || 0) + '%'; },
      note: function () { return 'of production'; }
    });
    secRow.style.gridTemplateColumns = '74px 1fr 88px';
    secWrap.appendChild(secRow);
    head.appendChild(secWrap);
    content.appendChild(head);

    var grid = el('div', { style: 'display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:10px;' });
    g.empires.forEach(function (emp) {
      if (emp.id === 0) return;
      var race = HOO.DATA.raceById[emp.raceId];
      var rel = player.relations[emp.id];
      var card = el('div', { cls: 'panel', style: 'padding:12px;' });

      if (emp.dead) {
        card.appendChild(el('div', { style: 'font-family:var(--font-display); color:var(--dim);', text: race.name + ' — extinct' }));
        grid.appendChild(card);
        return;
      }
      if (!rel.contact) {
        card.appendChild(el('div', { style: 'font-family:var(--font-display); color:var(--dim);', text: 'No Contact' }));
        grid.appendChild(card);
        return;
      }

      card.appendChild(el('div', { style: 'display:flex; align-items:center; gap:8px;' }, [
        el('span', { style: 'font-size:20px;', text: race.glyph }),
        el('div', {}, [
          el('div', { style: 'font-family:var(--font-display); font-weight:600; color:' + emp.color, text: race.name }),
          el('div', { cls: 'dim-t', style: 'font-size:11px;', text: U.esc(emp.leaderName) + ' · ' + HOO.DATA.PERSONALITIES[emp.personality].name + ' ' + HOO.DATA.OBJECTIVES[emp.objective].name })
        ])
      ]));

      // relations bar
      var relbar = el('div', { style: 'position:relative; height:10px; background:linear-gradient(90deg,#B0524B,#8492AF 50%,#6FBF7A); border-radius:3px; margin:10px 0 2px;' });
      var mark = el('div', { style: 'position:absolute; top:-3px; width:2px; height:16px; background:#E9EEF8; left:' + ((rel.value + 100) / 2) + '%;' });
      relbar.appendChild(mark);
      card.appendChild(relbar);
      var relName = HOO.State.relationName(rel.value);
      card.appendChild(el('div', { cls: 'mono', style: 'font-size:11px; color:var(--muted); display:flex; justify-content:space-between;' }, [
        el('span', { text: relName + (rel.war ? ' · AT WAR' : '') }),
        el('span', { text: treatyName(rel) })
      ]));

      // spies
      var sp = player.spies[emp.id] || (player.spies[emp.id] = { count: 0, mission: 'hide', alloc: 0, fund: 0 });
      var spyRow = el('div', { style: 'margin-top:8px;' });
      spyRow.appendChild(HOO.UI.ratioRow({
        label: 'Spies', cls: 'r-tech',
        get: function () { return sp.alloc * 10; },
        set: function (v) { sp.alloc = Math.round(v / 10); },
        pctLabel: function () { return sp.alloc + '%'; },
        note: function () { return sp.count + ' network' + (sp.count === 1 ? '' : 's'); }
      }));
      var missions = el('div', { cls: 'opt-row', style: 'margin-top:4px;' });
      [['hide', 'Hide'], ['espionage', 'Espionage'], ['sabotage', 'Sabotage']].forEach(function (m) {
        missions.appendChild(el('button', {
          cls: 'btn small' + (sp.mission === m[0] ? ' active' : ''), text: m[1],
          onclick: function () {
            HOO.Espionage.setSpyOrders(g, 0, emp.id, { mission: m[0] });
            HOO.UI.closeAll();
            racesScreen();
          }
        }));
      });
      spyRow.appendChild(missions);
      // mission-specific orders — the engine honors techTarget / sabTarget / sabStarId
      var SEL_STYLE = 'width:100%; margin-top:4px; background:var(--void-2); border:1px solid var(--line-2); color:var(--ink); padding:4px 6px; border-radius:4px; font-size:11px;';
      if (sp.mission === 'espionage') {
        var selT = el('select', { style: SEL_STYLE, title: 'Which field our agents try to steal from' });
        selT.appendChild(el('option', { value: '', text: 'Steal: any field (spies\' choice)' }));
        HOO.CONST.FIELDS.forEach(function (fld) {
          var o = el('option', { value: fld, text: 'Steal: ' + HOO.CONST.FIELD_NAMES[fld] });
          if (sp.techTarget === fld) o.selected = true;
          selT.appendChild(o);
        });
        selT.addEventListener('change', function () {
          HOO.Espionage.setSpyOrders(g, 0, emp.id, { techTarget: selT.value || null });
        });
        spyRow.appendChild(selT);
      } else if (sp.mission === 'sabotage') {
        var selOp = el('select', { style: SEL_STYLE, title: 'What the saboteurs go after' });
        [['', 'Sabotage: spies\' choice'], ['factories', 'Sabotage: factories'], ['bases', 'Sabotage: missile bases'], ['rebellion', 'Sabotage: incite rebellion']].forEach(function (op) {
          var o = el('option', { value: op[0], text: op[1] });
          if ((sp.sabTarget || '') === op[0]) o.selected = true;
          selOp.appendChild(o);
        });
        selOp.addEventListener('change', function () {
          HOO.Espionage.setSpyOrders(g, 0, emp.id, { sabTarget: selOp.value || null });
        });
        spyRow.appendChild(selOp);
        var selCol = el('select', { style: SEL_STYLE, title: 'Which of their colonies to strike' });
        selCol.appendChild(el('option', { value: '', text: 'Target: their largest colony' }));
        HOO.Colony.colonies(g, emp.id).forEach(function (e2) {
          if (!e2.star.explored[0]) return; // saboteurs can only be directed at charted systems
          var o = el('option', { value: String(e2.star.id), text: 'Target: ' + e2.star.name });
          if (sp.sabStarId === e2.star.id) o.selected = true;
          selCol.appendChild(o);
        });
        selCol.addEventListener('change', function () {
          HOO.Espionage.setSpyOrders(g, 0, emp.id, { sabStarId: selCol.value === '' ? null : parseInt(selCol.value, 10) });
        });
        spyRow.appendChild(selCol);
      }
      card.appendChild(spyRow);

      var btns = el('div', { style: 'display:flex; gap:6px; margin-top:10px;' });
      btns.appendChild(el('button', {
        cls: 'btn small primary', text: 'Audience', onclick: function () { audienceScreen(emp); }
      }));
      btns.appendChild(el('button', {
        cls: 'btn small', text: 'Report', onclick: function () { reportScreen(emp); }
      }));
      card.appendChild(btns);
      grid.appendChild(card);
    });
    content.appendChild(grid);
    HOO.UI.modal(content, { title: 'Bureau of Alien Affairs', width: 1020 });
  }

  function treatyName(rel) {
    if (rel.treaty === 'alliance') return 'Alliance' + (rel.trade ? ' · trade ' + rel.trade : '');
    if (rel.treaty === 'nonAggression') return 'Non-Aggression' + (rel.trade ? ' · trade ' + rel.trade : '');
    return rel.trade ? 'Trade ' + rel.trade + ' BC' : 'No treaties';
  }

  // ---------- audience ----------
  function audienceScreen(emp) {
    var g = HOO.game;
    var player = g.empires[0];
    var race = HOO.DATA.raceById[emp.raceId];
    var rel = player.relations[emp.id];
    var relThem = emp.relations[0];

    var content = el('div', {});
    content.appendChild(el('div', {
      cls: 'narrative',
      html: '<span class="speaker">' + U.esc(emp.leaderName) + ' of the ' + U.esc(race.name) + '</span>' + greeting(emp, relThem)
    }));

    var list = el('div', { style: 'display:flex; flex-direction:column; gap:6px; margin-top:10px;' });
    content.appendChild(list);

    function addOption(label, enabled, fn) {
      var b = el('button', { cls: 'btn', style: 'text-align:left;', text: label, onclick: fn });
      // set the attribute only when actually disabled — el() would otherwise
      // stringify undefined and disable every option
      if (!enabled) b.setAttribute('disabled', 'true');
      list.appendChild(b);
    }

    function respond(accepted, acceptText, rejectText, after) {
      HOO.UI.dialog('The ' + race.name + ' respond',
        '<div class="narrative"><span class="speaker">' + U.esc(emp.leaderName) + '</span>' + (accepted ? acceptText : rejectText) + '</div>',
        [{ label: 'Very Well', fn: after }]);
    }

    if (rel.war) {
      addOption('Propose Peace Treaty', relThem.embassy, function () {
        var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, 'peace');
        if (r.accept) HOO.Diplomacy.makePeace(g, 0, emp.id);
        respond(r.accept,
          'Enough blood has soaked the stars. Let there be peace between our peoples.',
          'Peace? You mistake our resolve. This war ends when we decide it ends.',
          function () { HOO.UI.closeAll(); racesScreen(); });
      });
    } else {
      addOption('Propose Non-Aggression Pact', rel.treaty === 'none', function () {
        var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, 'nonAggression');
        if (r.accept) { rel.treaty = 'nonAggression'; relThem.treaty = 'nonAggression'; }
        respond(r.accept,
          'Agreed. Our fleets will pass one another in peace.',
          'Your word is not yet worth the parchment. Perhaps in time.',
          function () { HOO.UI.closeAll(); racesScreen(); });
      });
      addOption('Propose Alliance', rel.treaty !== 'alliance', function () {
        var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, 'alliance');
        if (r.accept) { rel.treaty = 'alliance'; relThem.treaty = 'alliance'; }
        respond(r.accept,
          'So be it. Your enemies are our enemies. Your refuelling stations are ours, and ours are yours.',
          'An alliance is earned, not requested. We are not persuaded.',
          function () { HOO.UI.closeAll(); racesScreen(); });
      });
      var mt = HOO.Diplomacy.maxTrade(g, player, emp);
      addOption('Form Trade Agreement (up to ' + mt + ' BC/yr)', mt >= 10 && !rel.war, function () {
        var amt = Math.floor(mt * 0.75);
        var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, 'trade', { amount: amt });
        if (r.accept) HOO.Diplomacy.formTrade(g, 0, emp.id, amt);
        respond(r.accept,
          'A wise proposal. ' + amt + ' billion credits of goods will cross our borders each cycle. Trade begins at a loss and grows into fortune.',
          'Your goods do not interest us at present.',
          function () { HOO.UI.closeAll(); racesScreen(); });
      });
      addOption('Threaten War / Demand Tribute', true, function () {
        var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, 'threat');
        var txt = r.accept ?
          'We… acknowledge your strength. Take this tribute of ' + U.fmt(r.tribute) + ' BC, and trouble us no more.' :
          (emp.relations[0].war ? 'You dare threaten US? Then it is war!' : 'Empty words from an empty throne. Do not test us again.');
        respond(true, txt, txt, function () { HOO.UI.closeAll(); racesScreen(); });
      });
      if (rel.treaty !== 'none' || rel.trade > 0) {
        addOption('Break Treaties and Trade', true, function () {
          HOO.Diplomacy.breakTradeAndTreaty(g, 0, emp.id, 'all');
          respond(true, 'So the mask slips. We will remember this betrayal.', '', function () { HOO.UI.closeAll(); racesScreen(); });
        });
      }

      // third-party pressure — the engine performs the break/declaration on accept
      var breakTargets = [], warTargets = [];
      g.empires.forEach(function (t3) {
        if (t3.dead || t3.id === 0 || t3.id === emp.id) return;
        if (!player.relations[t3.id] || !player.relations[t3.id].contact) return;
        var rT = emp.relations[t3.id];
        if (!rT || !rT.contact) return;
        if (rT.treaty !== 'none') breakTargets.push(t3);
        if (!rT.war) warTargets.push(t3);
      });
      if (breakTargets.length) {
        addOption('Demand They Break a Treaty…', true, function () {
          thirdPartyPicker(emp, breakTargets, 'breakAllianceWith');
        });
      }
      if (warTargets.length) {
        addOption('Urge Them to Declare War…', true, function () {
          thirdPartyPicker(emp, warTargets, 'declareWarOn');
        });
      }
    }

    addOption('Offer Tribute (BC)', player.reserve >= 10, function () {
      var amt = Math.min(player.reserve, Math.max(10, Math.round((emp.economy ? emp.economy.totalRaw : 100) * 0.1)));
      HOO.Diplomacy.offerTribute(g, 0, emp.id, amt);
      HOO.UI.refreshTopbar();
      respond(true, 'Your gift of ' + U.fmt(amt) + ' BC is… noted. The ' + race.name + ' do not forget generosity.', '', function () { HOO.UI.closeAll(); racesScreen(); });
    });

    // gifting knowledge (manual: tribute) — unlike an exchange, the giver may
    // part with their newest secrets
    var techGifts = HOO.Diplomacy.tributableTechs(player, emp);
    addOption('Offer Tribute (Technology)', techGifts.length > 0, function () {
      tributeTechPicker(emp, techGifts);
    });

    var give = HOO.Diplomacy.tradableTechs(player, emp);
    var want = HOO.Diplomacy.tradableTechs(emp, player);
    addOption('Exchange Technology', give.length > 0 && want.length > 0 && !rel.war, function () {
      techExchange(emp, give, want);
    });

    HOO.UI.modal(content, { title: 'Audience — ' + race.name, width: 640 });
  }

  // pick a technology to gift as tribute
  function tributeTechPicker(emp, gifts) {
    var g = HOO.game;
    var race = HOO.DATA.raceById[emp.raceId];
    var content = el('div', {});
    content.appendChild(el('p', { cls: 'muted-t', text: 'A gift of knowledge. The newer the secret, the warmer the ' + race.name + ' memory of it.' }));
    var list = el('div', { cls: 'picker-list' });
    gifts.slice().reverse().slice(0, 14).forEach(function (t) { // newest first
      list.appendChild(el('div', {
        cls: 'design-slot', onclick: function () {
          HOO.Diplomacy.tributeTech(g, 0, emp.id, t.id);
          HOO.UI.dialog('The ' + race.name + ' respond',
            '<div class="narrative"><span class="speaker">' + U.esc(emp.leaderName) + '</span>The secrets of ' + U.esc(t.name) + ' are… a generous gift. We will not forget it.</div>',
            [{ label: 'Very Well', fn: function () { HOO.UI.closeAll(); racesScreen(); } }]);
        }
      }, [
        el('div', { cls: 'ds-value', text: t.name }),
        el('div', { cls: 'ds-stat', text: HOO.CONST.FIELD_NAMES[t.cat] + ' · level ' + t.level }),
        el('div', {})
      ]));
    });
    content.appendChild(list);
    HOO.UI.modal(content, { title: 'Tribute — Technology', width: 620 });
  }

  // ask an empire to break a treaty with, or declare war on, a third empire
  function thirdPartyPicker(emp, targets, kind) {
    var g = HOO.game;
    var race = HOO.DATA.raceById[emp.raceId];
    var content = el('div', {});
    content.appendChild(el('p', {
      cls: 'muted-t',
      text: kind === 'declareWarOn' ? 'Against whom should the ' + race.name + ' take up arms?' : 'Which of their treaties should be torn up?'
    }));
    var list = el('div', { style: 'display:flex; flex-direction:column; gap:6px;' });
    targets.forEach(function (t3) {
      var tRace = HOO.DATA.raceById[t3.raceId];
      list.appendChild(el('button', {
        cls: 'btn', style: 'text-align:left;', text: 'The ' + tRace.name,
        onclick: function () {
          var r = HOO.Diplomacy.evalProposal(g, emp.id, 0, kind, { target: t3.id });
          var lines = kind === 'declareWarOn' ?
            ['So be it. The ' + tRace.name + ' will feel our wrath.', 'We are not your sword to swing. No.'] :
            ['Very well. Our treaty with the ' + tRace.name + ' is ash.', 'Our treaties are our own business. No.'];
          HOO.UI.dialog('The ' + race.name + ' respond',
            '<div class="narrative"><span class="speaker">' + U.esc(emp.leaderName) + '</span>' + (r.accept ? lines[0] : lines[1]) + '</div>',
            [{ label: 'Very Well', fn: function () { HOO.UI.closeAll(); racesScreen(); } }]);
        }
      }));
    });
    content.appendChild(list);
    HOO.UI.modal(content, { title: (kind === 'declareWarOn' ? 'Urge War' : 'Demand Treaty Break') + ' — ' + race.name, width: 520 });
  }

  function greeting(emp, relThem) {
    var v = relThem.value;
    if (relThem.war) return 'You come to us in wartime. Speak quickly, before our patience thins.';
    if (v > 40) return 'Old friend. The court brightens at your arrival. What shall we accomplish together?';
    if (v > 10) return 'We receive you in good faith. Speak your purpose.';
    if (v > -20) return 'State your business. Our time is not without limit.';
    return 'You have some nerve, coming before this throne. Speak — briefly.';
  }

  function techExchange(emp, give, want) {
    var g = HOO.game;
    var content = el('div', {});
    content.appendChild(el('p', { cls: 'muted-t', text: 'Choose the technology you desire. The ' + HOO.DATA.raceById[emp.raceId].name + ' will name their price.' }));
    var list = el('div', { cls: 'picker-list' });
    want.slice(0, 10).forEach(function (t) {
      list.appendChild(el('div', {
        cls: 'design-slot', onclick: function () {
          // AI asks for a tech of similar or higher level
          var price = give.filter(function (gt) { return gt.level >= t.level - 5; });
          var ask = price.length ? price[0] : give[give.length - 1];
          HOO.UI.dialog('Their Price',
            'For <b>' + U.esc(t.name) + '</b>, the ' + HOO.DATA.raceById[emp.raceId].name + ' demand <b>' + U.esc(ask.name) + '</b>.',
            [
              {
                label: 'Agree to Exchange', fn: function () {
                  HOO.Diplomacy.exchangeTech(g, 0, emp.id, ask.id, t.id);
                  HOO.UI.closeAll();
                }
              },
              { label: 'Refuse', cls: '' }
            ]);
        }
      }, [
        el('div', { cls: 'ds-value', text: t.name }),
        el('div', { cls: 'ds-stat', text: HOO.CONST.FIELD_NAMES[t.cat] + ' · level ' + t.level }),
        el('div', {})
      ]));
    });
    content.appendChild(list);
    HOO.UI.modal(content, { title: 'Technology Exchange', width: 620 });
  }

  // ---------- intelligence report ----------
  function reportScreen(emp) {
    var g = HOO.game;
    var player = g.empires[0];
    var race = HOO.DATA.raceById[emp.raceId];
    var sp = player.spies[emp.id];
    var hasSpy = sp && sp.count > 0;
    var content = el('div', {});
    content.appendChild(el('p', {
      cls: hasSpy ? 'good' : 'muted-t', style: 'font-size:12px;',
      text: hasSpy ? 'Intelligence current — ' + sp.count + ' active network(s).' : 'No spy networks. Estimates only.'
    }));
    var grid = el('div', { style: 'display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;' });
    HOO.CONST.FIELDS.forEach(function (f) {
      var box = el('div', { cls: 'panel', style: 'padding:8px 10px;' });
      box.appendChild(el('div', { cls: 'eyebrow', text: HOO.CONST.FIELD_NAMES[f] + (hasSpy ? ' · lv ' + HOO.State.techLevel(emp, f) : '') }));
      if (hasSpy) {
        var latest = emp.techs[f].slice(-8).map(function (tid) { return HOO.DATA.techById[tid].name; });
        box.appendChild(el('div', { cls: 'muted-t', style: 'font-size:12px; margin-top:4px;', text: latest.join(', ') || 'Nothing notable' }));
      } else {
        box.appendChild(el('div', { cls: 'dim-t', style: 'font-size:12px; margin-top:4px;', text: 'Unknown' }));
      }
      grid.appendChild(box);
    });
    content.appendChild(grid);
    // wars & treaties
    var lines = [];
    g.empires.forEach(function (o) {
      if (o.dead || o.id === emp.id) return;
      var r = emp.relations[o.id];
      if (!r || !r.contact) return;
      if (r.war) lines.push('At war with the ' + HOO.DATA.raceById[o.raceId].name);
      else if (r.treaty === 'alliance') lines.push('Allied with the ' + HOO.DATA.raceById[o.raceId].name);
    });
    if (lines.length) {
      content.appendChild(el('hr', { cls: 'hr' }));
      lines.forEach(function (l) { content.appendChild(el('div', { cls: 'muted-t', style: 'font-size:12.5px;', text: l })); });
    }
    HOO.UI.modal(content, { title: 'Intelligence Report — ' + race.name, width: 720 });
  }

  // ================= PLANETS =================
  var planetsSort = { key: null, dir: 1 }; // remembered across openings this session

  function planetsScreen() {
    var g = HOO.game;
    var emp = g.empires[0];
    var content = el('div', {});

    // column model: header, right-aligned?, sort accessor (null = unsortable)
    var cols = [
      { h: 'Colony', get: function (e) { return e.star.name; } },
      { h: 'Pop', r: 1, get: function (e) { return e.colony.pop; } },
      { h: 'Δ', r: 1, get: function (e) { return e.colony.lastGrowth || 0; } },
      { h: 'Fact', r: 1, get: function (e) { return e.colony.factories; } },
      { h: 'Waste', r: 1, get: function (e) { return e.star.planet.waste; } },
      { h: 'Bases', r: 1, get: function (e) { return e.colony.bases; } },
      { h: 'Shd', r: 1, get: function (e) { return e.colony.shield || 0; } },
      { h: 'Prod', r: 1, get: function (e) { return e.colony.lastProd || 0; } },
      { h: 'Building', get: function (e) { return e.colony.buildingStargate ? 'Star Gate' : (emp.designs[e.colony.buildDesign] ? emp.designs[e.colony.buildDesign].name : ''); } },
      { h: 'Notes', get: null }
    ];

    var tblWrap = el('div', {});
    function renderTable() {
      U.clearEl(tblWrap);
      var list = HOO.Colony.colonies(g, 0);
      if (planetsSort.key !== null && cols[planetsSort.key] && cols[planetsSort.key].get) {
        var getv = cols[planetsSort.key].get;
        list.sort(function (a, b) {
          var av = getv(a), bv = getv(b);
          if (typeof av === 'string') return String(av).localeCompare(String(bv)) * planetsSort.dir;
          return (av - bv) * planetsSort.dir;
        });
      }
      var tbl = el('table', { cls: 'data' });
      var hdr = el('tr', {});
      cols.forEach(function (col, i) {
        var th = el('th', {
          cls: col.r ? 'r' : '',
          text: col.h + (planetsSort.key === i ? (planetsSort.dir > 0 ? ' ▴' : ' ▾') : '')
        });
        if (col.get) {
          th.style.cursor = 'pointer';
          th.title = 'Sort by ' + col.h;
          th.addEventListener('click', function () {
            if (planetsSort.key === i) {
              planetsSort.dir = -planetsSort.dir;
            } else {
              planetsSort.key = i;
              // text columns read best ascending, numbers biggest-first
              planetsSort.dir = (col.h === 'Colony' || col.h === 'Building') ? 1 : -1;
            }
            renderTable();
          });
        }
        hdr.appendChild(th);
      });
      tbl.appendChild(hdr);

      var tot = { pop: 0, gr: 0, fact: 0, waste: 0, bases: 0, prod: 0 };
      list.forEach(function (e) {
        var c = e.colony, s = e.star, p = s.planet;
        var tr = el('tr', {
          cls: 'click', onclick: function () {
            HOO.UI.closeAll();
            HOO.Panels.showStar(s.id);
          }
        });
        tr.appendChild(el('td', { text: s.name }));
        tr.appendChild(el('td', { cls: 'r', text: String(Math.round(c.pop)) }));
        var gr = Math.round(c.lastGrowth || 0);
        tr.appendChild(el('td', { cls: 'r ' + (gr >= 0 ? 'good' : 'bad'), text: (gr >= 0 ? '+' : '') + gr }));
        tr.appendChild(el('td', { cls: 'r', text: String(Math.round(c.factories)) }));
        tr.appendChild(el('td', { cls: 'r ' + (p.waste > 0 ? 'bad' : ''), text: String(Math.round(p.waste)) }));
        tr.appendChild(el('td', { cls: 'r', text: String(c.bases) }));
        tr.appendChild(el('td', { cls: 'r', text: c.shield ? U.roman(c.shield) : '' }));
        tr.appendChild(el('td', { cls: 'r', text: U.fmt(c.lastProd) }));
        tr.appendChild(el('td', { text: c.buildingStargate ? 'Star Gate' : (emp.designs[c.buildDesign] ? emp.designs[c.buildDesign].name : '') }));
        var notes = [];
        var sp = HOO.CONST.SPECIALS[p.special];
        if (sp.name) notes.push(sp.name);
        var def = HOO.CONST.PLANET_TYPES[p.type];
        if (def.hostility) notes.push('hostile');
        if (c.stargate) notes.push('(*)');
        if (c.reloc !== null && c.reloc !== undefined && g.stars[c.reloc]) notes.push('reloc→' + g.stars[c.reloc].name);
        var inbound = 0;
        g.transports.forEach(function (t) { if (t.empire === 0 && t.to === s.id) inbound += t.pop; });
        if (inbound > 0) notes.push('inbound ' + Math.round(inbound) + 'M');
        if (c.transported) notes.push('out ' + Math.round(c.transported) + 'M');
        if (c.inRebellion) notes.push('REBELLION');
        tr.appendChild(el('td', { cls: 'dim-t', text: notes.join(' ') }));
        tbl.appendChild(tr);
        tot.pop += c.pop; tot.gr += c.lastGrowth || 0; tot.fact += c.factories;
        tot.waste += p.waste; tot.bases += c.bases; tot.prod += c.lastProd || 0;
      });

      // empire totals footer
      var trT = el('tr', {});
      function totCell(txt, right) { trT.appendChild(el('td', { cls: (right ? 'r ' : '') + 'gold', style: 'border-top:1px solid var(--line-2); font-weight:600;', text: txt })); }
      totCell('Total (' + list.length + ')');
      totCell(String(Math.round(tot.pop)), 1);
      totCell((tot.gr >= 0 ? '+' : '') + Math.round(tot.gr), 1);
      totCell(String(Math.round(tot.fact)), 1);
      totCell(String(Math.round(tot.waste)), 1);
      totCell(String(tot.bases), 1);
      totCell('', 1);
      totCell(U.fmt(tot.prod), 1);
      totCell('');
      totCell('');
      tbl.appendChild(trT);
      tblWrap.appendChild(tbl);
    }
    renderTable();
    content.appendChild(tblWrap);

    // economy summary + reserve tax
    var eco = emp.economy;
    if (eco) {
      var sum = el('div', { style: 'display:flex; gap:20px; margin-top:14px; flex-wrap:wrap; align-items:center;' });
      sum.appendChild(el('div', { cls: 'stat mono', html: 'Income — planets <b>' + U.fmt(eco.totalRaw) + '</b> · trade <b>' + U.fmt(eco.trade) + '</b>' }));
      sum.appendChild(el('div', { cls: 'stat mono', html: 'Costs — ships <b>' + U.fmt(eco.shipMaint) + '</b> · bases <b>' + U.fmt(eco.baseMaint) + '</b> · spies <b>' + U.fmt(eco.spyCost) + '</b> · security <b>' + U.fmt(eco.secCost) + '</b>' }));
      content.appendChild(sum);
    }
    var taxWrap = el('div', { style: 'max-width:380px; margin-top:10px;' });
    taxWrap.appendChild(HOO.UI.ratioRow({
      label: 'Tax', cls: 'r-ind',
      get: function () { return emp.taxRate * 5; },
      set: function (v) { emp.taxRate = Math.round(v / 5); },
      pctLabel: function () { return emp.taxRate + '%'; },
      note: function () { return '→ reserve (2:1)'; }
    }));
    content.appendChild(taxWrap);
    content.appendChild(el('div', { cls: 'stat mono', style: 'margin-top:4px;', html: 'Planetary Reserve: <b>' + U.fmt(emp.reserve) + '</b> BC — fund colonies from their panel.' }));

    HOO.UI.modal(content, { title: 'Colonial Administration', width: 1020 });
  }

  // ================= TECH =================
  function techScreen() {
    var g = HOO.game;
    var emp = g.empires[0];
    var content = el('div', { style: 'display:grid; grid-template-columns: 1fr 360px; gap:18px;' });
    var left = el('div', {});
    var right = el('div', {});
    content.appendChild(left);
    content.appendChild(right);

    // right: allocation bars + current projects
    right.appendChild(el('div', { cls: 'eyebrow', text: 'Research Allocation' }));
    var rows = {};
    HOO.CONST.FIELDS.forEach(function (f) {
      var wrap = el('div', { style: 'margin-bottom:14px;' });
      rows[f] = HOO.UI.ratioRow({
        label: HOO.CONST.FIELD_NAMES[f].slice(0, 5), cls: 'r-tech',
        get: function () { return emp.research.alloc[f]; },
        set: function (v) {
          HOO.UI.rebalance(emp.research.alloc, f, v, emp.research.locked);
          Object.keys(rows).forEach(function (k) { rows[k]._update(); });
        },
        note: function () { return ''; },
        lockable: true,
        locked: function () { return !!emp.research.locked[f]; },
        toggleLock: function () { emp.research.locked[f] = !emp.research.locked[f]; }
      });
      wrap.appendChild(rows[f]);
      var pr = HOO.Research.progress(emp, f);
      if (pr) {
        var pct = Math.round(pr.pctToBase * 100);
        var chanceTxt = pr.discoveryChance > 0 ? ' · ' + Math.round(pr.discoveryChance) + '% breakthrough' : ' · ' + pct + '% invested';
        wrap.appendChild(el('div', {
          cls: 'dim-t mono', style: 'font-size:10.5px; padding-left:52px;',
          text: pr.tech.name + chanceTxt
        }));
        // choice button when project just started
        var ch = HOO.Research.choices(emp, f);
        if (ch.length > 1 && emp.research.projects[f].invested < 1) {
          var sel = el('div', { style: 'padding-left:52px; margin-top:2px;' });
          ch.forEach(function (t) {
            sel.appendChild(el('button', {
              cls: 'btn small' + (t.id === pr.tech.id ? ' active' : ''), style: 'margin:2px 2px 0 0;', text: t.name,
              onclick: function () { HOO.Research.startProject(emp, f, t.id); HOO.UI.closeAll(); techScreen(); }
            }));
          });
          wrap.appendChild(sel);
        }
      } else {
        wrap.appendChild(el('div', { cls: 'dim-t mono', style: 'font-size:10.5px; padding-left:52px;', text: 'No projects left this game — allocation flows to other fields' }));
      }
      right.appendChild(wrap);
    });

    // left: discovered techs by field
    var tabs = el('div', { cls: 'opt-row', style: 'margin-bottom:10px;' });
    var listBox = el('div', { cls: 'picker-list' });
    var activeField = HOO.CONST.FIELDS[0];
    function renderList() {
      U.clearEl(listBox);
      emp.techs[activeField].slice().reverse().forEach(function (tid) {
        var t = HOO.DATA.techById[tid];
        listBox.appendChild(el('div', { cls: 'design-slot', style: 'cursor:default;' }, [
          el('div', { cls: 'ds-value', text: t.name }),
          el('div', { cls: 'ds-stat', text: t.desc }),
          el('div', { cls: 'ds-stat', text: 'lv ' + t.level })
        ]));
      });
      // manual (Technology): each game offers only part of the tree — show
      // what our own scientists can still reach; the rest must come from
      // espionage, trade, or conquest and is hidden here
      var upcoming = HOO.DATA.TECHS[activeField].filter(function (t) {
        return !emp.techFlags[t.id] && HOO.Research.inTree(emp, t.id);
      });
      if (upcoming.length) {
        listBox.appendChild(el('div', { cls: 'eyebrow', style: 'margin:10px 0 4px; display:block;', text: 'Within Reach This Game' }));
        upcoming.forEach(function (t) {
          listBox.appendChild(el('div', { cls: 'design-slot', style: 'cursor:default; opacity:0.5;' }, [
            el('div', { cls: 'ds-value', text: t.name }),
            el('div', { cls: 'ds-stat', text: 'undiscovered' }),
            el('div', { cls: 'ds-stat', text: 'lv ' + t.level })
          ]));
        });
      }
    }
    HOO.CONST.FIELDS.forEach(function (f) {
      var b = el('button', {
        cls: 'btn small' + (f === activeField ? ' active' : ''),
        text: HOO.CONST.FIELD_NAMES[f] + ' (' + HOO.State.techLevel(emp, f) + ')',
        onclick: function () {
          activeField = f;
          Array.prototype.forEach.call(tabs.children, function (c) { c.classList.remove('active'); });
          b.classList.add('active');
          renderList();
        }
      });
      tabs.appendChild(b);
    });
    left.appendChild(tabs);
    left.appendChild(listBox);
    renderList();

    HOO.UI.modal(content, { title: 'Ministry of Science', width: 1020 });
  }

  // ================= STATUS =================
  function statusScreen() {
    var g = HOO.game;
    var content = el('div', {});
    var cats = [
      ['Fleet', function (e) { var p = 0; g.fleets.forEach(function (f) { if (f.empire === e.id) f.ships.forEach(function (n, s) { if (e.designs[s]) p += n * e.designs[s].cost; }); }); return p; }],
      ['Population', function (e) { var p = 0; HOO.Colony.colonies(g, e.id).forEach(function (c) { p += c.colony.pop; }); return p; }],
      ['Technology', function (e) { var p = 0; HOO.CONST.FIELDS.forEach(function (f) { p += HOO.State.techLevel(e, f); }); return p; }],
      ['Planets', function (e) { return HOO.Colony.colonies(g, e.id).length; }],
      ['Production', function (e) { return e.economy ? e.economy.totalRaw : 0; }],
      ['Total Power', function (e) { return HOO.Turn.powerOf(g, e); }]
    ];
    var known = g.empires.filter(function (e) {
      return !e.dead && (e.id === 0 || g.empires[0].relations[e.id].contact);
    });
    cats.forEach(function (cat) {
      content.appendChild(el('div', { cls: 'eyebrow', style: 'margin-top:10px; display:block;', text: cat[0] }));
      var max = 1;
      known.forEach(function (e) { max = Math.max(max, cat[1](e)); });
      known.forEach(function (e) {
        var v = cat[1](e);
        var row = el('div', { style: 'display:grid; grid-template-columns:110px 1fr; gap:8px; align-items:center; margin:3px 0;' });
        row.appendChild(el('div', { cls: 'mono', style: 'font-size:11px; color:' + e.color, text: HOO.DATA.raceById[e.raceId].name }));
        var bar = el('div', { style: 'height:10px; background:var(--void-2); border:1px solid var(--line); border-radius:3px; overflow:hidden;' });
        // any nonzero value gets a visible sliver — log scaling can round to 0%
        var pctW = v > 0 ? Math.max(2, Math.round(Math.log(1 + v) / Math.log(1 + max) * 100)) : 0;
        bar.appendChild(el('div', { style: 'height:100%; width:' + pctW + '%; background:' + e.color + '; opacity:0.8;' }));
        row.appendChild(bar);
        content.appendChild(row);
      });
    });
    HOO.UI.modal(content, { title: 'Galactic Status', width: 640 });
  }

  HOO.Screens = {
    open: open, audienceScreen: audienceScreen, statusScreen: statusScreen, designSpecs: designSpecs,
    helpScreen: helpScreen, messageLog: messageLog
  };
})();
