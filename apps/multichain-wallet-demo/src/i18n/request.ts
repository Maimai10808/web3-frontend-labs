import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { defaultLocale, locales } from "@web3-frontend-labs/i18n/config";
import enMessages from "@web3-frontend-labs/i18n/messages/en";
import zhCnMessages from "@web3-frontend-labs/i18n/messages/zh-CN";

const messagesByLocale = {
  en: enMessages,
  "zh-CN": zhCnMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
