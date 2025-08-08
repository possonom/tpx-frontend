// src/application/services/DashboardService.ts
import { PracticeService } from "./PracticeService";
import { PharmacyService } from "./PharmacyService";
import { TransactionService } from "./TransactionService";

export interface DashboardStats {
  practices: {
    total: number;
    active: number;
    forSale: number;
    sold: number;
    averageValuation: number;
  };
  pharmacies: {
    total: number;
    active: number;
    forSale: number;
    sold: number;
    averageRevenue: number;
  };
  transactions: {
    total: number;
    active: number;
    completed: number;
    totalValue: number;
    totalCommission: number;
    averageValue: number;
  };
  monthlyTrends: Array<{
    month: string;
    practicesSold: number;
    pharmaciesSold: number;
    transactionValue: number;
    commission: number;
  }>;
}

export interface RecentActivity {
  id: string;
  type:
    | "PRACTICE_CREATED"
    | "PHARMACY_CREATED"
    | "TRANSACTION_UPDATED"
    | "STATUS_CHANGED";
  description: string;
  timestamp: Date;
  userId?: string;
  entityId: string;
  entityType: "PRACTICE" | "PHARMACY" | "TRANSACTION";
}

export class DashboardService {
  constructor(
    private practiceService: PracticeService,
    private pharmacyService: PharmacyService,
    private transactionService: TransactionService
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        practicesData,
        activePractices,
        forSalePractices,
        soldPractices,
        pharmaciesData,
        activePharmacies,
        forSalePharmacies,
        soldPharmacies,
        transactionStats,
      ] = await Promise.all([
        this.practiceService.getAllPractices({ limit: 1 }),
        this.practiceService.getPracticesByStatus("ACTIVE"),
        this.practiceService.getPracticesByStatus("FOR_SALE"),
        this.practiceService.getPracticesByStatus("SOLD"),
        this.pharmacyService.getAllPharmacies({ limit: 1 }),
        this.pharmacyService.getAllPharmacies({ status: "ACTIVE" }),
        this.pharmacyService.getAllPharmacies({ status: "FOR_SALE" }),
        this.pharmacyService.getAllPharmacies({ status: "SOLD" }),
        this.transactionService.getDashboardStats(),
      ]);

      // Calculate average valuations and revenues
      const allPractices = await this.practiceService.getAllPractices();
      const allPharmacies = await this.pharmacyService.getAllPharmacies();

      const averageValuation =
        allPractices.practices.length > 0
          ? allPractices.practices.reduce(
              (sum, p) => sum + p.valuation.estimatedValue,
              0
            ) / allPractices.practices.length
          : 0;

      const averageRevenue =
        allPharmacies.pharmacies.length > 0
          ? allPharmacies.pharmacies.reduce(
              (sum, p) => sum + p.revenue.annual,
              0
            ) / allPharmacies.pharmacies.length
          : 0;

      return {
        practices: {
          total: practicesData.total,
          active: activePractices.practices.length,
          forSale: forSalePractices.practices.length,
          sold: soldPractices.practices.length,
          averageValuation,
        },
        pharmacies: {
          total: pharmaciesData.total,
          active: activePharmacies.pharmacies.length,
          forSale: forSalePharmacies.pharmacies.length,
          sold: soldPharmacies.pharmacies.length,
          averageRevenue,
        },
        transactions: {
          total: transactionStats.totalTransactions,
          active: transactionStats.activeTransactions,
          completed: transactionStats.completedTransactions,
          totalValue: transactionStats.totalValue,
          totalCommission: transactionStats.totalCommission,
          averageValue: transactionStats.averageValue,
        },
        monthlyTrends: transactionStats.monthlyTrends.map((trend) => ({
          month: trend.month,
          practicesSold: 0, // Would need to implement tracking
          pharmaciesSold: 0, // Would need to implement tracking
          transactionValue: trend.value,
          commission: trend.commission,
        })),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    // In a real implementation, this would query an activity log table
    // For now, return mock data structure
    return [
      {
        id: "1",
        type: "PRACTICE_CREATED" as const,
        description:
          "New medical practice 'Downtown Family Medicine' added to the system",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        entityId: "practice-1",
        entityType: "PRACTICE" as const,
      },
      {
        id: "2",
        type: "TRANSACTION_UPDATED" as const,
        description: "Transaction T-001 moved to Due Diligence phase",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        entityId: "transaction-1",
        entityType: "TRANSACTION" as const,
      },
      {
        id: "3",
        type: "PHARMACY_CREATED" as const,
        description: "New pharmacy 'MedPlus Pharmacy' registered",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        entityId: "pharmacy-1",
        entityType: "PHARMACY" as const,
      },
    ].slice(0, limit);
  }

