import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@web3-frontend-labs/i18n", "@web3-frontend-labs/ui"],
};

export default withNextIntl(nextConfig);
