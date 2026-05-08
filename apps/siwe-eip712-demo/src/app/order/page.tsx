import { OrderSigner } from "@/src/components/order-signer";
import { SiweStatus } from "@/src/components/siwe-status";

export default function OrderPage() {
  return (
    <main className="islamic-page-shell islamic-geometric-grid min-h-screen overflow-hidden px-6 py-16 md:px-12 md:py-28 lg:px-20 lg:py-36">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <SiweStatus />
        <OrderSigner />
      </div>
    </main>
  );
}
