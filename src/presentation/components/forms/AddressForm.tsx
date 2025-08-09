"use client";

import { useTranslations } from "next-intl";
import { Field, Input, makeStyles, tokens } from "@fluentui/react-components";
import { Address } from "../../../domain";

const useStyles = makeStyles({
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
  formFieldHalf: {
    flex: "1",
    minWidth: "150px",
  },
});

interface AddressFormProps {
  address: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  errors?: Record<string, string>;
}

export default function AddressForm({
  address,
  onChange,
  errors,
}: AddressFormProps) {
  const t = useTranslations();
  const styles = useStyles();

  const handleChange = (field: keyof Address, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <div className={styles.formSection}>
      <Field
        label={t("address.street")}
        required
        validationMessage={errors?.street}
        validationState={errors?.street ? "error" : "none"}
      >
        <Input
          value={address.street || ""}
          onChange={(_, data) => handleChange("street", data.value)}
          placeholder={t("address.street")}
        />
      </Field>

      <div className={styles.formRow}>
        <Field
          className={styles.formField}
          label={t("address.city")}
          required
          validationMessage={errors?.city}
          validationState={errors?.city ? "error" : "none"}
        >
          <Input
            value={address.city || ""}
            onChange={(_, data) => handleChange("city", data.value)}
            placeholder={t("address.city")}
          />
        </Field>

        <Field
          className={styles.formFieldHalf}
          label={t("address.state")}
          required
          validationMessage={errors?.state}
          validationState={errors?.state ? "error" : "none"}
        >
          <Input
            value={address.state || ""}
            onChange={(_, data) => handleChange("state", data.value)}
            placeholder={t("address.state")}
          />
        </Field>
      </div>

      <div className={styles.formRow}>
        <Field
          className={styles.formFieldHalf}
          label={t("address.postalCode")}
          required
          validationMessage={errors?.postalCode}
          validationState={errors?.postalCode ? "error" : "none"}
        >
          <Input
            value={address.postalCode || ""}
            onChange={(_, data) => handleChange("postalCode", data.value)}
            placeholder={t("address.postalCode")}
          />
        </Field>

        <Field
          className={styles.formField}
          label={t("address.country")}
          required
          validationMessage={errors?.country}
          validationState={errors?.country ? "error" : "none"}
        >
          <Input
            value={address.country || ""}
            onChange={(_, data) => handleChange("country", data.value)}
            placeholder={t("address.country")}
          />
        </Field>
      </div>
    </div>
  );
}
