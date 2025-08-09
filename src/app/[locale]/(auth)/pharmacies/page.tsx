"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  BuildingRetail24Regular,
  Eye24Regular,
  Edit24Regular,
  Delete24Regular,
  Add24Regular,
  Search24Regular,
} from "@fluentui/react-icons";
import {
  Pharmacy,
  PharmacyStatus,
  PharmacyType,
} from "../../../../domain/entities/Pharmacy";

// Interface for raw API response with date strings
interface RawPharmacy extends Omit<Pharmacy, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
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
    alignItems: "flex-start",
    gap: "16px",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filters: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    padding: "16px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: tokens.colorBrandForeground1,
  },
  pharmaciesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "16px",
  },
  pharmacyCard: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: tokens.shadow8,
    },
  },
  pharmacyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },
  pharmacyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  pharmacyDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gap: "16px",
    textAlign: "center",
  },
});

// API function to fetch pharmacies
async function fetchPharmacies(filters: {
  status?: PharmacyStatus;
  type?: PharmacyType;
  search?: string;
}): Promise<{
  pharmacies: Pharmacy[];
  summary: {
    total: number;
    active: number;
    forSale: number;
    recentRevenue: number;
  };
}> {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.type) params.append("type", filters.type);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`/api/v1/pharmacies?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch pharmacies");
  }

  const data = await response.json();

  // Convert date strings back to Date objects
  const pharmacies = data.pharmacies.map((pharmacy: RawPharmacy) => ({
    ...pharmacy,
    createdAt: new Date(pharmacy.createdAt),
    updatedAt: new Date(pharmacy.updatedAt),
  })) as Pharmacy[];

  return {
    pharmacies,
    summary: data.summary,
  };
}

function getStatusColor(
  status: PharmacyStatus
): "success" | "warning" | "important" | "subtle" | "danger" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FOR_SALE":
      return "warning";
    case "UNDER_CONTRACT":
      return "important";
    case "SOLD":
      return "subtle";
    case "INACTIVE":
      return "danger";
    default:
      return "subtle";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PharmaciesPage() {
  const t = useTranslations("pharmacies");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const styles = useStyles();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PharmacyStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<PharmacyType | "">("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "pharmacies",
      { search: searchTerm, status: statusFilter, type: typeFilter },
    ],
    queryFn: () =>
      fetchPharmacies({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as PharmacyStatus | "");
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type as PharmacyType | "");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label={tCommon("loading")} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.emptyState}>
        <Text size={500}>{tCommon("error")}</Text>
        <Button onClick={() => refetch()}>{tCommon("retry")}</Button>
      </div>
    );
  }

  const {
    pharmacies = [],
    summary = { total: 0, active: 0, forSale: 0, recentRevenue: 0 },
  } = data || {};

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Text size={600} weight="semibold">
            {t("title")}
          </Text>
          <Text size={400} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("subtitle")}
          </Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          size="medium"
          onClick={() => router.push("/pharmacies/add")}
        >
          {t("addNew")}
        </Button>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{summary.total}</div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {tCommon("total")} {t("title")}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{summary.active}</div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("active")}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{summary.forSale}</div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("forSale")}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {formatCurrency(summary.recentRevenue)}
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("revenue")}
          </Text>
        </Card>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <SearchBox
          placeholder={t("search")}
          value={searchTerm}
          onChange={(_, data) => handleSearch(data.value)}
          contentBefore={<Search24Regular />}
          size="medium"
        />
        <Dropdown
          placeholder={tCommon("status")}
          value={statusFilter}
          onOptionSelect={(_, data) =>
            handleStatusFilter(data.optionValue as string)
          }
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="ACTIVE">{t("active")}</Option>
          <Option value="FOR_SALE">Zum Verkauf</Option>
          <Option value="UNDER_CONTRACT">Unter Vertrag</Option>
          <Option value="SOLD">Verkauft</Option>
          <Option value="INACTIVE">{t("inactive")}</Option>
        </Dropdown>
        <Dropdown
          placeholder="Typ"
          value={typeFilter}
          onOptionSelect={(_, data) =>
            handleTypeFilter(data.optionValue as string)
          }
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="RETAIL">Einzelhandel</Option>
          <Option value="HOSPITAL">Krankenhaus</Option>
          <Option value="CLINICAL">Klinisch</Option>
          <Option value="COMPOUNDING">Rezeptur</Option>
          <Option value="SPECIALTY">Spezialist</Option>
          <Option value="MAIL_ORDER">Versandhandel</Option>
          <Option value="ONLINE">Online</Option>
        </Dropdown>
      </div>

      {/* Pharmacies Grid */}
      {pharmacies.length === 0 ? (
        <div className={styles.emptyState}>
          <BuildingRetail24Regular />
          <Text size={500}>{t("noResults")}</Text>
        </div>
      ) : (
        <div className={styles.pharmaciesGrid}>
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} className={styles.pharmacyCard}>
              <CardHeader>
                <div className={styles.pharmacyHeader}>
                  <div className={styles.pharmacyTitle}>{pharmacy.name}</div>
                  <Badge
                    appearance="tint"
                    color={getStatusColor(pharmacy.status)}
                    size="small"
                  >
                    {pharmacy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardPreview>
                <div className={styles.pharmacyDetails}>
                  <div className={styles.detailRow}>
                    <Text size={300}>{t("location")}:</Text>
                    <Text size={300}>
                      {pharmacy.location.city}, {pharmacy.location.state}
                    </Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Typ:</Text>
                    <Text size={300}>{pharmacy.type}</Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>{t("revenue")}:</Text>
                    <Text size={300} weight="semibold">
                      {formatCurrency(pharmacy.revenue.annual)}
                    </Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Inhaber:</Text>
                    <Text size={300}>{pharmacy.owner.name}</Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>{t("created")}:</Text>
                    <Text size={300}>
                      {pharmacy.createdAt.toLocaleDateString("de-DE")}
                    </Text>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button
                    appearance="subtle"
                    icon={<Eye24Regular />}
                    size="small"
                  >
                    {t("view")}
                  </Button>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                  >
                    {t("delete")}
                  </Button>
                </div>
              </CardPreview>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
