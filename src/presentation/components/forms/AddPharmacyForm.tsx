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
import { Add24Regular, Delete24Regular } from "@fluentui/react-icons";
import {
  Pharmacy,
  PharmacyType,
  PharmacyOwner,
  Address,
  ContactInfo,
  License,
} from "@domain/index";
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
  licenseCard: {
    padding: tokens.spacingVerticalM,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalS,
  },
  licenseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacingVerticalS,
  },
});

interface AddPharmacyFormProps {
  onSubmit: (
    pharmacy: Omit<Pharmacy, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddPharmacyForm({
  onSubmit,
  onCancel,
  isLoading,
}: AddPharmacyFormProps) {
  const t = useTranslations();
  const styles = useStyles();

  const [formData, setFormData] = useState({
    name: "",
    type: "RETAIL" as PharmacyType,
    location: {} as Partial<Address>,
    revenue: {
      annual: 0,
      monthly: 0,
      prescriptionVolume: 0,
      averageTicketSize: 0,
      year: new Date().getFullYear(),
    },
    status: "ACTIVE" as const,
    owner: {
      name: "",
      licenseNumber: "",
      contactInfo: {} as Partial<ContactInfo>,
      ownershipPercentage: 100,
    },
    licenses: [] as Partial<License>[],
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

    if (formData.revenue.annual <= 0) {
      newErrors.annualRevenue = t("forms.validation.positive");
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
        } as PharmacyOwner,
        licenses: formData.licenses as License[],
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

  const addLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [
        ...prev.licenses,
        {
          number: "",
          type: "STATE",
          issuedDate: new Date(),
          expiryDate: new Date(),
          status: "ACTIVE",
        },
      ],
    }));
  };

  const removeLicense = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index),
    }));
  };

  const updateLicense = (
    index: number,
    field: keyof License,
    value: string | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.map((license, i) =>
        i === index ? { ...license, [field]: value } : license
      ),
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text size={700} weight="bold">
          {t("pharmacy.addNew")}
        </Text>
      </div>

      <Card>
        <CardPreview>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Basic Information</Text>

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

              <Field label={t("pharmacy.type")} required>
                <Dropdown
                  value={formData.type}
                  selectedOptions={[formData.type]}
                  onOptionSelect={(_, data) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: data.optionValue as PharmacyType,
                    }))
                  }
                >
                  {Object.keys(t.raw("pharmacy.types")).map((type) => (
                    <Option key={type} value={type}>
                      {t(`pharmacy.types.${type}`)}
                    </Option>
                  ))}
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

            {/* Revenue Information */}
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>
                {t("pharmacy.revenue")}
              </Text>

              <div className={styles.formRow}>
                <Field
                  className={styles.formField}
                  label="Annual Revenue"
                  required
                  validationMessage={errors.annualRevenue}
                  validationState={errors.annualRevenue ? "error" : "none"}
                >
                  <Input
                    type="number"
                    value={formData.revenue.annual.toString()}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue: {
                          ...prev.revenue,
                          annual: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>

                <Field className={styles.formField} label="Monthly Revenue">
                  <Input
                    type="number"
                    value={formData.revenue.monthly.toString()}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue: {
                          ...prev.revenue,
                          monthly: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>
              </div>

              <div className={styles.formRow}>
                <Field
                  className={styles.formField}
                  label={t("pharmacy.prescriptionVolume")}
                >
                  <Input
                    type="number"
                    value={formData.revenue.prescriptionVolume.toString()}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue: {
                          ...prev.revenue,
                          prescriptionVolume: parseInt(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>

                <Field
                  className={styles.formField}
                  label={t("pharmacy.averageTicketSize")}
                >
                  <Input
                    type="number"
                    value={formData.revenue.averageTicketSize.toString()}
                    onChange={(_, data) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue: {
                          ...prev.revenue,
                          averageTicketSize: parseFloat(data.value) || 0,
                        },
                      }))
                    }
                    placeholder="0"
                  />
                </Field>
              </div>
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
                  label="License Number"
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
                    placeholder="License Number"
                  />
                </Field>
              </div>

              <Field label={t("pharmacy.ownershipPercentage")}>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    formData.owner.ownershipPercentage?.toString() || "100"
                  }
                  onChange={(_, data) =>
                    setFormData((prev) => ({
                      ...prev,
                      owner: {
                        ...prev.owner,
                        ownershipPercentage: parseFloat(data.value) || 100,
                      },
                    }))
                  }
                  placeholder="100"
                />
              </Field>

              <ContactForm
                contact={formData.owner.contactInfo || {}}
                onChange={handleOwnerContactChange}
                errors={{
                  email: errors["owner.email"],
                  phone: errors["owner.phone"],
                }}
              />
            </div>

            <Divider />

            {/* Licenses */}
            <div className={styles.formSection}>
              <div className={styles.licenseHeader}>
                <Text className={styles.sectionTitle}>
                  {t("pharmacy.licenses")}
                </Text>
                <Button
                  appearance="secondary"
                  icon={<Add24Regular />}
                  onClick={addLicense}
                >
                  Add License
                </Button>
              </div>

              {formData.licenses.map((license, index) => (
                <div key={index} className={styles.licenseCard}>
                  <div className={styles.licenseHeader}>
                    <Text weight="semibold">License {index + 1}</Text>
                    <Button
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      onClick={() => removeLicense(index)}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <Field className={styles.formField} label="License Number">
                      <Input
                        value={license.number || ""}
                        onChange={(_, data) =>
                          updateLicense(index, "number", data.value)
                        }
                        placeholder="License Number"
                      />
                    </Field>

                    <Field className={styles.formField} label="License Type">
                      <Dropdown
                        value={license.type || "STATE"}
                        selectedOptions={[license.type || "STATE"]}
                        onOptionSelect={(_, data) =>
                          updateLicense(
                            index,
                            "type",
                            data.optionValue as string
                          )
                        }
                      >
                        {Object.keys(t.raw("pharmacy.licenseTypes")).map(
                          (type) => (
                            <Option key={type} value={type}>
                              {t(`pharmacy.licenseTypes.${type}`)}
                            </Option>
                          )
                        )}
                      </Dropdown>
                    </Field>
                  </div>

                  <div className={styles.formRow}>
                    <Field className={styles.formField} label="Issued Date">
                      <Input
                        type="date"
                        value={
                          license.issuedDate
                            ? license.issuedDate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(_, data) =>
                          updateLicense(
                            index,
                            "issuedDate",
                            new Date(data.value)
                          )
                        }
                      />
                    </Field>

                    <Field className={styles.formField} label="Expiry Date">
                      <Input
                        type="date"
                        value={
                          license.expiryDate
                            ? license.expiryDate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(_, data) =>
                          updateLicense(
                            index,
                            "expiryDate",
                            new Date(data.value)
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
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
