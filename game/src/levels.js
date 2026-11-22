// levels.js — the three galleries of the Marlow Museum.
// One job: the geometry of every level (walls, cover, patrols, cameras,
// lasers, loot, exit). Solids block movement and line of sight.
(function (H) {
  'use strict';

  var W = H.VIEW_W, HT = H.VIEW_H, T = H.WALL_T;

  function outerWalls() {
    return [
      { x: 0, y: 0, w: W, h: T },
      { x: 0, y: HT - T, w: W, h: T },
      { x: 0, y: 0, w: T, h: HT },
      { x: W - T, y: 0, w: T, h: HT },
    ];
  }

  H.LEVELS = [
    {
      name: 'Gallery I — The Atrium',
      sub: 'Lift the Aurelia Star, then slip out the service door.',
      par: 150,
      playerStart: { x: 80, y: 640 },
      exit: { x: 1140, y: 70, w: 90, h: 44, label: 'SERVICE DOOR' },
      walls: [
        { x: 250, y: 150, w: 18, h: 200 },
        { x: 250, y: 430, w: 18, h: 120 },
        { x: 1010, y: 150, w: 18, h: 200 },
        { x: 1010, y: 430, w: 18, h: 120 },
        { x: 470, y: 330, w: 340, h: 18 },
      ],
      cover: [
        { x: 605, y: 275, w: 70, h: 50, kind: 'case' },   // Aurelia Star pedestal
        { x: 380, y: 200, w: 70, h: 44, kind: 'case' },
        { x: 830, y: 200, w: 70, h: 44, kind: 'case' },
        { x: 380, y: 480, w: 70, h: 44, kind: 'case' },
        { x: 830, y: 480, w: 70, h: 44, kind: 'case' },
        { x: 560, y: 520, w: 54, h: 54, kind: 'crate' },
        { x: 666, y: 520, w: 54, h: 54, kind: 'crate' },
        { x: 120, y: 120, w: 40, h: 40, kind: 'plant' },
        { x: 1120, y: 200, w: 40, h: 40, kind: 'plant' },
      ],
      guards: [
        { x: 320, y: 110, path: [[320, 110], [960, 110]], speed: 55, pause: 1.4 },
        { x: 960, y: 610, path: [[960, 610], [320, 610]], speed: 62, pause: 1.2 },
      ],
      cameras: [
        { x: 640, y: 66, angle: Math.PI / 2, sweep: 0.7, speed: 0.5 },
        { x: 1252, y: 360, angle: Math.PI, sweep: 0.6, speed: 0.65 },
      ],
      lasers: [
        { x1: 640, y1: 360, x2: 640, y2: 560, period: 4.0, on: 2.6, phase: 0 },
      ],
      loot: [
        { x: 640, y: 300, kind: 'main', value: 25000, name: 'AURELIA STAR' },
        { x: 200, y: 180, kind: 'side', value: 2000, name: 'Jade Vase' },
        { x: 1090, y: 520, kind: 'side', value: 3500, name: 'Gilded Portrait' },
        { x: 640, y: 630, kind: 'side', value: 1500, name: 'Ruby Brooch' },
      ],
      lamps: [
        { x: 320, y: 300, r: 170 }, { x: 960, y: 300, r: 170 }, { x: 640, y: 600, r: 150 },
      ],
    },
    {
      name: 'Gallery II — Hall of Kings',
      sub: 'Three guards, three eyes in the ceiling. Take the Sun Opal.',
      par: 170,
      playerStart: { x: 80, y: 640 },
      exit: { x: 50, y: 70, w: 90, h: 44, label: 'STAIRWELL' },
      walls: [
        { x: 400, y: 120, w: 18, h: 180 },
        { x: 400, y: 380, w: 18, h: 170 },
        { x: 860, y: 120, w: 18, h: 180 },
        { x: 860, y: 380, w: 18, h: 170 },
        { x: 520, y: 470, w: 240, h: 18 },
        { x: 520, y: 180, w: 240, h: 18 },
      ],
      cover: [
        { x: 600, y: 120, w: 80, h: 50, kind: 'case' },   // Sun Opal pedestal
        { x: 180, y: 220, w: 70, h: 44, kind: 'case' },
        { x: 1030, y: 220, w: 70, h: 44, kind: 'case' },
        { x: 180, y: 520, w: 70, h: 44, kind: 'case' },
        { x: 1030, y: 520, w: 70, h: 44, kind: 'case' },
        { x: 480, y: 560, w: 54, h: 54, kind: 'crate' },
        { x: 746, y: 560, w: 54, h: 54, kind: 'crate' },
        { x: 120, y: 640, w: 40, h: 40, kind: 'plant' },
        { x: 1160, y: 640, w: 40, h: 40, kind: 'plant' },
      ],
      guards: [
        { x: 300, y: 90, path: [[300, 90], [980, 90]], speed: 65, pause: 1.2 },
        { x: 980, y: 340, path: [[980, 340], [300, 340]], speed: 70, pause: 1.0 },
        { x: 300, y: 630, path: [[300, 630], [980, 630]], speed: 60, pause: 1.4 },
      ],
      cameras: [
        { x: 640, y: 66, angle: Math.PI / 2, sweep: 0.7, speed: 0.55 },
        { x: 1252, y: 200, angle: Math.PI, sweep: 0.6, speed: 0.7 },
        { x: 28, y: 500, angle: 0, sweep: 0.6, speed: 0.6 },
      ],
      lasers: [
        { x1: 640, y1: 200, x2: 640, y2: 460, period: 3.6, on: 2.4, phase: 0 },
        { x1: 300, y1: 380, x2: 300, y2: 660, period: 4.0, on: 2.6, phase: 2.0 },
      ],
      loot: [
        { x: 640, y: 145, kind: 'main', value: 30000, name: 'SUN OPAL' },
        { x: 180, y: 350, kind: 'side', value: 3000, name: 'Ivory Mask' },
        { x: 1100, y: 180, kind: 'side', value: 4500, name: 'Emerald Sceptre' },
        { x: 640, y: 620, kind: 'side', value: 2000, name: 'Silver Chalice' },
        { x: 1080, y: 560, kind: 'side', value: 3000, name: "King's Seal" },
      ],
      lamps: [
        { x: 320, y: 180, r: 160 }, { x: 960, y: 180, r: 160 },
        { x: 320, y: 560, r: 150 }, { x: 960, y: 560, r: 150 }, { x: 640, y: 360, r: 140 },
      ],
    },
    {
      name: 'Gallery III — The Vault',
      sub: 'Four guards, a laser ring and the Sun Opal behind glass. Pick it slow.',
      par: 200,
      playerStart: { x: 80, y: 80 },
      exit: { x: 1140, y: 600, w: 90, h: 44, label: 'ROOF EXIT' },
      walls: [
        { x: 470, y: 250, w: 340, h: 18 },
        { x: 470, y: 470, w: 340, h: 18 },
        { x: 470, y: 250, w: 18, h: 80 },
        { x: 470, y: 410, w: 18, h: 78 },
        { x: 792, y: 250, w: 18, h: 80 },
        { x: 792, y: 410, w: 18, h: 78 },
        { x: 250, y: 120, w: 18, h: 200 },
        { x: 250, y: 400, w: 18, h: 160 },
        { x: 1010, y: 120, w: 18, h: 200 },
        { x: 1010, y: 400, w: 18, h: 160 },
      ],
      cover: [
        { x: 590, y: 330, w: 100, h: 60, kind: 'vault' }, // Sun Opal vault case
        { x: 330, y: 200, w: 70, h: 44, kind: 'case' },
        { x: 880, y: 200, w: 70, h: 44, kind: 'case' },
        { x: 330, y: 520, w: 70, h: 44, kind: 'case' },
        { x: 880, y: 520, w: 70, h: 44, kind: 'case' },
        { x: 560, y: 120, w: 54, h: 54, kind: 'crate' },
        { x: 680, y: 120, w: 54, h: 54, kind: 'crate' },
        { x: 480, y: 600, w: 54, h: 54, kind: 'crate' },
        { x: 700, y: 600, w: 54, h: 54, kind: 'crate' },
        { x: 120, y: 360, w: 40, h: 40, kind: 'plant' },
        { x: 1160, y: 360, w: 40, h: 40, kind: 'plant' },
      ],
      guards: [
        { x: 300, y: 90, path: [[300, 90], [980, 90]], speed: 72, pause: 1.0 },
        { x: 180, y: 200, path: [[180, 200], [180, 520]], speed: 66, pause: 1.2 },
        { x: 1100, y: 200, path: [[1100, 200], [1100, 520]], speed: 66, pause: 1.2 },
        { x: 980, y: 668, path: [[980, 668], [300, 668]], speed: 74, pause: 0.9 },
      ],
      cameras: [
        { x: 640, y: 66, angle: Math.PI / 2, sweep: 0.7, speed: 0.6 },
        { x: 28, y: 360, angle: 0, sweep: 0.6, speed: 0.7 },
        { x: 1252, y: 360, angle: Math.PI, sweep: 0.6, speed: 0.7 },
        { x: 640, y: 654, angle: -Math.PI / 2, sweep: 0.7, speed: 0.55 },
      ],
      lasers: [
        { x1: 455, y1: 300, x2: 455, y2: 440, period: 3.4, on: 2.2, phase: 0.5 },
        { x1: 825, y1: 300, x2: 825, y2: 440, period: 3.4, on: 2.2, phase: 1.8 },
      ],
      loot: [
        { x: 640, y: 360, kind: 'vault', value: 40000, name: 'SUN OPAL' },
        { x: 200, y: 180, kind: 'side', value: 6000, name: 'Crown Jewels' },
        { x: 1080, y: 180, kind: 'side', value: 5000, name: 'Moon Pearl' },
        { x: 200, y: 560, kind: 'side', value: 4000, name: 'Golden Idol' },
        { x: 1080, y: 560, kind: 'side', value: 5500, name: 'Star Sapphire' },
      ],
      lamps: [
        { x: 320, y: 180, r: 150 }, { x: 960, y: 180, r: 150 },
        { x: 320, y: 540, r: 150 }, { x: 960, y: 540, r: 150 }, { x: 640, y: 360, r: 170 },
      ],
    },
  ];

  // Build a live level: solids list + runtime copies of every entity.
  H.buildLevel = function (idx) {
    var def = H.LEVELS[idx];
    var solids = outerWalls().concat(def.walls, def.cover);
    return {
      def: def,
      index: idx,
      solids: solids,
      guards: def.guards.map(function (g) { return H.createGuard(g); }),
      cameras: def.cameras.map(function (c) { return H.createCamera(c); }),
      lasers: def.lasers.map(function (l) { return H.createLaser(l); }),
      loot: def.loot.map(function (l) {
        return { x: l.x, y: l.y, kind: l.kind, value: l.value, name: l.name, taken: false };
      }),
      exit: def.exit,
      time: 0,
    };
  };
})(window.HEIST);
