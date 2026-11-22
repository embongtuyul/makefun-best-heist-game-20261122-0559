// hud.js — the DOM heads-up display and screen overlays.
// One job: mirror the game state into readable HTML, never the canvas.
(function (H) {
  'use strict';

  function el(id) { return document.getElementById(id); }

  function alarmColour(v) {
    if (v >= 70) return '#ff3b57';
    if (v >= 40) return '#ffb02e';
    return '#39d98a';
  }

  H.updateHud = function (S) {
    var a = S.alarm;
    var fill = el('hud-alarm-fill');
    if (fill) {
      fill.style.width = Math.round(a.value) + '%';
      fill.style.background = alarmColour(a.value);
    }
    var alabel = el('hud-alarm-label');
    if (alabel) {
      alabel.textContent = a.lockdownT > 0
        ? 'LOCKDOWN ' + Math.ceil(a.lockdownT) + 's — HIDE!'
        : 'ALARM ' + Math.round(a.value) + '%';
      alabel.style.color = alarmColour(a.value);
    }
    var loot = el('hud-loot');
    if (loot) loot.textContent = H.fmtMoney(S.totalLoot);
    var timer = el('hud-timer');
    if (timer) timer.textContent = H.fmtTime(S.level.time);
    var tools = el('hud-tools');
    if (tools) {
      tools.textContent = 'EMP ×' + S.player.tools.emp + ' [1]   SMOKE ×' + S.player.tools.smoke +
        ' [2]   DECOY ×' + S.player.tools.decoy + ' [3]';
    }
    var obj = el('hud-objective');
    if (obj) {
      obj.textContent = S.mainTaken
        ? '★ Star secured — reach the ' + S.level.exit.label + '!'
        : 'Steal the ' + S.mainName + ' — stay out of the cones.';
    }
    var lvl = el('hud-level');
    if (lvl) lvl.textContent = S.level.def.name;
    var stance = el('hud-stance');
    if (stance) {
      var p = S.player;
      stance.textContent = p.stance === 'sneak' ? 'SNEAKING — silent, hard to spot'
        : p.stance === 'sprint' ? 'SPRINTING — fast and LOUD'
        : 'WALKING';
      stance.style.color = p.stance === 'sprint' ? '#ff9a9a' : p.stance === 'sneak' ? '#9dffc9' : '#cfd6ea';
    }
    var prompt = el('hud-prompt');
    if (prompt) {
      var near = H.nearestLoot(S.player, S.level.loot);
      if (S.player.grabTarget) {
        prompt.textContent = S.player.grabTarget.kind === 'vault' ? 'LOCKPICKING… hold still!' : 'GRABBING… hold still!';
      } else if (near) {
        prompt.textContent = 'E — GRAB ' + near.name + ' (' + H.fmtMoney(near.value) + ')';
      } else if (S.mainTaken && S.playerInExit) {
        prompt.textContent = 'ESCAPE!';
      } else {
        prompt.textContent = 'WASD move · Shift sprint · C sneak · E grab · 1 EMP · 2 smoke · 3 decoy';
      }
    }
    // Latest alarm event, fading.
    var ev = el('hud-event');
    if (ev) {
      if (a.lastLabel && S.now - a.lastLabelT < 2.5) {
        ev.textContent = '⚠ ' + a.lastLabel;
        ev.style.opacity = '1';
      } else {
        ev.style.opacity = '0';
      }
    }
  };

  H.showOverlay = function (name) {
    var ids = ['ov-menu', 'ov-pause', 'ov-caught', 'ov-clear', 'ov-win'];
    for (var i = 0; i < ids.length; i++) {
      var d = el(ids[i]);
      if (d) d.style.display = ids[i] === name ? 'flex' : 'none';
    }
  };

  H.fillCaught = function (reason, S) {
    var r = el('caught-reason'); if (r) r.textContent = reason;
    var s = el('caught-stats');
    if (s) s.textContent = 'Loot kept: ' + H.fmtMoney(S.totalLoot) + ' · Alarm peaked at ' +
      Math.round(S.alarmPeak) + '% · Spotted ' + S.spots + '×';
  };

  H.fillClear = function (bonus, S) {
    var b = el('clear-bonus'); if (b) b.textContent = 'Time bonus ' + H.fmtMoney(bonus);
    var l = el('clear-loot'); if (l) l.textContent = 'Loot so far: ' + H.fmtMoney(S.totalLoot);
    var t = el('clear-title');
    if (t) t.textContent = S.levelIndex >= 2 ? 'THE VAULT IS YOURS' : 'GALLERY CLEAR';
  };

  H.fillWin = function (S) {
    var rank = el('win-rank'); if (rank) rank.textContent = S.rank;
    var loot = el('win-loot'); if (loot) loot.textContent = H.fmtMoney(S.totalLoot);
    var stats = el('win-stats');
    if (stats) {
      stats.textContent = 'Time ' + H.fmtTime(S.totalTime) + ' · Spotted ' + S.spots +
        '× · Alarms tripped ' + S.alarmsTripped + ' · Ghost bonus ' +
        (S.spots === 0 ? H.fmtMoney(5000) : H.fmtMoney(0));
    }
  };
})(window.HEIST);
