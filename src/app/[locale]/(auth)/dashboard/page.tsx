// src/app/(auth)/dashboard/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  Text,
  makeStyles,
  tokens,
  Spinner,
} from "@fluentui/react-components";
import {
  Heart24Filled,
  BuildingRetail24Filled,
  ArrowSwap24Filled,
  Money24Filled,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statIcon: {
    fontSize: "24px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
  },
  statLabel: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
  },
  chartContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "24px",
    borderRadius: "8px",
    marginTop: "24px",
  },
});

async function fetchDashboardStats() {
  const response = await fetch("/api/v1/dashboard/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const styles = useStyles();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner label={t("loading")} />
      </div>
    );
  }

  const statCards = [
    {
      icon: <Heart24Filled />,
      label: t("activePractices"),
      value: stats?.activePractices || 0,
      color: tokens.colorPaletteRedBackground3,
    },
    {
      icon: <BuildingRetail24Filled />,
      label: t("activePharmacies"),
      value: stats?.activePharmacies || 0,
      color: tokens.colorPaletteGreenBackground3,
    },
    {
      icon: <ArrowSwap24Filled />,
      label: t("openTransactions"),
      value: stats?.openTransactions || 0,
      color: tokens.colorPaletteBlueBackground2,
    },
    {
      icon: <Money24Filled />,
      label: t("monthlyRevenue"),
      value: `€${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      color: tokens.colorPaletteYellowBackground3,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <Text size={400}>{t("subtitle")}</Text>
      </div>

      <div className={styles.grid}>
        {statCards.map((stat, index) => (
          <Card key={index} className={styles.statCard}>
            <CardHeader
              header={
                <div className={styles.statHeader}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              }
            />
          </Card>
        ))}
      </div>

      <div className={styles.chartContainer}>
        <h2 className="text-xl font-semibold mb-4">{t("transactionTrends")}</h2>
        {/* Chart component would go here */}
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t("chartPlaceholder")}
        </div>
      </div>
    </div>
  );
}
