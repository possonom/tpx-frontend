// src/domain/entities/ZmoAnnouncement.ts

export interface ZmoAnnouncement {
  announce_key: string;
  source_type: "pdf" | "web";
  source_content: string;
  announce_content?: Record<string, unknown>;
  workflow_completed: boolean;
  prompt_version?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  pdf_filename?: string;
  status: ZmoAnnouncementStatus;
}

export type ZmoAnnouncementStatus =
  | "raw_content"
  | "llm_processing"
  | "llm_completed"
  | "llm_failed"
  | "manual_review"
  | "validated"
  | "exported"
  | "archived";

export interface ZmoAnnouncementSummary {
  total: number;
  by_status: Record<ZmoAnnouncementStatus, number>;
  recent_count: number;
  pending_review: number;
}

export interface ZmoAnnouncementAction {
  id: string;
  announce_key: string;
  action_type: "review" | "validate" | "reject" | "export" | "archive";
  user_id: string;
  comments?: string;
  created_at: Date;
}

// Helper functions
export const getStatusColor = (status: ZmoAnnouncementStatus): string => {
  switch (status) {
    case "raw_content":
      return "#666666";
    case "llm_processing":
      return "#0078d4";
    case "llm_completed":
      return "#107c10";
    case "llm_failed":
      return "#d13438";
    case "manual_review":
      return "#ff8c00";
    case "validated":
      return "#00b294";
    case "exported":
      return "#5c2d91";
    case "archived":
      return "#979593";
    default:
      return "#666666";
  }
};

export const getStatusDisplayName = (
  status: ZmoAnnouncementStatus,
  t: (key: string) => string
): string => {
  return t(`zmo.status.${status}`);
};
