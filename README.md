# GRANDA — Lo/Hi-Pass Filter Web Plugin

A browser-based audio effect plugin with lo-pass and hi-pass filters, A/B comparison, dry/wet mix, and an integrated drag-and-drop audio player.

**Dark-mode Frutiger × Neumorphism** aesthetic out of the box, fully customizable via design tokens.

## Quick Start

```bash
# Serve locally (ES modules require HTTP)
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` (or the port shown), then drag an audio file onto the drop zone.

## Features

| Control | Function |
|---------|----------|
| **Lo-Pass** | Cuts frequencies above the set point (200 Hz – 20 kHz) |
| **Hi-Pass** | Cuts frequencies below the set point (20 Hz – 8 kHz) |
| **Mix** | Dry/wet blend (0% – 100%) |
| **A/B** | Instantly compare two preset slots (A = current, B = alternate) |
| **ON/OFF** | Bypass the entire effect chain (dry signal only) |

### Audio Player

- **Drag & drop** or click to load audio (MP3, WAV, FLAC, OGG)
- **Play / Pause / Rewind / Change** transport controls
- **Seek bar** with elapsed and total time (Spotify-style)
- **Spacebar** toggles play/pause when a track is loaded

## Project Structure

```
granda/
├── index.html              # Plugin + player markup
├── css/
│   ├── tokens.css          # ★ Design tokens — edit art style here
│   └── styles.css          # Layout & component styles
├── js/
│   ├── audio-engine.js     # Web Audio API graph
│   ├── knob.js             # Rotary knob component
│   ├── player.js           # Drag-drop player UI
│   └── main.js             # App wiring
└── CURSOR_WALKTHROUGH.md   # Guide for customizing art style in Cursor
```

## Customizing the Art Style

All visual variables live in `css/tokens.css`. See **[CURSOR_WALKTHROUGH.md](./CURSOR_WALKTHROUGH.md)** for a step-by-step guide on using Cursor to reshape the Frutiger/Neumorphism look.

## Tech

- Vanilla HTML/CSS/JS (no build step)
- Web Audio API (`BiquadFilterNode`, `GainNode`)
- ES Modules
