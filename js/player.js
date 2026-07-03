/**
 * Audio Player UI
 * Drag-and-drop zone, transport controls, seek bar.
 */

export class AudioPlayer {
  constructor(engine, elements) {
    this.engine = engine;
    this.dropZone = elements.dropZone;
    this.player = elements.player;
    this.fileInput = elements.fileInput;

    this.filenameEl = elements.filename;
    this.statusEl = elements.status;
    this.progressFill = elements.progressFill;
    this.progressBar = elements.progressBar;
    this.currentTimeEl = elements.currentTime;
    this.durationEl = elements.duration;
    this.playBtn = elements.playBtn;
    this.pauseBtn = elements.pauseBtn;
    this.rewindBtn = elements.rewindBtn;
    this.changeBtn = elements.changeBtn;

    this.onPlay = elements.onPlay;
    this.onPause = elements.onPause;

    this._raf = null;
    this._seeking = false;

    this._bind();
    this.engine.onEnded(() => this._onTrackEnded());
  }

  _bind() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.changeBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this._loadFile(e.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach((evt) => {
      this.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((evt) => {
      this.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
      });
    });

    this.dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        this._loadFile(file);
      }
    });

    this.playBtn.addEventListener('click', () => this._play());
    this.pauseBtn.addEventListener('click', () => this._pause());
    this.rewindBtn.addEventListener('click', () => {
      this.engine.rewind();
      this._updateProgress();
    });

    this.progressBar.addEventListener('mousedown', (e) => this._startSeek(e));
    this.progressBar.addEventListener('touchstart', (e) => this._startSeek(e), { passive: false });
  }

  async _loadFile(file) {
    try {
      this.statusEl.textContent = 'Loading…';
      const { duration, name } = await this.engine.loadFile(file);
      this.filenameEl.textContent = name;
      this.durationEl.textContent = formatTime(duration);
      this.currentTimeEl.textContent = '0:00';
      this.progressFill.style.width = '0%';
      this.statusEl.textContent = 'Ready';

      this.dropZone.classList.add('hidden');
      this.player.classList.add('is-visible');
      this._showPlayState(false);
    } catch (err) {
      this.statusEl.textContent = 'Failed to load audio';
      console.error(err);
    }
  }

  _play() {
    this.engine.play();
    this._showPlayState(true);
    this.statusEl.textContent = 'Playing';
    this._tick();
    this.onPlay?.();
  }

  _pause() {
    this.engine.pause();
    this._showPlayState(false);
    this.statusEl.textContent = 'Paused';
    cancelAnimationFrame(this._raf);
    this.onPause?.();
  }

  _showPlayState(playing) {
    this.playBtn.disabled = playing;
    this.pauseBtn.disabled = !playing;
    this.playBtn.classList.toggle('is-playing', playing);
    this.pauseBtn.classList.toggle('is-paused', !playing);
  }

  _onTrackEnded() {
    this._showPlayState(false);
    this.statusEl.textContent = 'Ended';
    this.progressFill.style.width = '0%';
    this.currentTimeEl.textContent = '0:00';
    cancelAnimationFrame(this._raf);
    this.onPause?.();
  }

  _tick() {
    const update = () => {
      if (!this.engine.isPlaying) return;
      this._updateProgress();
      this._raf = requestAnimationFrame(update);
    };
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(update);
  }

  _updateProgress() {
    const t = this.engine.getCurrentTime();
    const d = this.engine.duration;
    const pct = d > 0 ? (t / d) * 100 : 0;
    this.progressFill.style.width = `${pct}%`;
    this.currentTimeEl.textContent = formatTime(t);
  }

  _startSeek(e) {
    e.preventDefault();
    this._seeking = true;
    this.progressBar.classList.add('is-seeking');

    const seek = (ev) => {
      const rect = this.progressBar.getBoundingClientRect();
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const ratio = x / rect.width;
      this.engine.seek(ratio);
      this._updateProgress();
    };

    const end = () => {
      this._seeking = false;
      this.progressBar.classList.remove('is-seeking');
      document.removeEventListener('mousemove', seek);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', seek);
      document.removeEventListener('touchend', end);
    };

    seek(e);
    document.addEventListener('mousemove', seek);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', seek, { passive: false });
    document.addEventListener('touchend', end);
  }

  reset() {
    this.dropZone.classList.remove('hidden');
    this.player.classList.remove('is-visible');
    this.fileInput.value = '';
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
