"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "../../../../i18n/src/config";
import { usePathname, useRouter } from "../../../../i18n/src/navigation";

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: AppLocale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1">
      {locales.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            disabled={isPending}
            onClick={() => handleChange(item)}
            className={
              isActive
                ? "rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            }
          >
            {localeLabels[item]}
          </button>
        );
      })}
    </div>
  );
}
