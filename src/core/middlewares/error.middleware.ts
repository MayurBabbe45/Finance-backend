import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.url} >>`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Only send the stack trace if we are NOT in production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};