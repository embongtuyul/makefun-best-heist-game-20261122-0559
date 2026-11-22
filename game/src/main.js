// main.js — the game: state machine, loop, scoring, tools, win/lose.
// One job: own the run — menu, playing, caught, clear, win — and drive it.
(function (H) {
  'use strict';
  var T = H.TUNING;

  H.MAX_LOOT = H.LEVELS.reduce(function (sum, l) {
    return sum + l.loot.reduce(function (s, x) { return s + x.value; }, 0);
  }, 0);

  function newRun() {
    return {
      screen: 'menu', // menu | playing | paused | caught | levelclear | win
      levelIndex: 0, level: null, player: null,
      alarm: { value: 0, flash: 0, lockdownT: 0, lastLabel: '', lastLabelT: -9 },
      alarmPeak: 0, alarmsTripped: 0, spots: 0,
      totalLoot: 0, lootValue: 0, totalTime: 0,
      lootAtLevelStart: 0, lootValueAtLevelStart: 0,
      mainTaken: false, mainName: '',
      smokes: [], noises: [], floaters: [], events: [],
      now: 0, photo: false, photoNow: 0,
      paused: false, clearT: 0, rank: 'C',
      playerInExit: false,
    };
  }

  H.startLevel = function (S, idx) {
    S.levelIndex = idx;
    S.level = H.buildLevel(idx);
    S.player = H.createPlayer(S.level.def.playerStart);
    S.alarm = { value: 0, flash: 0, lockdownT: 0, lastLabel: '', lastLabelT: -9 };
    S.smokes = []; S.noises = []; S.floaters = []; S.events = [];
    S.lootAtLevelStart = S.totalLoot;
    S.lootValueAtLevelStart = S.lootValue;
    var main = S.level.def.loot.find(function (l) { return l.kind === 'main' || l.kind === 'vault'; });
    S.mainTaken = false;
    S.mainName = main ? main.name : 'loot';
    S.playerInExit = false;
  };

  H.gameCaught = function (S, reason) {
    if (S.screen !== 'playing') return;
    S.screen = 'caught';
    S.spots = S.spots; // spots counted at the chase transition
    H.audioBlip(110, 0.6, 'sawtooth', 0.22);
    H.fillCaught(reason, S);
    H.showOverlay('ov-caught');
  };

  H.computeRank = function (S) {
    var pct = S.lootValue / H.MAX_LOOT;
    if (pct >= 0.9 && S.spots === 0) return 'S';
    if (pct >= 0.8) return 'A';
    if (pct >= 0.6) return 'B';
    return 'C';
  };

  function levelClear(S) {
    var remaining = Math.max(0, S.level.def.par - S.level.time);
    var bonus = Math.round(remaining) * 50;
    S.totalLoot += bonus;
    S.totalTime += S.level.time;
    S.screen = 'levelclear';
    S.clearT = 0;
    H.audioPickup();
    H.audioBlip(523, 0.15, 'sine', 0.14);
    setTimeout(function () { H.audioBlip(784, 0.2, 'sine', 0.14); }, 140);
    H.fillClear(bonus, S);
    H.showOverlay('ov-clear');
  }

  function winGame(S) {
    S.totalTime += S.level.time;
    if (S.spots === 0) S.totalLoot += 5000; // ghost bonus: never spotted
    S.rank = H.computeRank(S);
    S.screen = 'win';
    H.fillWin(S);
    H.showOverlay('ov-win');
  }

  function nextAfterClear(S) {
    if (S.levelIndex >= H.LEVELS.length - 1) winGame(S);
    else {
      H.startLevel(S, S.levelIndex + 1);
      S.screen = 'playing';
      H.showOverlay(null);
    }
  }

  function retryLevel(S) {
    S.totalLoot = S.lootAtLevelStart;
    S.lootValue = S.lootValueAtLevelStart;
    H.startLevel(S, S.levelIndex);
    S.screen = 'playing';
    H.showOverlay(null);
  }

  function addFloater(S, x, y, text, color) {
    S.floaters.push({ x: x, y: y, text: text, t: 0, life: 1.6, color: color || '#ffe9a8' });
  }

  function tryGrab(S, dt) {
    var p = S.player;
    var near = H.nearestLoot(p, S.level.loot);
    if (p.grabTarget) {
      var stillNear = near === p.grabTarget && !p.moving;
      if (H.input.interact && stillNear) {
        p.grabT += dt;
        if (p.grabT >= p.grabNeed) {
          var got = p.grabTarget;
          got.taken = true;
          S.totalLoot += got.value;
          S.lootValue += got.value;
          addFloater(S, got.x, got.y - 18, '+' + H.fmtMoney(got.value), '#ffe9a8');
          H.audioPickup();
          if (got.kind === 'main' || got.kind === 'vault') {
            S.mainTaken = true;
            addFloater(S, p.x, p.y - 30, got.name + ' SECURED!', '#9dffc9');
          }
          p.grabTarget = null; p.grabT = 0;
        }
      } else {
        p.grabTarget = null; p.grabT = 0; // moved or let go: start over
      }
      return;
    }
    if (H.input.interact && near && !p.moving) {
      p.grabTarget = near;
      p.grabNeed = near.kind === 'vault' ? T.vaultGrabSeconds : T.grabSeconds;
      p.grabT = 0;
    }
  }

  function useTool(S, which) {
    var p = S.player;
    if (which === 'emp' && p.tools.emp > 0) {
      p.tools.emp--;
      for (var i = 0; i < S.level.cameras.length; i++) S.level.cameras[i].disabledT = T.empSeconds;
      for (var j = 0; j < S.level.lasers.length; j++) S.level.lasers[j].disabledT = T.empSeconds;
      addFloater(S, p.x, p.y - 26, 'EMP — cameras dark ' + T.empSeconds + 's', '#9db6e8');
      H.audioBlip(1800, 0.1, 'square', 0.1);
      H.audioBlip(900, 0.15, 'square', 0.1);
    } else if (which === 'smoke' && p.tools.smoke > 0) {
      p.tools.smoke--;
      S.smokes.push({ x: p.x, y: p.y, r: 70, t: T.smokeSeconds });
      H.audioBlip(300, 0.2, 'sine', 0.08);
    } else if (which === 'decoy' && p.tools.decoy > 0) {
      p.tools.decoy--;
      H.tossDecoy(p, H.input.mouse, S);
    }
  }

  function inExit(S) {
    var e = S.level.exit, p = S.player;
    return p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6;
  }

  function update(S, dt) {
    S.now += dt;
    S.level.time += dt;
    var p = S.player;

    // Tools (edge-triggered).
    if (H.wasPressed('Digit1')) useTool(S, 'emp');
    if (H.wasPressed('Digit2')) useTool(S, 'smoke');
    if (H.wasPressed('Digit3')) useTool(S, 'decoy');
    if (H.wasPressed('KeyM')) H.audioToggleMute();

    H.updatePlayer(p, H.input, S.level.solids, dt, S);
    tryGrab(S, dt);

    // Sprinting rings out every step.
    if (p.moving && p.stance === 'sprint') {
      S.noises.push({ x: p.x, y: p.y, r: T.noiseSprint, t: 0.2, kind: 'step' });
    }

    for (var i = 0; i < S.level.guards.length; i++) H.updateGuard(S.level.guards[i], p, S, dt);
    for (var j = 0; j < S.level.cameras.length; j++) H.updateCamera(S.level.cameras[j], p, S, dt);
    for (var k = 0; k < S.level.lasers.length; k++) H.updateLaser(S.level.lasers[k], p, S, dt);
    H.updateAlarm(S, dt);

    // Alarm peak + trip counter.
    if (S.alarm.value > S.alarmPeak) S.alarmPeak = S.alarm.value;

    // Smoke and noise decay.
    for (var s = S.smokes.length - 1; s >= 0; s--) {
      S.smokes[s].t -= dt;
      if (S.smokes[s].t <= 0) S.smokes.splice(s, 1);
    }
    for (var n = S.noises.length - 1; n >= 0; n--) {
      S.noises[n].t -= dt;
      if (S.noises[n].t <= 0) S.noises.splice(n, 1);
    }
    for (var f = S.floaters.length - 1; f >= 0; f--) {
      S.floaters[f].t += dt;
      if (S.floaters[f].t >= S.floaters[f].life) S.floaters.splice(f, 1);
    }

    // Footsteps.
    if (p.moving) {
      S.stepT = (S.stepT || 0) + dt * (p.stance === 'sprint' ? 2.4 : 1.6);
      if (S.stepT > 0.42) { S.stepT = 0; H.audioStep(p.stance === 'sprint'); }
    }
    H.audioAlarmDrone(S.alarm.value / 100);

    // Escape!
    S.playerInExit = inExit(S);
    if (S.mainTaken && S.playerInExit && S.alarm.lockdownT <= 0) levelClear(S);
  }

  // Demo behind the menu: guards patrol, cameras sweep, nobody plays.
  function updateMenu(S, dt) {
    S.now += dt;
    var dummy = S.player;
    for (var i = 0; i < S.level.guards.length; i++) H.patrolStep(S.level.guards[i], dt, S.level.solids);
    for (var j = 0; j < S.level.cameras.length; j++) {
      var cam = S.level.cameras[j];
      cam.t += dt;
      cam.angle = cam.baseAngle + Math.sin(cam.t * cam.speed) * cam.sweep;
    }
    for (var k = 0; k < S.level.lasers.length; k++) S.level.lasers[k].t += dt;
    void dummy;
  }

  H.boot = function () {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    H.bindInput(canvas);
    var S = newRun();
    window.HEIST.state = S;
    H.startLevel(S, 0);
    S.screen = 'menu';
    H.showOverlay('ov-menu');

    // Screenshot poses: ?shot=1..4 freezes a real game state for the camera.
    var shot = 0;
    try {
      var m = /[?&]shot=(\d)/.exec(window.location.search);
      if (m) shot = parseInt(m[1], 10);
    } catch (e) { shot = 0; }
    if (shot >= 1 && shot <= 4) {
      H.applyShot(S, shot);
      H.showOverlay(shot === 4 ? 'ov-win' : null);
    }

    document.getElementById('btn-start').addEventListener('click', function () {
      H.audioUnlock();
      H.startLevel(S, 0);
      S.totalLoot = 0; S.lootValue = 0; S.totalTime = 0; S.spots = 0;
      S.alarmsTripped = 0; S.alarmPeak = 0;
      S.screen = 'playing';
      H.showOverlay(null);
    });
    document.getElementById('btn-retry').addEventListener('click', function () { retryLevel(S); });
    document.getElementById('btn-next').addEventListener('click', function () { nextAfterClear(S); });
    document.getElementById('btn-again').addEventListener('click', function () {
      S.totalLoot = 0; S.lootValue = 0; S.totalTime = 0; S.spots = 0;
      S.alarmsTripped = 0; S.alarmPeak = 0;
      H.startLevel(S, 0);
      S.screen = 'playing';
      H.showOverlay(null);
    });
    document.getElementById('btn-menu').addEventListener('click', function () {
      H.startLevel(S, 0);
      S.screen = 'menu';
      H.showOverlay('ov-menu');
    });

    var last = performance.now();
    var frames = 0;
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!S.photo) {
        if (S.screen === 'playing' && !S.paused) update(S, dt);
        else if (S.screen === 'menu') updateMenu(S, dt);
        else if (S.screen === 'levelclear') {
          S.now += dt;
          S.clearT += dt;
          if (S.clearT > 3.2 || H.wasPressed('Enter') || H.wasPressed('Space')) nextAfterClear(S);
        } else {
          S.now += dt;
        }
        // Global keys.
        if (H.wasPressed('Escape')) {
          if (S.screen === 'playing') { S.paused = !S.paused; H.showOverlay(S.paused ? 'ov-pause' : null); }
        }
        if (H.wasPressed('KeyR') && (S.screen === 'caught' || S.screen === 'playing')) retryLevel(S);
        if (H.wasPressed('Enter') || H.wasPressed('Space')) {
          if (S.screen === 'menu') document.getElementById('btn-start').click();
          else if (S.screen === 'caught') retryLevel(S);
          else if (S.screen === 'win') document.getElementById('btn-again').click();
        }
        if (H.wasPressed('KeyM')) H.audioToggleMute();
      }
      H.render(ctx, S);
      H.updateHud(S);
      frames++;
      if (frames === 2 && S.photo) window.__shotReady = true;
      if (frames === 30 && !S.photo) window.__shotReady = true;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  // Readable snapshot for automated playtests (CDP evaluates this).
  H.debugState = function () {
    var S = window.HEIST.state;
    if (!S) return { error: 'no state' };
    return {
      screen: S.screen,
      level: S.levelIndex + 1,
      levelName: S.level ? S.level.def.name : null,
      alarm: Math.round(S.alarm.value),
      lockdown: Math.round(S.alarm.lockdownT * 10) / 10,
      loot: S.totalLoot,
      lootValue: S.lootValue,
      mainTaken: S.mainTaken,
      player: { x: Math.round(S.player.x), y: Math.round(S.player.y), stance: S.player.stance },
      guards: S.level.guards.map(function (g) {
        return { state: g.state, suspicion: Math.round(g.suspicion * 100) / 100, x: Math.round(g.x), y: Math.round(g.y) };
      }),
      cameras: S.level.cameras.map(function (c) { return { seeT: Math.round(c.seeT * 100) / 100, disabled: c.disabledT > 0 }; }),
      lasersLive: S.level.lasers.map(function (l) { return H.laserLive(l); }),
      lootLeft: S.level.loot.filter(function (l) { return !l.taken; }).length,
      time: Math.round(S.level.time),
      spots: S.spots,
      errors: (window.__gameErrors || []).slice(-5),
    };
  };

  window.addEventListener('error', function (e) {
    window.__gameErrors = window.__gameErrors || [];
    window.__gameErrors.push(String(e.message));
  });
  window.addEventListener('load', function () { H.boot(); });
})(window.HEIST);
