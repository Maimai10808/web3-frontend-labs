import { redirect } from "next/navigation";
import { defaultLocale } from "@web3-frontend-labs/i18n/config";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
