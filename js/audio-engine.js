/**
 * GRANDA Audio Engine
 * Web Audio API graph: source → filters → dry/wet mix → output
 */

export class GrandaAudioEngine {
  constructor() {
    this.ctx = null;
    this.source = null;
    this.buffer = null;

    this.lowpass = null;
    this.highpass = null;
    this.dryGain = null;
    this.wetGain = null;
    this.masterGain = null;

    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
    this.duration = 0;

    this.params = {
      lowpass:  { freq: 20000, min: 200,   max: 20000 },
      highpass: { freq: 20,    min: 20,    max: 8000  },
      mix:      { value: 1,     min: 0,     max: 1     },
    };

    this.slotA = { lowpass: 20000, highpass: 20, mix: 1 };
    this.slotB = { lowpass: 4000,  highpass: 200, mix: 0.7 };
    this.activeSlot = 'A';
    this.bypassCompare = false;
    this.pluginEnabled = true;

    this._onEnded = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this._buildGraph();
  }

  _buildGraph() {
    this.lowpass = this.ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = this.params.lowpass.freq;
    this.lowpass.Q.value = 0.707;

    this.highpass = this.ctx.createBiquadFilter();
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = this.params.highpass.freq;
    this.highpass.Q.value = 0.707;

    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;

    this._updateMix(this.params.mix.value);
  }

  _updateMix(wet) {
    if (!this.dryGain) return;
    const dry = 1 - wet;
    this.dryGain.gain.value = dry;
    this.wetGain.gain.value = wet;
  }

  async loadFile(file) {
    this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.duration = this.buffer.duration;
    this.pauseOffset = 0;
    this._stopSource();
    return { duration: this.duration, name: file.name };
  }

  _connectSource() {
    if (!this.buffer || !this.ctx) return;

    this._stopSource();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.onended = () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        this._onEnded?.();
      }
    };

    this.source.connect(this.highpass);
    this.highpass.connect(this.lowpass);
    this.lowpass.connect(this.wetGain);

    this.source.connect(this.dryGain);

    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  play() {
    if (!this.buffer) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this._connectSource();
    this.startTime = this.ctx.currentTime - this.pauseOffset;
    this.source.start(0, this.pauseOffset);
    this.isPlaying = true;
  }

  pause() {
    if (!this.isPlaying) return;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    this._stopSource();
    this.isPlaying = false;
  }

  rewind() {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.pauseOffset = 0;
    if (wasPlaying) this.play();
  }

  seek(ratio) {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.pauseOffset = Math.max(0, Math.min(1, ratio)) * this.duration;
    if (wasPlaying) this.play();
  }

  getCurrentTime() {
    if (this.isPlaying) {
      return this.ctx.currentTime - this.startTime;
    }
    return this.pauseOffset;
  }

  _stopSource() {
    if (this.source) {
      try { this.source.stop(); } catch (_) { /* already stopped */ }
      this.source.disconnect();
      this.source = null;
    }
  }

  setLowpass(freq) {
    this.params.lowpass.freq = freq;
    if (this.lowpass) {
      this.lowpass.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
    }
    this._saveToActiveSlot('lowpass', freq);
  }

  setHighpass(freq) {
    this.params.highpass.freq = freq;
    if (this.highpass) {
      this.highpass.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
    }
    this._saveToActiveSlot('highpass', freq);
  }

  setMix(value) {
    this.params.mix.value = value;
    this._updateMix(value);
    this._saveToActiveSlot('mix', value);
  }

  _saveToActiveSlot(key, value) {
    const slot = this.activeSlot === 'A' ? this.slotA : this.slotB;
    if (key === 'lowpass') slot.lowpass = value;
    else if (key === 'highpass') slot.highpass = value;
    else if (key === 'mix') slot.mix = value;
  }

  toggleBypassCompare(enabled) {
    this.bypassCompare = enabled;
    if (enabled) {
      this._applySlot('B');
    } else {
      this._applySlot('A');
    }
  }

  _applySlot(slotName) {
    const slot = slotName === 'A' ? this.slotA : this.slotB;
    this.setLowpass(slot.lowpass);
    this.setHighpass(slot.highpass);
    this.setMix(slot.mix);
  }

  setPluginEnabled(enabled) {
    this.pluginEnabled = enabled;
    if (!this.masterGain) return;

    if (enabled) {
      this._updateMix(this.params.mix.value);
      this.masterGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02);
    } else {
      this.dryGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02);
      this.wetGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
    }
  }

  getState() {
    return {
      lowpass: this.params.lowpass.freq,
      highpass: this.params.highpass.freq,
      mix: this.params.mix.value,
      activeSlot: this.activeSlot,
      bypassCompare: this.bypassCompare,
      pluginEnabled: this.pluginEnabled,
      slotA: { ...this.slotA },
      slotB: { ...this.slotB },
    };
  }

  onEnded(cb) {
    this._onEnded = cb;
  }

  dispose() {
    this._stopSource();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
