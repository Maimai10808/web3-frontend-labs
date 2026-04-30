"use client";

import { Check, Globe2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import {
  localeLabels,
  locales,
  type AppLocale,
} from "../../../../i18n/src/config";
import { usePathname, useRouter } from "../../../../i18n/src/navigation";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: AppLocale) {
    if (nextLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale,
      });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-2 rounded-full border-white/30 bg-white/15 text-white shadow-sm backdrop-blur-md hover:border-white/50 hover:bg-white/25 hover:text-white disabled:opacity-60"
        >
          <Globe2 className="size-4 text-white" />
          <span className="text-white">{localeLabels[locale]}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl border border-white/20 bg-slate-950/80 p-1.5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
      >
        {locales.map((item) => {
          const isActive = item === locale;

          return (
            <DropdownMenuItem
              key={item}
              disabled={isPending}
              onClick={() => handleChange(item)}
              className={
                isActive
                  ? "flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/15 px-3 py-2 text-white outline-none focus:bg-white/20 focus:text-white"
                  : "flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2 text-white/80 outline-none transition-colors focus:bg-white/10 focus:text-white"
              }
            >
              <span className="text-sm font-medium text-white">
                {localeLabels[item]}
              </span>
              {isActive ? <Check className="size-4 text-white" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
