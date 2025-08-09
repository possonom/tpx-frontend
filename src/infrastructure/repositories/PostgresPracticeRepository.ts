// src/infrastructure/repositories/PostgresPracticeRepository.ts
import { Pool } from "pg";
import {
  MedicalPractice,
  PracticeStatus,
  MedicalSpecialization,
} from "@domain/entities/Practice";
import {
  PracticeRepository,
  PracticeFilters,
  CreatePracticeInput,
  UpdatePracticeInput,
} from "@application/services/PracticeService";

export class PostgresPracticeRepository implements PracticeRepository {
  constructor(private pool: Pool) {}

  async findAll(
    filters?: PracticeFilters
  ): Promise<{ practices: MedicalPractice[]; total: number }> {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT p.*, 
               json_build_object(
                 'street', p.location_street,
                 'city', p.location_city,
                 'state', p.location_state,
                 'postalCode', p.location_postal_code,
                 'country', p.location_country
               ) as location,
               json_build_object(
                 'estimatedValue', p.valuation_estimated_value,
                 'valuationDate', p.valuation_date,
                 'methodology', p.valuation_methodology,
                 'annualRevenue', p.valuation_annual_revenue,
                 'ebitda', p.valuation_ebitda,
                 'patientBase', p.valuation_patient_base
               ) as valuation,
               json_build_object(
                 'id', p.owner_id,
                 'name', p.owner_name,
                 'licenseNumber', p.owner_license_number,
                 'contactInfo', json_build_object(
                   'email', p.owner_email,
                   'phone', p.owner_phone,
                   'mobile', p.owner_mobile
                 )
               ) as owner
        FROM medical_practices p
        WHERE 1=1
      `;

      const params: unknown[] = [];
      let paramCount = 0;

      if (filters?.status) {
        paramCount++;
        params.push(filters.status);
        query += ` AND p.status = $${paramCount}`;
      }

      if (filters?.specialization) {
        paramCount++;
        params.push(filters.specialization);
        query += ` AND p.specialization = $${paramCount}`;
      }

      if (filters?.minValuation) {
        paramCount++;
        params.push(filters.minValuation);
        query += ` AND p.valuation_estimated_value >= $${paramCount}`;
      }

      if (filters?.maxValuation) {
        paramCount++;
        params.push(filters.maxValuation);
        query += ` AND p.valuation_estimated_value <= $${paramCount}`;
      }

      if (filters?.location) {
        paramCount++;
        params.push(`%${filters.location}%`);
        query += ` AND (p.location_city ILIKE $${paramCount} OR p.location_state ILIKE $${paramCount})`;
      }

      // Count total records
      const countQuery = query.replace(
        /SELECT .* FROM/,
        "SELECT COUNT(*) as total FROM"
      );
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Add sorting
      const sortBy = filters?.sortBy || "createdAt";
      const sortOrder = filters?.sortOrder || "desc";
      query += ` ORDER BY p.${
        sortBy === "valuation" ? "valuation_estimated_value" : sortBy
      } ${sortOrder}`;

      // Add pagination
      if (filters?.limit) {
        paramCount++;
        params.push(filters.limit);
        query += ` LIMIT $${paramCount}`;
      }

      if (filters?.page && filters?.limit) {
        paramCount++;
        params.push((filters.page - 1) * filters.limit);
        query += ` OFFSET $${paramCount}`;
      }

      const result = await client.query(query, params);
      const practices = result.rows.map(this.mapRowToPractice);

      return { practices, total };
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<MedicalPractice | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT p.*, 
               json_build_object(
                 'street', p.location_street,
                 'city', p.location_city,
                 'state', p.location_state,
                 'postalCode', p.location_postal_code,
                 'country', p.location_country
               ) as location,
               json_build_object(
                 'estimatedValue', p.valuation_estimated_value,
                 'valuationDate', p.valuation_date,
                 'methodology', p.valuation_methodology,
                 'annualRevenue', p.valuation_annual_revenue,
                 'ebitda', p.valuation_ebitda,
                 'patientBase', p.valuation_patient_base
               ) as valuation,
               json_build_object(
                 'id', p.owner_id,
                 'name', p.owner_name,
                 'licenseNumber', p.owner_license_number,
                 'contactInfo', json_build_object(
                   'email', p.owner_email,
                   'phone', p.owner_phone,
                   'mobile', p.owner_mobile
                 )
               ) as owner
        FROM medical_practices p
        WHERE p.id = $1
      `;

      const result = await client.query(query, [id]);
      return result.rows.length > 0
        ? this.mapRowToPractice(result.rows[0])
        : null;
    } finally {
      client.release();
    }
  }

  async create(data: CreatePracticeInput): Promise<MedicalPractice> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const practiceId = this.generateId();
      const ownerId = this.generateId();
      const now = new Date();

      const query = `
        INSERT INTO medical_practices (
          id, name, specialization, status,
          location_street, location_city, location_state, location_postal_code, location_country,
          valuation_estimated_value, valuation_date, valuation_methodology, 
          valuation_annual_revenue, valuation_ebitda, valuation_patient_base,
          owner_id, owner_name, owner_license_number, owner_email, owner_phone, owner_mobile,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23
        ) RETURNING *
      `;

      const params = [
        practiceId,
        data.name,
        data.specialization,
        "ACTIVE",
        data.location.street,
        data.location.city,
        data.location.state,
        data.location.postalCode,
        data.location.country,
        data.valuation.estimatedValue,
        new Date(),
        data.valuation.methodology,
        data.valuation.annualRevenue,
        data.valuation.ebitda,
        data.valuation.patientBase,
        ownerId,
        data.owner.name,
        data.owner.licenseNumber,
        data.owner.contactInfo.email,
        data.owner.contactInfo.phone,
        data.owner.contactInfo.mobile,
        now,
        now,
      ];

      const result = await client.query(query, params);
      await client.query("COMMIT");

      return this.mapRowToPractice({
        ...result.rows[0],
        location: data.location,
        valuation: {
          ...data.valuation,
          valuationDate: new Date(),
        },
        owner: {
          id: ownerId,
          ...data.owner,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<UpdatePracticeInput>
  ): Promise<MedicalPractice> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const updates: string[] = [];
      const params: unknown[] = [id];
      let paramCount = 1;

      if (data.name) {
        paramCount++;
        params.push(data.name);
        updates.push(`name = $${paramCount}`);
      }

      if (data.specialization) {
        paramCount++;
        params.push(data.specialization);
        updates.push(`specialization = $${paramCount}`);
      }

      if (data.status) {
        paramCount++;
        params.push(data.status);
        updates.push(`status = $${paramCount}`);
      }

      if (data.location) {
        if (data.location.street) {
          paramCount++;
          params.push(data.location.street);
          updates.push(`location_street = $${paramCount}`);
        }
        if (data.location.city) {
          paramCount++;
          params.push(data.location.city);
          updates.push(`location_city = $${paramCount}`);
        }
        // Add other location fields as needed
      }

      if (data.valuation?.estimatedValue) {
        paramCount++;
        params.push(data.valuation.estimatedValue);
        updates.push(`valuation_estimated_value = $${paramCount}`);
      }

      paramCount++;
      params.push(new Date());
      updates.push(`updated_at = $${paramCount}`);

      if (updates.length === 1) {
        // Only updated_at
        throw new Error("No fields to update");
      }

      const query = `
        UPDATE medical_practices 
        SET ${updates.join(", ")}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, params);
      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Practice not found");
      }

      return this.findById(id) as Promise<MedicalPractice>;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM medical_practices WHERE id = $1",
        [id]
      );
      if (result.rowCount === 0) {
        throw new Error("Practice not found");
      }
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: PracticeStatus
  ): Promise<MedicalPractice> {
    return this.update(id, { status });
  }

  private mapRowToPractice(row: Record<string, unknown>): MedicalPractice {
    return {
      id: String(row.id),
      name: String(row.name),
      specialization: row.specialization as MedicalSpecialization,
      status: row.status as PracticeStatus,
      location: (row.location && Object.keys(row.location).length > 0
        ? row.location
        : {
            street: row.location_street,
            city: row.location_city,
            state: row.location_state,
            postalCode: row.location_postal_code,
            country: row.location_country,
          }) as {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      },
      valuation:
        row.valuation &&
        typeof row.valuation === "object" &&
        "methodology" in row.valuation
          ? ({
              ...row.valuation,
              methodology: (row.valuation as { methodology: string })
                .methodology as "INCOME" | "MARKET" | "ASSET",
            } as {
              estimatedValue: number;
              valuationDate: Date;
              methodology: "INCOME" | "MARKET" | "ASSET";
              annualRevenue?: number;
              ebitda?: number;
              patientBase?: number;
            })
          : {
              estimatedValue: row.valuation_estimated_value as number,
              valuationDate:
                row.valuation_date &&
                (typeof row.valuation_date === "string" ||
                  typeof row.valuation_date === "number" ||
                  row.valuation_date instanceof Date)
                  ? new Date(row.valuation_date)
                  : new Date(),
              methodology: row.valuation_methodology as
                | "INCOME"
                | "MARKET"
                | "ASSET",
              annualRevenue: row.valuation_annual_revenue as number | undefined,
              ebitda: row.valuation_ebitda as number | undefined,
              patientBase: row.valuation_patient_base as number | undefined,
            },
      owner:
        row.owner &&
        typeof row.owner === "object" &&
        "id" in row.owner &&
        "name" in row.owner &&
        "licenseNumber" in row.owner &&
        "contactInfo" in row.owner
          ? (row.owner as {
              id: string;
              name: string;
              licenseNumber: string;
              contactInfo: { email: string; phone: string; mobile: string };
            })
          : {
              id: String(row.owner_id),
              name: String(row.owner_name),
              licenseNumber: String(row.owner_license_number),
              contactInfo: {
                email: String(row.owner_email),
                phone: String(row.owner_phone),
                mobile: String(row.owner_mobile),
              },
            },
      documents: [], // Would be fetched from separate table
      createdAt: new Date(row.created_at as string | number | Date),
      updatedAt: new Date(row.updated_at as string | number | Date),
    };
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
