import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided or invalid format.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied. User context missing.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
      return;
    }

    next();
  };
};