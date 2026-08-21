/* Hamster of Orion — bootstrap & turn orchestration */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';

  // build identifier: shown in the window title and available to any screen
  // (title screen, save meta, bug reports)
  HOO.VERSION = '1.0.0';

  function rebuild() {
    HOO.UI.closeAll();
    // let the tactical screen tear itself down (removes its own overlay,
    // timers and capture-phase key blocker) if it exposes a hook
    if (HOO.CombatUI && HOO.CombatUI.forceClose) {
      try { HOO.CombatUI.forceClose(); } catch (e) { console.error(e); }
    }
    // sweep overlays that bypass the registry (tactical combat appends its
    // own .station-overlay directly to <body>) so a rebuild never leaves a
    // dead screen covering the map
    var orphans = document.querySelectorAll('.station-overlay');
    for (var i = 0; i < orphans.length; i++) {
      if (orphans[i].parentNode) orphans[i].parentNode.removeChild(orphans[i]);
    }
    HOO.UI.buildFrame();
  }

  var processing = false;
  var stateSuspect = false;  // player elected to keep playing after a mid-cycle fault
  var faultDialogUp = false; // never stack more than one anomaly dialog
  var lastFaultToast = 0;

  function restoreBackup() {
    faultDialogUp = false;
    if (HOO.State.load('backup')) {
      stateSuspect = false;
      processing = false;
      HOO.UI.setWheelSpinning(false);
      rebuild();
      HOO.UI.toast({ tag: 'RESTORED', text: 'The chronicle has been rolled back to the last stable cycle.', kind: 'green' });
    } else {
      stateSuspect = true;
      HOO.UI.dialog('Restore Failed', 'No stable backup could be read from browser storage. Play continues on the current state.');
    }
  }

  function faultDialog(e) {
    if (faultDialogUp) return;
    faultDialogUp = true;
    var msg = e && e.message ? e.message : String(e);
    HOO.UI.dialog('Anomaly Detected',
      'The chroniclers report an inconsistency in this cycle: <span class="mono" style="font-size:11px;">' + HOO.util.esc(msg) + '</span>' +
      '<div class="muted-t" style="margin-top:8px;">Restoring returns the empire to the state before this cycle began. ' +
      'Continuing keeps the partially processed cycle and is not recommended.</div>',
      [
        { label: 'Restore Stable State', cls: 'primary', fn: restoreBackup },
        { label: 'Continue Anyway', cls: 'danger', fn: function () { faultDialogUp = false; stateSuspect = true; } }
      ], true);
  }

  // refresh whichever side panel is showing after the world changed
  function refreshSelection() {
    var sel = HOO.Map.getSelected();
    if (sel.star !== null && sel.star !== undefined) {
      HOO.Panels.showStar(sel.star);
    } else if (sel.fleet) {
      // the selected fleet may have moved, merged, or died this cycle
      if (HOO.game.fleets.indexOf(sel.fleet) >= 0) HOO.Panels.showFleet(sel.fleet);
      else { HOO.Map.clearSelection(); HOO.Panels.showBlank(); }
    }
  }

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
      // rolling pre-cycle backup: after a fault the older, known-good backup
      // is preserved until a full cycle completes cleanly again
      if (!stateSuspect) HOO.State.save('backup');
      var res;
      try {
        res = HOO.Turn.nextTurn(HOO.game);
      } catch (e) {
        console.error(e);
        processing = false;
        HOO.UI.setWheelSpinning(false);
        faultDialog(e);
        return;
      }
      try {
        HOO.Notices.presentTurn(res, function () {
          // the cycle completed cleanly: this state is the new good baseline
          stateSuspect = false;
          // autosave every turn
          if (!HOO.State.save('auto')) {
            HOO.UI.toast({ tag: 'SAVE', text: 'Autosave failed — browser storage is full or blocked.', kind: 'red' });
          }
          processing = false;
          HOO.UI.setWheelSpinning(false);
          HOO.UI.refreshTopbar();
          refreshSelection();
        });
      } catch (e) {
        console.error(e);
        processing = false;
        HOO.UI.setWheelSpinning(false);
        faultDialog(e);
      }
    }, 250);
  }

  // ---------- global fault net ----------
  // presentTurn's dialog queue and the combat timeout chain run outside
  // endTurn's try/catch; without this, one throw leaves the wheel disabled
  // and processing stuck true until a page reload
  function onGlobalFault(err) {
    if (!HOO.game) return;
    if (err) console.error(err);
    if (processing) {
      processing = false;
      HOO.UI.setWheelSpinning(false);
      faultDialog(err);
    } else {
      var now = Date.now();
      if (now - lastFaultToast > 5000) {
        lastFaultToast = now;
        HOO.UI.toast({
          tag: 'FAULT', kind: 'red',
          text: 'A script error occurred: ' + (err && err.message ? err.message : String(err))
        });
      }
    }
  }
  window.addEventListener('error', function (ev) { onGlobalFault(ev.error || ev.message); });
  window.addEventListener('unhandledrejection', function (ev) { onGlobalFault(ev.reason); });

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
      // focused slider widgets (ratio bars) own their keys, incl. Tab to move
      // focus — but Escape must still close screens even from a slider
      if (e.target && e.target.getAttribute && e.target.getAttribute('role') === 'slider' &&
          e.key !== 'Escape') return;
      // tactical combat owns the keyboard entirely while its overlay is up
      // (the canvas check guards against stale isActive state after a
      // fault-recovery rebuild swept the combat overlay out of the DOM)
      if (HOO.CombatUI && HOO.CombatUI.isActive && HOO.CombatUI.isActive() &&
          document.getElementById('combat-canvas')) return;
      if (!inGame()) return;

      if (e.key === 'Escape') {
        if (HOO.UI.hasOverlay()) { HOO.UI.close(); } // no-op on noClose modals
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
        case '?': HOO.Screens.open('help'); break;
      }
    });
  }

  // ---------- small-viewport notice ----------
  var viewportDismissed = false;

  function checkViewport() {
    var existing = document.getElementById('viewport-notice');
    var narrow = window.innerWidth < 900;
    if (!narrow || viewportDismissed) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }
    if (existing) return;
    var el = HOO.util.el;
    document.body.appendChild(el('div', { id: 'viewport-notice', cls: 'viewport-notice' }, [
      el('span', { text: 'Hamster of Orion is designed for desktop displays 1024px wide or more.' }),
      el('button', {
        cls: 'btn small', text: 'Dismiss',
        onclick: function () {
          viewportDismissed = true;
          var n = document.getElementById('viewport-notice');
          if (n && n.parentNode) n.parentNode.removeChild(n);
        }
      })
    ]));
  }

  function boot() {
    document.title = 'Hamster of Orion · v' + HOO.VERSION;
    bindKeys();
    checkViewport();
    window.addEventListener('resize', checkViewport);
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
