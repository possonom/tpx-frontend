"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
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
  const locale = useLocale();
  const styles = useStyles();

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from the pathname and add the new one
    const segments = pathname.split('/').filter(Boolean);
    // Remove the first segment if it's a locale
    if (segments[0] === locale) {
      segments.shift();
    }
    const pathWithoutLocale = segments.length > 0 ? `/${segments.join('/')}` : '/dashboard';
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  const languages = [
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

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
              disabled={language.code === locale}
            >
              {language.flag} {language.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
