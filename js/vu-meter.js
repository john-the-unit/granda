/**
 * VU Meter — animates needle from AnalyserNode data
 */

export class VUMeter {
  constructor(needleEl) {
    this.needle = needleEl;
    this.analyser = null;
    this.data = null;
    this._raf = null;
    this._angle = -42;
  }

  connect(analyser) {
    this.analyser = analyser;
    this.data = new Uint8Array(analyser.frequencyBinCount);
    this._tick();
  }

  disconnect() {
    cancelAnimationFrame(this._raf);
    this.analyser = null;
    this._setAngle(-42);
  }

  _tick() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    const len = Math.min(this.data.length, 64);
    for (let i = 0; i < len; i++) sum += this.data[i];
    const avg = sum / len / 255;

    const target = -42 + avg * 68;
    this._angle += (target - this._angle) * 0.25;
    this._setAngle(this._angle);

    this._raf = requestAnimationFrame(() => this._tick());
  }

  _setAngle(deg) {
    this.needle.style.transform = `rotate(${deg}deg)`;
  }
}
