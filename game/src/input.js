// input.js — keyboard and mouse state.
// One job: what the player's hands are doing right now.
(function (H) {
  'use strict';

  H.input = {
    up: false, down: false, left: false, right: false,
    sprint: false, sneak: false, interact: false,
    mouse: { x: 640, y: 360, down: false },
    pressed: {}, // edge-triggered keys, consumed by main.js
  };

  var KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'sprint', ShiftRight: 'sprint',
    KeyC: 'sneak', ControlLeft: 'sneak',
    KeyE: 'interact',
  };

  H.bindInput = function (canvas) {
    window.addEventListener('keydown', function (e) {
      var name = KEYMAP[e.code];
      if (name) { H.input[name] = true; e.preventDefault(); }
      if (!e.repeat) H.input.pressed[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
      var name = KEYMAP[e.code];
      if (name) H.input[name] = false;
    });
    window.addEventListener('blur', function () {
      H.input.up = H.input.down = H.input.left = H.input.right = false;
      H.input.sprint = H.input.sneak = H.input.interact = false;
    });
    canvas.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      H.input.mouse.x = (e.clientX - r.left) * (H.VIEW_W / r.width);
      H.input.mouse.y = (e.clientY - r.top) * (H.VIEW_H / r.height);
    });
    canvas.addEventListener('mousedown', function (e) {
      H.input.mouse.down = true;
      H.audioUnlock();
      var r = canvas.getBoundingClientRect();
      H.input.mouse.x = (e.clientX - r.left) * (H.VIEW_W / r.width);
      H.input.mouse.y = (e.clientY - r.top) * (H.VIEW_H / r.height);
    });
    window.addEventListener('mouseup', function () { H.input.mouse.down = false; });
  };

  // Was this key pressed since the last frame? (edge trigger)
  H.wasPressed = function (code) {
    if (H.input.pressed[code]) { H.input.pressed[code] = false; return true; }
    return false;
  };

  H.clearPressed = function () { H.input.pressed = {}; };
})(window.HEIST);
