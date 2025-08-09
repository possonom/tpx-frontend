"use client";

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
  Divider,
} from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";
import {
  MedicalPractice,
  MedicalSpecialization,
  PracticeOwner,
  Address,
  ContactInfo,
} from "../../../domain";
import AddressForm from "./AddressForm";
import ContactForm from "./ContactForm";

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXL,
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    marginBottom: tokens.spacingVerticalL,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
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
  sectionTitle: {
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
});

interface AddPracticeFormProps {
  onSubmit: (
    practice: Omit<MedicalPractice, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddPracticeForm({
  onSubmit,
  onCancel,
  isLoading,
}: AddPracticeFormProps) {
  const t = useTranslations();
  const styles = useStyles();

  const [formData, setFormData] = useState({
    name: "",
    specialization: "GENERAL_PRACTICE" as MedicalSpecialization,
    location: {} as Partial<Address>,
    valuation: {
      estimatedValue: 0,
      valuationDate: new Date(),
      methodology: "INCOME" as "INCOME" | "MARKET" | "ASSET",
      annualRevenue: 0,
      ebitda: 0,
      patientBase: 0,
    },
    status: "ACTIVE" as const,
    owner: {
      name: "",
      licenseNumber: "",
      contactInfo: {} as Partial<ContactInfo>,
    },
    documents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("forms.validation.required");
    }

    if (!formData.location.street?.trim()) {
      newErrors["location.street"] = t("forms.validation.required");
    }

    if (!formData.location.city?.trim()) {
      newErrors["location.city"] = t("forms.validation.required");
    }

    if (!formData.location.postalCode?.trim()) {
      newErrors["location.postalCode"] = t("forms.validation.required");
    }

    if (!formData.location.country?.trim()) {
      newErrors["location.country"] = t("forms.validation.required");
    }

    if (!formData.owner.name?.trim()) {
      newErrors["owner.name"] = t("forms.validation.required");
    }

    if (!formData.owner.licenseNumber?.trim()) {
      newErrors["owner.licenseNumber"] = t("forms.validation.required");
    }

    if (!formData.owner.contactInfo?.email?.trim()) {
      newErrors["owner.email"] = t("forms.validation.required");
    }

    if (!formData.owner.contactInfo?.phone?.trim()) {
      newErrors["owner.phone"] = t("forms.validation.required");
    }

    if (formData.valuation.estimatedValue <= 0) {
      newErrors.estimatedValue = t("forms.validation.positive");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        location: formData.location as Address,
        owner: {
          id: "",
          ...formData.owner,
          contactInfo: formData.owner.contactInfo as ContactInfo,
        } as PracticeOwner,
      });
    }
  };

