import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateData = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    
    // 1. Use safeParse to avoid try/catch blocks and 'unknown' type errors
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // 2. If validation fails, result.error is strongly typed by Zod
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid input data',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
      return;
    }

    // 3. If validation succeeds, move to the controller
    next();
  };
};