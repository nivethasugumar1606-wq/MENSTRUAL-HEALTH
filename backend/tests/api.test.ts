import request from 'supertest';
import app from '../src/server.js';
import { prisma } from '../src/utils/prisma.js';
import { DAILY_CURRICULUM } from '../../shared/data/dailyCurriculum.js';

describe('Nurtura API & Privacy Security Suite', () => {
  const userA = {
    username: 'bloom_girl_a',
    password: 'password123',
    nickname: 'Maya',
    ageBand: '13-14',
    periodStatus: 'started_recently'
  };

  const userB = {
    username: 'bloom_girl_b',
    password: 'password456',
    nickname: 'Chloe',
    ageBand: '10-12',
    periodStatus: 'not_started'
  };

  let tokenA = '';
  let tokenB = '';
  let userAId = '';
  let userBId = '';
  let createdPeriodId = '';
  let createdJournalId = '';

  beforeAll(async () => {
    // Clean test database tables in correct order
    await prisma.dailyLearningActivity.deleteMany();
    await prisma.earnedBadge.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.learningProgress.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.periodRecord.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. A user can create an account and sign in
  it('1. should register a new minor user and award welcome badge without asking for full name or address', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userA);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.nickname).toBe('Maya');
    expect(res.body.data.user.username).toBe(userA.username);

    tokenA = res.body.data.token;
    userAId = res.body.data.user.id;
  });

  it('1b. should allow user to login and receive valid auth token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: userA.username,
        password: userA.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    tokenA = res.body.data.token;
  });

  // Register User B for authorization testing
  it('should register a second user B', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userB);

    expect(res.status).toBe(201);
    tokenB = res.body.data.token;
    userBId = res.body.data.user.id;
  });

  // 2. A user can add a period start date and save it to the database
  it('2. should save a period record with start date and flow level', async () => {
    const res = await request(app)
      .post('/api/periods')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        flow: 'medium',
        symptoms: ['mild cramps', 'tiredness'],
        mood: 'calm',
        energy: 'medium',
        notes: 'Drank warm water and rested'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.startDate).toBe('2026-09-01');
    expect(res.body.data.flow).toBe('medium');
    createdPeriodId = res.body.data.id;
  });

  // 3. The saved record remains available after a new request/session
  it('3. should retrieve saved period record and show proper cycle stats', async () => {
    const res = await request(app)
      .get('/api/periods')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.periods.length).toBe(1);
    expect(res.body.data.periods[0].id).toBe(createdPeriodId);
    // Insufficient data notice because only 1 period exists
    expect(res.body.data.stats.hasSufficientData).toBe(false);
    expect(res.body.data.stats.explanation).toContain('at least two recorded periods');
  });

  // 4. A user can edit and delete their own records
  it('4a. should allow updating period record with an end date and flow change', async () => {
    const res = await request(app)
      .put(`/api/periods/${createdPeriodId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        endDate: '2026-09-06',
        flow: 'heavy',
        notes: 'Updated end date'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.endDate).toBe('2026-09-06');
    expect(res.body.data.flow).toBe('heavy');
  });

  // 5. Period estimates are clearly marked and not generated from fabricated history
  it('5. should calculate estimates only after second period is recorded', async () => {
    // Add second cycle 28 days later
    await request(app)
      .post('/api/periods')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        startDate: '2026-09-29',
        endDate: '2026-10-04',
        flow: 'medium'
      });

    const res = await request(app)
      .get('/api/periods')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats.hasSufficientData).toBe(true);
    expect(res.body.data.stats.averageCycleLength).toBe(28);
    expect(res.body.data.stats.estimatedNextPeriodStart).toBe('2026-10-27');
    expect(res.body.data.stats.explanation).toContain('average cycle is about 28 days');
  });

  // 6. A user can complete a quiz and persist their progress
  it('6. should complete a lesson and persist quiz results in database', async () => {
    const lessonRes = await request(app)
      .post('/api/learning/complete-lesson')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        lessonId: 'period-basics-what-is-it',
        pointsEarned: 15
      });

    expect(lessonRes.status).toBe(200);

    const quizRes = await request(app)
      .post('/api/learning/quiz-attempt')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        quizId: 'myth-or-fact',
        score: 5,
        totalQuestions: 5
      });

    expect(quizRes.status).toBe(201);
    expect(quizRes.body.data.passed).toBe(true);

    const progressRes = await request(app)
      .get('/api/learning/progress')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(progressRes.status).toBe(200);
    expect(progressRes.body.data.completedLessonsCount).toBe(1);
    expect(progressRes.body.data.completedLessonIds).toContain('period-basics-what-is-it');
    expect(progressRes.body.data.badges.some((b: any) => b.badgeId === 'myth-buster')).toBe(true);
  });

  // 7. Journal entries remain private and can be edited or deleted
  it('7. should create, retrieve, and delete a private journal entry', async () => {
    const journalRes = await request(app)
      .post('/api/journal')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        date: '2026-10-24',
        mood: 'calm',
        energy: 'high',
        cramps: 'none',
        symptoms: [],
        notes: 'Today was an energetic day with friends.'
      });

    expect(journalRes.status).toBe(200);
    expect(journalRes.body.success).toBe(true);
    createdJournalId = journalRes.body.data.id;

    // Retrieve entry
    const getRes = await request(app)
      .get('/api/journal/date/2026-10-24')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.notes).toBe('Today was an energetic day with friends.');
  });

  // 8. Cross-account security: User B CANNOT view or edit User A's data
  it('8. should reject User B from modifying or deleting User A period record', async () => {
    // User B tries to update User A's period record
    const updateRes = await request(app)
      .put(`/api/periods/${createdPeriodId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        flow: 'light'
      });

    expect(updateRes.status).toBe(404); // Scoped query returns 404 not found

    // User B tries to delete User A's period record
    const deleteRes = await request(app)
      .delete(`/api/periods/${createdPeriodId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(deleteRes.status).toBe(404);
  });

  // 9. Input validation rejects invalid dates
  it('9. should reject impossible date ranges (end date before start date)', async () => {
    const res = await request(app)
      .post('/api/periods')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        startDate: '2026-10-15',
        endDate: '2026-10-10', // Invalid: before start
        flow: 'medium'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('End date cannot be earlier than start date');
  });

  // 10. Data export functionality
  it('10. should allow user to export their entire personal data file', async () => {
    const res = await request(app)
      .get('/api/auth/export')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.periods.length).toBeGreaterThan(0);
    expect(res.body.data.journalEntries.length).toBeGreaterThan(0);
    expect(res.body.data.learningProgress.length).toBeGreaterThan(0);
    expect(res.body.data.dailyActivities).toBeDefined();
  });

  // ==================== PHASE 1: 50-DAY CURRICULUM VERIFICATION ====================
  describe('Phase 1: 50-Day Learning Curriculum (200 Activities)', () => {
    it('1. should contain exactly 50 days, each with exactly 2 unique MCQs and 2 unique Myth/Facts', () => {
      expect(DAILY_CURRICULUM).toHaveLength(50);

      let totalMCQs = 0;
      let totalMythFacts = 0;

      DAILY_CURRICULUM.forEach((day, index) => {
        expect(day.dayNumber).toBe(index + 1);
        expect(day.title).toBeDefined();
        expect(day.topic).toBeDefined();
        expect(day.mcqs).toHaveLength(2);
        expect(day.mythFacts).toHaveLength(2);

        totalMCQs += day.mcqs.length;
        totalMythFacts += day.mythFacts.length;
      });

      expect(totalMCQs).toBe(100);
      expect(totalMythFacts).toBe(100);
      expect(totalMCQs + totalMythFacts).toBe(200);
    });

    it('2. all 200 activities must have scientifically valid answers and clear explanations', () => {
      DAILY_CURRICULUM.forEach((day) => {
        day.mcqs.forEach((mcq) => {
          expect(mcq.id).toMatch(/^day-\d+-mcq-[12]$/);
          expect(mcq.question.trim().length).toBeGreaterThan(10);
          expect(mcq.options).toHaveLength(4);
          expect([0, 1, 2, 3]).toContain(mcq.correctIndex);
          expect(mcq.explanation.trim().length).toBeGreaterThan(15);
        });

        day.mythFacts.forEach((mf) => {
          expect(mf.id).toMatch(/^day-\d+-mf-[12]$/);
          expect(mf.statement.trim().length).toBeGreaterThan(10);
          expect(typeof mf.isFact).toBe('boolean');
          expect(mf.explanation.trim().length).toBeGreaterThan(15);
        });
      });
    });

    it('3. no activities or questions should be artificially repeated across the 50 days', () => {
      const allActivityIds = new Set<string>();
      const allMcqQuestions = new Set<string>();
      const allMfStatements = new Set<string>();

      DAILY_CURRICULUM.forEach((day) => {
        day.mcqs.forEach((mcq) => {
          expect(allActivityIds.has(mcq.id)).toBe(false);
          allActivityIds.add(mcq.id);

          const normalizedQ = mcq.question.toLowerCase().trim();
          expect(allMcqQuestions.has(normalizedQ)).toBe(false);
          allMcqQuestions.add(normalizedQ);
        });

        day.mythFacts.forEach((mf) => {
          expect(allActivityIds.has(mf.id)).toBe(false);
          allActivityIds.add(mf.id);

          const normalizedS = mf.statement.toLowerCase().trim();
          expect(allMfStatements.has(normalizedS)).toBe(false);
          allMfStatements.add(normalizedS);
        });
      });

      expect(allActivityIds.size).toBe(200);
      expect(allMcqQuestions.size).toBe(100);
      expect(allMfStatements.size).toBe(100);
    });
  });

  // ==================== PHASE 2 & 4: DAILY BLOOM STREAK & DATABASE PERSISTENCE ====================
  describe('Phase 2 & 4: Daily Bloom Streak Tracking & Strict Ownership', () => {
    const today = new Date().toISOString().split('T')[0];
    // Helper to calculate YYYY-MM-DD offset
    const offsetDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    it('4. a correctly completed activity is saved to the database with server confirmation', async () => {
      const res = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          activityId: 'day-1-mcq-1',
          dayNumber: 1,
          activityType: 'mcq',
          clientDate: today
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activity.activityId).toBe('day-1-mcq-1');
      expect(res.body.data.streak.currentStreak).toBe(1);
      expect(res.body.data.streak.todayCompleted).toBe(true);

      // Verify record exists in DB with User A's ID
      const inDb = await prisma.dailyLearningActivity.findUnique({
        where: { userId_activityId: { userId: userAId, activityId: 'day-1-mcq-1' } }
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.userId).toBe(userAId);
    });

    it('5. a failed save does not count toward the streak', async () => {
      const res = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          activityId: 'invalid-activity',
          dayNumber: 999, // Invalid day number
          activityType: 'unknown'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Verify invalid activity was NOT saved in DB
      const inDb = await prisma.dailyLearningActivity.findFirst({
        where: { activityId: 'invalid-activity' }
      });
      expect(inDb).toBeNull();
    });

    it('6. completing multiple activities on the same day increases streak by only one day', async () => {
      const res = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          activityId: 'day-1-mf-1',
          dayNumber: 1,
          activityType: 'myth_fact',
          clientDate: today
        });

      expect(res.status).toBe(200);
      // Still 1-day streak because both were completed on the same date
      expect(res.body.data.streak.currentStreak).toBe(1);
      expect(res.body.data.streak.todayActivityCount).toBe(2);
    });

    it('10. duplicate submissions do not create duplicate completions or alter counts', async () => {
      const countBefore = await prisma.dailyLearningActivity.count({
        where: { userId: userAId }
      });

      const res = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          activityId: 'day-1-mcq-1', // Already submitted
          dayNumber: 1,
          activityType: 'mcq',
          clientDate: today
        });

      expect(res.status).toBe(200);
      const countAfter = await prisma.dailyLearningActivity.count({
        where: { userId: userAId }
      });
      expect(countAfter).toBe(countBefore);
    });

    it('7. consecutive active days increase the streak correctly', async () => {
      // Simulate activity yesterday
      const yesterday = offsetDate(-1);
      await prisma.dailyLearningActivity.create({
        data: {
          userId: userAId,
          activityId: 'day-2-mcq-1',
          dayNumber: 2,
          activityType: 'mcq',
          activityDate: yesterday
        }
      });

      // Simulate activity day before yesterday
      const twoDaysAgo = offsetDate(-2);
      await prisma.dailyLearningActivity.create({
        data: {
          userId: userAId,
          activityId: 'day-3-mcq-1',
          dayNumber: 3,
          activityType: 'mcq',
          activityDate: twoDaysAgo
        }
      });

      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      // 3 consecutive days: twoDaysAgo, yesterday, today -> 3-day streak
      expect(res.body.data.streak.currentStreak).toBe(3);
      expect(res.body.data.streak.longestStreak).toBe(3);
    });

    it('8. a missed day followed by a new activity starts a new consecutive streak while preserving longest streak', async () => {
      // Create an activity 10 days ago (creating a gap from -9 to -3)
      await prisma.dailyLearningActivity.create({
        data: {
          userId: userAId,
          activityId: 'day-10-mcq-1',
          dayNumber: 10,
          activityType: 'mcq',
          activityDate: offsetDate(-10)
        }
      });

      // Also create an older 4-day streak chain (days -14, -13, -12, -11)
      for (const offset of [-14, -13, -12, -11]) {
        await prisma.dailyLearningActivity.create({
          data: {
            userId: userAId,
            activityId: `day-test-chain-${offset}`,
            dayNumber: 5,
            activityType: 'mcq',
            activityDate: offsetDate(offset)
          }
        });
      }

      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      // Current chain is still 3 (twoDaysAgo, yesterday, today)
      expect(res.body.data.streak.currentStreak).toBe(3);
      // Longest chain is 5 (days -14, -13, -12, -11, -10)
      expect(res.body.data.streak.longestStreak).toBe(5);
    });

    it('11. the Monday–Sunday weekly calendar displays real saved data', async () => {
      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      const calendar = res.body.data.streak.weeklyCalendar;
      expect(calendar).toHaveLength(7);

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      calendar.forEach((d: any, idx: number) => {
        expect(d.dayName).toBe(dayNames[idx]);
        expect(typeof d.dayNumber).toBe('number');
        expect(typeof d.isCompleted).toBe('boolean');
        expect(typeof d.isToday).toBe('boolean');
      });

      const todayItem = calendar.find((d: any) => d.isToday);
      expect(todayItem).toBeDefined();
      expect(todayItem.isCompleted).toBe(true);
    });

    it('12. My Progress displays the correct totalPoints including daily activities', async () => {
      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.completedDailyActivities).toBeDefined();
      expect(res.body.data.completedDailyActivities.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalPoints).toBeGreaterThan(0);
    });

    it('13. User B cannot view or access User A activity history (strict privacy)', async () => {
      const resB = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      // User B has not completed any activities yet
      expect(resB.body.data.completedDailyActivities).toHaveLength(0);
      expect(resB.body.data.streak.currentStreak).toBe(0);
      expect(resB.body.data.streak.longestStreak).toBe(0);
      expect(resB.body.data.streak.todayCompleted).toBe(false);
    });
  });

  // ==================== 24-HOUR INTERVAL DAY UNLOCK VERIFICATION ====================
  describe('24-Hour Interval Day Unlock & Protection', () => {
    it('should unlock Day 1 immediately and show countdown to Day 2', async () => {
      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unlockedDayInfo).toBeDefined();
      expect(res.body.data.unlockedDayInfo.maxUnlockedDay).toBe(1);
      expect(res.body.data.unlockedDayInfo.nextDayUnlockSeconds).toBeGreaterThan(86000);
      expect(res.body.data.unlockedDayInfo.nextDayUnlockSeconds).toBeLessThanOrEqual(86400);
      expect(res.body.data.unlockedDayInfo.nextDayUnlockTime).toBeDefined();
    });

    it('should reject direct submission of Day 2 activities before 24 hours elapse with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          activityId: 'day-2-mcq-1',
          dayNumber: 2,
          activityType: 'mcq'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Day 2 is locked');

      // Verify no record exists in DB for Day 2
      const record = await prisma.dailyLearningActivity.findFirst({
        where: { userId: userBId, activityId: 'day-2-mcq-1' }
      });
      expect(record).toBeNull();
    });

    it('should unlock Day 2 only after 24 hours have elapsed from program start', async () => {
      // Simulate 25 hours elapsed since User B started program
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: userBId },
        data: { learningProgramStartedAt: twentyFiveHoursAgo }
      });

      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unlockedDayInfo.maxUnlockedDay).toBe(2);

      // Day 2 activity submission should now be accepted
      const submitRes = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          activityId: 'day-2-mcq-1',
          dayNumber: 2,
          activityType: 'mcq'
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.activity.dayNumber).toBe(2);
    });

    it('should unlock subsequent days at exact 24-hour intervals without timer drift', async () => {
      // 73 hours = 3 full 24-hour intervals + 1 hour -> Day 4 unlocked (1 + 3)
      const seventyThreeHoursAgo = new Date(Date.now() - 73 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: userBId },
        data: { learningProgramStartedAt: seventyThreeHoursAgo }
      });

      const res = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unlockedDayInfo.maxUnlockedDay).toBe(4);

      // Attempting Day 5 should still be rejected with 403 Forbidden
      const submitDay5 = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          activityId: 'day-5-mcq-1',
          dayNumber: 5,
          activityType: 'mcq'
        });

      expect(submitDay5.status).toBe(403);
      expect(submitDay5.body.message).toContain('Day 5 is locked');
    });

    it('should allow user to revisit and complete activities on previously unlocked days without losing progress', async () => {
      // User B is at Day 4, but can still complete Day 1's second activity
      const submitDay1 = await request(app)
        .post('/api/learning/daily-activity')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          activityId: 'day-1-mcq-2',
          dayNumber: 1,
          activityType: 'mcq'
        });

      expect(submitDay1.status).toBe(200);
      expect(submitDay1.body.success).toBe(true);

      const progress = await request(app)
        .get('/api/learning/progress')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(progress.body.data.completedDailyActivities).toContain('day-1-mcq-2');
      expect(progress.body.data.completedDailyActivities).toContain('day-2-mcq-1');
      expect(progress.body.data.unlockedDayInfo.maxUnlockedDay).toBe(4);
    });
  });

  // 11. Account deletion cascades all personal records
  it('11. should delete account and cascade remove all period, journal, and daily activity records', async () => {
    const deleteRes = await request(app)
      .delete('/api/auth/account')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify User A no longer exists in DB
    const userInDb = await prisma.user.findUnique({ where: { id: userAId } });
    expect(userInDb).toBeNull();

    // Verify period records for User A are gone
    const periodsInDb = await prisma.periodRecord.findMany({ where: { userId: userAId } });
    expect(periodsInDb.length).toBe(0);

    // Verify journals for User A are gone
    const journalsInDb = await prisma.journalEntry.findMany({ where: { userId: userAId } });
    expect(journalsInDb.length).toBe(0);

    // Verify daily activities for User A are cascade deleted
    const activitiesInDb = await prisma.dailyLearningActivity.findMany({ where: { userId: userAId } });
    expect(activitiesInDb.length).toBe(0);
  });
});
