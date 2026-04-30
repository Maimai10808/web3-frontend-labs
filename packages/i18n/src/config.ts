export const locales = ["en", "zh-CN", "ja"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  ja: "日本語",
};
