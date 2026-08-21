/* Hamster of Orion — title & new game setup */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;

  function showTitle() {
    var app = document.getElementById('app');
    U.clearEl(app);

    var screen = el('div', { cls: 'title-screen' });
    var wheel = el('div', { cls: 'title-wheel' });
    wheel.innerHTML = U.wheelSvg(560, '#E3B34C', 8);
    screen.appendChild(wheel);

    screen.appendChild(el('div', { cls: 'title-block' }, [
      el('div', { cls: 'over', text: 'The Great Awakening · Year 2623' }),
      el('h1', { html: 'Hamster<br><span class="of">of</span> Orion' }),
      el('div', { cls: 'tag', text: '“He who masters the Wheel of Orion shall master the universe.”' })
    ]));

    var menu = el('div', { cls: 'title-menu' });
    function tryLoad(slot) {
      if (HOO.State.load(slot)) HOO.Main.rebuild();
      else HOO.UI.dialog('Archive Damaged', 'This save could not be read — it may be corrupt or from a newer build.');
    }
    var hasAuto = !!HOO.State.saveMeta('auto');
    if (hasAuto) {
      menu.appendChild(el('button', {
        cls: 'btn primary', text: 'Continue Game',
        onclick: function () { tryLoad('auto'); }
      }));
    }
    menu.appendChild(el('button', { cls: 'btn' + (hasAuto ? '' : ' primary'), text: 'New Game', onclick: showSetup }));
    [1, 2, 3, 4, 5, 6].forEach(function (slot) {
      var meta = HOO.State.saveMeta(slot);
      if (meta) {
        menu.appendChild(el('button', {
          cls: 'btn', text: 'Load ' + slot + ' — cycle ' + meta.year + ' (' + meta.race + ')',
          onclick: function () { tryLoad(slot); }
        }));
      }
    });
    screen.appendChild(menu);
    app.appendChild(screen);
  }

  function showSetup() {
    var app = document.getElementById('app');
    U.clearEl(app);

    var opts = {
      size: 'medium', difficulty: 'average', opponents: 3,
      raceId: 'hamsters', leaderName: '', homeName: ''
    };

    var screen = el('div', { cls: 'title-screen' });
    var wheel = el('div', { cls: 'title-wheel' });
    wheel.innerHTML = U.wheelSvg(560, '#E3B34C', 8);
    screen.appendChild(wheel);

    var panel = el('div', { cls: 'setup panel', style: 'padding:22px; max-height: calc(100vh - 60px); overflow-y:auto;' });
    panel.appendChild(el('h1', { style: 'font-family:var(--font-display); font-size:20px; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:16px;', text: 'Found Your Empire' }));

    var grid = el('div', { cls: 'setup-grid' });
    var left = el('div', {});
    var right = el('div', {});
    grid.appendChild(left);
    grid.appendChild(right);

    // galaxy size
    left.appendChild(optGroup('Galaxy Size', Object.keys(HOO.CONST.GALAXY_SIZES).map(function (k) {
      return { v: k, label: HOO.CONST.GALAXY_SIZES[k].name + ' · ' + HOO.CONST.GALAXY_SIZES[k].stars + ' stars' };
    }), function (v) { opts.size = v; }, opts.size));

    // difficulty
    left.appendChild(optGroup('Difficulty', Object.keys(HOO.CONST.DIFFICULTIES).map(function (k) {
      return { v: k, label: HOO.CONST.DIFFICULTIES[k].name };
    }), function (v) { opts.difficulty = v; }, opts.difficulty));

    // opponents
    left.appendChild(optGroup('Opponents', [1, 2, 3, 4, 5].map(function (n) {
      return { v: n, label: String(n) };
    }), function (v) { opts.opponents = v; }, opts.opponents));

    // names (manual: the player names both the emperor and the home world)
    var inputStyle = 'width:100%; background:var(--void-2); border:1px solid var(--line-2); color:var(--ink); padding:7px 9px; border-radius:4px; margin-top:4px;';
    var nameGroup = el('div', { cls: 'opt-group' });
    nameGroup.appendChild(el('span', { cls: 'eyebrow', text: 'Eternal Consciousness (optional name)' }));
    nameGroup.appendChild(el('input', {
      placeholder: 'Leader name…',
      style: inputStyle,
      oninput: function () { opts.leaderName = this.value; }
    }));
    nameGroup.appendChild(el('span', { cls: 'eyebrow', style: 'display:block; margin-top:10px;', text: 'Home World (optional name)' }));
    nameGroup.appendChild(el('input', {
      placeholder: 'Home world name…',
      style: inputStyle,
      oninput: function () { opts.homeName = this.value; }
    }));
    left.appendChild(nameGroup);

    // race picker
    right.appendChild(el('span', { cls: 'eyebrow', style: 'display:block; margin-bottom:6px;', text: 'Your Race' }));
    var loreBox = el('div', { cls: 'race-lore' });
    var rgrid = el('div', { cls: 'race-grid' });
    HOO.DATA.RACES.forEach(function (r) {
      var card = el('div', {
        cls: 'race-card' + (opts.raceId === r.id ? ' sel' : ''),
        onclick: function () {
          opts.raceId = r.id;
          Array.prototype.forEach.call(rgrid.children, function (c) { c.classList.remove('sel'); });
          card.classList.add('sel');
          updateLore();
        }
      }, [
        el('div', { cls: 'rc-glyph', text: r.glyph }),
        el('div', { cls: 'rc-name', text: r.name }),
        el('div', { cls: 'rc-trait', text: r.trait })
      ]);
      rgrid.appendChild(card);
    });
    right.appendChild(rgrid);
    right.appendChild(loreBox);
    function updateLore() {
      var r = HOO.DATA.raceById[opts.raceId];
      loreBox.innerHTML = '<b>' + U.esc(r.name) + '</b> — ' + U.esc(r.lore) + '<br><span class="gold">' + U.esc(r.bonusText) + '</span>';
    }
    updateLore();

    panel.appendChild(grid);

    var btnRow = el('div', { style: 'display:flex; gap:10px; margin-top:18px;' });
    btnRow.appendChild(el('button', {
      cls: 'btn primary', style: 'padding:10px 22px;', text: 'Begin — Cycle 2623',
      onclick: function () {
        HOO.State.newGame(opts);
        HOO.Main.rebuild();
        // opening narrative
        var r = HOO.DATA.raceById[opts.raceId];
        HOO.UI.dialog('The Wheel Turns',
          '<div class="narrative"><span class="speaker">' + U.esc(HOO.game.empires[0].leaderName) + '</span>' +
          'One hundred twenty-three years since the Awakening. Ten races reach for the stars, and at the galaxy\'s heart the Wheel of Orion waits behind its barrier, turning for no one. It will turn for the ' + U.esc(r.name) + '.</div>' +
          '<p class="muted-t" style="margin-top:8px; font-size:12.5px;">Send your scouts to the nearby stars. Find worlds worth claiming. Your colony ship is ready.</p>',
          [{ label: 'Take Command' }]);
      }
    }));
    btnRow.appendChild(el('button', { cls: 'btn', text: 'Back', onclick: showTitle }));
    panel.appendChild(btnRow);

    screen.appendChild(panel);
    app.appendChild(screen);
  }

  function optGroup(label, items, set, current) {
    var group = el('div', { cls: 'opt-group' });
    group.appendChild(el('span', { cls: 'eyebrow', text: label }));
    var row = el('div', { cls: 'opt-row' });
    items.forEach(function (it) {
      var b = el('button', {
        cls: 'btn small' + (it.v === current ? ' active' : ''), text: it.label,
        onclick: function () {
          set(it.v);
          Array.prototype.forEach.call(row.children, function (c) { c.classList.remove('active'); });
          b.classList.add('active');
        }
      });
      row.appendChild(b);
    });
    group.appendChild(row);
    return group;
  }

  HOO.NewGame = { showTitle: showTitle, showSetup: showSetup };
})();
