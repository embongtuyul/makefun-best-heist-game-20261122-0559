// player.js — the thief: movement, stance, noise, tools, grabbing loot.
// One job: turn input into a position, a stance and a noise ring.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.createPlayer = function (start) {
    return {
      x: start.x, y: start.y, px: start.x, py: start.y,
      angle: 0, moving: false, stance: 'walk', // walk | sneak | sprint
      noise: 0, noiseX: start.x, noiseY: start.y,
      tools: { emp: H.TOOLS_START.emp, smoke: H.TOOLS_START.smoke, decoy: H.TOOLS_START.decoy },
      grabTarget: null, grabT: 0, grabNeed: 0,
      inDark: false, hidden: false,
    };
  };

  // Is the player standing inside any lamp's light?
  H.playerInLight = function (p, lamps) {
    for (var i = 0; i < lamps.length; i++) {
      if (H.dist(p.x, p.y, lamps[i].x, lamps[i].y) < lamps[i].r) return true;
    }
    return false;
  };

  H.updatePlayer = function (p, input, solids, dt, S) {
    var ix = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    var iy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    var mag = Math.sqrt(ix * ix + iy * iy);
    p.px = p.x; p.py = p.y;
    p.moving = mag > 0;
    p.stance = input.sprint ? 'sprint' : (input.sneak ? 'sneak' : 'walk');
    var speed = p.stance === 'sprint' ? T.sprintSpeed : p.stance === 'sneak' ? T.sneakSpeed : T.walkSpeed;
    if (p.grabTarget) speed = 0; // grabbing holds the thief still
    if (mag > 0) {
      var nx = p.x + (ix / mag) * speed * dt;
      var ny = p.y + (iy / mag) * speed * dt;
      p.angle = Math.atan2(iy, ix);
      // Move one axis at a time so walls slide instead of sticking.
      p.x = nx;
      for (var i = 0; i < solids.length; i++) H.resolveCircleRect(p, T.playerRadius, solids[i]);
      p.y = ny;
      for (var j = 0; j < solids.length; j++) H.resolveCircleRect(p, T.playerRadius, solids[j]);
    }
    p.x = H.clamp(p.x, H.WALL_T + T.playerRadius, H.VIEW_W - H.WALL_T - T.playerRadius);
    p.y = H.clamp(p.y, H.WALL_T + T.playerRadius, H.VIEW_H - H.WALL_T - T.playerRadius);

    // Noise: sprinting rings out, walking whispers, sneaking is silent.
    var want = p.moving ? (p.stance === 'sprint' ? T.noiseSprint : p.stance === 'walk' ? T.noiseWalk : 0) : 0;
    p.noise = want;
    if (want > 0) { p.noiseX = p.x; p.noiseY = p.y; }

    // Darkness: inside a lamp's circle the thief is lit and easier to spot.
    p.inDark = !H.playerInLight(p, S.level.def.lamps);
    // Hidden inside a smoke cloud.
    p.hidden = false;
    for (var s = 0; s < S.smokes.length; s++) {
      var sm = S.smokes[s];
      if (H.dist(p.x, p.y, sm.x, sm.y) < sm.r) { p.hidden = true; break; }
    }
  };

  // Nearest loot within grab reach (56px). Returns the loot or null.
  H.nearestLoot = function (p, loot) {
    var best = null, bd = 56;
    for (var i = 0; i < loot.length; i++) {
      if (loot[i].taken) continue;
      var d = H.dist(p.x, p.y, loot[i].x, loot[i].y);
      if (d < bd) { bd = d; best = loot[i]; }
    }
    return best;
  };

  // Toss a decoy coin toward the mouse: it lands ~190px out and rings.
  H.tossDecoy = function (p, mouse, S) {
    var dx = mouse.x - p.x, dy = mouse.y - p.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var lx = p.x + (dx / d) * Math.min(190, d);
    var ly = p.y + (dy / d) * Math.min(190, d);
    lx = H.clamp(lx, H.WALL_T + 12, H.VIEW_W - H.WALL_T - 12);
    ly = H.clamp(ly, H.WALL_T + 12, H.VIEW_H - H.WALL_T - 12);
    S.noises.push({ x: lx, y: ly, r: T.noiseDecoy, t: 0.9, kind: 'decoy' });
    H.audioBlip(1250, 0.07, 'square', 0.10);
    return { x: lx, y: ly };
  };
})(window.HEIST);