  async getPerformanceMetrics(
    timeframe: "week" | "month" | "quarter" | "year" = "month"
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const transactionMetrics =
      await this.transactionService.getTransactionMetrics({
        start: startDate,
        end: now,
      });

    return {
      period: timeframe,
      transactions: {
        count: transactionMetrics.totalTransactions,
        value: transactionMetrics.totalValue,
        commission: transactionMetrics.totalCommission,
        averageValue: transactionMetrics.averageValue,
      },
      efficiency: {
        averageClosingTime: 0, // Would calculate from transaction timelines
        successRate: 0, // Would calculate completed vs cancelled
        customerSatisfaction: 0, // Would come from surveys/feedback
      },
      growth: {
        transactionGrowth: 0, // Would compare with previous period
        revenueGrowth: 0, // Would compare commission growth
        clientGrowth: 0, // Would track new clients acquired
      },
    };
  }

  async getTopPerformers() {
    // In a real implementation, this would aggregate data by broker/user
    return {
      brokers: [
        {
          id: "broker-1",
          name: "John Smith",
          transactionsCompleted: 12,
          totalValue: 2400000,
          commission: 120000,
        },
        {
          id: "broker-2",
          name: "Sarah Johnson",
          transactionsCompleted: 8,
          totalValue: 1800000,
          commission: 90000,
        },
      ],
      assets: {
        topPractices: [
          {
            id: "practice-1",
            name: "Downtown Cardiology",
            valuation: 850000,
            specialty: "CARDIOLOGY",
          },
        ],
        topPharmacies: [
          {
            id: "pharmacy-1",
            name: "CityMed Pharmacy",
            revenue: 2100000,
            type: "RETAIL",
          },
        ],
      },
    };
  }

  async getAlerts() {
    const [expiringLicenses, stalledTransactions] = await Promise.all([
      this.pharmacyService.getPharmaciesWithExpiringLicenses(30),
      this.transactionService.getAllTransactions({
        status: "DUE_DILIGENCE",
        // Would add date filter for transactions stuck too long
      }),
    ]);

    return {
      critical: [
        ...expiringLicenses.map((pharmacy) => ({
          id: `license-${pharmacy.id}`,
          type: "LICENSE_EXPIRY" as const,
          message: `License expiring soon for ${pharmacy.name}`,
          entityId: pharmacy.id,
          entityType: "PHARMACY" as const,
          dueDate: pharmacy.licenses.find((l) => l.status === "ACTIVE")
            ?.expiryDate,
        })),
      ],
      warnings: [
        ...stalledTransactions.transactions
          .filter((t) => {
            // Filter transactions that have been in due diligence for over 30 days
            const thirtyDaysAgo = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            );
            return new Date(t.createdAt) < thirtyDaysAgo;
          })
          .map((transaction) => ({
            id: `stalled-${transaction.id}`,
            type: "STALLED_TRANSACTION" as const,
            message: `Transaction ${transaction.id} has been in due diligence for over 30 days`,
            entityId: transaction.id,
            entityType: "TRANSACTION" as const,
          })),
      ],
      info: [],
    };
  }
}
