import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const SALT_ROUNDS = 10;

export class AuthService {
  static async register(email: string, password: string, role: Role = 'VIEWER') {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'INACTIVE') {
      throw new Error('User account is deactivated');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}