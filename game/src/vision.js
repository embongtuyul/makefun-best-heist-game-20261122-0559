// vision.js — line of sight and vision-cone math.
// One job: answer "can this watcher see that point?" and clip cones to walls.
(function (H) {
  'use strict';

  // True when segment (x1,y1)-(x2,y2) hits rectangle r.
  function segHitsRect(x1, y1, x2, y2, r) {
    var dx = x2 - x1, dy = y2 - y1;
    var tmin = 0, tmax = 1;
    var p, q, t;
    // X slab
    if (Math.abs(dx) < 1e-9) { if (x1 < r.x || x1 > r.x + r.w) return false; }
    else {
      p = -dx; q = x1 - r.x;
      t = q / p; if (p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else { if (t < tmin) return false; if (t < tmax) tmax = t; }
      p = dx; q = r.x + r.w - x1;
      t = q / p; if (p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else { if (t < tmin) return false; if (t < tmax) tmax = t; }
    }
    // Y slab
    if (Math.abs(dy) < 1e-9) { if (y1 < r.y || y1 > r.y + r.h) return false; }
    else {
      p = -dy; q = y1 - r.y;
      t = q / p; if (p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else { if (t < tmin) return false; if (t < tmax) tmax = t; }
      p = dy; q = r.y + r.h - y1;
      t = q / p; if (p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else { if (t < tmin) return false; if (t < tmax) tmax = t; }
    }
    return tmin <= tmax;
  }

  // Distance along ray (ox,oy)+t*(dx,dy) to the first rectangle hit, or Infinity.
  function rayHit(ox, oy, dx, dy, rects) {
    var best = Infinity;
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      var tmin = 0, tmax = Infinity, ok = true, t, p, q;
      if (Math.abs(dx) < 1e-9) { if (ox < r.x || ox > r.x + r.w) continue; }
      else {
        p = -dx; q = ox - r.x; t = q / p;
        if (p < 0) { if (t > tmax) { ok = false; } else if (t > tmin) tmin = t; }
        else { if (t < tmin) { ok = false; } else if (t < tmax) tmax = t; }
        if (!ok) continue;
        p = dx; q = r.x + r.w - ox; t = q / p;
        if (p < 0) { if (t > tmax) { ok = false; } else if (t > tmin) tmin = t; }
        else { if (t < tmin) { ok = false; } else if (t < tmax) tmax = t; }
        if (!ok) continue;
      }
      if (Math.abs(dy) < 1e-9) { if (oy < r.y || oy > r.y + r.h) continue; }
      else {
        p = -dy; q = oy - r.y; t = q / p;
        if (p < 0) { if (t > tmax) { ok = false; } else if (t > tmin) tmin = t; }
        else { if (t < tmin) { ok = false; } else if (t < tmax) tmax = t; }
        if (!ok) continue;
        p = dy; q = r.y + r.h - oy; t = q / p;
        if (p < 0) { if (t > tmax) { ok = false; } else if (t > tmin) tmin = t; }
        else { if (t < tmin) { ok = false; } else if (t < tmax) tmax = t; }
        if (!ok) continue;
      }
      if (tmin < best) best = tmin;
    }
    return best;
  }

  // Line of sight: true when nothing solid stands between the two points.
  H.losClear = function (x1, y1, x2, y2, solids) {
    for (var i = 0; i < solids.length; i++) {
      if (segHitsRect(x1, y1, x2, y2, solids[i])) return false;
    }
    return true;
  };

  // Is point (px,py) inside the watcher's cone (range + half-angle + LOS)?
  H.inCone = function (wx, wy, wAngle, range, halfAngle, px, py, solids) {
    var dx = px - wx, dy = py - wy;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d > range) return false;
    if (d < 1e-6) return true;
    var ang = Math.atan2(dy, dx);
    if (Math.abs(H.angDiff(ang, wAngle)) > halfAngle) return false;
    return H.losClear(wx, wy, px, py, solids);
  };

  // Vision cone clipped by walls: polygon of ray endpoints across the cone.
  H.conePolygon = function (wx, wy, wAngle, range, halfAngle, solids, rays) {
    rays = rays || 26;
    var pts = [{ x: wx, y: wy }];
    for (var i = 0; i <= rays; i++) {
      var a = wAngle - halfAngle + (2 * halfAngle * i) / rays;
      var dx = Math.cos(a), dy = Math.sin(a);
      var t = rayHit(wx, wy, dx, dy, solids);
      if (!isFinite(t) || t > range) t = range;
      pts.push({ x: wx + dx * t, y: wy + dy * t });
    }
    return pts;
  };

  // Circle (px,py,r) vs rectangle collision resolve: push the circle out.
  H.resolveCircleRect = function (p, r, rect) {
    var cx = H.clamp(p.x, rect.x, rect.x + rect.w);
    var cy = H.clamp(p.y, rect.y, rect.y + rect.h);
    var dx = p.x - cx, dy = p.y - cy;
    var d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return false;
    if (d2 < 1e-9) {
      // Centre inside the rect: push out along the smallest penetration axis.
      var left = p.x - rect.x, right = rect.x + rect.w - p.x;
      var top = p.y - rect.y, bottom = rect.y + rect.h - p.y;
      var m = Math.min(left, right, top, bottom);
      if (m === left) p.x = rect.x - r;
      else if (m === right) p.x = rect.x + rect.w + r;
      else if (m === top) p.y = rect.y - r;
      else p.y = rect.y + rect.h + r;
      return true;
    }
    var d = Math.sqrt(d2);
    p.x = cx + (dx / d) * r;
    p.y = cy + (dy / d) * r;
    return true;
  };
})(window.HEIST);
