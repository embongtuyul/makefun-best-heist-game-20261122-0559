// audio.js — WebAudio synth: footsteps, pickups, alarms. No audio files.
// One job: every sound the game makes, from oscillators.
(function (H) {
  'use strict';

  var ctx = null, master = null, muted = false, alarmOsc = null, alarmGain = null;

  function ensure() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      return true;
    } catch (e) { return false; }
  }

  H.audioUnlock = function () { if (ensure() && ctx.state === 'suspended') ctx.resume(); };
  H.audioMuted = function () { return muted; };
  H.audioToggleMute = function () {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.5;
    return muted;
  };

  H.audioBlip = function (freq, dur, type, gain) {
    if (muted || !ensure()) return;
    try {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + (dur || 0.1));
    } catch (e) { /* audio is garnish, never fatal */ }
  };

  // Soft filtered-noise tick for a footstep.
  H.audioStep = function (loud) {
    if (muted || !ensure()) return;
    try {
      var len = Math.floor(ctx.sampleRate * 0.06);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = loud ? 900 : 420;
      var g = ctx.createGain(); g.gain.value = loud ? 0.16 : 0.06;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
    } catch (e) { /* ignore */ }
  };

  // Two-note pickup chime.
  H.audioPickup = function () {
    H.audioBlip(660, 0.09, 'sine', 0.12);
    setTimeout(function () { H.audioBlip(990, 0.14, 'sine', 0.12); }, 90);
  };

  // Alarm drone while the meter is high; call every frame with the level.
  H.audioAlarmDrone = function (level) {
    if (!ensure()) return;
    if (level > 0.55 && !muted) {
      if (!alarmOsc) {
        try {
          alarmOsc = ctx.createOscillator();
          alarmOsc.type = 'triangle';
          alarmOsc.frequency.value = 96;
          alarmGain = ctx.createGain();
          alarmGain.gain.value = 0;
          alarmOsc.connect(alarmGain); alarmGain.connect(master);
          alarmOsc.start();
        } catch (e) { alarmOsc = null; }
      }
      if (alarmGain) alarmGain.gain.value = (level - 0.55) * 0.16;
    } else if (alarmOsc && alarmGain) {
      alarmGain.gain.value = 0;
    }
  };
})(window.HEIST);
