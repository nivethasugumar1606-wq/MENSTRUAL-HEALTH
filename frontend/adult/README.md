# MOONLIT — Menstrual Wellness Sanctuary

> **“Your body. Your rhythm. Your own little universe.”**

MOONLIT is a compassionate, beautifully illustrated digital sanctuary for menstrual wellness, cycle tracking, PCOS/PCOD clarity, and food freedom, built specifically for teen girls and young women.

---

## 🎨 Strict Visual Identity & Aesthetics

Following the reference board design direction:
1. **Strict Two-Colour Palette**:
   - **Violet (`#32234B`)**: Rich, muted plum/purple representing confidence, calm, and individuality.
   - **Sandal (`#F5ECE3`)**: Warm sand-beige representing comfort, softness, and warmth.
   - Lighter and darker tonal variations of these two colours provide contrast. No pink, green, teal, orange, or blue accents.
2. **Illustration Colour-Swap Rule**:
   - On **violet backgrounds**, doodles and botanical line art are **sandal-coloured**.
   - On **sandal backgrounds**, doodles and botanical line art are **violet-coloured**.
3. **Unique Hand-Drawn Girl Doodles**:
   - Every major page has its own distinct girl doodle and handwritten cursive annotation (e.g. *"Same girl. Different days. Same dreams."*, *"Small steps. Big changes."*, *"Good food is self care ♡"*, *"Your privacy matters ♡"*, *"You got this ♡"*, *"Prepared not worried ♡"*). No illustrations are ever repeated or flipped.
4. **Editorial Typography**:
   - Serif Headings: `Playfair Display`
   - Sans-Serif Body: `Plus Jakarta Sans`
   - Handwritten Annotations: `Caveat`

---

## 🧭 Standalone Multi-Page Architecture

Each section is an independent, beautifully composed standalone page with working back buttons (`‹ 01`, `‹ 02`, etc.), top navbar active states, and bottom thumb navigation:

| Route | Page | Background | Visual Doodle Scene |
|---|---|---|---|
| `#/home` | Welcome / Landing | Deep Violet | Girl with headphones reading by starry window |
| `#/board` | Master Poster Board | Sandal | Poster Canvas with Hero & 4 Core Screens |
| `#/decoder` | 01 Body & Food Decoder | Sandal | Girl cross-legged eating from wholesome bowl |
| `#/decode-body` | Decode My Body (Topics) | Sandal | Girl learning about bodily rhythms |
| `#/food-freedom` | Food Freedom | Sandal | Girl with balanced fruit and bread platter |
| `#/connect-dots` | Connect the Dots (Patterns) | Sandal | Girl connecting constellation patterns |
| `#/tiny-steps` | My Tiny Steps (Habits) | Sandal | Girl watering sprouting seedling |
| `#/privacy` | 02 My Privacy, My Rules | Sandal | Girl at laptop with bun, sleeping cat & plant |
| `#/privacy-lock` | App Lock & PIN Security | Sandal | Padlock & secret 4-digit code |
| `#/privacy-storage` | Data & Storage Transparency | Sandal | Local-first storage guarantees |
| `#/privacy-export` | Export / Delete Data | Sandal | Report generator & JSON backup |
| `#/privacy-notif` | Notification Preview | Sandal | Discreet neutral lock-screen reminders |
| `#/cycle` | 03 My Cycle | Sandal | April 2025 calendar & Daydreaming girl |
| `#/prep-guide` | 04 7-Day Prep Guide | Sandal | Countdown stepper, Do's checklist & Tote bag girl |

---

## ⚙️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:5173/

# 4. Run automated test suite
node tests/cycleCalculator.test.js

# 5. Build production bundle
npm run build
```

---

## 🔒 Medical Trust & Privacy Safeguards
- **100% Local-First**: All cycle logs and notes stay in browser `localStorage`. No cloud data leaks.
- **Explainable & Deterministic Math**: Cycle predictions and pain summaries explain exact data intervals without black-box AI hallucinations.
- **Medical Disclaimer**: MOONLIT is an educational and wellness tracking sanctuary, not a diagnostic device.

## Doctor Visit & Ask Mimi (integrated from hackcache)

- `#/heard`, `#/heard-schedule`, `#/heard-questions`, `#/heard-summary` — Doctor Visit hub (checklist, PCOS prompts, questions, tests, advice tracker, cycle comparison, printable summary). Code: `src/doctorVisit.js`.
- `#/ask-mimi` — offline chatbot with 3-tier safety triage. Code: `src/askMimi.js`, `src/logic/safety.js`, `src/data/faqData.js`.
- Store: `heardData` extended and `chatMessages` added in `src/data/store.js` (saved state is merged on load, so existing localStorage data keeps working).
- Tests: `node tests/doctorVisit.test.js`, `node tests/askMimiSafety.test.js`.
