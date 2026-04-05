import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;
      
      // Basic fallback validation (We will add Zod for strict validation later)
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await AuthService.register(email, password, role);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      // If the service throws an error (e.g., "User already exists"), we catch it here
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
      // 401 Unauthorized for bad credentials
      res.status(401).json({ error: error.message });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    // We cast req to any here briefly just for the test, but in our 
    // future feature controllers we will strictly use AuthRequest.
    const userPayload = (req as any).user;
    
    res.status(200).json({ 
      message: 'You have accessed a protected route!',
      userContext: userPayload 
    });
  }
}