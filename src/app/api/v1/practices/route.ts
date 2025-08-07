// src/app/api/v1/practices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import postgresPool from "@/infrastructure/database/postgres/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const specialization = searchParams.get("specialization");

    let query = "SELECT * FROM medical_practices WHERE 1=1";
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (specialization) {
      params.push(specialization);
      query += ` AND specialization = $${params.length}`;
    }

    const result = await postgresPool.query(query, params);

    return NextResponse.json({
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    console.error("Error fetching practices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check authorization
  const userRoles = (session.user as any).roles || [];
  if (!userRoles.includes("admin") && !userRoles.includes("broker")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate input (you'd use Zod here)
    const { name, specialization, location, valuation, owner } = body;

    const query = `
      INSERT INTO medical_practices 
      (name, specialization, location, valuation, owner_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
      RETURNING *
    `;

    const result = await postgresPool.query(query, [
      name,
      specialization,
      JSON.stringify(location),
      JSON.stringify(valuation),
      owner,
    ]);

    return NextResponse.json(
      {
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating practice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
