// src/domain/entities/shared.ts
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
  mobile?: string;
  address?: Address;
  preferredContact?: "EMAIL" | "PHONE" | "MAIL";
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export type VerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";
