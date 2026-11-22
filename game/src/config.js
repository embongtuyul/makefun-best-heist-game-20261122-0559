// config.js — THE AURELIA JOB: tuning, colours, shared helpers.
// One job: every number and colour the rest of the game reads.
window.HEIST = window.HEIST || {};
(function (H) {
  'use strict';

  H.VIEW_W = 1280;
  H.VIEW_H = 720;
  H.WALL_T = 24; // outer wall thickness

  H.TUNING = {
    walkSpeed: 165,
    sneakSpeed: 96,
    sprintSpeed: 248,
    playerRadius: 11,
    guardRange: 195,
    guardHalfAngle: 0.62,
    guardPatrolSpeed: 58,
    guardChaseSpeed: 205,
    guardInvestigateSpeed: 132,
    guardCatchDist: 17,
    camRange: 235,
    camHalfAngle: 0.5,
    camTriggerTime: 0.7,
    alarmCamHit: 14,
    alarmLaserHit: 18,
    alarmDecay: 1.4,
    alarmLockdownAt: 100,
    lockdownSeconds: 10,
    grabSeconds: 0.7,
    vaultGrabSeconds: 2.6,
    empSeconds: 8,
    smokeSeconds: 6,
    noiseWalk: 42,
    noiseSprint: 135,
    noiseDecoy: 170,
    darkFactor: 0.55, // detection rate multiplier while the thief stands in darkness
    sprintSpotFactor: 1.6,
    sneakSpotFactor: 0.55,
  };

  H.TOOLS_START = { emp: 2, smoke: 2, decoy: 3 };

  H.COLOURS = {
    floorA: '#12172e',
    floorB: '#0e1327',
    carpet: '#3a2a12',
    wall: '#1c2547',
    wallEdge: '#c9a227',
    caseFrame: '#8a6d2f',
    caseGlass: 'rgba(150,190,255,0.10)',
    crate: '#5a3d22',
    crateEdge: '#7d5a34',
    plant: '#1e4d2e',
    player: '#e8e4d8',
    playerRing: '#ffd76a',
    guard: '#3d5a99',
    guardCap: '#22345e',
    coneCalm: 'rgba(255,210,90,0.20)',
    coneEdgeCalm: 'rgba(255,210,90,0.55)',
    coneAlert: 'rgba(255,64,64,0.30)',
    coneEdgeAlert: 'rgba(255,64,64,0.75)',
    coneCam: 'rgba(255,90,130,0.16)',
    coneCamEdge: 'rgba(255,90,130,0.5)',
    laser: '#ff2d55',
    loot: '#ffd76a',
    exit: '#39d98a',
    exitLocked: '#ff5d5d',
  };

  H.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  H.dist = function (x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); };
  H.angDiff = function (a, b) { var d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  H.lerp = function (a, b, t) { return a + (b - a) * t; };
  H.fmtMoney = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  H.fmtTime = function (s) { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  // Deterministic RNG (mulberry32) so screenshot poses and levels are stable.
  H.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
})(window.HEIST);
