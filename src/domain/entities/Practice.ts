// src/domain/entities/Practice.ts
import { Address, ContactInfo, Document } from "./shared";

export interface PracticeValuation {
  estimatedValue: number;
  valuationDate: Date;
  methodology: "INCOME" | "MARKET" | "ASSET";
  annualRevenue?: number;
  ebitda?: number;
  patientBase?: number;
}

export interface PracticeOwner {
  id: string;
  name: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
}

export type MedicalSpecialization =
  | "GENERAL_PRACTICE"
  | "CARDIOLOGY"
  | "DERMATOLOGY"
  | "ORTHOPEDICS"
  | "PEDIATRICS"
  | "PSYCHIATRY"
  | "RADIOLOGY"
  | "SURGERY"
  | "INTERNAL_MEDICINE"
  | "EMERGENCY_MEDICINE"
  | "ANESTHESIOLOGY"
  | "OBSTETRICS_GYNECOLOGY"
  | "OPHTHALMOLOGY"
  | "ENT"
  | "UROLOGY"
  | "NEUROLOGY"
  | "ONCOLOGY"
  | "PATHOLOGY"
  | "OTHER";

export type PracticeStatus =
  | "ACTIVE"
  | "FOR_SALE"
  | "UNDER_CONTRACT"
  | "SOLD"
  | "INACTIVE";

export interface MedicalPractice {
  id: string;
  name: string;
  specialization: MedicalSpecialization;
  location: Address;
  valuation: PracticeValuation;
  status: PracticeStatus;
  owner: PracticeOwner;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
