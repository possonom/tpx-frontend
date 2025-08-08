"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  Text,
  Button,
  Badge,
  makeStyles,
  tokens,
  Spinner,
  SearchBox,
  Dropdown,
  Option,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@fluentui/react-components";
import {
  ArrowSwap24Regular,
  Eye24Regular,
  Edit24Regular,
  Delete24Regular,
  Add24Regular,
  Search24Regular,
  MoneyHand24Regular,
} from "@fluentui/react-icons";
import {
  BrokerageTransaction,
  TransactionStatus,
  TransactionType,
} from "../../../../domain/entities/Transaction";

// Interface for raw API response with date strings
interface RawBrokerageTransaction extends Omit<BrokerageTransaction, 'createdAt' | 'updatedAt' | 'timeline'> {
  createdAt: string;
  updatedAt: string;
  timeline: {
    initiatedAt: string;
    dueDiligenceStarted?: string;
    dueDiligenceCompleted?: string;
    contractSigned?: string;
    closingScheduled?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
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
  tableContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    overflow: "hidden",
    boxShadow: tokens.shadow4,
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
  actionButton: {
    minWidth: "auto",
  },
  commissionCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionButtons: {
    display: "flex",
    gap: "4px",
  },
});

// API function to fetch transactions
async function fetchTransactions(filters: {
  status?: TransactionStatus;
  type?: TransactionType;
  search?: string;
}): Promise<{
  transactions: BrokerageTransaction[];
  summary: {
    total: number;
    active: number;
    completed: number;
    totalValue: number;
    totalCommission: number;
  };
}> {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.type) params.append("type", filters.type);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`/api/v1/transactions?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  const data = await response.json();
  
  // Convert date strings back to Date objects
  const transactions = data.transactions.map((transaction: RawBrokerageTransaction) => ({
    ...transaction,
    createdAt: new Date(transaction.createdAt),
    updatedAt: new Date(transaction.updatedAt),
    timeline: {
      ...transaction.timeline,
      initiatedAt: new Date(transaction.timeline.initiatedAt),
      dueDiligenceStarted: transaction.timeline.dueDiligenceStarted 
        ? new Date(transaction.timeline.dueDiligenceStarted) 
        : undefined,
      dueDiligenceCompleted: transaction.timeline.dueDiligenceCompleted 
        ? new Date(transaction.timeline.dueDiligenceCompleted) 
        : undefined,
      contractSigned: transaction.timeline.contractSigned 
        ? new Date(transaction.timeline.contractSigned) 
        : undefined,
      closingScheduled: transaction.timeline.closingScheduled 
        ? new Date(transaction.timeline.closingScheduled) 
        : undefined,
      completedAt: transaction.timeline.completedAt 
        ? new Date(transaction.timeline.completedAt) 
        : undefined,
      cancelledAt: transaction.timeline.cancelledAt 
        ? new Date(transaction.timeline.cancelledAt) 
        : undefined,
    },
  })) as BrokerageTransaction[];

  return {
    transactions,
    summary: data.summary,
  };
}

function getStatusColor(status: TransactionStatus): "success" | "warning" | "important" | "subtle" | "danger" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "CONTRACT_SIGNED":
    case "CLOSING":
      return "important";
    case "DUE_DILIGENCE":
    case "NEGOTIATION":
      return "warning";
    case "INITIATED":
      return "subtle";
    case "CANCELLED":
      return "danger";
    default:
      return "subtle";
  }
}

function getStatusDisplayName(status: TransactionStatus): string {
  const statusMap: Record<TransactionStatus, string> = {
    INITIATED: "Eingeleitet",
    DUE_DILIGENCE: "Due Diligence",
    NEGOTIATION: "Verhandlung",
    CONTRACT_SIGNED: "Vertrag unterzeichnet",
    CLOSING: "Abschluss",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
  };
  return statusMap[status] || status;
}

function getTypeDisplayName(type: TransactionType): string {
  const typeMap: Record<TransactionType, string> = {
    PRACTICE_SALE: "Praxisverkauf",
    PHARMACY_SALE: "Apothekenverkauf",
    MERGER: "Fusion",
    ACQUISITION: "Übernahme",
    PARTNERSHIP: "Partnerschaft",
  };
  return typeMap[type] || type;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionsPage() {
  const t = useTranslations("transactions");
  const tCommon = useTranslations("common");
  const styles = useStyles();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transactions", { search: searchTerm, status: statusFilter, type: typeFilter }],
    queryFn: () =>
      fetchTransactions({
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
    setStatusFilter(status as TransactionStatus | "");
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type as TransactionType | "");
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

  const { transactions = [], summary = { total: 0, active: 0, completed: 0, totalValue: 0, totalCommission: 0 } } = data || {};

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
        >
          Neue Transaktion
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
            Aktive Transaktionen
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{summary.completed}</div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("completed")}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {formatCurrency(summary.totalValue)}
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("totalAmount")}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {formatCurrency(summary.totalCommission)}
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {t("totalCommission")}
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
          placeholder={t("status")}
          value={statusFilter}
          onOptionSelect={(_, data) => handleStatusFilter(data.optionValue as string)}
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="INITIATED">Eingeleitet</Option>
          <Option value="DUE_DILIGENCE">Due Diligence</Option>
          <Option value="NEGOTIATION">Verhandlung</Option>
          <Option value="CONTRACT_SIGNED">Vertrag unterzeichnet</Option>
          <Option value="CLOSING">Abschluss</Option>
          <Option value="COMPLETED">{t("completed")}</Option>
          <Option value="CANCELLED">{t("cancelled")}</Option>
        </Dropdown>
        <Dropdown
          placeholder={t("type")}
          value={typeFilter}
          onOptionSelect={(_, data) => handleTypeFilter(data.optionValue as string)}
        >
          <Option value="">{tCommon("all")}</Option>
          <Option value="PRACTICE_SALE">Praxisverkauf</Option>
          <Option value="PHARMACY_SALE">Apothekenverkauf</Option>
          <Option value="MERGER">Fusion</Option>
          <Option value="ACQUISITION">Übernahme</Option>
          <Option value="PARTNERSHIP">Partnerschaft</Option>
        </Dropdown>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <ArrowSwap24Regular />
          <Text size={500}>{t("noResults")}</Text>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <Table arial-label="Transactions table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>{t("type")}</TableHeaderCell>
                <TableHeaderCell>{t("client")}</TableHeaderCell>
                <TableHeaderCell>{t("amount")}</TableHeaderCell>
                <TableHeaderCell>{t("commission")}</TableHeaderCell>
                <TableHeaderCell>{t("status")}</TableHeaderCell>
                <TableHeaderCell>{t("date")}</TableHeaderCell>
                <TableHeaderCell>{t("broker")}</TableHeaderCell>
                <TableHeaderCell>Aktionen</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Text size={300} font="monospace">
                      {transaction.id.slice(0, 8)}...
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>
                      {getTypeDisplayName(transaction.type)}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>
                      {transaction.seller.name}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300} weight="semibold">
                      {formatCurrency(transaction.dealValue)}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <div className={styles.commissionCell}>
                      <MoneyHand24Regular fontSize="16px" />
                      <Text size={300}>
                        {formatCurrency(transaction.commission.totalAmount)}
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      appearance="tint"
                      color={getStatusColor(transaction.status)}
                      size="small"
                    >
                      {getStatusDisplayName(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>
                      {transaction.timeline.initiatedAt.toLocaleDateString("de-DE")}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>
                      {transaction.assignedBroker}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        appearance="subtle"
                        icon={<Eye24Regular />}
                        size="small"
                        className={styles.actionButton}
                      />
                      <Button
                        appearance="subtle"
                        icon={<Edit24Regular />}
                        size="small"
                        className={styles.actionButton}
                      />
                      <Button
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        size="small"
                        className={styles.actionButton}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
