// src/app/api/v1/practices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MedicalPractice, PracticeStatus, MedicalSpecialization } from "../../../../domain/entities/Practice";

// Mock data for practices
const mockPractices: MedicalPractice[] = [
  {
    id: "pr-001",
    name: "Praxis Dr. Schmidt - Allgemeinmedizin",
    specialization: "GENERAL_PRACTICE",
    location: {
      street: "Hauptstraße 45",
      city: "München",
      state: "Bayern",
      postalCode: "80539",
      country: "Deutschland",
    },
    valuation: {
      estimatedValue: 450000,
      valuationDate: new Date("2024-06-15"),
      methodology: "INCOME",
      annualRevenue: 280000,
      ebitda: 85000,
      patientBase: 1850,
    },
    status: "ACTIVE",
    owner: {
      id: "own-001",
      name: "Dr. Maria Schmidt",
      licenseNumber: "LÄK-BY-2015-8234",
      contactInfo: {
        phone: "+49 89 12345678",
        email: "dr.schmidt@praxis-muenchen.de",
      },
    },
    documents: [],
    createdAt: new Date("2015-03-10"),
    updatedAt: new Date("2024-08-01"),
  },
  {
    id: "pr-002",
    name: "Kardiologie Zentrum Berlin",
    specialization: "CARDIOLOGY",
    location: {
      street: "Friedrichstraße 123",
      city: "Berlin",
      state: "Berlin",
      postalCode: "10117",
      country: "Deutschland",
    },
    valuation: {
      estimatedValue: 850000,
      valuationDate: new Date("2024-07-20"),
      methodology: "MARKET",
      annualRevenue: 520000,
      ebitda: 165000,
      patientBase: 2300,
    },
    status: "FOR_SALE",
    owner: {
      id: "own-002",
      name: "Dr. Thomas Müller",
      licenseNumber: "LÄK-BE-2012-5671",
      contactInfo: {
        phone: "+49 30 87654321",
        email: "t.mueller@kardio-berlin.de",
      },
    },
    documents: [],
    createdAt: new Date("2012-09-15"),
    updatedAt: new Date("2024-07-20"),
  },
  {
    id: "pr-003",
    name: "Orthopädie Hamburg Nord",
    specialization: "ORTHOPEDICS",
    location: {
      street: "Alsterchaussee 67",
      city: "Hamburg",
      state: "Hamburg",
      postalCode: "20149",
      country: "Deutschland",
    },
    valuation: {
      estimatedValue: 650000,
      valuationDate: new Date("2024-05-10"),
      methodology: "INCOME",
      annualRevenue: 420000,
      ebitda: 125000,
      patientBase: 1950,
    },
    status: "UNDER_CONTRACT",
    owner: {
      id: "own-003",
      name: "Dr. Sarah Weber",
      licenseNumber: "LÄK-HH-2018-9456",
      contactInfo: {
        phone: "+49 40 74105890",
        email: "sarah.weber@ortho-hamburg.de",
      },
    },
    documents: [],
    createdAt: new Date("2018-01-20"),
    updatedAt: new Date("2024-07-15"),
  },
  {
    id: "pr-004",
    name: "Hautarztpraxis Dr. Fischer",
    specialization: "DERMATOLOGY",
    location: {
      street: "Königsallee 89",
      city: "Düsseldorf",
      state: "Nordrhein-Westfalen",
      postalCode: "40212",
      country: "Deutschland",
    },
    valuation: {
      estimatedValue: 380000,
      valuationDate: new Date("2024-04-25"),
      methodology: "MARKET",
      annualRevenue: 245000,
      ebitda: 73000,
      patientBase: 1650,
    },
    status: "ACTIVE",
    owner: {
      id: "own-004",
      name: "Dr. Michael Fischer",
      licenseNumber: "LÄK-NRW-2019-3345",
      contactInfo: {
        phone: "+49 211 567890",
        email: "m.fischer@hautarzt-duesseldorf.de",
      },
    },
    documents: [],
    createdAt: new Date("2019-06-01"),
    updatedAt: new Date("2024-08-03"),
  },
  {
    id: "pr-005",
    name: "Kinderarztpraxis Regenbogen",
    specialization: "PEDIATRICS",
    location: {
      street: "Marktplatz 12",
      city: "Stuttgart",
      state: "Baden-Württemberg",
      postalCode: "70173",
      country: "Deutschland",
    },
    valuation: {
      estimatedValue: 520000,
      valuationDate: new Date("2024-03-15"),
      methodology: "INCOME",
      annualRevenue: 310000,
      ebitda: 95000,
      patientBase: 2150,
    },
    status: "ACTIVE",
    owner: {
      id: "own-005",
      name: "Dr. Anna Zimmermann",
      licenseNumber: "LÄK-BW-2016-7789",
      contactInfo: {
        phone: "+49 711 234567",
        email: "a.zimmermann@kinderarzt-stuttgart.de",
      },
    },
    documents: [],
    createdAt: new Date("2016-04-12"),
    updatedAt: new Date("2024-07-28"),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PracticeStatus | null;
    const specialization = searchParams.get("specialization") as MedicalSpecialization | null;
    const search = searchParams.get("search");

    let filteredPractices = mockPractices;

    // Apply filters
    if (status) {
      filteredPractices = filteredPractices.filter(
        (practice) => practice.status === status
      );
    }

    if (specialization) {
      filteredPractices = filteredPractices.filter(
        (practice) => practice.specialization === specialization
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPractices = filteredPractices.filter(
        (practice) =>
          practice.name.toLowerCase().includes(searchTerm) ||
          practice.location.city.toLowerCase().includes(searchTerm) ||
          practice.owner.name.toLowerCase().includes(searchTerm) ||
          practice.specialization.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate summary statistics
    const summary = {
      total: mockPractices.length,
      active: mockPractices.filter((p) => p.status === "ACTIVE").length,
      forSale: mockPractices.filter((p) => p.status === "FOR_SALE").length,
      totalValue: mockPractices.reduce((sum, p) => sum + p.valuation.estimatedValue, 0),
    };

    return NextResponse.json({
      practices: filteredPractices,
      summary,
    });
  } catch (error) {
    console.error("Error fetching practices:", error);
    return NextResponse.json(
      { error: "Failed to fetch practices" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // In a real application, you would update the database here
    console.log(`Updating practice ${id} with status ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating practice:", error);
    return NextResponse.json(
      { error: "Failed to update practice" },
      { status: 500 }
    );
  }
}
