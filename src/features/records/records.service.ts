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
  static async getUserRecords(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where: { userId, deletedAt: null },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.financialRecord.count({
        where: { userId, deletedAt: null }
      })
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
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
}