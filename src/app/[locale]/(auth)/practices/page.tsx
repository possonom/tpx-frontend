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
  Heart24Regular,
  Eye24Regular,
  Edit24Regular,
  Delete24Regular,
  Add24Regular,
  Search24Regular,
} from "@fluentui/react-icons";
import {
  MedicalPractice,
  PracticeStatus,
  MedicalSpecialization,
} from "../../../../domain/entities/Practice";

// Interface for raw API response with date strings
interface RawMedicalPractice extends Omit<MedicalPractice, 'createdAt' | 'updatedAt'> {
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
  practicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "16px",
  },
  practiceCard: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: tokens.shadow8,
    },
  },
  practiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },
  practiceTitle: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  practiceDetails: {
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

// API function to fetch practices
async function fetchPractices(filters: {
  status?: PracticeStatus;
  specialization?: MedicalSpecialization;
  search?: string;
}): Promise<{
  practices: MedicalPractice[];
  summary: {
    total: number;
    active: number;
    forSale: number;
    totalValue: number;
  };
}> {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.specialization) params.append("specialization", filters.specialization);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`/api/v1/practices?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch practices");
  }

  const data = await response.json();
  
  // Convert date strings back to Date objects
  const practices = data.practices.map((practice: RawMedicalPractice) => ({
    ...practice,
    createdAt: new Date(practice.createdAt),
    updatedAt: new Date(practice.updatedAt),
    valuation: {
      ...practice.valuation,
      valuationDate: new Date(practice.valuation.valuationDate),
    },
  })) as MedicalPractice[];

  return {
    practices,
    summary: data.summary,
  };
}

function getStatusColor(status: PracticeStatus): "success" | "warning" | "important" | "subtle" | "danger" {
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

function getSpecializationDisplayName(specialization: MedicalSpecialization): string {
  const specializationMap: Record<MedicalSpecialization, string> = {
    GENERAL_PRACTICE: "Allgemeinmedizin",
    CARDIOLOGY: "Kardiologie",
    DERMATOLOGY: "Dermatologie",
    ORTHOPEDICS: "Orthopädie",
    PEDIATRICS: "Pädiatrie",
    PSYCHIATRY: "Psychiatrie",
    RADIOLOGY: "Radiologie",
    SURGERY: "Chirurgie",
    INTERNAL_MEDICINE: "Innere Medizin",
    EMERGENCY_MEDICINE: "Notfallmedizin",
    ANESTHESIOLOGY: "Anästhesiologie",
    OBSTETRICS_GYNECOLOGY: "Gynäkologie",
    OPHTHALMOLOGY: "Augenheilkunde",
    ENT: "HNO",
    UROLOGY: "Urologie",
    NEUROLOGY: "Neurologie",
    ONCOLOGY: "Onkologie",
    PATHOLOGY: "Pathologie",
    OTHER: "Sonstige",
  };
  return specializationMap[specialization] || specialization;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PracticesPage() {
  const t = useTranslations("practices");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const styles = useStyles();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PracticeStatus | "">("");
  const [specializationFilter, setSpecializationFilter] = useState<MedicalSpecialization | "">("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["practices", { search: searchTerm, status: statusFilter, specialization: specializationFilter }],
    queryFn: () =>
      fetchPractices({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        specialization: specializationFilter || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as PracticeStatus | "");
  };

  const handleSpecializationFilter = (specialization: string) => {
    setSpecializationFilter(specialization as MedicalSpecialization | "");
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

  const { practices = [], summary = { total: 0, active: 0, forSale: 0, totalValue: 0 } } = data || {};

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
          onClick={() => router.push("/practices/add")}
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
            Zum Verkauf
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {formatCurrency(summary.totalValue)}
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Gesamtwert
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
          onOptionSelect={(_, data) => handleStatusFilter(data.optionValue as string)}
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="ACTIVE">{t("active")}</Option>
          <Option value="FOR_SALE">Zum Verkauf</Option>
          <Option value="UNDER_CONTRACT">Unter Vertrag</Option>
          <Option value="SOLD">Verkauft</Option>
          <Option value="INACTIVE">{t("inactive")}</Option>
        </Dropdown>
        <Dropdown
          placeholder="Fachrichtung"
          value={specializationFilter}
          onOptionSelect={(_, data) => handleSpecializationFilter(data.optionValue as string)}
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="GENERAL_PRACTICE">Allgemeinmedizin</Option>
          <Option value="CARDIOLOGY">Kardiologie</Option>
          <Option value="DERMATOLOGY">Dermatologie</Option>
          <Option value="ORTHOPEDICS">Orthopädie</Option>
          <Option value="PEDIATRICS">Pädiatrie</Option>
          <Option value="PSYCHIATRY">Psychiatrie</Option>
          <Option value="INTERNAL_MEDICINE">Innere Medizin</Option>
          <Option value="SURGERY">Chirurgie</Option>
          <Option value="OTHER">Sonstige</Option>
        </Dropdown>
      </div>

      {/* Practices Grid */}
      {practices.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart24Regular />
          <Text size={500}>{t("noResults")}</Text>
        </div>
      ) : (
        <div className={styles.practicesGrid}>
          {practices.map((practice) => (
            <Card key={practice.id} className={styles.practiceCard}>
              <CardHeader>
                <div className={styles.practiceHeader}>
                  <div className={styles.practiceTitle}>
                    {practice.name}
                  </div>
                  <Badge
                    appearance="tint"
                    color={getStatusColor(practice.status)}
                    size="small"
                  >
                    {practice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardPreview>
                <div className={styles.practiceDetails}>
                  <div className={styles.detailRow}>
                    <Text size={300}>{t("location")}:</Text>
                    <Text size={300}>
                      {practice.location.city}, {practice.location.state}
                    </Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Fachrichtung:</Text>
                    <Text size={300}>{getSpecializationDisplayName(practice.specialization)}</Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Bewertung:</Text>
                    <Text size={300} weight="semibold">
                      {formatCurrency(practice.valuation.estimatedValue)}
                    </Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Umsatz:</Text>
                    <Text size={300}>
                      {practice.valuation.annualRevenue ? formatCurrency(practice.valuation.annualRevenue) : "-"}
                    </Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>Inhaber:</Text>
                    <Text size={300}>{practice.owner.name}</Text>
                  </div>
                  <div className={styles.detailRow}>
                    <Text size={300}>{t("created")}:</Text>
                    <Text size={300}>
                      {practice.createdAt.toLocaleDateString("de-DE")}
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
