// src/domain/entities/Pharmacy.ts
import { Address, ContactInfo, Document } from "./shared";

export type PharmacyType =
  | "RETAIL"
  | "HOSPITAL"
  | "CLINICAL"
  | "COMPOUNDING"
  | "SPECIALTY"
  | "MAIL_ORDER"
  | "ONLINE";

export type PharmacyStatus =
  | "ACTIVE"
  | "FOR_SALE"
  | "UNDER_CONTRACT"
  | "SOLD"
  | "INACTIVE";

export interface Revenue {
  annual: number;
  monthly: number;
  prescriptionVolume: number;
  averageTicketSize: number;
  year: number;
}

export interface License {
  id: string;
  number: string;
  type: "STATE" | "DEA" | "NPI" | "NCPDP";
  issuedDate: Date;
  expiryDate: Date;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
}

export interface PharmacyOwner {
  id: string;
  name: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
  ownershipPercentage?: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  type: PharmacyType;
  location: Address;
  revenue: Revenue;
  status: PharmacyStatus;
  owner: PharmacyOwner;
  licenses: License[];
  createdAt: Date;
  updatedAt: Date;
}
