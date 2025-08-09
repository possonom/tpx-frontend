"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Button,
  Badge,
  makeStyles,
  tokens,
  Spinner,
  SearchBox,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import {
  DocumentBulletList24Regular,
  Eye24Regular,
  Checkmark24Regular,
  Dismiss24Regular,
  ArrowExport24Regular,
  Archive24Regular,
} from "@fluentui/react-icons";
import {
  ZmoAnnouncement,
  ZmoAnnouncementStatus,
  getStatusColor,
} from "@domain/domain/entities/ZmoAnnouncement";

// Interface for raw API response with date strings
interface RawZmoAnnouncement
  extends Omit<ZmoAnnouncement, "created_at" | "updated_at"> {
  created_at: string;
  updated_at: string;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  filters: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
  },
  statLabel: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
  announcementsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  announcementCard: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  announcementMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  contentPreview: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
    marginTop: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px",
    color: tokens.colorNeutralForeground3,
  },
});

// API function to fetch announcements
async function fetchZmoAnnouncements(filters: {
  status?: ZmoAnnouncementStatus;
  search?: string;
}): Promise<{
  announcements: ZmoAnnouncement[];
  summary: {
    total: number;
    pendingReview: number;
    recentCount: number;
  };
}> {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`/api/v1/zmo/announcements?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch announcements");
  }

  const data = await response.json();

  // Convert date strings back to Date objects
  const announcements = data.announcements.map(
    (announcement: RawZmoAnnouncement) => ({
      ...announcement,
      created_at: new Date(announcement.created_at),
      updated_at: new Date(announcement.updated_at),
    })
  ) as ZmoAnnouncement[];

  return {
    announcements,
    summary: data.summary,
  };
}

// API function to update announcement status
async function updateAnnouncementStatus(
  announce_key: string,
  action: string
): Promise<void> {
  const response = await fetch("/api/v1/zmo/announcements", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      announce_key,
      action,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update announcement");
  }
}

export default function AnnouncementsPage() {
  const t = useTranslations("zmo");
  const tCommon = useTranslations("common");
  const styles = useStyles();

  const [statusFilter, setStatusFilter] = useState<
    ZmoAnnouncementStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["zmo-announcements", statusFilter, searchQuery],
    queryFn: () =>
      fetchZmoAnnouncements({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      }),
  });

  const handleActionClick = async (announcementKey: string, action: string) => {
    try {
      await updateAnnouncementStatus(announcementKey, action);
      refetch();
    } catch (error) {
      console.error("Failed to update announcement:", error);
      // TODO: Show error toast/notification
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner label={t("loadingData")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <Text>{tCommon("error")}</Text>
        <Button onClick={() => refetch()}>{tCommon("retry")}</Button>
      </div>
    );
  }

  const { announcements, summary } = data || { announcements: [], summary: {} };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <Text size={400}>{t("subtitle")}</Text>
        </div>
        <Button
          appearance="primary"
          icon={<DocumentBulletList24Regular />}
          onClick={() => refetch()}
        >
          {t("refreshData")}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader
            header={
              <div>
                <div className={styles.statValue}>{summary.total || 0}</div>
                <div className={styles.statLabel}>
                  {t("totalAnnouncements")}
                </div>
              </div>
            }
          />
        </Card>
        <Card className={styles.statCard}>
          <CardHeader
            header={
              <div>
                <div className={styles.statValue}>
                  {summary.pendingReview || 0}
                </div>
                <div className={styles.statLabel}>{t("pendingReview")}</div>
              </div>
            }
          />
        </Card>
        <Card className={styles.statCard}>
          <CardHeader
            header={
              <div>
                <div className={styles.statValue}>
                  {summary.recentCount || 0}
                </div>
                <div className={styles.statLabel}>
                  {t("recentAnnouncements")}
                </div>
              </div>
            }
          />
        </Card>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <SearchBox
          placeholder={tCommon("search")}
          value={searchQuery}
          onChange={(_, data) => setSearchQuery(data.value)}
        />
        <Dropdown
          placeholder={t("filters.all")}
          value={statusFilter}
          onOptionSelect={(_, data) =>
            setStatusFilter(data.optionValue as ZmoAnnouncementStatus | "all")
          }
        >
          <Option value="all">{t("filters.all")}</Option>
          <Option value="manual_review">{t("filters.needsReview")}</Option>
          <Option value="validated">{t("filters.processed")}</Option>
          <Option value="llm_failed">{t("filters.failed")}</Option>
        </Dropdown>
      </div>

      {/* Announcements List */}
      <div className={styles.announcementsList}>
        {announcements.length === 0 ? (
          <div className={styles.emptyState}>
            <DocumentBulletList24Regular
              style={{
                fontSize: "48px",
                color: tokens.colorNeutralForeground4,
              }}
            />
            <Text>{t("noAnnouncements")}</Text>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.announce_key}
              className={styles.announcementCard}
            >
              <CardHeader
                header={
                  <div className={styles.announcementHeader}>
                    <div>
                      <Text weight="semibold">
                        {((
                          announcement.announce_content as Record<
                            string,
                            unknown
                          >
                        )?.title as string) || announcement.announce_key}
                      </Text>
                      <div className={styles.announcementMeta}>
                        <Badge
                          color="informative"
                          style={{
                            backgroundColor: getStatusColor(
                              announcement.status
                            ),
                          }}
                        >
                          {t(`status.${announcement.status}`)}
                        </Badge>
                        <Text>
                          {t("sourceType")}: {announcement.source_type}
                        </Text>
                        <Text>
                          {t("created")}:{" "}
                          {announcement.created_at.toLocaleDateString()}
                        </Text>
                        {announcement.pdf_filename && (
                          <Text>
                            {t("filename")}: {announcement.pdf_filename}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <Button
                        size="small"
                        icon={<Eye24Regular />}
                        onClick={() =>
                          handleActionClick(announcement.announce_key, "view")
                        }
                      >
                        {t("viewDetails")}
                      </Button>
                      {announcement.status === "manual_review" && (
                        <>
                          <Button
                            size="small"
                            appearance="primary"
                            icon={<Checkmark24Regular />}
                            onClick={() =>
                              handleActionClick(
                                announcement.announce_key,
                                "validate"
                              )
                            }
                          >
                            {t("validate")}
                          </Button>
                          <Button
                            size="small"
                            icon={<Dismiss24Regular />}
                            onClick={() =>
                              handleActionClick(
                                announcement.announce_key,
                                "reject"
                              )
                            }
                          >
                            {t("reject")}
                          </Button>
                        </>
                      )}
                      {announcement.status === "validated" && (
                        <Button
                          size="small"
                          icon={<ArrowExport24Regular />}
                          onClick={() =>
                            handleActionClick(
                              announcement.announce_key,
                              "export"
                            )
                          }
                        >
                          {t("export")}
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<Archive24Regular />}
                        onClick={() =>
                          handleActionClick(
                            announcement.announce_key,
                            "archive"
                          )
                        }
                      >
                        {t("archive")}
                      </Button>
                    </div>
                  </div>
                }
              />
              <CardPreview>
                <div className={styles.contentPreview}>
                  <Text>
                    {((announcement.announce_content as Record<string, unknown>)
                      ?.summary as string) ||
                      announcement.source_content.substring(0, 150) + "..."}
                  </Text>
                </div>
              </CardPreview>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
