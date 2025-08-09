import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@fluentui/react-components", "@fluentui/react-icons"],
};

export default withNextIntl(nextConfig);
