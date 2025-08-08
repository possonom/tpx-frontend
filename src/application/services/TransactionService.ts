// src/application/services/TransactionService.ts
import {
  BrokerageTransaction,
  TransactionStatus,
  TransactionType,
} from "@domain/domain/entities/Transaction";
import { z } from "zod";

export const CreateTransactionSchema = z.object({
  type: z.enum([
    "PRACTICE_SALE",
    "PHARMACY_SALE",
    "MERGER",
    "ACQUISITION",
    "PARTNERSHIP",
  ]),
  seller: z.object({
    type: z.enum(["INDIVIDUAL", "CORPORATION", "PARTNERSHIP", "LLC", "TRUST"]),
    name: z.string().min(1),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().min(1),
      mobile: z.string().optional(),
    }),
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
  }),
  buyer: z.object({
    type: z.enum(["INDIVIDUAL", "CORPORATION", "PARTNERSHIP", "LLC", "TRUST"]),
    name: z.string().min(1),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().min(1),
      mobile: z.string().optional(),
    }),
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
  }),
  asset: z.object({
    id: z.string().uuid(),
    type: z.enum(["PRACTICE", "PHARMACY"]),
    name: z.string().min(1),
    estimatedValue: z.number().positive(),
  }),
  timeline: z.object({
    expectedClosingDate: z.string().or(z.date()),
    dueDiligenceDeadline: z.string().or(z.date()).optional(),
    contractSigningDate: z.string().or(z.date()).optional(),
  }),
  commission: z.object({
    rate: z.number().min(0).max(100),
    amount: z.number().positive(),
    paymentSchedule: z.enum([
      "UPFRONT",
      "ON_CLOSING",
      "SPLIT",
      "MILESTONE_BASED",
    ]),
  }),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial().extend(
  {
    id: z.string().uuid(),
    status: z
      .enum([
        "INITIATED",
        "DUE_DILIGENCE",
        "NEGOTIATION",
        "CONTRACT_SIGNED",
        "CLOSING",
        "COMPLETED",
        "CANCELLED",
      ])
      .optional(),
  }
);

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  sellerId?: string;
  buyerId?: string;
  assetType?: "PRACTICE" | "PHARMACY";
  minValue?: number;
  maxValue?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "expectedClosingDate" | "estimatedValue" | "status";
  sortOrder?: "asc" | "desc";
}

export interface TransactionRepository {
  findAll(
    filters?: TransactionFilters
  ): Promise<{ transactions: BrokerageTransaction[]; total: number }>;
  findById(id: string): Promise<BrokerageTransaction | null>;
  create(data: CreateTransactionInput): Promise<BrokerageTransaction>;
  update(
    id: string,
    data: Partial<UpdateTransactionInput>
  ): Promise<BrokerageTransaction>;
  delete(id: string): Promise<void>;
  updateStatus(
    id: string,
    status: TransactionStatus
  ): Promise<BrokerageTransaction>;
  findByStatus(status: TransactionStatus): Promise<BrokerageTransaction[]>;
  findByParty(partyId: string): Promise<BrokerageTransaction[]>;
  getTransactionMetrics(dateRange?: {
    start: Date;
    end: Date;
  }): Promise<TransactionMetrics>;
}

export interface TransactionMetrics {
  totalTransactions: number;
  totalValue: number;
  averageValue: number;
  totalCommission: number;
  statusBreakdown: Record<TransactionStatus, number>;
  typeBreakdown: Record<TransactionType, number>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    value: number;
    commission: number;
  }>;
}

export class TransactionService {
  constructor(private repository: TransactionRepository) {}

  async getAllTransactions(filters?: TransactionFilters) {
    return this.repository.findAll(filters);
  }

  async getTransactionById(id: string) {
    if (!id) throw new Error("Transaction ID is required");
    return this.repository.findById(id);
  }

  async createTransaction(data: CreateTransactionInput) {
    const validatedData = CreateTransactionSchema.parse(data);
    return this.repository.create(validatedData);
  }

  async updateTransaction(id: string, data: Partial<UpdateTransactionInput>) {
    if (!id) throw new Error("Transaction ID is required");

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided for update");
    }

    const validatedData = UpdateTransactionSchema.partial().parse({
      ...data,
      id,
    });
    return this.repository.update(id, validatedData);
  }

  async deleteTransaction(id: string) {
    if (!id) throw new Error("Transaction ID is required");
    return this.repository.delete(id);
  }

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    if (!id) throw new Error("Transaction ID is required");

    // Validate status transition
    const transaction = await this.repository.findById(id);
    if (!transaction) throw new Error("Transaction not found");

    if (!this.isValidStatusTransition(transaction.status, status)) {
      throw new Error(
        `Invalid status transition from ${transaction.status} to ${status}`
      );
    }

    return this.repository.updateStatus(id, status);
  }

  async getTransactionsByStatus(status: TransactionStatus) {
    return this.repository.findByStatus(status);
  }

  async getTransactionsByParty(partyId: string) {
    if (!partyId) throw new Error("Party ID is required");
    return this.repository.findByParty(partyId);
  }

  async getTransactionMetrics(dateRange?: { start: Date; end: Date }) {
    return this.repository.getTransactionMetrics(dateRange);
  }

  async getDashboardStats() {
    const [
      allTransactions,
      activeTransactions,
      completedTransactions,
      metrics,
    ] = await Promise.all([
      this.repository.findAll({ limit: 1 }),
      this.repository.findByStatus("INITIATED"),
      this.repository.findByStatus("COMPLETED"),
      this.repository.getTransactionMetrics(),
    ]);

    return {
      totalTransactions: allTransactions.total,
      activeTransactions: activeTransactions.length,
      completedTransactions: completedTransactions.length,
      totalValue: metrics.totalValue,
      totalCommission: metrics.totalCommission,
      averageValue: metrics.averageValue,
      monthlyTrends: metrics.monthlyTrends.slice(-12), // Last 12 months
    };
  }

  async validateTransactionData(
    data: CreateTransactionInput
  ): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      CreateTransactionSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map(
            (err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`
          ),
        };
      }
      return { isValid: false, errors: ["Unknown validation error"] };
    }
  }

  async calculateDueDiligenceProgress(transactionId: string): Promise<{
    percentage: number;
    completedItems: string[];
    pendingItems: string[];
  }> {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Sample due diligence checklist - would be configurable based on transaction type
    const checklist = [
      "Financial statements review",
      "Legal documentation verification",
      "Asset valuation confirmation",
      "License verification",
      "Compliance audit",
      "Insurance review",
      "Staff contracts review",
      "Lease agreements review",
    ];

    // In a real implementation, this would check against actual completed items
    const completedItems: string[] = [];
    const pendingItems = [...checklist];

    return {
      percentage: (completedItems.length / checklist.length) * 100,
      completedItems,
      pendingItems,
    };
  }

  private isValidStatusTransition(
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus
  ): boolean {
    const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
      INITIATED: ["DUE_DILIGENCE", "CANCELLED"],
      DUE_DILIGENCE: ["NEGOTIATION", "CANCELLED"],
      NEGOTIATION: ["CONTRACT_SIGNED", "DUE_DILIGENCE", "CANCELLED"],
      CONTRACT_SIGNED: ["CLOSING", "CANCELLED"],
      CLOSING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: ["INITIATED"], // Allow reactivation
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
