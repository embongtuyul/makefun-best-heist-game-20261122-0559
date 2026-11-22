# THE AURELIA JOB — Midnight at the Marlow Museum

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/embongtuyul/makefun-best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/embongtuyul/makefun-best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down 2D heist game for the [best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559).
Sneak through three night galleries of the Marlow Museum, slip past patrolling
guards and their vision cones, dodge sweeping CCTV cameras and blinking laser
tripwires, lift the Aurelia Star and the Sun Opal — and get out before the
alarm meter hits 100% and the museum locks down.

## Play

Open `game/index.html` in desktop Chrome (or serve `game/` from any static
server — `node serve.ts` serves it at http://localhost:8080). No network, no build step.

- **WASD / Arrows** — move
- **Shift** — sprint (fast, loud — guards hear it)
- **C** — sneak (slow, silent, harder to spot)
- **E** — grab loot / pick the vault (hold still)
- **1** — EMP: kills cameras and lasers for 8s · **2** — smoke bomb · **3** — decoy coin
- **Esc** — pause · **R** — retry gallery · **M** — mute

## What's in the game

- 3 galleries of rising difficulty (Atrium, Hall of Kings, The Vault)
- Guards with raycast-clipped vision cones, patrols, pauses and scans; suspicion
  that fills, chases, investigates your last-seen spot and the noises you make
- Sweeping CCTV cameras that ping guards when they hold you in frame
- Laser tripwires on a blink cycle — cross while they are dark, or EMP them
- One alarm meter: cameras, lasers and being spotted feed it; at 100% the
  museum locks down and every guard converges on you
- Light and shadow: lamplight exposes you, darkness hides you
- Loot with real values (main pieces + side pieces), a vault that takes 2.6s to
  pick, time bonuses, a $5,000 ghost bonus for never being spotted, ranks S–C
- Tools at a cost: EMP, smoke and decoy are limited per gallery
- WebAudio synth — footsteps, pickup chimes, alarm drone. No audio files.
- Screenshots are deterministic poses of the game's own code (`?shot=1..4`)

## Layout

- `game/index.html` — page shell, HUD, overlays
- `game/css/style.css` — presentation
- `game/src/config.js` — tuning, colours, helpers
- `game/src/vision.js` — line of sight and cone clipping
- `game/src/levels.js` — the three gallery definitions
- `game/src/player.js` — movement, stance, noise, tools
- `game/src/guard.js` — patrol, suspicion, investigate, chase
- `game/src/camera.js` — sweeping cameras and detection
- `game/src/laser.js` — tripwires on a blink cycle
- `game/src/alarm.js` — the alarm meter and lockdown
- `game/src/render.js` — all canvas drawing
- `game/src/audio.js` — WebAudio synth
- `game/src/input.js` — keyboard and mouse state
- `game/src/hud.js` — DOM HUD and overlays
- `game/src/shots.js` — deterministic screenshot poses
- `game/src/main.js` — boot, loop, state machine, scoring
- `main.ts` — the hand-in program (copies `game/` + `screenshots/`, writes
  `dossier.json` with the kit's `buildDossier`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
