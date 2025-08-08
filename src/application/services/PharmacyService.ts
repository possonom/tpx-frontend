// src/application/services/PharmacyService.ts
import {
  Pharmacy,
  PharmacyStatus,
  PharmacyType,
} from "@domain/domain/entities/Pharmacy";
import { z } from "zod";

export const CreatePharmacySchema = z.object({
  name: z.string().min(1, "Pharmacy name is required"),
  type: z.enum([
    "RETAIL",
    "HOSPITAL",
    "CLINICAL",
    "COMPOUNDING",
    "SPECIALTY",
    "MAIL_ORDER",
    "ONLINE",
  ]),
  location: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  owner: z.object({
    name: z.string().min(1),
    licenseNumber: z.string().min(1),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string().min(1),
      mobile: z.string().optional(),
    }),
    ownershipPercentage: z.number().min(0).max(100).optional(),
  }),
  revenue: z.object({
    annual: z.number().positive(),
    monthly: z.number().positive(),
    prescriptionVolume: z.number().positive(),
    averageTicketSize: z.number().positive(),
    year: z.number().int().min(2000).max(new Date().getFullYear()),
  }),
  licenses: z.array(
    z.object({
      number: z.string().min(1),
      type: z.enum(["STATE", "DEA", "NPI", "NCPDP"]),
      issuedDate: z.string().or(z.date()),
      expiryDate: z.string().or(z.date()),
      status: z.enum(["ACTIVE", "EXPIRED", "SUSPENDED"]),
    })
  ),
});

export const UpdatePharmacySchema = CreatePharmacySchema.partial().extend({
  id: z.string().uuid(),
  status: z
    .enum(["ACTIVE", "FOR_SALE", "UNDER_CONTRACT", "SOLD", "INACTIVE"])
    .optional(),
});

export type CreatePharmacyInput = z.infer<typeof CreatePharmacySchema>;
export type UpdatePharmacyInput = z.infer<typeof UpdatePharmacySchema>;

export interface PharmacyFilters {
  status?: PharmacyStatus;
  type?: PharmacyType;
  minRevenue?: number;
  maxRevenue?: number;
  location?: string;
  licenseStatus?: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  page?: number;
  limit?: number;
  sortBy?: "name" | "revenue" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PharmacyRepository {
  findAll(
    filters?: PharmacyFilters
  ): Promise<{ pharmacies: Pharmacy[]; total: number }>;
  findById(id: string): Promise<Pharmacy | null>;
  create(data: CreatePharmacyInput): Promise<Pharmacy>;
  update(id: string, data: Partial<UpdatePharmacyInput>): Promise<Pharmacy>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: PharmacyStatus): Promise<Pharmacy>;
  findByLicenseExpiry(daysFromNow: number): Promise<Pharmacy[]>;
}

export class PharmacyService {
  constructor(private repository: PharmacyRepository) {}

  async getAllPharmacies(filters?: PharmacyFilters) {
    return this.repository.findAll(filters);
  }

  async getPharmacyById(id: string) {
    if (!id) throw new Error("Pharmacy ID is required");
    return this.repository.findById(id);
  }

  async createPharmacy(data: CreatePharmacyInput) {
    const validatedData = CreatePharmacySchema.parse(data);
    return this.repository.create(validatedData);
  }

  async updatePharmacy(id: string, data: Partial<UpdatePharmacyInput>) {
    if (!id) throw new Error("Pharmacy ID is required");

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided for update");
    }

    const validatedData = UpdatePharmacySchema.partial().parse({ ...data, id });
    return this.repository.update(id, validatedData);
  }

  async deletePharmacy(id: string) {
    if (!id) throw new Error("Pharmacy ID is required");
    return this.repository.delete(id);
  }

  async updatePharmacyStatus(id: string, status: PharmacyStatus) {
    if (!id) throw new Error("Pharmacy ID is required");
    return this.repository.updateStatus(id, status);
  }

  async searchPharmacies(query: string, filters?: PharmacyFilters) {
    const searchFilters = {
      ...filters,
      search: query,
    };
    return this.repository.findAll(searchFilters);
  }

  async getPharmaciesByType(
    type: PharmacyType,
    filters?: Omit<PharmacyFilters, "type">
  ) {
    return this.repository.findAll({ ...filters, type });
  }

  async getPharmaciesWithExpiringLicenses(daysFromNow: number = 30) {
    return this.repository.findByLicenseExpiry(daysFromNow);
  }

  async validatePharmacyData(
    data: CreatePharmacyInput
  ): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      CreatePharmacySchema.parse(data);
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

  async calculatePharmacyMetrics(id: string) {
    const pharmacy = await this.getPharmacyById(id);
    if (!pharmacy) throw new Error("Pharmacy not found");

    const { revenue } = pharmacy;
    return {
      monthlyGrowthRate: this.calculateGrowthRate(
        revenue.annual,
        revenue.monthly
      ),
      prescriptionEfficiency: revenue.prescriptionVolume / revenue.annual,
      averageMonthlyRevenue: revenue.annual / 12,
      projectedAnnualRevenue: revenue.monthly * 12,
      complianceScore: this.calculateComplianceScore(pharmacy.licenses),
    };
  }

  private calculateGrowthRate(annual: number, monthly: number): number {
    const projectedAnnual = monthly * 12;
    return ((projectedAnnual - annual) / annual) * 100;
  }

  private calculateComplianceScore(licenses: Pharmacy["licenses"]): number {
    if (licenses.length === 0) return 0;

    const activeLicenses = licenses.filter((l) => l.status === "ACTIVE").length;
    return (activeLicenses / licenses.length) * 100;
  }
}
