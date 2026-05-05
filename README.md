# B-Chess
A local chrome extension for analyzing Chess.com bot games using Stockfish
# B-Chess: Local Analyzer

B-Chess is a personal Chrome extension project that runs the Stockfish 10 engine locally in the browser to analyze chess games in real-time. 

## Features
* **Local Processing:** Runs Stockfish directly in the browser via Web Workers.
* **Smart Turn Detection:** Uses `chess.js` to validate legal moves and eliminate DOM-related visual bugs (ghost pieces, click errors).
* **Dynamic Arrows:** Draws non-intrusive, scroll-safe SVG arrows to show the best engine lines (MultiPV).
* **UI Customization:** Includes a draggable control panel with theme selection and board orientation syncing.

## Development & Architecture
This project was built primarily as an exercise in extension architecture, DOM manipulation, and AI-assisted development. The logic, problem-solving, and code architecture were directed by me, while the heavy lifting of code generation was handled collaboratively with an AI assistant (Gemini).

## 🛠️ How to Install
1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the `B-Chess` folder.
5. Open a computer game on Chess.com and click the "Motoru Çalıştır" button!

*Disclaimer: This is a personal educational tool. Using engine analysis in live, rated multiplayer games violates fair play policies.*

*_Disclaimer: This program still have some problems and bugs, but this version is likely to beat the 3200 elo bot_*
