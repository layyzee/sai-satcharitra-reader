# Sri Sai Satcharitra - Daily Offline Reader

## Project Overview
A 100% offline daily devotional reading app for Sri Sai Satcharitra (51 chapters, 48 daily reading sections) with streak tracking, 7-day Saptah Parayan schedule, daily blessings, and a Web Audio synthesized temple bell.

## Architecture
- `index.html`: Main desktop/mobile responsive UI.
- `style.css`: Clean parchment typography with 3 themes (Sepia Holy Book, Day Light, Night Dark).
- `app.js`: Client-side logic for chapter rendering, font sizing, bookmarks, streak calculation, search, and Web Audio bell chime.
- `data/bundle.js`: Encapsulates full text into `window.SAI_CHAPTERS` to avoid local `file://` CORS restrictions in desktop webviews.
- `data/chapters.json`: Raw structured JSON of all 48 reading sections scraped from authentic sources.
- `data/devotional.json`: 11 Baba Vachans and 4 daily Aarti lyrics.
- `assets/icon.icns` & `assets/icon.png`: Official Shirdi Sai Baba portrait icons.
- `SaiSatcharitra.dmg`: Compiled native macOS Apple Silicon desktop app packaged with `pake-cli`.

## Development Commands
- Open locally: Open `index.html` in any modern web browser.
- Rebuild desktop app: `pake file://$(pwd)/index.html --name "SaiSatcharitra" --icon assets/icon.icns --width 1200 --height 850 --targets dmg`
- Git Repo: `https://github.com/layyzee/sai-satcharitra-reader`
