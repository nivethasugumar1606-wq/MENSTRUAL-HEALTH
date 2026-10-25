import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  isValidDateString,
  VALID_MOODS,
  VALID_ENERGIES,
  VALID_CRAMPS,
  sanitizeString
} from '../validators/schemas.js';

export async function listJournalEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const parsed = entries.map((e) => ({
      id: e.id,
      userId: e.userId,
      date: e.date,
      mood: e.mood,
      energy: e.energy,
      cramps: e.cramps,
      symptoms: JSON.parse(e.symptoms || '[]'),
      notes: e.notes,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { date, mood, energy, cramps, symptoms, notes } = req.body;

    if (!date || !isValidDateString(date)) {
      res.status(400).json({
        success: false,
        message: 'A valid date in YYYY-MM-DD format is required.'
      });
      return;
    }

    const cleanMood = VALID_MOODS.includes(mood) ? mood : 'calm';
    const cleanEnergy = VALID_ENERGIES.includes(energy) ? energy : 'medium';
    const cleanCramps = VALID_CRAMPS.includes(cramps) ? cramps : 'none';
    const cleanSymptoms = Array.isArray(symptoms)
      ? symptoms.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const cleanNotes = notes ? sanitizeString(notes) : null;

    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_date: {
          userId,
          date
        }
      },
      create: {
        userId,
        date,
        mood: cleanMood,
        energy: cleanEnergy,
        cramps: cleanCramps,
        symptoms: JSON.stringify(cleanSymptoms),
        notes: cleanNotes
      },
      update: {
        mood: cleanMood,
        energy: cleanEnergy,
        cramps: cleanCramps,
        symptoms: JSON.stringify(cleanSymptoms),
        notes: cleanNotes
      }
    });

    // Milestone check: check journal entries count for Self-Care Star badge
    const count = await prisma.journalEntry.count({ where: { userId } });
    if (count === 1) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'first-journal' } },
        create: {
          userId,
          badgeId: 'first-journal',
          badgeName: 'Mindful Moment',
          badgeDescription: 'Checked in with your mind and body! Journaling builds self-awareness.',
          badgeIcon: 'heart'
        },
        update: {}
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry saved safely in your private vault!',
      data: {
        id: entry.id,
        userId: entry.userId,
        date: entry.date,
        mood: entry.mood,
        energy: entry.energy,
        cramps: entry.cramps,
        symptoms: cleanSymptoms,
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getJournalEntryByDate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const date = String(req.params.date);

    if (!date || !isValidDateString(date)) {
      res.status(400).json({ success: false, message: 'Invalid date parameter.' });
      return;
    }

    const entry = await prisma.journalEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    });

    if (!entry) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: entry.id,
        userId: entry.userId,
        date: entry.date,
        mood: entry.mood,
        energy: entry.energy,
        cramps: entry.cramps,
        symptoms: JSON.parse(entry.symptoms || '[]'),
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const id = String(req.params.id);

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Journal entry not found or you do not have permission to delete it.'
      });
      return;
    }

    await prisma.journalEntry.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted.'
    });
  } catch (error) {
    next(error);
  }
}
