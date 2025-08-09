"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardPreview,
  Text,
  Button,
  Field,
  Input,
  Dropdown,
  Option,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXL,
    maxWidth: "800px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
  },
  formRow: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
  },
  formField: {
    flex: "1",
    minWidth: "200px",
  },
  actions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "flex-end",
    marginTop: tokens.spacingVerticalL,
  },
});

export default function AddPharmacyPage() {
  const router = useRouter();
  const t = useTranslations();
  const styles = useStyles();

  const [formData, setFormData] = useState({
    name: "",
    type: "RETAIL",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    ownerName: "",
    annualRevenue: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/pharmacies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          location: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          revenue: {
            annual: parseFloat(formData.annualRevenue) || 0,
            monthly: (parseFloat(formData.annualRevenue) || 0) / 12,
            prescriptionVolume: 1000,
            averageTicketSize: 50,
            year: new Date().getFullYear(),
          },
          status: "ACTIVE",
          owner: {
            name: formData.ownerName,
            licenseNumber: "TEMP-LICENSE",
            contactInfo: {
              email: "temp@example.com",
              phone: "+49 123 456789",
            },
            ownershipPercentage: 100,
          },
          licenses: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create pharmacy");
      }

      alert("Pharmacy created successfully!");
      router.push("/pharmacies");
    } catch (error) {
      console.error("Error creating pharmacy:", error);
      alert("Error creating pharmacy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/pharmacies");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <Text size={700} weight="bold">
        Add New Pharmacy
      </Text>

      <Card>
        <CardPreview>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Field label="Pharmacy Name" required>
              <Input
                value={formData.name}
                onChange={(_, data) => handleInputChange("name", data.value)}
                placeholder="Enter pharmacy name"
              />
            </Field>

            <Field label="Pharmacy Type">
              <Dropdown
                value={formData.type}
                selectedOptions={[formData.type]}
                onOptionSelect={(_, data) =>
                  handleInputChange("type", data.optionValue as string)
                }
              >
                <Option value="RETAIL">Retail</Option>
                <Option value="HOSPITAL">Hospital</Option>
                <Option value="CLINICAL">Clinical</Option>
                <Option value="COMPOUNDING">Compounding</Option>
                <Option value="SPECIALTY">Specialty</Option>
              </Dropdown>
            </Field>

            <Text size={500} weight="semibold">
              Location
            </Text>

            <Field label="Street" required>
              <Input
                value={formData.street}
                onChange={(_, data) => handleInputChange("street", data.value)}
                placeholder="Street address"
              />
            </Field>

            <div className={styles.formRow}>
              <Field label="City" required className={styles.formField}>
                <Input
                  value={formData.city}
                  onChange={(_, data) => handleInputChange("city", data.value)}
                  placeholder="City"
                />
              </Field>

              <Field label="State" className={styles.formField}>
                <Input
                  value={formData.state}
                  onChange={(_, data) => handleInputChange("state", data.value)}
                  placeholder="State"
                />
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="Postal Code" className={styles.formField}>
                <Input
                  value={formData.postalCode}
                  onChange={(_, data) =>
                    handleInputChange("postalCode", data.value)
                  }
                  placeholder="Postal Code"
                />
              </Field>

              <Field label="Country" className={styles.formField}>
                <Input
                  value={formData.country}
                  onChange={(_, data) =>
                    handleInputChange("country", data.value)
                  }
                  placeholder="Country"
                />
              </Field>
            </div>

            <Text size={500} weight="semibold">
              Owner Information
            </Text>

            <Field label="Owner Name" required>
              <Input
                value={formData.ownerName}
                onChange={(_, data) =>
                  handleInputChange("ownerName", data.value)
                }
                placeholder="Owner name"
              />
            </Field>

            <Field label="Annual Revenue">
              <Input
                type="number"
                value={formData.annualRevenue}
                onChange={(_, data) =>
                  handleInputChange("annualRevenue", data.value)
                }
                placeholder="Annual revenue in EUR"
              />
            </Field>

            <div className={styles.actions}>
              <Button
                appearance="secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                type="submit"
                disabled={isLoading}
                icon={<Add24Regular />}
              >
                {isLoading ? "Creating..." : "Create Pharmacy"}
              </Button>
            </div>
          </form>
        </CardPreview>
      </Card>
    </div>
  );
}
