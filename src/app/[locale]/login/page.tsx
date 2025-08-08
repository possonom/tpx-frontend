"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardPreview,
  Button,
  Title1,
  Title3,
  Text,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
} from "@fluentui/react-components";
import { PersonRegular, ShieldCheckmarkRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackground2} 100%)`,
    ...shorthands.padding("20px"),
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    ...shorthands.padding("0"),
    boxShadow: tokens.shadow64,
  },
  cardPreview: {
    ...shorthands.padding("40px"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.gap("24px"),
  },
  logo: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    marginBottom: "20px",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    marginBottom: "32px",
  },
  button: {
    width: "100%",
    height: "48px",
    fontSize: "16px",
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    textAlign: "center",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
    width: "100%",
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.padding("24px", "0", "0", "0"),
    marginTop: "8px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    color: tokens.colorNeutralForeground2,
  },
});

export default function LoginPage() {
  const t = useTranslations("auth");
  const styles = useStyles();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For development, use credentials provider
      const result = await signIn("credentials", {
        email: "admin@thp-ag.com",
        password: "admin",
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(t("loginError"));
      } else if (result?.url) {
        router.push(result.url);
      } else {
        // If no URL returned but no error, redirect to dashboard
        router.push("/dashboard");
      }
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          header={
            <div className={styles.logo}>
              <ShieldCheckmarkRegular
                style={{
                  fontSize: "32px",
                  color: tokens.colorBrandForeground1,
                }}
              />
              <Title1>THP AG</Title1>
            </div>
          }
        />
        <CardPreview className={styles.cardPreview}>
          <div>
            <Title3 className={styles.title}>{t("welcomeBack")}</Title3>
            <Text className={styles.subtitle}>{t("loginSubtitle")}</Text>
          </div>

          <Button
            appearance="primary"
            className={styles.button}
            onClick={handleLogin}
            disabled={isLoading}
            icon={isLoading ? <Spinner size="tiny" /> : <PersonRegular />}
          >
            {isLoading ? t("signingIn") : t("signInSSO")}
          </Button>

          {error && (
            <Text className={styles.errorText} size={300}>
              {error}
            </Text>
          )}

          <div className={styles.features}>
            <div className={styles.feature}>
              <ShieldCheckmarkRegular />
              <Text size={300}>{t("secureAuth")}</Text>
            </div>
            <div className={styles.feature}>
              <PersonRegular />
              <Text size={300}>{t("roleBasedAccess")}</Text>
            </div>
          </div>
        </CardPreview>
      </Card>
    </div>
  );
}
