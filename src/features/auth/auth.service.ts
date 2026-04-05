import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const SALT_ROUNDS = 10;

export class AuthService {
  
  // 1. Register a new user
  static async register(email: string, password: string, role: Role = 'VIEWER') {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    // Remove password hash from the returned object for security
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 2. Login an existing user
  static async login(email: string, password: string) {
    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status === 'INACTIVE') {
      throw new Error('User account is deactivated');
    }

    // Generate the JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Return the token and user data (excluding password)
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}