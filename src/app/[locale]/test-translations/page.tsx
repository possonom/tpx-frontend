"use client";

import { useTranslations } from "next-intl";

export default function TestTranslationsPage() {
  const t = useTranslations("navigation");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Translation Test</h1>
      <ul>
        <li>Dashboard: {t("dashboard")}</li>
        <li>ZMO Announcements: {t("zmoAnnouncements")}</li>
        <li>Practices: {t("medicalPractices")}</li>
      </ul>
    </div>
  );
}
