# ॐ Sri Sai Satcharitra — Daily Reader & Parayan Suite

A sacred, distraction-free, 100% offline desktop reader and spiritual companion designed for daily reading (*Nitya Niyam*) and 7-day (*Saptah Parayan*) of **Sri Sai Satcharitra** (the life and teachings of Shirdi Sai Baba, translated by N.V. Gunaji).

![Shirdi Sai Baba](assets/saibaba.jpg)

---

## ✨ Key Features

### 1. 📖 Daily Reading Mode (*Nitya Niyam*)
- **Automated Daily Chapter Focus:** Automatically greets you with today's assigned chapter, sub-topics, and estimated reading time.
- **Mark Complete & Daily Streak:** Increments your daily devotion streak 🔥 and advances to the next chapter for tomorrow.
- **Auto-Bookmark Memory:** Automatically saves your exact scroll location using local storage—reopen anytime and resume seamlessly.
- **Overall Parayan Progress:** Visual progress bar tracking all 48 reading sections (Chapters 1 to 51, Epilogue & Aarti).

### 2. 🗓️ 7-Day Saptah Parayan Plan
Traditional Thursday-to-Wednesday 7-day reading schedule:
- **Day 1 (Thursday):** Chapters 1 to 7 — *Advent, First Arrival & Early Leelas*
- **Day 2 (Friday):** Chapters 8 to 15 — *Begging Food, Mode of Life & Miraculous Cures*
- **Day 3 (Saturday):** Chapters 16 to 22 — *Brahma-Jnana, Upadesh & Rescues from Serpents*
- **Day 4 (Sunday):** Chapters 23 to 29 — *Yoga & Onion, Chanak Leela & Bhajans*
- **Day 5 (Monday):** Chapters 30 to 35 — *Drawn to Shirdi & Greatness of Udi*
- **Day 6 (Tuesday):** Chapters 36 to 42 — *Chavadi Procession, Handi, Gita & Foretelling*
- **Day 7 (Wednesday):** Chapters 43 to 51 — *Maha-Samadhi, Reminiscences & Epilogue*

### 3. 🎨 Devotional Typography & Themes
- **3 Color Themes:**
  - **Warm Sepia** *(Default)* — Holy book parchment paper, soft on the eyes for early morning prayers.
  - **Day Light** — Crisp, clean ivory reading mode.
  - **Night Dark** — Deep serene slate with soft cream text for evening reading.
- **Custom Font Sizing:** Instant `A-`, `A`, and `A+` controls.
- **Classical Editorial Layout:** Centered reading measure (680px), generous line-height, and opening drop caps.

### 4. 🔔 Sacred Temple Bell Synthesizer
- Built using the **Web Audio API** (528Hz Solfeggio frequency with realistic harmonic overtones).
- Rings a gentle, peaceful temple chime upon completing today's chapter, or anytime by pressing the bell icon / `B` key. Zero external audio files required.

### 5. 🪔 The 4 Daily Aartis of Shirdi
Complete offline texts with translations and spiritual significance:
- **Kakad Aarti** *(Dawn 4:30 AM — The Morning Awakening)*
- **Madhyan Aarti** *(Noon 12:00 PM — The Afternoon Offering)*
- **Dhoop Aarti** *(Sunset 6:30 PM — The Evening Twilight Prayer)*
- **Shej Aarti** *(Night 10:00 PM — The Night Rest Prayer / Lullaby)*

### 6. ✨ 11 Assurances of Sai Baba (*11 Vachans*)
- Complete immortal promises of Sai Baba.
- Dynamic daily blessing drawer on the home dashboard with a one-click **"Draw New Blessing"** inspiration generator.

### 7. 🔍 Fast In-Chapter Search & Highlights
- Real-time word search (`Cmd+F` or Search button) highlighting all occurrences inside the chapter text.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `[` | Previous Chapter |
| `]` | Next Chapter |
| `T` | Cycle Themes (Sepia → Light → Dark) |
| `+` / `-` | Increase / Decrease Font Size |
| `B` | Ring Sacred Temple Bell 🔔 |
| `Esc` | Return to Dashboard / Close Popups |
| `?` | Show Shortcuts Helper |

---

## 🚀 How to Run

### Option 1: Instant Local Web View (Zero Install)
Simply open `index.html` in any web browser on your Mac, Windows, or Linux machine:
```bash
open index.html
```
The entire application runs **100% offline** without needing a local web server or internet connection.

### Option 2: Build Native macOS Desktop App (.dmg / .app)
Using [Pake](https://github.com/tw93/Pake):
```bash
# 1. Install Pake CLI globally
npm install -g pake-cli

# 2. Package into a native Mac app
pake index.html --name "SaiSatcharitra" --icon assets/icon.icns --use-local-file
```
This generates a fast, lightweight native macOS `.dmg` and `.app` directly in your folder!

---

## 📁 Project Structure

```text
sai_satcharitra_app/
├── index.html              # Main single-page application
├── style.css               # Devotional themes, layout & responsive typography
├── app.js                  # Engine: State, bookmarking, search, audio synthesizer
├── download_all.py         # Offline chapter ingestion & text sanitization script
├── assets/
│   ├── saibaba.jpg         # Authentic historical portrait of Shirdi Sai Baba
│   ├── icon.png            # High-res square icon
│   └── icon.icns           # Native macOS multi-resolution icon bundle
└── data/
    ├── bundle.js           # Self-contained offline data bundle (CORS-safe)
    ├── chapters.json       # All 48 chapters in structured JSON
    └── devotional.json     # 4 Daily Aartis & 11 Assurances
```

---

## 🙏 Credits & Dedication
Dedicated with reverence to **Shri Sadguru Sainath Maharaj of Shirdi**.

*Text based on the English translation of Shri Sai Satcharita by N.V. Gunaji.*
