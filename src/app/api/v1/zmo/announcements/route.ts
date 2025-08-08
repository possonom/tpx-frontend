import { NextRequest, NextResponse } from "next/server";
import {
  ZmoAnnouncement,
  ZmoAnnouncementStatus,
} from "../../../../../domain/entities/ZmoAnnouncement";

// This would typically connect to your PostgreSQL database
// For now, we'll use the same mock data as in the component

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ZmoAnnouncementStatus | null;
    const search = searchParams.get("search");

    // Mock data - replace with actual database query
    const mockAnnouncements: ZmoAnnouncement[] = [
      {
        announce_key: "zmo_2024_001",
        source_type: "web",
        source_content: "Neue Richtlinien für Apothekenzulassung in Bayern...",
        announce_content: {
          title: "Apothekenzulassung Bayern",
          category: "regulation",
          summary: "Neue Bestimmungen für die Zulassung von Apotheken",
        },
        workflow_completed: false,
        status: "manual_review",
        created_at: new Date("2024-08-07"),
        updated_at: new Date("2024-08-07"),
        pdf_filename: undefined,
      },
      {
        announce_key: "zmo_2024_002",
        source_type: "pdf",
        source_content: "PDF content about practice regulations...",
        announce_content: {
          title: "Praxisverordnung Update",
          category: "practice",
          summary: "Aktualisierte Verordnungen für Arztpraxen",
        },
        workflow_completed: true,
        status: "validated",
        created_at: new Date("2024-08-06"),
        updated_at: new Date("2024-08-07"),
        pdf_filename: "praxis_verordnung_2024.pdf",
      },
      {
        announce_key: "zmo_2024_003",
        source_type: "web",
        source_content: "LLM processing failed for this announcement...",
        announce_content: undefined,
        workflow_completed: false,
        status: "llm_failed",
        created_at: new Date("2024-08-05"),
        updated_at: new Date("2024-08-05"),
        pdf_filename: undefined,
      },
    ];

    // Apply filters
    let filteredAnnouncements = mockAnnouncements;

    if (status) {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.status === status
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) =>
          a.announce_key.toLowerCase().includes(searchLower) ||
          a.source_content.toLowerCase().includes(searchLower) ||
          ((a.announce_content as Record<string, unknown>)?.title as string)
            ?.toLowerCase()
            .includes(searchLower)
      );
    }

    const summary = {
      total: filteredAnnouncements.length,
      pendingReview: filteredAnnouncements.filter(
        (a) => a.status === "manual_review"
      ).length,
      recentCount: filteredAnnouncements.filter((a) => {
        const daysDiff =
          (Date.now() - a.created_at.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).length,
    };

    return NextResponse.json({
      announcements: filteredAnnouncements,
      summary,
    });
  } catch (error) {
    console.error("Error fetching ZMO announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { announce_key, action } = body;

    if (!announce_key || !action) {
      return NextResponse.json(
        { error: "Missing announce_key or action" },
        { status: 400 }
      );
    }

    // TODO: Implement actual status update logic
    // This would update the database record
    console.log(`Updating announcement ${announce_key} with action ${action}`);

    // Mock response
    return NextResponse.json({
      success: true,
      message: `Announcement ${announce_key} updated with action ${action}`,
    });
  } catch (error) {
    console.error("Error updating ZMO announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
