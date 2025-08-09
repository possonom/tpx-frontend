"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "../../i18n";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  makeStyles,
} from "@fluentui/react-components";
import { ChevronDown20Regular, Globe20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  menuButton: {
    minWidth: "auto",
  },
});

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const styles = useStyles();

  // Extract locale from pathname as a fallback
  const segments = pathname.split("/").filter(Boolean);
  const pathnameLocale =
    segments.length > 0 && locales.includes(segments[0] as Locale)
      ? (segments[0] as Locale)
      : "de";

  // Use pathname locale as the current locale (more reliable for URL-based routing)
  const currentLocale = pathnameLocale;

  const switchLanguage = (newLocale: string) => {
    // Split pathname and handle locale detection
    const segments = pathname.split("/").filter(Boolean);

    // Check if the first segment is a valid locale
    let pathWithoutLocale = "";

    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      // First segment is a locale, remove it and keep the rest
      pathWithoutLocale = segments.slice(1).join("/");
    } else {
      // No locale in path, keep all segments
      pathWithoutLocale = segments.join("/");
    }

    // Construct new path with new locale
    const newPath = `/${newLocale}${
      pathWithoutLocale ? `/${pathWithoutLocale}` : "/dashboard"
    }`;

    // Use router.push for navigation
    router.push(newPath);
  };

  const languages = [
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <Menu>
      <MenuTrigger>
        <MenuButton
          appearance="subtle"
          className={styles.menuButton}
          icon={<Globe20Regular />}
          menuIcon={<ChevronDown20Regular />}
        >
          {currentLanguage?.flag} {currentLanguage?.name}
        </MenuButton>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              disabled={language.code === currentLocale}
            >
              {language.flag} {language.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
