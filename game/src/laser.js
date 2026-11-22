// laser.js — laser tripwires that blink on and off on a cycle.
// One job: know whether the beam is live, and whether the thief crossed it.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.createLaser = function (l) {
    return {
      x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2,
      period: l.period, on: l.on, phase: l.phase || 0,
      t: l.phase || 0, cooldown: 0, disabledT: 0, tripped: false,
    };
  };

  H.laserLive = function (lz) {
    if (lz.disabledT > 0) return false;
    return (lz.t % lz.period) < lz.on;
  };

  function segSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
    var d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
    if (Math.abs(d) < 1e-9) return false;
    var t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
    var u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  H.updateLaser = function (lz, p, S, dt) {
    lz.t += dt;
    if (lz.disabledT > 0) lz.disabledT -= dt;
    if (lz.cooldown > 0) lz.cooldown -= dt;
    if (!H.laserLive(lz) || lz.cooldown > 0) return;
    // The thief's step this frame crossed the beam.
    if (segSeg(p.px, p.py, p.x, p.y, lz.x1, lz.y1, lz.x2, lz.y2)) {
      lz.cooldown = 2;
      lz.tripped = true;
      var mx = (lz.x1 + lz.x2) / 2, my = (lz.y1 + lz.y2) / 2;
      H.alarmAdd(S, T.alarmLaserHit, 'LASER TRIPPED');
      H.guardsInvestigate(S, mx, my);
      S.events.push({ kind: 'laser', x: mx, y: my, t: S.now });
      H.audioBlip(1400, 0.18, 'sawtooth', 0.14);
    }
  };
})(window.HEIST);
