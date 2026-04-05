import { z } from 'zod';

// Schema for creating a new financial record
export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().int().positive("Amount must be a positive integer (in cents)"),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, "Category is required"),
    date: z.string().datetime("Invalid date format. Must be an ISO 8601 string."),
    notes: z.string().optional(),
  })
});

// Schema for updating (all fields are optional)
export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().int().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
});