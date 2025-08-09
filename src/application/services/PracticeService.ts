// src/application/services/PracticeService.ts
import {
  MedicalPractice,
  PracticeStatus,
  MedicalSpecialization,
} from "@domain/entities/Practice";
import { z } from "zod";

export const CreatePracticeSchema = z.object({
  name: z.string().min(1, "Practice name is required"),
  specialization: z.enum([
    "GENERAL_PRACTICE",
    "CARDIOLOGY",
    "DERMATOLOGY",
    "ORTHOPEDICS",
    "PEDIATRICS",
    "PSYCHIATRY",
    "RADIOLOGY",
    "SURGERY",
    "INTERNAL_MEDICINE",
    "EMERGENCY_MEDICINE",
    "ANESTHESIOLOGY",
    "OBSTETRICS_GYNECOLOGY",
    "OPHTHALMOLOGY",
    "ENT",
    "UROLOGY",
    "NEUROLOGY",
    "ONCOLOGY",
    "PATHOLOGY",
    "OTHER",
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
  }),
  valuation: z.object({
    estimatedValue: z.number().positive(),
    methodology: z.enum(["INCOME", "MARKET", "ASSET"]),
    annualRevenue: z.number().optional(),
    ebitda: z.number().optional(),
    patientBase: z.number().optional(),
  }),
});

export const UpdatePracticeSchema = CreatePracticeSchema.partial().extend({
  id: z.string().uuid(),
  status: z
    .enum(["ACTIVE", "FOR_SALE", "UNDER_CONTRACT", "SOLD", "INACTIVE"])
    .optional(),
});

export type CreatePracticeInput = z.infer<typeof CreatePracticeSchema>;
export type UpdatePracticeInput = z.infer<typeof UpdatePracticeSchema>;

export interface PracticeFilters {
  status?: PracticeStatus;
  specialization?: MedicalSpecialization;
  minValuation?: number;
  maxValuation?: number;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "valuation" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PracticeRepository {
  findAll(
    filters?: PracticeFilters
  ): Promise<{ practices: MedicalPractice[]; total: number }>;
  findById(id: string): Promise<MedicalPractice | null>;
  create(data: CreatePracticeInput): Promise<MedicalPractice>;
  update(
    id: string,
    data: Partial<UpdatePracticeInput>
  ): Promise<MedicalPractice>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: PracticeStatus): Promise<MedicalPractice>;
}

export class PracticeService {
  constructor(private repository: PracticeRepository) {}

  async getAllPractices(filters?: PracticeFilters) {
    return this.repository.findAll(filters);
  }

  async getPracticeById(id: string) {
    if (!id) throw new Error("Practice ID is required");
    return this.repository.findById(id);
  }

  async createPractice(data: CreatePracticeInput) {
    const validatedData = CreatePracticeSchema.parse(data);
    return this.repository.create(validatedData);
  }

  async updatePractice(id: string, data: Partial<UpdatePracticeInput>) {
    if (!id) throw new Error("Practice ID is required");

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided for update");
    }

    const validatedData = UpdatePracticeSchema.partial().parse({ ...data, id });
    return this.repository.update(id, validatedData);
  }

  async deletePractice(id: string) {
    if (!id) throw new Error("Practice ID is required");
    return this.repository.delete(id);
  }

  async updatePracticeStatus(id: string, status: PracticeStatus) {
    if (!id) throw new Error("Practice ID is required");
    return this.repository.updateStatus(id, status);
  }

  async searchPractices(query: string, filters?: PracticeFilters) {
    const searchFilters = {
      ...filters,
      search: query,
    };
    return this.repository.findAll(searchFilters);
  }

  async getPracticesByStatus(
    status: PracticeStatus,
    filters?: Omit<PracticeFilters, "status">
  ) {
    return this.repository.findAll({ ...filters, status });
  }

  async validatePracticeData(
    data: CreatePracticeInput
  ): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      CreatePracticeSchema.parse(data);
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
}
