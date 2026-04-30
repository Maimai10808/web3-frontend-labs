import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { defaultLocale, locales } from "@web3-frontend-labs/i18n/config";

import enMessages from "./messages/en.json";
import zhCnMessages from "./messages/zh-CN.json";
import jaMessages from "./messages/ja.json";

const messagesByLocale = {
  en: enMessages,
  "zh-CN": zhCnMessages,
  ja: jaMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
