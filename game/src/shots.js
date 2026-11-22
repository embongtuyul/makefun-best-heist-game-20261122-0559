// shots.js — deterministic screenshot poses.
// One job: set up an exact, readable game state for each screenshot (?shot=1..4).
// The poses are real states of the game's own code, frozen for the camera.
(function (H) {
  'use strict';

  function freeze(S) {
    S.photo = true; // updates halt; the render loop keeps drawing this frame
    S.now = S.photoNow;
  }

  // Shot 1 — the cover: Gallery I mid-heist. Thief crouched behind the central
  // case, guard cones sweeping, cameras live, laser on, alarm at 32%.
  function shotCover(S) {
    H.startLevel(S, 0);
    S.screen = 'playing';
    var p = S.player;
    p.x = 560; p.y = 400; p.px = 560; p.py = 400;
    p.stance = 'sneak'; p.angle = -Math.PI / 2;
    S.alarm.value = 32;
    S.totalLoot = 2000; S.lootValue = 2000; // Jade Vase already lifted
    S.level.loot[1].taken = true;
    var g = S.level.guards;
    g[0].x = 430; g[0].y = 110; g[0].angle = Math.PI / 2; g[0].suspicion = 0.4;
    g[1].x = 900; g[1].y = 610; g[1].angle = Math.PI; g[1].suspicion = 0;
    var cams = S.level.cameras;
    cams[0].angle = Math.PI / 2 + 0.4;
    cams[1].angle = Math.PI - 0.3;
    S.level.lasers[0].t = 0.5; // beam live
    S.level.time = 47;
    S.photoNow = 12.5;
    freeze(S);
  }

  // Shot 2 — the chase: Gallery II, alarm 78%, a guard in full chase (red cone),
  // smoke deployed, camera flashing. The fair caught moment, mid-escape.
  function shotChase(S) {
    H.startLevel(S, 1);
    S.screen = 'playing';
    var p = S.player;
    p.x = 700; p.y = 480; p.px = 690; p.py = 480;
    p.stance = 'sprint'; p.angle = Math.PI / 4;
    S.alarm.value = 78;
    S.totalLoot = 64000; S.lootValue = 64000; // Atrium cleared + Sun Opal lifted
    S.mainTaken = true;
    S.level.loot[0].taken = true;
    S.level.loot[3].taken = true;
    var g = S.level.guards;
    g[0].x = 560; g[0].y = 340; g[0].angle = Math.atan2(480 - 340, 700 - 560);
    g[0].state = 'chase'; g[0].suspicion = 1;
    g[1].x = 820; g[1].y = 340; g[1].angle = Math.atan2(480 - 340, 700 - 820);
    g[1].state = 'investigate'; g[1].invX = 700; g[1].invY = 480; g[1].suspicion = 0.8;
    g[2].x = 400; g[2].y = 630; g[2].angle = Math.PI; g[2].suspicion = 0.3;
    S.smokes.push({ x: 640, y: 470, r: 70, t: 4 });
    var cams = S.level.cameras;
    cams[0].angle = Math.PI / 2 + 0.5; cams[0].seeT = 0.5;
    S.level.lasers[0].t = 3.0; // beam off — the gap to run through
    S.level.lasers[1].t = 0.4;
    S.level.time = 83;
    S.photoNow = 47.2;
    freeze(S);
  }

  // Shot 3 — the vault: Gallery III, thief lockpicking the Sun Opal case,
  // laser ring live, four guards on patrol, alarm low. Planning reads first.
  function shotVault(S) {
    H.startLevel(S, 2);
    S.screen = 'playing';
    var p = S.player;
    p.x = 640; p.y = 318; p.px = 640; p.py = 318;
    p.stance = 'sneak'; p.angle = Math.PI / 2;
    p.grabTarget = S.level.loot[0];
    p.grabT = 1.5; p.grabNeed = H.TUNING.vaultGrabSeconds;
    S.alarm.value = 12;
    S.totalLoot = 86500; S.lootValue = 86500; // two galleries cleared + two vault-side pieces
    S.level.loot[1].taken = true;
    S.level.loot[3].taken = true;
    var g = S.level.guards;
    g[0].x = 500; g[0].y = 90; g[0].angle = 0; g[0].suspicion = 0;
    g[1].x = 180; g[1].y = 300; g[1].angle = Math.PI / 2; g[1].suspicion = 0.2;
    g[2].x = 1100; g[2].y = 420; g[2].angle = -Math.PI / 2; g[2].suspicion = 0;
    g[3].x = 600; g[3].y = 668; g[3].angle = Math.PI; g[3].suspicion = 0;
    S.level.lasers[0].t = 0.3;
    S.level.lasers[1].t = 0.3;
    S.level.time = 131;
    S.photoNow = 88.0;
    freeze(S);
  }

  // Shot 4 — the getaway: the win screen after the vault, loot tallied, rank S.
  function shotWin(S) {
    H.startLevel(S, 2);
    S.screen = 'win';
    S.totalLoot = 134400; // 124,000 loot + 5,400 time bonus + 5,000 ghost bonus
    S.lootValue = 124000; // 90.5% of the museum's 137,000 — rank S
    S.totalTime = 412;
    S.spots = 0;
    S.alarmsTripped = 1;
    S.rank = 'S';
    S.level.loot.forEach(function (l) { l.taken = true; });
    S.mainTaken = true;
    S.player.x = 1185; S.player.y = 622; // standing in the Roof Exit
    S.level.time = 134;
    H.fillWin(S);
    H.showOverlay('ov-win');
    S.photoNow = 120.0;
    freeze(S);
  }

  H.applyShot = function (S, n) {
    if (n === 1) shotCover(S);
    else if (n === 2) shotChase(S);
    else if (n === 3) shotVault(S);
    else if (n === 4) shotWin(S);
    else return false;
    return true;
  };
})(window.HEIST);