  const handleLocationChange = (location: Partial<Address>) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleOwnerContactChange = (contactInfo: Partial<ContactInfo>) => {
    setFormData((prev) => ({
      ...prev,
      owner: {
        ...prev.owner,
        contactInfo,
      },
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text size={700} weight="bold">
          {t("practice.addNew")}
        </Text>
      </div>

      <Card>
        <CardPreview>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>{t("forms.name")}</Text>

              <Field
                label={t("forms.name")}
                required
                validationMessage={errors.name}
                validationState={errors.name ? "error" : "none"}
              >
                <Input
                  value={formData.name}
                  onChange={(_, data) =>
                    setFormData((prev) => ({ ...prev, name: data.value }))
                  }
                  placeholder={t("forms.name")}
                />
              </Field>

              <Field label={t("practice.specialization")} required>
                <Dropdown
                  value={formData.specialization}
                  selectedOptions={[formData.specialization]}
                  onOptionSelect={(_, data) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialization: data.optionValue as MedicalSpecialization,
                    }))
                  }
                >
                  {Object.keys(t.raw("practice.specializations")).map(
                    (spec) => (
                      <Option key={spec} value={spec}>
                        {t(`practice.specializations.${spec}`)}
                      </Option>
                    )
                  )}
                </Dropdown>
              </Field>
            </div>

            <Divider />

            {/* Location */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>{t("forms.location")}</Text>
              <AddressForm
                address={formData.location}
                onChange={handleLocationChange}
                errors={{
                  street: errors["location.street"],
                  city: errors["location.city"],
                  state: errors["location.state"],
                  postalCode: errors["location.postalCode"],
                  country: errors["location.country"],
                }}
              />
            </div>

            <Divider />

            {/* Valuation */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Valuation Information</Text>

              <div className={styles.formRow}>
                <Field
                  className={styles.formField}
                  label={t("practice.estimatedValue")}
                  required
                  validationMessage={errors.estimatedValue}
                  validationState={errors.estimatedValue ? "error" : "none"}
                >
                  <Input
                    type="number"
                    value={formData.valuation.estimatedValue.toString()}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        valuation: {
                          ...prev.valuation,
                          estimatedValue: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>

                <Field
                  className={styles.formField}
                  label={t("practice.methodology")}
                >
                  <Dropdown
                    value={formData.valuation.methodology}
                    selectedOptions={[formData.valuation.methodology]}
                    onOptionSelect={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        valuation: {
                          ...prev.valuation,
                          methodology: data.optionValue as
                            | "INCOME"
                            | "MARKET"
                            | "ASSET",
                        },
                      }))
                    }
                  >
                    <Option value="INCOME">
                      {t("practice.methodologies.INCOME")}
                    </Option>
                    <Option value="MARKET">
                      {t("practice.methodologies.MARKET")}
                    </Option>
                    <Option value="ASSET">
                      {t("practice.methodologies.ASSET")}
                    </Option>
                  </Dropdown>
                </Field>
              </div>

              <div className={styles.formRow}>
                <Field
                  className={styles.formField}
                  label={t("practice.annualRevenue")}
                >
                  <Input
                    type="number"
                    value={formData.valuation.annualRevenue?.toString() || ""}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        valuation: {
                          ...prev.valuation,
                          annualRevenue: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>

                <Field
                  className={styles.formField}
                  label={t("practice.ebitda")}
                >
                  <Input
                    type="number"
                    value={formData.valuation.ebitda?.toString() || ""}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        valuation: {
                          ...prev.valuation,
                          ebitda: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>
              </div>

              <Field label={t("practice.patientBase")}>
                <Input
                  type="number"
                  value={formData.valuation.patientBase?.toString() || ""}
                  onChange={(_, data) =>
                    setFormData((prev) => ({
                      ...prev,
                      valuation: {
                        ...prev.valuation,
                        patientBase: parseInt(data.value) || 0,
                      },
                    }))
                  }
                  placeholder="0"
                />
              </Field>
            </div>

            <Divider />

            {/* Owner Information */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>{t("forms.owner")}</Text>

              <div className={styles.formRow}>
                <Field
                  className={styles.formField}
                  label={t("forms.name")}
                  required
                  validationMessage={errors["owner.name"]}
                  validationState={errors["owner.name"] ? "error" : "none"}
                >
                  <Input
                    value={formData.owner.name || ""}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        owner: { ...prev.owner, name: data.value },
                      }))
                    }
                    placeholder={t("forms.name")}
                  />
                </Field>

                <Field
                  className={styles.formField}
                  label={t("practice.licenseNumber")}
                  required
                  validationMessage={errors["owner.licenseNumber"]}
                  validationState={
                    errors["owner.licenseNumber"] ? "error" : "none"
                  }
                >
                  <Input
                    value={formData.owner.licenseNumber || ""}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        owner: { ...prev.owner, licenseNumber: data.value },
                      }))
                    }
                    placeholder={t("practice.licenseNumber")}
                  />
                </Field>
              </div>

              <ContactForm
                contact={formData.owner.contactInfo || {}}
                onChange={handleOwnerContactChange}
                errors={{
                  email: errors["owner.email"],
                  phone: errors["owner.phone"],
                }}
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button
                appearance="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t("forms.cancel")}
              </Button>
              <Button
                appearance="primary"
                type="submit"
                disabled={isLoading}
                icon={<Add24Regular />}
              >
                {isLoading ? "Creating..." : t("forms.create")}
              </Button>
            </div>
          </form>
        </CardPreview>
      </Card>
    </div>
  );
}
