// render.js — every pixel of the museum at night.
// One job: draw the room so cover, danger and loot read at a glance.
(function (H) {
  'use strict';
  var C = H.COLOURS;

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
  }

  function drawFloor(ctx, S) {
    ctx.fillStyle = C.floorA;
    ctx.fillRect(0, 0, H.VIEW_W, H.VIEW_H);
    // Marble checker, low contrast so the play reads first.
    var ts = 80;
    for (var y = 0; y < H.VIEW_H; y += ts) {
      for (var x = 0; x < H.VIEW_W; x += ts) {
        if (((x / ts) + (y / ts)) % 2 === 0) {
          ctx.fillStyle = C.floorB;
          ctx.fillRect(x, y, ts, ts);
        }
      }
    }
    // Gold carpet runner down the middle of each gallery.
    ctx.fillStyle = C.carpet;
    ctx.fillRect(H.VIEW_W / 2 - 70, H.WALL_T, 140, H.VIEW_H - 2 * H.WALL_T);
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(H.VIEW_W / 2 - 70, H.WALL_T, 140, H.VIEW_H - 2 * H.WALL_T);
    // Lamp pools of warm light.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var lamps = S.level.def.lamps;
    for (var i = 0; i < lamps.length; i++) {
      var g = ctx.createRadialGradient(lamps[i].x, lamps[i].y, 8, lamps[i].x, lamps[i].y, lamps[i].r);
      g.addColorStop(0, 'rgba(255,196,90,0.10)');
      g.addColorStop(1, 'rgba(255,196,90,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(lamps[i].x, lamps[i].y, lamps[i].r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawExit(ctx, S) {
    var e = S.level.exit;
    var open = S.mainTaken;
    var locked = !open;
    ctx.save();
    ctx.fillStyle = locked ? 'rgba(255,93,93,0.16)' : 'rgba(57,217,138,0.22)';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = locked ? C.exitLocked : C.exit;
    ctx.lineWidth = 2;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = locked ? '#ff9a9a' : '#9dffc9';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    var label = locked ? '🔒 ' + e.label : 'EXIT — ' + e.label;
    var ly = e.y + e.h + 18;
    var lw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(3,5,12,0.8)';
    ctx.fillRect(e.x + e.w / 2 - lw / 2 - 6, ly - 14, lw + 12, 19);
    ctx.fillStyle = locked ? '#ff9a9a' : '#9dffc9';
    ctx.fillText(label, e.x + e.w / 2, ly);
    ctx.restore();
  }

  function drawLoot(ctx, S) {
    var t = S.now;
    for (var i = 0; i < S.level.loot.length; i++) {
      var l = S.level.loot[i];
      if (l.taken) continue;
      var pulse = 0.55 + 0.35 * Math.sin(t * 3 + i);
      ctx.save();
      var g = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.kind === 'main' || l.kind === 'vault' ? 46 : 26);
      g.addColorStop(0, 'rgba(255,215,106,' + (0.55 * pulse + 0.25) + ')');
      g.addColorStop(1, 'rgba(255,215,106,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.kind === 'main' || l.kind === 'vault' ? 46 : 26, 0, Math.PI * 2); ctx.fill();
      // Gem: a rotated square with a bright core.
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.PI / 4);
      var s = l.kind === 'main' || l.kind === 'vault' ? 11 : 7;
      ctx.fillStyle = C.loot;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = '#fff6cf';
      ctx.fillRect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
      ctx.restore();
      if (l.kind === 'main' || l.kind === 'vault') {
        // Name plate above the jewel, on a dark pill so it reads over anything.
        ctx.save();
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        var tw = ctx.measureText(l.name).width;
        var ty = l.y - 26;
        ctx.fillStyle = 'rgba(3,5,12,0.85)';
        ctx.fillRect(l.x - tw / 2 - 6, ty - 13, tw + 12, 18);
        ctx.fillStyle = '#ffe9a8';
        ctx.fillText(l.name, l.x, ty);
        ctx.restore();
      }
    }
  }

  function drawLasers(ctx, S) {
    for (var i = 0; i < S.level.lasers.length; i++) {
      var lz = S.level.lasers[i];
      var live = H.laserLive(lz);
      var alpha = lz.disabledT > 0 ? 0.12 : live ? (lz.tripped ? 1 : 0.85) : 0.18;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,45,85,' + alpha + ')';
      ctx.lineWidth = live ? 3 : 1.5;
      ctx.setLineDash(live ? [] : [6, 8]);
      ctx.beginPath(); ctx.moveTo(lz.x1, lz.y1); ctx.lineTo(lz.x2, lz.y2); ctx.stroke();
      ctx.setLineDash([]);
      // Emitter boxes at both ends.
      ctx.fillStyle = '#3a1020';
      ctx.strokeStyle = '#ff2d55';
      ctx.lineWidth = 1.5;
      ctx.fillRect(lz.x1 - 5, lz.y1 - 5, 10, 10); ctx.strokeRect(lz.x1 - 5, lz.y1 - 5, 10, 10);
      ctx.fillRect(lz.x2 - 5, lz.y2 - 5, 10, 10); ctx.strokeRect(lz.x2 - 5, lz.y2 - 5, 10, 10);
      if (!live && lz.disabledT <= 0) {
        ctx.fillStyle = 'rgba(255,215,106,0.9)';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        var mx = (lz.x1 + lz.x2) / 2, my = (lz.y1 + lz.y2) / 2;
        ctx.fillText('OFF — GO!', mx, my - 10);
      }
      ctx.restore();
    }
  }

  function drawCover(ctx, S) {
    for (var i = 0; i < S.level.def.cover.length; i++) {
      var c = S.level.def.cover[i];
      ctx.save();
      if (c.kind === 'case' || c.kind === 'vault') {
        ctx.fillStyle = '#0e1a33';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = C.caseGlass;
        ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
        ctx.strokeStyle = C.caseFrame;
        ctx.lineWidth = c.kind === 'vault' ? 3 : 2;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        if (c.kind === 'vault') {
          ctx.fillStyle = '#ffd76a';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('VAULT', c.x + c.w / 2, c.y + c.h + 14);
        }
      } else if (c.kind === 'crate') {
        ctx.fillStyle = C.crate;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = C.crateEdge;
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + c.w, c.y + c.h);
        ctx.moveTo(c.x + c.w, c.y); ctx.lineTo(c.x, c.y + c.h);
        ctx.stroke();
      } else if (c.kind === 'plant') {
        ctx.fillStyle = C.plant;
        ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2f7a44';
        ctx.beginPath(); ctx.arc(c.x + c.w / 2 - 6, c.y + c.h / 2 - 6, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawWalls(ctx, S) {
    for (var i = 0; i < S.level.solids.length; i++) {
      var r = S.level.solids[i];
      var isCover = S.level.def.cover.indexOf(r) >= 0;
      if (isCover) continue; // cover draws itself
      ctx.save();
      ctx.fillStyle = C.wall;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = C.wallEdge;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.65;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      ctx.restore();
    }
  }

  function drawCones(ctx, S) {
    // Guard cones first (under the guards), then camera cones.
    for (var i = 0; i < S.level.guards.length; i++) {
      var g = S.level.guards[i];
      var alert = g.state === 'chase';
      var pts = H.conePolygon(g.x, g.y, g.angle, H.TUNING.guardRange, H.TUNING.guardHalfAngle, S.level.solids, 22);
      ctx.save();
      poly(ctx, pts);
      ctx.fillStyle = alert ? C.coneAlert : C.coneCalm;
      ctx.fill();
      ctx.strokeStyle = alert ? C.coneEdgeAlert : C.coneEdgeCalm;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    for (var j = 0; j < S.level.cameras.length; j++) {
      var cam = S.level.cameras[j];
      if (cam.disabledT > 0) continue;
      var cpts = H.conePolygon(cam.x, cam.y, cam.angle, H.TUNING.camRange, H.TUNING.camHalfAngle, S.level.solids, 20);
      ctx.save();
      poly(ctx, cpts);
      ctx.fillStyle = cam.seeT > 0 ? 'rgba(255,60,110,0.30)' : C.coneCam;
      ctx.fill();
      ctx.strokeStyle = C.coneCamEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawSmoke(ctx, S) {
    for (var i = 0; i < S.smokes.length; i++) {
      var sm = S.smokes[i];
      ctx.save();
      var g = ctx.createRadialGradient(sm.x, sm.y, 4, sm.x, sm.y, sm.r);
      g.addColorStop(0, 'rgba(200,205,220,0.55)');
      g.addColorStop(1, 'rgba(200,205,220,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawGuards(ctx, S) {
    for (var i = 0; i < S.level.guards.length; i++) {
      var g = S.level.guards[i];
      ctx.save();
      // Body: navy uniform, cap, facing tick.
      ctx.fillStyle = C.guard;
      ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#9db6e8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = C.guardCap;
      ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#dfe8ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(g.x + Math.cos(g.angle) * 10, g.y + Math.sin(g.angle) * 10);
      ctx.lineTo(g.x + Math.cos(g.angle) * 17, g.y + Math.sin(g.angle) * 17);
      ctx.stroke();
      // Suspicion arc + mark.
      if (g.state === 'chase') {
        ctx.fillStyle = '#ff5d5d';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', g.x, g.y - 22);
      } else if (g.suspicion > 0.25 || g.state === 'investigate') {
        ctx.fillStyle = '#ffd76a';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', g.x, g.y - 22);
        ctx.strokeStyle = '#ffd76a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(g.x, g.y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.suspicion);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawCameras(ctx, S) {
    for (var i = 0; i < S.level.cameras.length; i++) {
      var cam = S.level.cameras[i];
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.rotate(cam.angle);
      ctx.fillStyle = cam.disabledT > 0 ? '#3a3f52' : '#20263f';
      ctx.fillRect(-4, -6, 14, 12);
      ctx.strokeStyle = cam.disabledT > 0 ? '#555' : (cam.seeT > 0 ? '#ff3c6e' : '#ff5d7e');
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-4, -6, 14, 12);
      ctx.fillStyle = cam.disabledT > 0 ? '#333' : '#ff2d55';
      ctx.beginPath(); ctx.arc(11, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawPlayer(ctx, S) {
    var p = S.player;
    ctx.save();
    // Soft shadow under the thief.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (p.stance === 'sneak') {
      ctx.strokeStyle = C.playerRing;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    // Hooded figure: dark cloak, pale face, gold clasp.
    ctx.fillStyle = '#232838';
    ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.playerRing;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = C.player;
    ctx.beginPath(); ctx.arc(p.x + Math.cos(p.angle) * 4, p.y + Math.sin(p.angle) * 4, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.loot;
    ctx.beginPath(); ctx.arc(p.x - Math.cos(p.angle) * 9, p.y - Math.sin(p.angle) * 9, 2, 0, Math.PI * 2); ctx.fill();
    if (p.stance === 'sprint') {
      ctx.strokeStyle = 'rgba(232,228,216,0.5)';
      ctx.lineWidth = 2;
      for (var i = 0; i < 3; i++) {
        var off = (i - 1) * 7;
        var px = -Math.cos(p.angle), py = -Math.sin(p.angle);
        ctx.beginPath();
        ctx.moveTo(p.x + px * 14 - py * off, p.y + py * 14 + px * off);
        ctx.lineTo(p.x + px * 24 - py * off, p.y + py * 24 + px * off);
        ctx.stroke();
      }
    }
    // Grab / lockpick progress ring.
    if (p.grabTarget) {
      var frac = p.grabT / p.grabNeed;
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNoise(ctx, S) {
    if (S.player.noise > 0 && S.player.moving) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(S.player.noiseX, S.player.noiseY, S.player.noise, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    for (var i = 0; i < S.noises.length; i++) {
      var n = S.noises[i];
      ctx.save();
      ctx.strokeStyle = n.kind === 'decoy' ? 'rgba(255,215,106,0.8)' : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (0.4 + 0.6 * (n.t / 0.9)), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawFloaters(ctx, S) {
    for (var i = 0; i < S.floaters.length; i++) {
      var f = S.floaters[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
      ctx.fillStyle = f.color || '#ffe9a8';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y - f.t * 34);
      ctx.restore();
    }
  }

  function drawVignette(ctx, S) {
    var g = ctx.createRadialGradient(640, 360, 300, 640, 360, 760);
    g.addColorStop(0, 'rgba(2,4,12,0)');
    g.addColorStop(1, 'rgba(2,4,12,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, H.VIEW_W, H.VIEW_H);
    // Red pulse while the alarm flashes.
    if (S.alarm.flash > 0.15 || S.alarm.lockdownT > 0) {
      ctx.fillStyle = 'rgba(255,30,60,' + (0.10 * S.alarm.flash + (S.alarm.lockdownT > 0 ? 0.08 : 0)) + ')';
      ctx.fillRect(0, 0, H.VIEW_W, H.VIEW_H);
    }
  }

  H.render = function (ctx, S) {
    drawFloor(ctx, S);
    drawExit(ctx, S);
    drawCones(ctx, S);
    drawLasers(ctx, S);
    drawWalls(ctx, S);
    drawCover(ctx, S);
    drawLoot(ctx, S); // jewels sit on top of their display cases
    drawSmoke(ctx, S);
    drawGuards(ctx, S);
    drawCameras(ctx, S);
    drawPlayer(ctx, S);
    drawNoise(ctx, S);
    drawFloaters(ctx, S);
    drawVignette(ctx, S);
  };
})(window.HEIST);
