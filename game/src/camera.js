// camera.js — sweeping CCTV cameras.
// One job: sweep the cone, and raise the alarm when the thief lingers in it.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.createCamera = function (c) {
    return {
      x: c.x, y: c.y, baseAngle: c.angle, sweep: c.sweep, speed: c.speed,
      angle: c.angle, t: Math.random() * 6,
      seeT: 0, // seconds the thief has been in the cone
      cooldown: 0, disabledT: 0, pinged: false,
    };
  };

  H.updateCamera = function (cam, p, S, dt) {
    cam.t += dt;
    if (cam.disabledT > 0) { cam.disabledT -= dt; cam.seeT = 0; return; }
    cam.angle = cam.baseAngle + Math.sin(cam.t * cam.speed) * cam.sweep;
    if (cam.cooldown > 0) cam.cooldown -= dt;
    var seen = !p.hidden && H.inCone(cam.x, cam.y, cam.angle, T.camRange, T.camHalfAngle, p.x, p.y, S.level.solids);
    if (seen) {
      cam.seeT += dt;
      if (cam.seeT >= T.camTriggerTime && cam.cooldown <= 0) {
        cam.cooldown = 3;
        cam.seeT = 0;
        H.alarmAdd(S, T.alarmCamHit, 'CAMERA SPOTTED YOU');
        H.guardsInvestigate(S, p.x, p.y);
        S.events.push({ kind: 'camera', x: cam.x, y: cam.y, t: S.now });
        H.audioBlip(880, 0.12, 'square', 0.12);
        H.audioBlip(660, 0.12, 'square', 0.12);
      }
    } else {
      cam.seeT = Math.max(0, cam.seeT - dt * 2);
    }
  };
})(window.HEIST);
