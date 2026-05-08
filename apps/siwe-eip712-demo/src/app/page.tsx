import { SiweStatus } from "@/src/components/siwe-status";
import { OrderSigner } from "../components/order-signer";
import { SignatureFlowExplainer } from "../components/signature-flow-explainer";

export default function HomePage() {
  return (
    <main className="islamic-page-shell islamic-geometric-grid min-h-screen overflow-hidden px-6 py-16 md:px-12 md:py-28 lg:px-20 lg:py-36">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:gap-14">
        <section className="relative rounded-xl border-2 border-[#c9a74e] bg-[#1a3a5c]/86 px-6 py-12 text-center text-[#f5ecd7] shadow-[0_8px_24px_rgba(201,167,78,0.2)] md:px-12 lg:px-16">
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-[#c9a74e]/35" />
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <div className="islamic-kicker font-sans text-xs text-[#c9a74e] md:text-sm">
              Wallet Identity Pavilion
            </div>
            <h1 className="mt-6 font-sans text-5xl font-semibold tracking-wide text-[#f5ecd7] md:text-7xl lg:text-8xl">
              SIWE Identity and SignedOrderBook Authorization
            </h1>
            <p className="mt-6 max-w-3xl font-sans text-sm leading-7 text-[#f5ecd7]/82 md:text-base">
              This demo now focuses on the real training path: connect a wallet,
              establish a SIWE session, sign a genuine SignedOrderBook typed
              order, and let the backend verify signer, session, token,
              deadline, and nonce before any optional onchain execution.
            </p>
          </div>
        </section>

        <section className="rounded-xl border-2 border-[#c9a74e] bg-[#f5ecd7]/88 p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <div className="grid gap-5 text-center md:grid-cols-3">
            {[
              [
                "Step 01",
                "Connect",
                "Connect a wallet, read the active address, and confirm the expected local deployment chain.",
              ],
              [
                "Step 02",
                "Authenticate with SIWE",
                "Create a web session that proves the connected wallet address is the current authenticated user.",
              ],
              [
                "Step 03",
                "Verify and Execute",
                "Build a real SignedOrderBook order, sign it with EIP-712 typed data, verify it on the backend, approve DemoERC20, and execute it onchain.",
              ],
            ].map(([step, title, description]) => (
              <div
                key={step}
                className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)] transition-all duration-300 ease-in-out hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)]"
              >
                <div className="font-sans text-xs font-semibold tracking-[0.24em] text-[#c9a74e] md:text-sm">
                  {step}
                </div>
                <h2 className="mt-4 font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
                  {title}
                </h2>
                <p className="mt-3 font-sans text-sm leading-7 text-[#1a3a5c]/78 md:text-base">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <SiweStatus />
          <OrderSigner />
          <SignatureFlowExplainer />
        </div>
      </div>
    </main>
  );
}
