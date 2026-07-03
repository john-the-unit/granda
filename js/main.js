import { GrandaAudioEngine } from './audio-engine.js';
import { Knob, freqFormat, mixFormat } from './knob.js';
import { AudioPlayer } from './player.js';

const engine = new GrandaAudioEngine();

const panel = document.getElementById('granda-panel');
const toggleBypass = document.getElementById('toggle-bypass');
const togglePower = document.getElementById('toggle-power');

const lowpassKnob = new Knob(document.getElementById('knob-lowpass'), {
  min: 200,
  max: 20000,
  value: 20000,
  formatValue: freqFormat,
  onChange: (v) => engine.setLowpass(v),
});

const mixKnob = new Knob(document.getElementById('knob-mix'), {
  min: 0,
  max: 1,
  value: 1,
  formatValue: mixFormat,
  onChange: (v) => engine.setMix(v),
});

const highpassKnob = new Knob(document.getElementById('knob-highpass'), {
  min: 20,
  max: 8000,
  value: 20,
  formatValue: freqFormat,
  onChange: (v) => engine.setHighpass(v),
});

toggleBypass.addEventListener('click', () => {
  const active = !toggleBypass.classList.contains('active');
  toggleBypass.classList.toggle('active', active);
  toggleBypass.setAttribute('aria-pressed', String(active));
  engine.toggleBypassCompare(active);
  syncKnobsFromEngine();
});

togglePower.addEventListener('click', () => {
  const active = !togglePower.classList.contains('active');
  togglePower.classList.toggle('active', active);
  togglePower.setAttribute('aria-pressed', String(active));
  engine.setPluginEnabled(active);
  panel.classList.toggle('is-off', !active);
});

togglePower.classList.add('active');
togglePower.setAttribute('aria-pressed', 'true');

function syncKnobsFromEngine() {
  const s = engine.getState();
  lowpassKnob.setValue(s.lowpass);
  highpassKnob.setValue(s.highpass);
  mixKnob.setValue(s.mix);
}

const player = new AudioPlayer(engine, {
  dropZone: document.getElementById('drop-zone'),
  player: document.getElementById('player'),
  fileInput: document.getElementById('file-input'),
  filename: document.getElementById('player-filename'),
  status: document.getElementById('player-status'),
  progressFill: document.getElementById('progress-fill'),
  progressBar: document.getElementById('progress-bar'),
  currentTime: document.getElementById('current-time'),
  duration: document.getElementById('duration'),
  playBtn: document.getElementById('btn-play'),
  pauseBtn: document.getElementById('btn-pause'),
  rewindBtn: document.getElementById('btn-rewind'),
  changeBtn: document.getElementById('btn-change'),
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault();
    if (engine.isPlaying) {
      player._pause();
    } else if (engine.buffer) {
      player._play();
    }
  }
});

export { engine, player, lowpassKnob, mixKnob, highpassKnob };
