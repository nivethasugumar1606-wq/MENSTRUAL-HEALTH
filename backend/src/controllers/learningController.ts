import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { calculateStreak, formatDate } from '../services/streakService.js';
import { calculateUnlockedDayInfo } from '../services/unlockService.js';

export async function getLearningProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { learningProgramStartedAt: true, createdAt: true }
    });

    const lessons = await prisma.learningProgress.findMany({
      where: { userId }
    });

    const quizzes = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const badges = await prisma.earnedBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    });

    const dailyActivities = await prisma.dailyLearningActivity.findMany({
      where: { userId },
      orderBy: { completedAt: 'asc' }
    });

    const clientDateQuery = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : undefined;

    const streak = calculateStreak(
      dailyActivities.map((a) => a.activityDate),
      clientDateQuery
    );

    // Calculate time-based unlock info (24h intervals from original program start)
    const highestCompletedDay = dailyActivities.reduce(
      (max, a) => Math.max(max, a.dayNumber),
      1
    );
    const startedAt = user?.learningProgramStartedAt || user?.createdAt || new Date();
    const unlockedDayInfo = calculateUnlockedDayInfo(startedAt, new Date(), highestCompletedDay);

    const lessonPoints = lessons.reduce((acc, l) => acc + l.pointsEarned, 0);
    const quizPoints = quizzes.reduce((acc, q) => acc + (q.score * 10), 0);
    const activityPoints = dailyActivities.length * 10;
    const totalPoints = lessonPoints + quizPoints + activityPoints;

    res.status(200).json({
      success: true,
      data: {
        totalPoints,
        completedLessonsCount: lessons.length,
        completedLessonIds: lessons.map((l) => l.lessonId),
        quizzesTakenCount: quizzes.length,
        recentQuizAttempts: quizzes.slice(0, 10).map((q) => ({
          id: q.id,
          quizId: q.quizId,
          score: q.score,
          totalQuestions: q.totalQuestions,
          passed: q.passed,
          createdAt: q.createdAt.toISOString()
        })),
        badges: badges.map((b) => ({
          id: b.id,
          badgeId: b.badgeId,
          badgeName: b.badgeName,
          badgeDescription: b.badgeDescription,
          badgeIcon: b.badgeIcon,
          earnedAt: b.earnedAt.toISOString()
        })),
        streak,
        completedDailyActivities: dailyActivities.map((a) => a.activityId),
        unlockedDayInfo
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function submitDailyActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { activityId, dayNumber, activityType, clientDate } = req.body;

    if (!activityId || typeof activityId !== 'string') {
      res.status(400).json({ success: false, message: 'Valid activityId is required.' });
      return;
    }

    const dayNum = Number(dayNumber);
    if (!dayNum || dayNum < 1 || dayNum > 50) {
      res.status(400).json({ success: false, message: 'dayNumber must be an integer between 1 and 50.' });
      return;
    }

    if (activityType !== 'mcq' && activityType !== 'myth_fact') {
      res.status(400).json({ success: false, message: 'activityType must be either "mcq" or "myth_fact".' });
      return;
    }

    // Server-side check for 24-hour day unlock eligibility
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { learningProgramStartedAt: true, createdAt: true }
    });

    const maxCompleted = await prisma.dailyLearningActivity.aggregate({
      where: { userId },
      _max: { dayNumber: true }
    });
    const highestCompletedDay = maxCompleted._max.dayNumber || 1;

    const startedAt = user?.learningProgramStartedAt || user?.createdAt || new Date();
    const unlockedDayInfo = calculateUnlockedDayInfo(startedAt, new Date(), highestCompletedDay);

    if (dayNum > unlockedDayInfo.maxUnlockedDay) {
      const remainingSec = unlockedDayInfo.nextDayUnlockSeconds;
      const hours = Math.floor(remainingSec / 3600);
      const minutes = Math.floor((remainingSec % 3600) / 60);
      res.status(403).json({
        success: false,
        message: `Day ${dayNum} is locked. Day ${unlockedDayInfo.maxUnlockedDay + 1} unlocks in ${hours}h ${minutes}m.`
      });
      return;
    }

    const effectiveDate = clientDate && /^\d{4}-\d{2}-\d{2}$/.test(String(clientDate))
      ? String(clientDate)
      : formatDate(new Date());

    // Idempotent insertion: Check if this activity has already been submitted by this user
    let activity = await prisma.dailyLearningActivity.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId
        }
      }
    });

    if (!activity) {
      activity = await prisma.dailyLearningActivity.create({
        data: {
          userId,
          activityId,
          dayNumber: dayNum,
          activityType,
          activityDate: effectiveDate
        }
      });
    }

    // Recalculate streak from persisted activity history
    const allActivities = await prisma.dailyLearningActivity.findMany({
      where: { userId },
      select: { activityDate: true }
    });

    const streak = calculateStreak(
      allActivities.map((a) => a.activityDate),
      effectiveDate
    );

    res.status(200).json({
      success: true,
      message: 'Learning activity completed and saved!',
      data: {
        activity: {
          id: activity.id,
          activityId: activity.activityId,
          dayNumber: activity.dayNumber,
          activityType: activity.activityType,
          activityDate: activity.activityDate,
          completedAt: activity.completedAt.toISOString()
        },
        streak,
        unlockedDayInfo
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function completeLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { lessonId, pointsEarned } = req.body;

    if (!lessonId || typeof lessonId !== 'string') {
      res.status(400).json({ success: false, message: 'Valid lessonId is required.' });
      return;
    }

    const points = typeof pointsEarned === 'number' && pointsEarned > 0 ? pointsEarned : 15;

    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      create: {
        userId,
        lessonId,
        completed: true,
        pointsEarned: points
      },
      update: {
        completed: true
      }
    });

    const totalCompleted = await prisma.learningProgress.count({ where: { userId } });
    if (totalCompleted >= 3) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'cycle-scholar' } },
        create: {
          userId,
          badgeId: 'cycle-scholar',
          badgeName: 'Cycle Scholar',
          badgeDescription: 'Completed 3 learning lessons! Expanding your knowledge of body science.',
          badgeIcon: 'book-open'
        },
        update: {}
      });
    }

    if (totalCompleted >= 6) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'body-champion' } },
        create: {
          userId,
          badgeId: 'body-champion',
          badgeName: 'Body Champion',
          badgeDescription: 'Completed all core body basics lessons! You are an expert on your growth.',
          badgeIcon: 'award'
        },
        update: {}
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lesson completed! Points awarded.',
      data: {
        lessonId: progress.lessonId,
        pointsEarned: progress.pointsEarned,
        completedAt: progress.completedAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function submitQuizAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { quizId, score, totalQuestions } = req.body;

    if (!quizId || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      res.status(400).json({ success: false, message: 'quizId, score, and totalQuestions are required.' });
      return;
    }

    const passed = score >= Math.ceil(totalQuestions * 0.6);

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalQuestions,
        passed
      }
    });

    if (quizId === 'myth-or-fact' && passed) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'myth-buster' } },
        create: {
          userId,
          badgeId: 'myth-buster',
          badgeName: 'Myth Buster',
          badgeDescription: 'Successfully debunked common period myths with scientific facts!',
          badgeIcon: 'shield-check'
        },
        update: {}
      });
    }

    const quizCount = await prisma.quizAttempt.count({ where: { userId } });
    if (quizCount >= 3) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'quiz-whiz' } },
        create: {
          userId,
          badgeId: 'quiz-whiz',
          badgeName: 'Quiz Whiz',
          badgeDescription: 'Completed 3 quiz challenges! Confident and informed.',
          badgeIcon: 'zap'
        },
        update: {}
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quiz results recorded! Great job learning today.',
      data: {
        id: attempt.id,
        quizId: attempt.quizId,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        createdAt: attempt.createdAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
