# Cursor Walkthrough — Customizing GRANDA's Art Style

This guide shows you how to use **Cursor** to reshape the GRANDA plugin's visual identity. The plugin ships with a **dark-mode Frutiger × Neumorphism** blend. Every aesthetic knob lives in one file so you stay in control.

---

## 1. Open the Project in Cursor

1. Clone or open the `granda` repository in Cursor.
2. Start a local server (required for ES modules):

   ```bash
   npx serve .
   ```

3. Open the app in your browser so you can see changes live.

---

## 2. Know Where the Art Lives

| File | Purpose |
|------|---------|
| `css/tokens.css` | **Start here.** Colors, shadows, fonts, sizes — all CSS custom properties. |
| `css/styles.css` | Layout, component structure, neumorphic surfaces. |
| `index.html` | Markup only — rarely needs changes for styling. |

> **Rule of thumb:** Change *what it looks like* in `tokens.css`. Change *how it's arranged* in `styles.css`.

---

## 3. Prompt Cursor to Change the Art Style

Open Cursor's chat (`Cmd/Ctrl + L`) and reference the token file directly. Here are copy-paste prompts you can adapt:

### Shift the color palette

```
@css/tokens.css Make the accent color a lime-green Frutiger glow
instead of cyan. Keep dark mode and neumorphic shadows.
```

### Push harder into Neumorphism

```
@css/tokens.css @css/styles.css Increase neumorphic depth —
stronger outer shadows on knobs and the panel, softer inner
shadows on the drop zone. Keep the dark palette.
```

### Add Frutiger Aero glass effects

```
@css/styles.css Add a subtle glass gradient overlay to the
plugin panel and player, with a soft cyan border glow on
active toggles. Reference Frutiger Aero glossy UI.
```

### Match a reference image

```
I've attached a style reference. Update @css/tokens.css and
@css/styles.css so GRANDA matches this hardware-inspired
layout but stays dark-mode neumorphic instead of skeuomorphic metal.
```

Attach your reference image in the chat when using this prompt.

### Typography overhaul

```
@css/tokens.css Switch to a more humanist stack — prefer
"Frutiger", "Candara", "Segoe UI". Make the GRANDA header
thinner with wider letter-spacing.
```

---

## 4. Token Reference (Quick Map)

Open `css/tokens.css` — these are the levers Cursor (or you) can turn:

### Palette

| Token | Default | Effect |
|-------|---------|--------|
| `--granda-bg` | `#1a1d24` | Page background |
| `--granda-surface` | `#22262f` | Plugin panel fill |
| `--granda-accent` | `#5ec4e8` | Knob indicators, active toggles, progress bar |
| `--granda-text` | `#e8ecf4` | Primary labels |

### Neumorphic Shadows

| Token | Effect |
|-------|--------|
| `--neu-outer` | Raised elements (panel, knobs, buttons) |
| `--neu-inner` | Recessed elements (drop zone, pressed states) |
| `--neu-shadow-dark` / `--neu-shadow-light` | Shadow pair — tweak both together for depth |

### Typography

| Token | Effect |
|-------|--------|
| `--font-display` | Font stack for all UI text |
| `--font-weight-thin` | GRANDA header weight |

### Sizing

| Token | Effect |
|-------|--------|
| `--knob-lg` / `--knob-sm` | Large (Lo/Hi-Pass) vs small (Mix) knob diameter |
| `--panel-radius` | Corner roundness of the main panel |
| `--switch-width` / `--switch-height` | A/B and ON/OFF pill toggles |

---

## 5. Example: Full Style Pivot in One Prompt

Paste this into Cursor for a dramatic restyle:

```
Restyle GRANDA to "Frutiger Aero Dark":

1. @css/tokens.css
   - Background: deep navy #0d1117
   - Accent: electric cyan #00d4ff with stronger glow
   - Neumorphic shadows: slightly bluer tint
   - Panel radius: 32px

2. @css/styles.css
   - Add a subtle linear gradient on .granda-panel (top lighter)
   - Progress bar fill: cyan-to-white gradient with glow
   - Active pill toggle: glass highlight pseudo-element

Do not change any JavaScript or HTML structure.
```

Cursor will diff only the CSS files. Refresh the browser to preview.

---

## 6. Iterating with Live Preview

1. Keep browser and Cursor side by side.
2. After each Cursor edit, hard-refresh (`Cmd/Ctrl + Shift + R`).
3. If a change looks wrong, tell Cursor:

   ```
   Revert the shadow changes on .knob__body — they're too harsh.
   Keep the new accent color.
   ```

4. Use **@ file references** so Cursor scopes changes and doesn't touch audio logic.

---

## 7. What NOT to Ask Cursor to Style-Edit

These files control **audio behavior**, not visuals. Only touch them for functional changes:

| File | Role |
|------|------|
| `js/audio-engine.js` | Filter frequencies, A/B slots, on/off bypass |
| `js/knob.js` | Knob drag interaction |
| `js/player.js` | Player transport & seek |
| `js/main.js` | Wires UI to engine |

If you want a functional change *and* a style change, split into two prompts:

1. "Add a resonance knob for the lo-pass filter" → JS files
2. "Style the new resonance knob to match existing knobs" → CSS files

---

## 8. Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  css/tokens.css  ← YOU / CURSOR EDIT HERE   │
│  (colors, shadows, fonts, sizes)            │
└──────────────────┬──────────────────────────┘
                   │ @import
┌──────────────────▼──────────────────────────┐
│  css/styles.css  (layout + components)      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  index.html      (structure)                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  js/*.js         (audio — leave alone for    │
│                   pure style work)           │
└─────────────────────────────────────────────┘
```

---

## 9. Preset Style Directions

Use these as Cursor prompt seeds:

| Direction | Prompt snippet |
|-----------|----------------|
| **Soft Neumorphism** | "Reduce contrast between shadow-dark and shadow-light by 30%. Everything should feel pillowy." |
| **Sharp Frutiger** | "Tighter letter-spacing, bolder knob labels, accent only on interactive states." |
| **Minimal Dark** | "Remove dashed knob arcs. Flatten shadows to near-zero. Keep only accent glow on active elements." |
| **Hardware Inspired** | "Reference the Decapitator layout feel — denser controls, smaller panel padding — but keep neumorphic dark surfaces, not wood/metal textures." |

---

## 10. Checklist After Restyling

- [ ] Plugin panel readable at a glance in dark mode
- [ ] Knob indicators visible against the surface
- [ ] A/B and ON/OFF toggles have clear active vs inactive states
- [ ] Drop zone still shows dashed border on hover
- [ ] Progress bar playhead visible on hover
- [ ] No layout breakage on mobile (`< 520px` width)

---

**You own the art direction.** `tokens.css` is the single source of truth — point Cursor at it, describe the vibe, and iterate until GRANDA looks exactly how you want.
