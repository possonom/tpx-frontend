import { NextRequest, NextResponse } from "next/server";
import { BrokerageTransaction, TransactionStatus, TransactionType } from "../../../../domain/entities/Transaction";
import { MedicalPractice } from "../../../../domain/entities/Practice";
import { Pharmacy } from "../../../../domain/entities/Pharmacy";

// Mock data for transactions
const mockTransactions: BrokerageTransaction[] = [
  {
    id: "tx-001",
    type: "PRACTICE_SALE",
    seller: {
      id: "seller-001",
      type: "INDIVIDUAL",
      name: "Dr. Maria Schmidt",
      contact: {
        email: "maria.schmidt@example.de",
        phone: "+49 89 12345678",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    buyer: {
      id: "buyer-001",
      type: "INDIVIDUAL",
      name: "Dr. Thomas Weber",
      contact: {
        email: "thomas.weber@example.de",
        phone: "+49 89 87654321",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    asset: {
      id: "pr-001",
      name: "Praxis Dr. Schmidt - Allgemeinmedizin",
    } as MedicalPractice | Pharmacy,
    status: "COMPLETED",
    timeline: {
      initiatedAt: new Date("2024-01-15"),
      dueDiligenceStarted: new Date("2024-01-22"),
      dueDiligenceCompleted: new Date("2024-02-10"),
      contractSigned: new Date("2024-02-15"),
      closingScheduled: new Date("2024-03-01"),
      completedAt: new Date("2024-03-01"),
    },
    documents: [],
    commission: {
      percentage: 5.0,
      totalAmount: 22500,
      paymentSchedule: [],
      status: "PAID",
    },
    dealValue: 450000,
    assignedBroker: "Max Mustermann",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "tx-002",
    type: "PHARMACY_SALE",
    seller: {
      id: "seller-002",
      type: "INDIVIDUAL",
      name: "Apotheke Stadtmitte GmbH",
      contact: {
        email: "info@apotheke-stadtmitte.de",
        phone: "+49 30 555-0123",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    buyer: {
      id: "buyer-002",
      type: "CORPORATION",
      name: "Pharma Holdings AG",
      contact: {
        email: "acquisitions@pharmaholdings.de",
        phone: "+49 69 999-8888",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    asset: {
      id: "ph-001",
      name: "Apotheke Stadtmitte",
    } as MedicalPractice | Pharmacy,
    status: "CONTRACT_SIGNED",
    timeline: {
      initiatedAt: new Date("2024-05-10"),
      dueDiligenceStarted: new Date("2024-05-20"),
      dueDiligenceCompleted: new Date("2024-06-15"),
      contractSigned: new Date("2024-07-01"),
      closingScheduled: new Date("2024-08-15"),
    },
    documents: [],
    commission: {
      percentage: 4.5,
      totalAmount: 38250,
      paymentSchedule: [],
      status: "PENDING",
    },
    dealValue: 850000,
    assignedBroker: "Sarah Fischer",
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-07-01"),
  },
  {
    id: "tx-003",
    type: "PRACTICE_SALE",
    seller: {
      id: "seller-003",
      type: "INDIVIDUAL",
      name: "Dr. Klaus Hoffmann",
      contact: {
        email: "klaus.hoffmann@praxis-hamburg.de",
        phone: "+49 40 123-4567",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    buyer: {
      id: "buyer-003",
      type: "INDIVIDUAL",
      name: "Dr. Anna Becker",
      contact: {
        email: "anna.becker@example.de",
        phone: "+49 40 765-4321",
      },
      verificationStatus: "PENDING",
      documents: [],
    },
    asset: {
      id: "pr-002",
      name: "Praxis Dr. Hoffmann",
    } as MedicalPractice | Pharmacy,
    status: "DUE_DILIGENCE",
    timeline: {
      initiatedAt: new Date("2024-06-20"),
      dueDiligenceStarted: new Date("2024-07-01"),
    },
    documents: [],
    commission: {
      percentage: 5.5,
      totalAmount: 35750,
      paymentSchedule: [],
      status: "PENDING",
    },
    dealValue: 650000,
    assignedBroker: "Michael Schneider",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-07-01"),
  },
  {
    id: "tx-004",
    type: "MERGER",
    seller: {
      id: "seller-004",
      type: "PARTNERSHIP",
      name: "Gemeinschaftspraxis Nord",
      contact: {
        email: "info@gp-nord.de",
        phone: "+49 511 111-2222",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    buyer: {
      id: "buyer-004",
      type: "PARTNERSHIP",
      name: "Medizinzentrum Süd",
      contact: {
        email: "kontakt@mz-sued.de",
        phone: "+49 511 333-4444",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    asset: {
      id: "pr-003",
      name: "Gemeinschaftspraxis Nord",
    } as MedicalPractice | Pharmacy,
    status: "NEGOTIATION",
    timeline: {
      initiatedAt: new Date("2024-07-15"),
      dueDiligenceStarted: new Date("2024-07-25"),
      dueDiligenceCompleted: new Date("2024-08-05"),
    },
    documents: [],
    commission: {
      percentage: 3.0,
      totalAmount: 36000,
      paymentSchedule: [],
      status: "PENDING",
    },
    dealValue: 1200000,
    assignedBroker: "Lisa Mueller",
    createdAt: new Date("2024-07-15"),
    updatedAt: new Date("2024-08-05"),
  },
  {
    id: "tx-005",
    type: "PHARMACY_SALE",
    seller: {
      id: "seller-005",
      type: "INDIVIDUAL",
      name: "Dr. Peter Richter",
      contact: {
        email: "peter.richter@apotheke-dorf.de",
        phone: "+49 8031 555-777",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    buyer: {
      id: "buyer-005",
      type: "INDIVIDUAL",
      name: "Dr. Monika Lang",
      contact: {
        email: "monika.lang@example.de",
        phone: "+49 8031 888-999",
      },
      verificationStatus: "VERIFIED",
      documents: [],
    },
    asset: {
      id: "ph-002",
      name: "Dorfapotheke Dr. Richter",
    } as MedicalPractice | Pharmacy,
    status: "INITIATED",
    timeline: {
      initiatedAt: new Date("2024-08-01"),
    },
    documents: [],
    commission: {
      percentage: 4.0,
      totalAmount: 15200,
      paymentSchedule: [],
      status: "PENDING",
    },
    dealValue: 380000,
    assignedBroker: "Robert Wagner",
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2024-08-01"),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TransactionStatus | null;
    const type = searchParams.get("type") as TransactionType | null;
    const search = searchParams.get("search");

    let filteredTransactions = mockTransactions;

    // Apply filters
    if (status) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.status === status
      );
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.type === type
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          transaction.seller.name.toLowerCase().includes(searchTerm) ||
          transaction.buyer.name.toLowerCase().includes(searchTerm) ||
          transaction.assignedBroker.toLowerCase().includes(searchTerm) ||
          transaction.id.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate summary statistics
    const activeStatuses: TransactionStatus[] = ["INITIATED", "DUE_DILIGENCE", "NEGOTIATION", "CONTRACT_SIGNED", "CLOSING"];
    const summary = {
      total: mockTransactions.length,
      active: mockTransactions.filter((t) => activeStatuses.includes(t.status)).length,
      completed: mockTransactions.filter((t) => t.status === "COMPLETED").length,
      totalValue: mockTransactions.reduce((sum, t) => sum + t.dealValue, 0),
      totalCommission: mockTransactions.reduce((sum, t) => sum + t.commission.totalAmount, 0),
    };

    return NextResponse.json({
      transactions: filteredTransactions,
      summary,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // In a real application, you would update the database here
    console.log(`Updating transaction ${id} with status ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
