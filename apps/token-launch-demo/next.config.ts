import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@web3-frontend-labs/contracts",
    "@web3-frontend-labs/wallet",
  ],
};

export default nextConfig;
