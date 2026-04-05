import prisma from '../../config/prisma';

export class DashboardService {
  static async getUserSummary(userId: string) {
    const incomeResult = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'INCOME', deletedAt: null },
    });

    const expenseResult = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'EXPENSE', deletedAt: null },
    });

    const expensesByCategory = await prisma.financialRecord.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', deletedAt: null },
      _sum: { amount: true },
    });

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    const expenseDistribution = expensesByCategory.map(item => ({
      name: item.category,
      value: item._sum.amount || 0,
    }));

    const recentActivity = await prisma.financialRecord.findMany({
      where: { userId, deletedAt: null },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return {
      metrics: { totalIncome, totalExpense, netBalance },
      expenseDistribution,
      recentActivity,
    };
  }
}