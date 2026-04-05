import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// 1. Teach TypeScript about our custom request object
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

// 2. Authentication Middleware: Verifies the JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided or invalid format.' });
    return;
  }

  // Extract the token (e.g., "Bearer eyJhbGciOi...")
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and attach the payload to the request object
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
    req.user = decoded;
    
    // Pass control to the next middleware or controller
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// 3. Authorization Middleware: Checks User Roles (Factory Function)
export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Ensure the user exists (verifyToken should run before this)
    if (!req.user) {
       res.status(401).json({ error: 'Access denied. User context missing.' });
       return;
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
       res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
       return;
    }

    next();
  };
};