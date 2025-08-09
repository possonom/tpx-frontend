// src/app/(auth)/layout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Navigation20Regular,
  Dismiss24Regular,
  Home24Regular,
  BuildingRetail24Regular,
  Heart24Regular,
  ArrowSwap24Regular,
  DocumentBulletList24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";

const useStyles = makeStyles({
  root: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "280px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "60px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: "12px",
  },
  mobileMenuButton: {
    display: "none",
    "@media (max-width: 768px)": {
      display: "flex",
    },
  },
  main: {
    flex: 1,
    padding: "24px",
    "@media (max-width: 768px)": {
      padding: "16px",
    },
  },
  nav: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    borderRadius: "4px",
    textDecoration: "none",
    color: tokens.colorNeutralForeground1,
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("navigation");
  const { data: session, status } = useSession();
  const router = useRouter();
  const styles = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { href: "/dashboard", label: t("dashboard"), icon: <Home24Regular /> },
    {
      href: "/practices",
      label: t("medicalPractices"),
      icon: <Heart24Regular />,
    },
    {
      href: "/pharmacies",
      label: t("pharmacies"),
      icon: <BuildingRetail24Regular />,
    },
    {
      href: "/transactions",
      label: t("transactions"),
      icon: <ArrowSwap24Regular />,
    },
    {
      href: "/announcements",
      label: t("zmoAnnouncements"),
      icon: <DocumentBulletList24Regular />,
    },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const Navigation = () => (
    <nav className={styles.nav}>
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.navItem}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">THP AG</h2>
          <p className="text-sm text-gray-600">{t("brokerageDashboard")}</p>
        </div>
        <Navigation />
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <Button
            className={styles.mobileMenuButton}
            appearance="subtle"
            icon={<Navigation20Regular />}
            onClick={() => setDrawerOpen(true)}
          />
          <div className="flex-1" />
          <div className="text-sm ml-4">
            {session.user?.name || session.user?.email}
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>

      <OverlayDrawer
        open={drawerOpen}
        onOpenChange={(_, { open }) => setDrawerOpen(open)}
        position="start"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => setDrawerOpen(false)}
              />
            }
          >
            {t("menu")}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <Navigation />
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
}
