import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await AuthService.register(email, password, role);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const data = await AuthService.login(email, password);
      res.status(200).json({ message: 'Login successful', ...data });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    const userPayload = (req as any).user;

    res.status(200).json({
      message: 'You have accessed a protected route!',
      userContext: userPayload,
    });
  }
}