// guard.js — patrolling guards: patrol, suspicion, investigate, chase, catch.
// One job: a guard's brain — what it sees and what it does about it.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.createGuard = function (g) {
    return {
      x: g.x, y: g.y, path: g.path, speed: g.speed, pause: g.pause || 1.2,
      wp: 1, waitT: 0, angle: 0, scanT: 0,
      state: 'patrol', // patrol | investigate | chase
      suspicion: 0, // 0..1 — fills while the thief is in the cone
      lastSeenX: 0, lastSeenY: 0, lastSeenT: 0,
      chaseLoseT: 0, invX: 0, invY: 0, lookT: 0,
      spotted: false,
    };
  };

  function seesPlayer(g, p, solids) {
    if (p.hidden) return 0;
    var d = H.dist(g.x, g.y, p.x, p.y);
    if (d > T.guardRange) return 0;
    if (!H.inCone(g.x, g.y, g.angle, T.guardRange, T.guardHalfAngle, p.x, p.y, solids)) return 0;
    // Closer + lit + sprinting = spotted faster; far + dark + sneaking = slow.
    var rate = 1.6 - (d / T.guardRange) * 0.9;
    if (p.inDark) rate *= T.darkFactor;
    if (p.stance === 'sneak') rate *= T.sneakSpotFactor;
    if (p.stance === 'sprint') rate *= T.sprintSpotFactor;
    return rate;
  }

  // Move a guard, sliding along walls instead of walking through them.
  function moveGuard(g, angle, speed, dt, solids) {
    g.x += Math.cos(angle) * speed * dt;
    g.y += Math.sin(angle) * speed * dt;
    for (var i = 0; i < solids.length; i++) H.resolveCircleRect(g, 13, solids[i]);
  }

  // One patrol step: walk to the next waypoint, scan while pausing there.
  // The scan oscillates around the facing the guard arrived with.
  H.patrolStep = function (g, dt, solids) {
    var tx = g.path[g.wp][0], ty = g.path[g.wp][1];
    var d = H.dist(g.x, g.y, tx, ty);
    if (d < 6) {
      if (g.waitT === 0) g.scanBase = g.angle;
      g.waitT += dt;
      g.scanT += dt;
      g.angle = g.scanBase + Math.sin(g.scanT * 1.4) * 0.5;
      if (g.waitT >= g.pause) {
        g.waitT = 0; g.scanT = 0;
        g.wp = (g.wp + 1) % g.path.length;
      }
    } else {
      var a = Math.atan2(ty - g.y, tx - g.x);
      g.angle = a;
      moveGuard(g, a, g.speed, dt, solids);
    }
  };

  H.updateGuard = function (g, p, S, dt) {
    var solids = S.level.solids;
    var seen = seesPlayer(g, p, solids);
    if (seen > 0) {
      g.suspicion = H.clamp(g.suspicion + seen * dt, 0, 1);
      g.lastSeenX = p.x; g.lastSeenY = p.y; g.lastSeenT = S.now;
      if (g.suspicion >= 1 && g.state !== 'chase') {
        g.state = 'chase'; g.chaseLoseT = 0;
        S.spots++;
        S.events.push({ kind: 'spotted', x: p.x, y: p.y, t: S.now });
        H.alarmAdd(S, 8, 'SPOTTED!');
        H.audioBlip(220, 0.25, 'sawtooth', 0.16);
      }
    } else {
      g.suspicion = H.clamp(g.suspicion - dt * 0.45, 0, 1);
    }

    if (g.state === 'patrol') {
      H.patrolStep(g, dt, solids);
    } else if (g.state === 'investigate') {
      var dx = g.invX - g.x, dy = g.invY - g.y;
      var dd = Math.sqrt(dx * dx + dy * dy);
      if (dd < 10) {
        g.lookT += dt;
        g.angle += dt * 1.6; // look around
        if (g.lookT > 2.2) { g.state = 'patrol'; g.lookT = 0; }
      } else {
        var ia = Math.atan2(dy, dx);
        g.angle = ia;
        moveGuard(g, ia, T.guardInvestigateSpeed, dt, solids);
      }
    } else if (g.state === 'chase') {
      if (seen > 0) {
        g.chaseLoseT = 0;
        var ca = Math.atan2(p.y - g.y, p.x - g.x);
        g.angle = ca;
        moveGuard(g, ca, T.guardChaseSpeed, dt, solids);
      } else {
        g.chaseLoseT += dt;
        var la = Math.atan2(g.lastSeenY - g.y, g.lastSeenX - g.x);
        g.angle = la;
        moveGuard(g, la, T.guardChaseSpeed, dt, solids);
        if (g.chaseLoseT > 2.5) {
          g.state = 'investigate';
          g.invX = g.lastSeenX; g.invY = g.lastSeenY; g.lookT = 0;
        }
      }
      // Caught: the guard lays a hand on the thief.
      if (H.dist(g.x, g.y, p.x, p.y) < T.guardCatchDist) {
        H.gameCaught(S, 'A guard caught you in the ' + S.level.def.name + '.');
      }
    }

    // Hears noise: a sprint or a decoy coin pulls the guard over.
    if (g.state === 'patrol' || g.state === 'investigate') {
      for (var i = 0; i < S.noises.length; i++) {
        var n = S.noises[i];
        if (H.dist(g.x, g.y, n.x, n.y) < n.r) {
          if (g.state !== 'investigate' || H.dist(g.invX, g.invY, n.x, n.y) > 30) {
            g.state = 'investigate'; g.invX = n.x; g.invY = n.y; g.lookT = 0;
          }
        }
      }
    }
  };

  // Send every guard to investigate a point (camera ping, laser trip).
  H.guardsInvestigate = function (S, x, y) {
    for (var i = 0; i < S.level.guards.length; i++) {
      var g = S.level.guards[i];
      if (g.state === 'chase') continue;
      g.state = 'investigate'; g.invX = x; g.invY = y; g.lookT = 0;
      g.suspicion = Math.max(g.suspicion, 0.55);
    }
  };
})(window.HEIST);
