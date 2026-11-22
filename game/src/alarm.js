// alarm.js — the alarm meter and lockdown.
// One job: the one number every mistake feeds, and what happens at 100.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.alarmAdd = function (S, amount, label) {
    if (S.alarm.lockdownT > 0) return; // lockdown already running: no double feed
    S.alarm.value = H.clamp(S.alarm.value + amount, 0, 100);
    S.alarm.flash = 1;
    S.alarm.lastLabel = label || '';
    S.alarm.lastLabelT = S.now;
    if (amount >= 14) S.alarmsTripped++; // camera / laser trips count as alarms
    if (S.alarm.value >= T.alarmLockdownAt) H.alarmLockdown(S);
  };

  H.alarmLockdown = function (S) {
    S.alarm.lockdownT = T.lockdownSeconds;
    S.alarm.value = 100;
    S.events.push({ kind: 'lockdown', x: S.player.x, y: S.player.y, t: S.now });
    H.audioBlip(180, 0.5, 'sawtooth', 0.2);
    H.audioBlip(140, 0.5, 'sawtooth', 0.2);
    // Every guard converges on the thief.
    for (var i = 0; i < S.level.guards.length; i++) {
      var g = S.level.guards[i];
      g.state = 'chase'; g.chaseLoseT = 0;
      g.lastSeenX = S.player.x; g.lastSeenY = S.player.y;
      g.suspicion = 1;
    }
  };

  H.updateAlarm = function (S, dt) {
    var a = S.alarm;
    if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 2);
    if (a.lockdownT > 0) {
      a.lockdownT -= dt;
      if (a.lockdownT <= 0) { a.value = 60; a.lockdownT = 0; }
      return;
    }
    // Quiet thief, quiet museum: the meter bleeds off slowly.
    var anySeeing = false;
    for (var i = 0; i < S.level.guards.length; i++) {
      if (S.level.guards[i].suspicion > 0.05) { anySeeing = true; break; }
    }
    if (!anySeeing) a.value = Math.max(0, a.value - T.alarmDecay * dt);
  };
})(window.HEIST);
