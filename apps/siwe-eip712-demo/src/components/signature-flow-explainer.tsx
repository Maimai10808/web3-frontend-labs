export function SignatureFlowExplainer() {
  const explainerCards = [
    {
      title: "SIWE",
      body: "SIWE is the identity layer. The wallet signs a login message, the backend verifies ownership of the address, and NextAuth establishes a session for subsequent application requests.",
      flow: "connect wallet → sign SIWE message → backend verify → session",
    },
    {
      title: "SignedOrderBook EIP-712",
      body: "EIP-712 is the authorization layer. The wallet signs a real SignedOrderBook order containing maker, token, recipient, amount, deadline, and nonce so the backend can verify intent first and the contract can verify and execute the same payload onchain.",
      flow: "session → request nonce → sign typed order → backend verify → approve token → execute order",
    },
  ];

  return (
    <section className="islamic-card mx-auto w-full max-w-2xl rounded-xl border-2 border-[#c9a74e] p-8 shadow-[0_8px_24px_rgba(201,167,78,0.2)]">
      <div className="relative z-10">
        <div className="text-center">
          <div className="islamic-kicker font-sans text-xs font-semibold text-[#c9a74e] md:text-sm">
            Comparative Atlas
          </div>
          <h2 className="mt-4 font-sans text-2xl font-semibold tracking-wide text-[#1a3a5c] md:text-3xl">
            SIWE vs SignedOrderBook EIP-712
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {explainerCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)] transition-all duration-300 ease-in-out hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)]"
            >
              <h3 className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
                {card.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-7 text-[#1a3a5c]/76 md:text-base">
                {card.body}
              </p>
              <div className="mt-4 rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] p-4 shadow-[0_2px_4px_rgba(201,167,78,0.1)]">
                <div className="font-sans text-xs font-semibold tracking-[0.18em] text-[#c9a74e] md:text-sm">
                  Sequence
                </div>
                <div className="mt-2 font-sans text-xs leading-6 tracking-wide text-[#1a3a5c] md:text-sm">
                  {card.flow}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border-2 border-[#c9a74e] bg-[#1a3a5c] p-8 text-[#f5ecd7] shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <h3 className="font-sans text-lg font-semibold tracking-wide text-[#f5ecd7] md:text-xl">
            Full Flow
          </h3>
          <div className="mt-4 rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7]/10 p-4 font-sans text-xs leading-6 tracking-wide text-[#f5ecd7] md:text-sm">
            connect wallet → verify expected chain → SIWE login → session →
            request signed-order nonce → sign SignedOrderBook typed data →
            backend recover signer → compare signer, maker, session, deadline,
            token, and nonce → approve DemoERC20 → execute SignedOrderBook
            order onchain
          </div>
        </div>
      </div>
    </section>
  );
}
