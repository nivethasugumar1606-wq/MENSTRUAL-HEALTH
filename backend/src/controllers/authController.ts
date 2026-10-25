import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { VALID_AGE_BANDS, VALID_PERIOD_STATUSES, sanitizeString } from '../validators/schemas.js';

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password, nickname, ageBand, periodStatus } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Please choose a username with at least 3 characters.'
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Please create a secure password with at least 6 characters.'
      });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This username is already taken. Please try another friendly name.'
      });
      return;
    }

    const cleanNickname = nickname ? sanitizeString(nickname) : 'Friend';
    const selectedAgeBand = VALID_AGE_BANDS.includes(ageBand) ? ageBand : '13-14';
    const selectedPeriodStatus = VALID_PERIOD_STATUSES.includes(periodStatus)
      ? periodStatus
      : 'not_started';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash,
        nickname: cleanNickname,
        ageBand: selectedAgeBand,
        periodStatus: selectedPeriodStatus
      }
    });

    // Award welcome badge: "Curious Explorer"
    await prisma.earnedBadge.create({
      data: {
        userId: newUser.id,
        badgeId: 'welcome-bloom',
        badgeName: 'Curious Explorer',
        badgeDescription: 'Welcome to Nurtura! Took the first step to understand your body.',
        badgeIcon: 'sparkles'
      }
    });

    const token = generateToken({
      userId: newUser.id,
      username: newUser.username
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to Nurtura! Your private account has been created.',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          nickname: newUser.nickname,
          ageBand: newUser.ageBand,
          periodStatus: newUser.periodStatus,
          createdAt: newUser.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Please enter both username and password.'
      });
      return;
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Incorrect username or password. Please try again.'
      });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Incorrect username or password. Please try again.'
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully! Welcome back.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          ageBand: user.ageBand,
          periodStatus: user.periodStatus,
          createdAt: user.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        ageBand: true,
        periodStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nickname, ageBand, periodStatus } = req.body;

    const updateData: any = {};
    if (nickname) updateData.nickname = sanitizeString(nickname);
    if (ageBand && VALID_AGE_BANDS.includes(ageBand)) updateData.ageBand = ageBand;
    if (periodStatus && VALID_PERIOD_STATUSES.includes(periodStatus)) updateData.periodStatus = periodStatus;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nickname: true,
        ageBand: true,
        periodStatus: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportUserData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        ageBand: true,
        periodStatus: true,
        createdAt: true
      }
    });

    const periods = await prisma.periodRecord.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });

    const journals = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const learning = await prisma.learningProgress.findMany({
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

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      appName: 'Nurtura',
      version: '1.0.0',
      privacyNote: 'This export contains your personal health tracking and learning records.',
      user,
      periods: periods.map((p) => ({
        ...p,
        symptoms: JSON.parse(p.symptoms || '[]')
      })),
      journalEntries: journals.map((j) => ({
        ...j,
        symptoms: JSON.parse(j.symptoms || '[]')
      })),
      learningProgress: learning,
      quizAttempts: quizzes,
      badges,
      dailyActivities
    };

    res.status(200).json({
      success: true,
      data: exportPayload
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    // Perform cascade delete of the user account and all personal data
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Your account and all associated period, journal, and learning records have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
}
