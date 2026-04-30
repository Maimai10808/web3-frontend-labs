import createMiddleware from "next-intl/middleware";
import { routing } from "@web3-frontend-labs/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(zh-CN|en)/:path*"],
};
