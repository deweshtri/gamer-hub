# Gamer Hub

An 8-game browser arcade, "Made by Atharv Tripathi" credited on every page. Static HTML/CSS/JS, no build step or framework — each game is a self-contained `.html` file plus a shared `style.css`.

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000/

## Hosting & repo
- GitHub: github.com/deweshtri/gamer-hub (account: deweshtri)
- Live site: https://deweshtri.github.io/gamer-hub/ (GitHub Pages, branch `main`, root)

## Games
`index.html` (hub) links to: `sky-jumper.html`, `snake.html`, `tictactoe.html`, `whackamole.html`, `memory.html`, `penalty.html`, `pong.html`, `rps.html`, `zombie-survival.html`, `neon-drift.html`, `ninja-dash.html`, `tower-defense.html`, `cube-rush.html`, `cyber-heist.html`, `fishing-frenzy.html`, `astro-blaster.html`

## Retro look
All games use a retro arcade style (Press Start 2P / VT323 fonts, dark neon palette, CRT scanlines). The original 7 games (Sky Jumper, Tic-Tac-Toe, Whack-a-Mole, Memory, Penalty, Pong, RPS) get it from `retro.css`, linked right after each page's own `<style>`, plus neon colors / low pixel-ratio rendering in their canvas/3D code. Restyles must stay visual-only — never change gameplay, controls or hitboxes.

## Pause / resume (all games)
Every game page loads `pause.js` as the first script in `<head>` (`<script src="pause.js"></script>` right after `<meta charset>`). It adds a ❚❚ PAUSE button (replaces the topbar `.spacer`, or floats top-right if there's no topbar), a P key toggle (Esc/P to resume), and auto-pauses when the tab is hidden. It works by freezing time globally (rAF, setTimeout/setInterval, performance.now, Date.now, Web Audio) and blocking game input while paused — so games need no per-game pause code. **Any new game must include it the same way.**

## Background music
Every game except Cube Rush (which has its own beat-synced level music) loads `music.js` right after `pause.js`: `<script src="music.js?v=1" data-theme="<theme>"></script>`. It synthesizes a themed chiptune loop with Web Audio (no audio files) — themes live in the `THEMES` table (bpm, key, scale, chord progression, drum/bass/arp patterns). It starts on the first tap/key (autoplay rules), adds a ♪ ON/OFF button left of PAUSE (preference saved in `localStorage` key `gamerhub_music`), and pause.js freezes it automatically. New games should pick or add a theme.

## Landscape (phones / tablets sideways)
Every game page links `landscape.css` as the **last** stylesheet before `</head>`. Its rules only apply under `@media (orientation: landscape) and (max-height: 600px)`: compact topbar, smaller pause button, credit moved to a fixed bottom-left corner, and per-game side-by-side layouts (board/canvas left, info/controls right) scoped with `body:has(<unique element>)`. Layout only — no gameplay changes. New games must link it and add a scoped block if their layout overflows at ~844×390.

## Multiplayer control scheme
Every game has a "vs Bot" / "2 Players" mode-select screen:
- **Sky Jumper**: P1 Space / left-tap, P2 Enter / right-tap — two birds dodge shared obstacles, last alive wins
- **Snake**: P1 WASD, P2 arrow keys — walls wrap around (no death on wall hit), 30s timer
- **Tic-Tac-Toe**: both players click the same board in turns
- **Pong**: P1 W/S, P2 arrow keys (or drag your own half of the screen, or on-screen ▲/▼ buttons below the canvas — P1's pair always shown, P2's pair only in 2-Player mode)
- **Whack-a-Mole**: split screen, separate 3x3 grid per player
- **Memory Match**: turn-based; the player who finds a match goes again
- **Penalty Shootout**: P1 picks the shot zone, P2 picks the keeper dive zone (sequential/sealed choice); bot keeper has a 50% detection chance; 3 "confuse" tokens per match scramble the keeper-side controls
- **Rock Paper Scissors**: P1 then P2 pick in sequence on the same buttons (sealed — picks show as 🔒 until both are in, then reveal together); vs Bot uses a uniform-random AI; first to 3 round wins takes the match

## Design decision: Ronaldo/Messi in Penalty Shootout
Drawn as simple colored jersey shapes with numbers (7 and 10) and name labels — **not** real photos or likeness art, to avoid copyright/right-of-publicity issues. If adding more real athletes or characters later, keep using this same abstracted approach.

Same idea for games inspired by trademarked titles: Cube Rush is a Geometry Dash-style game with an original name and art — don't use another game's name or assets.

## SEO / Search Console status (already done — don't redo)
- Google Search Console ownership verified 2026-06-17 via HTML file method (`google4b22a97b00cfa6cf.html` in repo root)
- `sitemap.xml` and `robots.txt` added and submitted
- Individual pages submitted via URL Inspection → Request Indexing
- Check `site:deweshtri.github.io` in Google to see current indexing progress before assuming setup needs to be redone
