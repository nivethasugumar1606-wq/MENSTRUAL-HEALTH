import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validatePeriodDates, VALID_FLOWS, VALID_MOODS, VALID_ENERGIES, sanitizeString } from '../validators/schemas.js';
import { calculateCycleStatistics } from '../services/cycleService.js';

export async function listPeriods(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const periods = await prisma.periodRecord.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });

    const parsed = periods.map((p) => ({
      id: p.id,
      userId: p.userId,
      startDate: p.startDate,
      endDate: p.endDate,
      flow: p.flow,
      symptoms: JSON.parse(p.symptoms || '[]'),
      mood: p.mood,
      energy: p.energy,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }));

    const stats = calculateCycleStatistics(periods);

    res.status(200).json({
      success: true,
      data: {
        periods: parsed,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { startDate, endDate, flow, symptoms, mood, energy, notes } = req.body;

    const validation = validatePeriodDates(startDate, endDate);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.error || 'Invalid period dates.'
      });
      return;
    }

    // Check duplicate start date for this user
    const existing = await prisma.periodRecord.findFirst({
      where: {
        userId,
        startDate
      }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `A period log already exists for ${startDate}. You can edit that record instead.`
      });
      return;
    }

    const cleanFlow = VALID_FLOWS.includes(flow) ? flow : 'medium';
    const cleanSymptoms = Array.isArray(symptoms)
      ? symptoms.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const cleanMood = mood && VALID_MOODS.includes(mood) ? mood : null;
    const cleanEnergy = energy && VALID_ENERGIES.includes(energy) ? energy : null;
    const cleanNotes = notes ? sanitizeString(notes) : null;

    const newRecord = await prisma.periodRecord.create({
      data: {
        userId,
        startDate,
        endDate: endDate || null,
        flow: cleanFlow,
        symptoms: JSON.stringify(cleanSymptoms),
        mood: cleanMood,
        energy: cleanEnergy,
        notes: cleanNotes
      }
    });

    // Check if this was their first or third log, and award milestone badges
    const totalCount = await prisma.periodRecord.count({ where: { userId } });
    if (totalCount === 1) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'first-log' } },
        create: {
          userId,
          badgeId: 'first-log',
          badgeName: 'Cycle Starter',
          badgeDescription: 'Logged your very first period entry! Knowledge is power.',
          badgeIcon: 'calendar'
        },
        update: {}
      });
    } else if (totalCount === 3) {
      await prisma.earnedBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: 'cycle-detective' } },
        create: {
          userId,
          badgeId: 'cycle-detective',
          badgeName: 'Cycle Detective',
          badgeDescription: 'Logged 3 cycles! Nurtura can now offer personalized cycle estimates.',
          badgeIcon: 'compass'
        },
        update: {}
      });
    }

    // Return the created record
    res.status(201).json({
      success: true,
      message: 'Period record saved successfully!',
      data: {
        id: newRecord.id,
        userId: newRecord.userId,
        startDate: newRecord.startDate,
        endDate: newRecord.endDate,
        flow: newRecord.flow,
        symptoms: cleanSymptoms,
        mood: newRecord.mood,
        energy: newRecord.energy,
        notes: newRecord.notes,
        createdAt: newRecord.createdAt.toISOString(),
        updatedAt: newRecord.updatedAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const id = String(req.params.id);
    const { startDate, endDate, flow, symptoms, mood, energy, notes } = req.body;

    // Strict ownership check
    const existing = await prisma.periodRecord.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Period entry not found or you do not have permission to edit it.'
      });
      return;
    }

    const effectiveStart = startDate || existing.startDate;
    const effectiveEnd = endDate !== undefined ? endDate : existing.endDate;

    const validation = validatePeriodDates(effectiveStart, effectiveEnd);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.error || 'Invalid dates.'
      });
      return;
    }

    const cleanFlow = flow && VALID_FLOWS.includes(flow) ? flow : existing.flow;
    const cleanSymptoms = symptoms !== undefined
      ? (Array.isArray(symptoms) ? symptoms.map((s) => String(s).trim()).filter(Boolean) : [])
      : JSON.parse(existing.symptoms || '[]');
    const cleanMood = mood !== undefined ? (VALID_MOODS.includes(mood) ? mood : null) : existing.mood;
    const cleanEnergy = energy !== undefined ? (VALID_ENERGIES.includes(energy) ? energy : null) : existing.energy;
    const cleanNotes = notes !== undefined ? sanitizeString(notes) : existing.notes;

    const updated = await prisma.periodRecord.update({
      where: { id },
      data: {
        startDate: effectiveStart,
        endDate: effectiveEnd,
        flow: cleanFlow,
        symptoms: JSON.stringify(cleanSymptoms),
        mood: cleanMood,
        energy: cleanEnergy,
        notes: cleanNotes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Period entry updated successfully!',
      data: {
        id: updated.id,
        userId: updated.userId,
        startDate: updated.startDate,
        endDate: updated.endDate,
        flow: updated.flow,
        symptoms: cleanSymptoms,
        mood: updated.mood,
        energy: updated.energy,
        notes: updated.notes,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const id = String(req.params.id);

    // Strict ownership verification
    const existing = await prisma.periodRecord.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Period entry not found or you do not have permission to delete it.'
      });
      return;
    }

    await prisma.periodRecord.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Period entry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}
