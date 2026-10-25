# Nurtura Architecture & Security Design

## 1. Design System — Exact Palette Compliance
The visual style meticulously adheres to the "Muted Mauve / Lavender Dreams" palette:
- **Background**: `#F5EFF8` (Light lilac surface, calm and inviting)
- **Secondary Lavender**: `#D7C4E8` (Delicate accent, borders, badges)
- **Muted Mauve**: `#B48AB8` (Primary brand color, buttons, active highlights)
- **Dusty Plum**: `#765477` (Secondary headings, muted icons, text accents)
- **Deep Plum**: `#342C40` (Primary high-contrast headings and readable body text)

Typography utilizes Google Fonts `Nunito` for high-legibility body text and `Quicksand` for soft, friendly headings.

---

## 2. Minor Privacy & Security Architecture
Given the sensitive nature of menstrual and teenage health data, privacy is enforced across the architecture:
1. **Minimal Data Collection**:
   - No real names, no exact birth dates, no school names, no phone numbers, and no home addresses.
   - Pseudonymous usernames and friendly optional nicknames only.
2. **Strict Server-Side Ownership Enforcement**:
   - Every read, update, and delete query enforces `where: { id, userId: req.userId }`.
   - Never trusts client-supplied IDs for authorization.
3. **Password Security**:
   - Passwords hashed with salt via `bcryptjs` (cost factor 10).
4. **Data Isolation & No Tracking**:
   - Zero advertising pixels, zero social graph tracking, zero external telemetry.
   - Menstrual dates and notes are excluded from server request/error logs.
5. **Right to Erasure & Export**:
   - Full JSON export available anytime.
   - Permanent account deletion performs cascading database removal of all related period, journal, quiz, and badge entries.

---

## 3. Period Tracker & Cycle Estimation Algorithm
In teenagers (ages 10–16), hormones fluctuate naturally as the hypothalamic-pituitary-ovarian axis matures.
The algorithm in `backend/src/services/cycleService.ts`:
1. **Never Forces a Fixed 28-Day Cycle**:
   - Accurately tracks days between consecutive period start dates (`dateDiffInDays`).
2. **Sufficient Data Verification**:
   - Requires at least 2 recorded cycles before producing an estimated window.
   - If < 2 cycles exist, presents a supportive explanatory message rather than fake data.
3. **Irregularity Detection & Normalization**:
   - If consecutive cycle lengths vary by more than 7 days, alerts the user with reassuring microcopy: *"Variation is completely normal and healthy during puberty!"*
4. **Supportive Language**:
   - Predictions are labeled as gentle estimates for packing supplies and building confidence, explicitly clarifying that they are not medical guarantees.

---

## 4. Reusable Medical Glossary System
Whenever a medical term appears for the first time in a lesson (e.g. *Menstruation*, *Uterus*, *Ovulation*, *Cervix*, *Hormones*, *Menstrual cramps*, *Vaginal discharge*):
- Rendered via `<GlossaryTooltip term="...">` with a subtle highlight and ✦ marker.
- Clicking or tapping reveals a plain-English, one-line definition and phonetic pronunciation.
- A global `<GlossaryModal />` enables full-text search and category filtering anytime.
