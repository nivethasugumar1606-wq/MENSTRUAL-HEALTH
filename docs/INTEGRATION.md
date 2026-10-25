# Team Integration Guide — Nurtura (Girls 10–16 Module)

## 1. Module Overview & Boundaries
Nurtura is designed as an **independent, modular menstrual health tracking and learning subsystem for girls ages 10 to 16**. It is developed as an autonomous module to be merged cleanly into the broader women's health platform without code rewrites or conflicting dependencies.

### Module Boundaries:
- **Scope**: Age-appropriate menstrual tracking (start/end dates, flow, mild symptoms), gamified puberty education, authentic product guide, private daily journaling, and a medical glossary.
- **Independence**: The module runs completely on its own during development (`localhost:5173` frontend, `localhost:5000` backend), using local SQLite or PostgreSQL.
- **No Adult Dashboard Overwrite**: Does not assume fertility/pregnancy tracking or adult health metrics; all predictions are clearly labeled as supportive estimates.

---

## 2. Shared Authentication & User Model
When merging with the adult women's website:
1. **Single Sign-On (SSO) / Shared JWT**:
   - The middleware in `backend/src/middleware/auth.ts` inspects standard `Authorization: Bearer <token>` headers.
   - If the main website uses a central JWT issuer, set `JWT_SECRET` in `.env` to match the main platform.
   - The token payload requires `{ userId: string }` or can be adjusted in `backend/src/utils/jwt.ts` to read your team's standard claim (e.g. `sub` or `id`).
2. **Database Schema Integration (`prisma/schema.prisma`)**:
   - If sharing a unified `User` table, simply attach foreign keys:
     ```prisma
     model User {
       id              String           @id @default(uuid())
       // ... main women's platform fields ...
       // Nurtura extensions:
       nickname        String?
       ageBand         String?          // "10-12" | "13-14" | "15-16"
       periodStatus    String?          // "not_started" | "started_recently" | "tracking_regularly"
       periods         PeriodRecord[]
       journalEntries  JournalEntry[]
       learningProgress LearningProgress[]
       quizAttempts    QuizAttempt[]
       badges          EarnedBadge[]
     }
     ```
   - Notice that all child tables (`PeriodRecord`, `JournalEntry`, `LearningProgress`, `EarnedBadge`) cascade delete on user deletion.

---

## 3. Route Mounting & Namespace Prefixing
All API routes are cleanly namespaced to avoid collision with the adult women's API:
- `/api/periods/*`
- `/api/journal/*`
- `/api/learning/*`
- `/api/auth/*` (or mount as `/api/kids-auth/*` if separate auth is preferred)

### Mounting in the Main Express App:
```typescript
import kidsPeriodRoutes from './kids-section/backend/src/routes/periodRoutes.js';
import kidsJournalRoutes from './kids-section/backend/src/routes/journalRoutes.js';
import kidsLearningRoutes from './kids-section/backend/src/routes/learningRoutes.js';

// Mount under a dedicated prefix or top-level:
app.use('/api/kids/periods', kidsPeriodRoutes);
app.use('/api/kids/journal', kidsJournalRoutes);
app.use('/api/kids/learning', kidsLearningRoutes);
```

---

## 4. Frontend Component Integration
The frontend is built with React and Tailwind CSS.
- The core features are cleanly isolated under `frontend/src/features/`:
  * `features/tracker/`: Cycle calendar, logging modal, stats card, history.
  * `features/learning/`: Lessons, Myth or Fact game, multiple choice quiz.
  * `features/products/`: 6-product guide with authentic illustrations & usage modals.
  * `features/journal/`: Private daily check-in.
  * `features/progress/`: Badges showcase and point tracker.
- You can render `App.tsx` directly inside a nested route (e.g., `<Route path="/teen-zone/*" element={<NurturaApp />} />`) or import individual feature components into a sub-navigation tab.

---

## 5. Environment Variables & Database Setup
For production with PostgreSQL:
```env
# Switch Prisma schema datasource provider from "sqlite" to "postgresql"
DATABASE_URL="postgresql://user:password@hostname:5432/lavender_bloom?schema=public"
JWT_SECRET="your_shared_team_secret_key"
FRONTEND_URL="https://your-main-domain.com"
```
Run `npx prisma migrate dev` or `npx prisma db push` to synchronize the schema.
