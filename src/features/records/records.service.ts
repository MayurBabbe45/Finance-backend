import prisma from '../../config/prisma';
import { RecordType } from '@prisma/client';

// Define an interface for the incoming data to keep TypeScript happy
interface CreateRecordDTO {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
}

export class RecordsService {
  
  // 1. Create a new record
  static async createRecord(userId: string, data: CreateRecordDTO) {
    return prisma.financialRecord.create({
      data: {
        ...data,
        date: new Date(data.date), // Convert the ISO string to a JS Date object
        userId,
      },
    });
  }

  // 2. Get active records for a specific user (with Pagination)
  static async getUserRecords(
    userId: string, 
    page: number, 
    limit: number, 
    filters: { type?: string, category?: string } // <-- Add filters parameter
  ) {
    const skip = (page - 1) * limit;

    // Build the dynamic WHERE clause based on what the user wants to filter
    const whereClause: any = { userId, deletedAt: null };
    if (filters.type) whereClause.type = filters.type;
    if (filters.category) whereClause.category = filters.category;

    const records = await prisma.financialRecord.findMany({
      where: whereClause, // <-- Pass the dynamic clause here
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    });

    const total = await prisma.financialRecord.count({ where: whereClause });

    return {
      data: records,
      meta: { total, page, totalPages: Math.ceil(total / limit) },
    };
  }

  // 3. Soft-delete a record
  static async deleteRecord(recordId: string, userId: string) {
    // SECURITY CHECK: Ensure the record belongs to the user trying to delete it
    const record = await prisma.financialRecord.findFirst({
      where: { id: recordId, userId, deletedAt: null }
    });

    if (!record) {
      throw new Error('Record not found or you are not authorized to delete it.');
    }

    // Perform the soft delete
    return prisma.financialRecord.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });
  }

  // Add this inside RecordsService class
  static async updateRecord(id: string, userId: string, data: any) {
    // Ensure the record belongs to the user and isn't deleted
    const existing = await prisma.financialRecord.findFirst({
      where: { id, userId, deletedAt: null }
    });

    if (!existing) throw new Error('Record not found or unauthorized');

    return await prisma.financialRecord.update({
      where: { id },
      data
    });
  }
}