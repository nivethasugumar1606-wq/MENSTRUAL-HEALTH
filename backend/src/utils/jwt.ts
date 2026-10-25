import jwt from 'jsonwebtoken';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'lavender_bloom_default_dev_secret_key_2026';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as any;

export interface JwtPayload {
  userId: string;
  username: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
