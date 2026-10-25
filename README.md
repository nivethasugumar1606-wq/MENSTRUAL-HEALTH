# 🌸 Nurtura — Menstrual Health Tracker & Learning Website for Girls (Ages 10–16)

Nurtura is a complete, private, and gentle menstrual health tracking and educational web application designed specifically for young girls aged 10 to 16. It serves as an autonomous, modular component ready for independent development and effortless future integration into a broader women's health platform.

---

## 🎨 Design System — "Muted Mauve / Lavender Dreams"

The visual style meticulously adheres to the provided color palette:

| Role | Color Hex | Visual Description |
| :--- | :--- | :--- |
| **Background** | `#F5EFF8` | Soft, soothing lavender tint |
| **Secondary Lavender** | `#D7C4E8` | Delicate accent, pill tags, and borders |
| **Muted Mauve** | `#B48AB8` | Primary button, active states, and brand highlights |
| **Dusty Plum** | `#765477` | Subheadings, icons, and accessible dark text |
| **Deep Plum** | `#342C40` | Main headings and high-contrast readable body text |

- **Typography**: Google Fonts `Nunito` for ultra-readable body text and `Quicksand` for friendly headings.
- **Friendly Cartoon Mascot**: "Petal" the bloom mascot, offering supportive tips, celebration confetti, and reassurance.

---

## 📱 Application Structure (7 Core Pages)

1. **Welcome / Onboarding**: Friendly intro to body changes, reassurance that cycles vary, and privacy-conscious registration.
2. **My Cycle (Period Tracker)**: Accessible monthly calendar, personalized cycle length calculations, irregular cycle detection, start/end dates, flow levels, and symptom logging.
3. **Learn & Play**:
   - **Period Basics & Body Science**: Expandable illustrated lessons with inline medical terms.
   - **Myth or Fact Game**: Interactive quiz debunking period misconceptions with scientific explanations.
   - **Quick Quiz**: Multiple choice challenges with explanations and retry options.
4. **Period Products Guide**: Authentic guides for Disposable Pads, Cloth Pads, Pantyliners, Period Underwear, Tampons, and Menstrual Cups with usage steps, changing frequency, and hygiene safety.
5. **My Body Journal**: Private daily check-ins for mood, energy, cramps, and personal thoughts.
6. **My Progress**: Educational achievements dashboard with learning points and badges, strictly separated from menstrual cycle data.
7. **Privacy & Settings**: Minor privacy safeguards, data export (JSON download), and complete account deletion with database cascade.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, bcryptjs, jsonwebtoken, Helmet, CORS, express-rate-limit.
- **Database**:
  - Local Development: SQLite (zero-config, portable `dev.db`).
  - Production Deployment: PostgreSQL (configured in `.env` via Prisma).

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Install Dependencies & Setup Database
In the root directory, run:
```bash
# Install backend dependencies & setup local SQLite database
cd backend
npm install
npx prisma generate
npx prisma db push

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start Local Development Servers
You can start both backend and frontend from their respective directories:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Backend starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser!

---

## 👤 Creating Your First Account

1. Open `http://localhost:5173`.
2. Click **"Create My Private Account"**.
3. Choose a friendly username (e.g., `flowergirl21`) and a password (at least 6 characters).
4. Enter an optional nickname (e.g. `Maya`) and select your age band (`10-12`, `13-14`, or `15-16`).
5. Click **"Complete Safe Signup"**.
6. You will instantly receive the **Curious Explorer** welcome badge and access your private cycle tracker!

*Note: You can also click **"Explore Lessons First"** to browse educational content without creating an account.*

---

## 🧪 Automated Testing

Comprehensive automated tests verify all 15 acceptance criteria:
- User registration and minor privacy guarantees
- Login and JWT authentication
- Period record CRUD (create, view, edit end date, delete)
- Cycle calculations (verified 2-cycle estimate requirement)
- Interactive quiz and lesson completion persistence
- Private body journal entries CRUD
- Cross-account ownership authorization (User B blocked from User A)
- Input validation (rejects impossible date ranges)
- Data export in JSON format
- Account deletion with database cascade

To execute the test suite:
```bash
cd backend
npm test
```

All 13 test suites execute and pass cleanly.

---

## 🛡️ Privacy & Minor Protection Safeguards

1. **No Identifying Data**: Never requires full legal names, home addresses, phone numbers, or school names.
2. **Encrypted at Rest & in Transit**: Passwords hashed with bcrypt.
3. **Strict Server-Side Ownership**: Every database operation verifies `where: { id, userId: req.userId }`.
4. **Zero Trackers**: No third-party ad pixels or tracking scripts.
5. **No Medical Stigmatization**: Cycles are never graded or turned into competitive leaderboards.
6. **Data Export & Deletion**: Minors can export their full data file or erase their account anytime.

---

## 🤝 Team Integration into Adult Women's Platform

Refer to [`docs/INTEGRATION.md`](./docs/INTEGRATION.md) for full instructions:
- **Module Boundaries**: Documented clear API and frontend separation.
- **Shared Auth**: Connects to the main website's JWT issuer via `JWT_SECRET`.
- **Database Schema**: Attaches to the parent platform's `User` table without name collisions.
- **Route Prefixes**: Cleanly mounted under `/api/kids/*` or `/api/*`.
