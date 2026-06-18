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
`index.html` (hub) links to: `sky-jumper.html`, `snake.html`, `tictactoe.html`, `whackamole.html`, `memory.html`, `penalty.html`, `pong.html`, `rps.html`

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

## SEO / Search Console status (already done — don't redo)
- Google Search Console ownership verified 2026-06-17 via HTML file method (`google4b22a97b00cfa6cf.html` in repo root)
- `sitemap.xml` and `robots.txt` added and submitted
- Individual pages submitted via URL Inspection → Request Indexing
- Check `site:deweshtri.github.io` in Google to see current indexing progress before assuming setup needs to be redone
