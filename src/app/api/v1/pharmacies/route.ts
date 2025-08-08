import { NextRequest, NextResponse } from "next/server";
import { Pharmacy, PharmacyStatus, PharmacyType } from "../../../../domain/entities/Pharmacy";

// Mock data for pharmacies
const mockPharmacies: Pharmacy[] = [
  {
    id: "ph-001",
    name: "Apotheke am Marktplatz",
    type: "RETAIL",
    location: {
      street: "Marktplatz 15",
      city: "München",
      state: "Bayern",
      postalCode: "80331",
      country: "Deutschland",
    },
    revenue: {
      annual: 850000,
      monthly: 70833,
      prescriptionVolume: 12500,
      averageTicketSize: 68,
      year: 2024,
    },
    status: "ACTIVE",
    owner: {
      id: "own-001",
      name: "Dr. Maria Schmidt",
      licenseNumber: "APO-BY-2019-0234",
      contactInfo: {
        phone: "+49 89 12345678",
        email: "maria.schmidt@apotheke-marktplatz.de",
      },
      ownershipPercentage: 100,
    },
    licenses: [
      {
        id: "lic-001",
        number: "APO-BY-2019-0234",
        type: "STATE",
        issuedDate: new Date("2019-03-15"),
        expiryDate: new Date("2029-03-15"),
        status: "ACTIVE",
      },
    ],
    createdAt: new Date("2019-03-15"),
    updatedAt: new Date("2024-08-01"),
  },
  {
    id: "ph-002",
    name: "Stadtapotheke Berlin",
    type: "RETAIL",
    location: {
      street: "Unter den Linden 42",
      city: "Berlin",
      state: "Berlin",
      postalCode: "10117",
      country: "Deutschland",
    },
    revenue: {
      annual: 1200000,
      monthly: 100000,
      prescriptionVolume: 18000,
      averageTicketSize: 67,
      year: 2024,
    },
    status: "FOR_SALE",
    owner: {
      id: "own-002",
      name: "Thomas Müller",
      licenseNumber: "APO-BE-2018-0156",
      contactInfo: {
        phone: "+49 30 87654321",
        email: "thomas.mueller@stadtapotheke-berlin.de",
      },
      ownershipPercentage: 100,
    },
    licenses: [
      {
        id: "lic-002",
        number: "APO-BE-2018-0156",
        type: "STATE",
        issuedDate: new Date("2018-06-01"),
        expiryDate: new Date("2028-06-01"),
        status: "ACTIVE",
      },
    ],
    createdAt: new Date("2018-06-01"),
    updatedAt: new Date("2024-07-15"),
  },
  {
    id: "ph-003",
    name: "Krankenhaus-Apotheke Hamburg",
    type: "HOSPITAL",
    location: {
      street: "Universitätsklinikum Hamburg-Eppendorf",
      city: "Hamburg",
      state: "Hamburg",
      postalCode: "20246",
      country: "Deutschland",
    },
    revenue: {
      annual: 2800000,
      monthly: 233333,
      prescriptionVolume: 45000,
      averageTicketSize: 62,
      year: 2024,
    },
    status: "ACTIVE",
    owner: {
      id: "own-003",
      name: "Dr. Sarah Weber",
      licenseNumber: "APO-HH-2020-0089",
      contactInfo: {
        phone: "+49 40 74105-0",
        email: "sarah.weber@uke.de",
      },
      ownershipPercentage: 100,
    },
    licenses: [
      {
        id: "lic-003",
        number: "APO-HH-2020-0089",
        type: "STATE",
        issuedDate: new Date("2020-01-10"),
        expiryDate: new Date("2030-01-10"),
        status: "ACTIVE",
      },
    ],
    createdAt: new Date("2020-01-10"),
    updatedAt: new Date("2024-08-05"),
  },
  {
    id: "ph-004",
    name: "Online-Apotheke Deutschland",
    type: "ONLINE",
    location: {
      street: "Industriestraße 25",
      city: "Frankfurt am Main",
      state: "Hessen",
      postalCode: "60486",
      country: "Deutschland",
    },
    revenue: {
      annual: 3200000,
      monthly: 266667,
      prescriptionVolume: 55000,
      averageTicketSize: 58,
      year: 2024,
    },
    status: "UNDER_CONTRACT",
    owner: {
      id: "own-004",
      name: "Dr. Michael Fischer",
      licenseNumber: "APO-HE-2017-0312",
      contactInfo: {
        phone: "+49 69 123456789",
        email: "michael.fischer@online-apotheke-de.com",
      },
      ownershipPercentage: 75,
    },
    licenses: [
      {
        id: "lic-004",
        number: "APO-HE-2017-0312",
        type: "STATE",
        issuedDate: new Date("2017-09-12"),
        expiryDate: new Date("2027-09-12"),
        status: "ACTIVE",
      },
    ],
    createdAt: new Date("2017-09-12"),
    updatedAt: new Date("2024-07-28"),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PharmacyStatus | null;
    const type = searchParams.get("type") as PharmacyType | null;
    const search = searchParams.get("search");

    let filteredPharmacies = mockPharmacies;

    // Apply filters
    if (status) {
      filteredPharmacies = filteredPharmacies.filter(
        (pharmacy) => pharmacy.status === status
      );
    }

    if (type) {
      filteredPharmacies = filteredPharmacies.filter(
        (pharmacy) => pharmacy.type === type
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPharmacies = filteredPharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(searchTerm) ||
          pharmacy.location.city.toLowerCase().includes(searchTerm) ||
          pharmacy.owner.name.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate summary statistics
    const summary = {
      total: mockPharmacies.length,
      active: mockPharmacies.filter((p) => p.status === "ACTIVE").length,
      forSale: mockPharmacies.filter((p) => p.status === "FOR_SALE").length,
      recentRevenue: mockPharmacies.reduce((sum, p) => sum + p.revenue.annual, 0),
    };

    return NextResponse.json({
      pharmacies: filteredPharmacies,
      summary,
    });
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // In a real application, you would update the database here
    console.log(`Updating pharmacy ${id} with status ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating pharmacy:", error);
    return NextResponse.json(
      { error: "Failed to update pharmacy" },
      { status: 500 }
    );
  }
}
