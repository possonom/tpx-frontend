// src/domain/entities/Transaction.ts
import { MedicalPractice } from "./Practice";
import { Pharmacy } from "./Pharmacy";
import { Address, ContactInfo, VerificationStatus } from "./shared";

export type TransactionType =
  | "PRACTICE_SALE"
  | "PHARMACY_SALE"
  | "MERGER"
  | "ACQUISITION"
  | "PARTNERSHIP";

export type TransactionStatus =
  | "INITIATED"
  | "DUE_DILIGENCE"
  | "NEGOTIATION"
  | "CONTRACT_SIGNED"
  | "CLOSING"
  | "COMPLETED"
  | "CANCELLED";

export type PartyType =
  | "INDIVIDUAL"
  | "CORPORATION"
  | "PARTNERSHIP"
  | "LLC"
  | "TRUST";

export interface Party {
  id: string;
  type: PartyType;
  name: string;
  contact: ContactInfo;
  verificationStatus: VerificationStatus;
  documents: KYCDocument[];
  registrationNumber?: string;
  taxId?: string;
}

export interface KYCDocument {
  id: string;
  type:
    | "ID"
    | "PASSPORT"
    | "LICENSE"
    | "INCORPORATION"
    | "TAX_CERT"
    | "BANK_STATEMENT";
  documentNumber?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  documentUrl: string;
  status: VerificationStatus;
}

export interface TransactionTimeline {
  initiatedAt: Date;
  dueDiligenceStarted?: Date;
  dueDiligenceCompleted?: Date;
  contractSigned?: Date;
  closingScheduled?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface Commission {
  percentage: number;
  fixedAmount?: number;
  totalAmount: number;
  paymentSchedule: PaymentSchedule[];
  status: "PENDING" | "PARTIALLY_PAID" | "PAID";
}

export interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: "PENDING" | "PAID" | "OVERDUE";
  description: string;
}

export interface TransactionDocument {
  id: string;
  type:
    | "LOI"
    | "NDA"
    | "PURCHASE_AGREEMENT"
    | "DUE_DILIGENCE"
    | "FINANCIAL"
    | "LEGAL"
    | "OTHER";
  name: string;
  description?: string;
  uploadedAt: Date;
  uploadedBy: string;
  documentUrl: string;
  confidential: boolean;
  accessLog?: DocumentAccess[];
}

export interface DocumentAccess {
  userId: string;
  accessedAt: Date;
  action: "VIEW" | "DOWNLOAD" | "PRINT";
  ipAddress?: string;
}

export interface BrokerageTransaction {
  id: string;
  type: TransactionType;
  seller: Party;
  buyer: Party;
  asset: MedicalPractice | Pharmacy;
  status: TransactionStatus;
  timeline: TransactionTimeline;
  documents: TransactionDocument[];
  commission: Commission;
  dealValue: number;
  notes?: string;
  assignedBroker: string;
  createdAt: Date;
  updatedAt: Date;
}
