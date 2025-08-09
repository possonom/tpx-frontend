"use client";

import { useTranslations } from "next-intl";
import {
  Field,
  Input,
  Dropdown,
  Option,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { ContactInfo } from "../../../domain";

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
});

interface ContactFormProps {
  contact: Partial<ContactInfo>;
  onChange: (contact: Partial<ContactInfo>) => void;
  errors?: Record<string, string>;
}

export default function ContactForm({
  contact,
  onChange,
  errors,
}: ContactFormProps) {
  const t = useTranslations();
  const styles = useStyles();

  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({
      ...contact,
      [field]: value,
    });
  };

  return (
    <div className={styles.formSection}>
      <Field
        label={t("contact.email")}
        required
        validationMessage={errors?.email}
        validationState={errors?.email ? "error" : "none"}
      >
        <Input
          type="email"
          value={contact.email || ""}
          onChange={(_, data) => handleChange("email", data.value)}
          placeholder={t("contact.email")}
        />
      </Field>

      <div className={styles.formRow}>
        <Field
          className={styles.formField}
          label={t("contact.phone")}
          required
          validationMessage={errors?.phone}
          validationState={errors?.phone ? "error" : "none"}
        >
          <Input
            type="tel"
            value={contact.phone || ""}
            onChange={(_, data) => handleChange("phone", data.value)}
            placeholder={t("contact.phone")}
          />
        </Field>

        <Field
          className={styles.formField}
          label={t("contact.mobile")}
          validationMessage={errors?.mobile}
          validationState={errors?.mobile ? "error" : "none"}
        >
          <Input
            type="tel"
            value={contact.mobile || ""}
            onChange={(_, data) => handleChange("mobile", data.value)}
            placeholder={t("contact.mobile")}
          />
        </Field>
      </div>

      <Field
        label={t("contact.preferredContact")}
        validationMessage={errors?.preferredContact}
        validationState={errors?.preferredContact ? "error" : "none"}
      >
        <Dropdown
          value={contact.preferredContact || "EMAIL"}
          selectedOptions={[contact.preferredContact || "EMAIL"]}
          onOptionSelect={(_, data) =>
            handleChange("preferredContact", data.optionValue as string)
          }
          placeholder={t("contact.preferredContact")}
        >
          <Option value="EMAIL">{t("contact.email")}</Option>
          <Option value="PHONE">{t("contact.phone")}</Option>
          <Option value="MAIL">Mail</Option>
        </Dropdown>
      </Field>
    </div>
  );
}
