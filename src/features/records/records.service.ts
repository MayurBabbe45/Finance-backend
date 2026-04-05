import prisma from '../../config/prisma';
import { RecordType } from '@prisma/client';

interface CreateRecordDTO {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
}

export class RecordsService {
  static async createRecord(userId: string, data: CreateRecordDTO) {
    return prisma.financialRecord.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId,
      },
    });
  }

  static async getUserRecords(
    userId: string,
    page: number,
    limit: number,
    filters: { type?: string; category?: string }
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = { userId, deletedAt: null };
    if (filters.type) whereClause.type = filters.type;
    if (filters.category) whereClause.category = filters.category;

    const records = await prisma.financialRecord.findMany({
      where: whereClause,
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

  static async deleteRecord(recordId: string, userId: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id: recordId, userId, deletedAt: null },
    });

    if (!record) {
      throw new Error('Record not found or you are not authorized to delete it.');
    }

    return prisma.financialRecord.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });
  }

  static async updateRecord(id: string, userId: string, data: any) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) throw new Error('Record not found or unauthorized');

    return await prisma.financialRecord.update({
      where: { id },
      data,
    });
  }
}