import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    nickname: string;
    ageBand: string;
    periodStatus: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      res.status(401).json({
        success: false,
        message: 'Your session has expired or is invalid. Please sign in again.'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        ageBand: true,
        periodStatus: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Account not found. Please sign in again.'
      });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
