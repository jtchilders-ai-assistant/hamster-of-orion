/* Hamster of Orion — bootstrap & turn orchestration */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';

  function rebuild() {
    HOO.UI.closeAll();
    HOO.UI.buildFrame();
  }

  var processing = false;

  function endTurn() {
    if (processing || !HOO.game) return;
    if (HOO.game.gameOver && HOO.game.gameOver.defeat && HOO.game.gameOver.how === 'eliminated') {
      HOO.Notices.gameOverScreen();
      return;
    }
    processing = true;
    HOO.UI.setWheelSpinning(true);

    // slight delay so the wheel visibly turns
    setTimeout(function () {
      var res;
      try {
        res = HOO.Turn.nextTurn(HOO.game);
      } catch (e) {
        console.error(e);
        processing = false;
        HOO.UI.setWheelSpinning(false);
        HOO.UI.dialog('Anomaly Detected', 'The chroniclers report an inconsistency in this cycle: <span class="mono" style="font-size:11px;">' + (e && e.message ? e.message : e) + '</span>');
        return;
      }
      HOO.Notices.presentTurn(res, function () {
        // autosave every turn
        HOO.State.save('auto');
        processing = false;
        HOO.UI.setWheelSpinning(false);
        HOO.UI.refreshTopbar();
        // refresh side panel
        var sel = HOO.Map.getSelected();
        if (sel.star !== null && sel.star !== undefined) HOO.Panels.showStar(sel.star);
      });
    }, 250);
  }

  // ---------- keyboard shortcuts ----------
  var keysBound = false;

  function inGame() {
    return !!(HOO.game && document.getElementById('next-turn-btn'));
  }

  function cycleColonies(dir) {
    var g = HOO.game;
    var cols = HOO.Colony.colonies(g, 0);
    if (!cols.length) return;
    var sel = HOO.Map.getSelected();
    var idx = -1;
    cols.forEach(function (e, i) { if (e.star.id === sel.star) idx = i; });
    var next = cols[((idx + dir) % cols.length + cols.length) % cols.length];
    HOO.Map.centerOn(next.star.id);
    HOO.Panels.showStar(next.star.id);
  }

  function cycleFleets() {
    var g = HOO.game;
    var fleets = g.fleets.filter(function (f) { return f.empire === 0 && f.at !== null; });
    if (!fleets.length) return;
    var sel = HOO.Map.getSelected();
    var idx = fleets.indexOf(sel.fleet);
    var next = fleets[(idx + 1) % fleets.length];
    HOO.Map.centerOn(next.at);
    HOO.Panels.showFleet(next);
  }

  function bindKeys() {
    if (keysBound) return;
    keysBound = true;
    document.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!inGame()) return;

      if (e.key === 'Escape') {
        if (HOO.UI.hasOverlay()) { HOO.UI.close(); }
        else {
          HOO.Map.clearSelection();
          HOO.Map.cancelModes();
          HOO.Panels.showBlank();
        }
        e.preventDefault();
        return;
      }
      if (HOO.UI.hasOverlay()) return; // other keys only act on the main view

      switch (e.key) {
        case 'Enter': endTurn(); e.preventDefault(); break;
        case '1': HOO.Screens.open('design'); break;
        case '2': HOO.Screens.open('fleet'); break;
        case '3': HOO.Screens.open('races'); break;
        case '4': HOO.Screens.open('planets'); break;
        case '5': HOO.Screens.open('tech'); break;
        case '6': HOO.Screens.open('status'); break;
        case 'g': case 'G': HOO.Screens.open('game'); break;
        case 'Tab': cycleColonies(e.shiftKey ? -1 : 1); e.preventDefault(); break;
        case 'f': case 'F': cycleFleets(); break;
        case 'h': case 'H':
          HOO.Map.centerOn(HOO.game.empires[0].homeStarId);
          HOO.Panels.showStar(HOO.game.empires[0].homeStarId);
          break;
      }
    });
  }

  function boot() {
    bindKeys();
    // fresh session: show title (Continue offered if autosave exists)
    HOO.NewGame.showTitle();
  }

  HOO.Main = { rebuild: rebuild, endTurn: endTurn, boot: boot, cycleColonies: cycleColonies, cycleFleets: cycleFleets };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
