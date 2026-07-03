/**
 * Rotary Knob Component
 * Maps vertical drag to a normalized 0–1 value, renders arc + indicator.
 */

const ARC_START = 135;
const ARC_SWEEP = 270;

export class Knob {
  constructor(el, { min = 0, max = 1, value = 0.5, onChange, formatValue } = {}) {
    this.el = el;
    this.min = min;
    this.max = max;
    this.value = this._clamp(value);
    this.onChange = onChange;
    this.formatValue = formatValue || ((v) => v.toFixed(0));

    this._dragging = false;
    this._lastY = 0;

    this._build();
    this._bind();
    this._render();
  }

  _build() {
    this.el.classList.add('knob');
    this.el.innerHTML = `
      <div class="knob__arc" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <path class="knob__arc-bg" d="" />
          <path class="knob__arc-path" d="" />
        </svg>
      </div>
      <div class="knob__body">
        <div class="knob__indicator"></div>
      </div>
      <span class="knob__value"></span>
    `;

    this.indicator = this.el.querySelector('.knob__indicator');
    this.valueEl = this.el.querySelector('.knob__value');
    this.arcBg = this.el.querySelector('.knob__arc-bg');
    this.arcPath = this.el.querySelector('.knob__arc-path');
    this._drawStaticArc();
  }

  _drawStaticArc() {
    const cx = 50, cy = 50, r = 44;
    const startRad = (ARC_START - 90) * Math.PI / 180;
    const endRad = (ARC_START + ARC_SWEEP - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = ARC_SWEEP > 180 ? 1 : 0;
    this.arcBg.setAttribute('d',
      `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
    );
  }

  _bind() {
    const onDown = (e) => {
      e.preventDefault();
      this._dragging = true;
      this._lastY = e.touches ? e.touches[0].clientY : e.clientY;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };

    const onMove = (e) => {
      if (!this._dragging) return;
      e.preventDefault();
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = (this._lastY - y) * 0.005;
      this._lastY = y;
      this.setNormalized(this.getNormalized() + delta);
    };

    const onUp = () => {
      this._dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    this.el.addEventListener('mousedown', onDown);
    this.el.addEventListener('touchstart', onDown, { passive: false });

    this.el.addEventListener('dblclick', () => {
      this.setNormalized(0.5);
    });
  }

  _clamp(v) {
    return Math.max(this.min, Math.min(this.max, v));
  }

  getNormalized() {
    return (this.value - this.min) / (this.max - this.min);
  }

  setNormalized(n) {
    n = Math.max(0, Math.min(1, n));
    const v = this.min + n * (this.max - this.min);
    this.setValue(v);
  }

  setValue(v) {
    const prev = this.value;
    this.value = this._clamp(v);
    this._render();
    if (this.value !== prev) {
      this.onChange?.(this.value);
    }
  }

  _render() {
    const norm = this.getNormalized();
    const angle = ARC_START + norm * ARC_SWEEP;

    this.indicator.style.transform = `rotate(${angle}deg)`;
    this.valueEl.textContent = this.formatValue(this.value);

    const cx = 50, cy = 50, r = 44;
    const startRad = (ARC_START - 90) * Math.PI / 180;
    const endRad = (angle - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = norm * ARC_SWEEP > 180 ? 1 : 0;

    this.arcPath.setAttribute('d',
      `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
    );
  }
}

export function freqFormat(hz) {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return `${Math.round(hz)}`;
}

export function mixFormat(v) {
  return `${Math.round(v * 100)}%`;
}
