import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateData = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Zod will parse the request body against our schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // If it passes, move to the next function (the Controller)
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable JSON response
        res.status(400).json({
          error: 'Invalid input data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(error);
    }
  };
};