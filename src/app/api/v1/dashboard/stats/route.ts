// src/app/api/v1/dashboard/stats/route.ts
import { NextResponse } from "next/server";

// Simple mock implementation for dashboard KPIs
// In a real implementation you would aggregate from DB models
export async function GET() {
  try {
    // Provide deterministic mock values (could randomize if needed)
    const stats = {
      activePractices: 12,
      activePharmacies: 8,
      openTransactions: 5,
      monthlyRevenue: 145000, // cents or euros, here in EUR
      // Optionally could add historical series later
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error generating dashboard stats", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
