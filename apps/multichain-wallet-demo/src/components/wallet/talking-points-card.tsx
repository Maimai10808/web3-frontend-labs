"use client";

export function TalkingPointsCard() {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Interview Talking Points</h3>
      <ul className="grid list-disc gap-2 pl-5 text-sm leading-6 text-slate-300">
        <li>多链不是加 chainId，而是账户模型、签名模型、交易模型都不同。</li>
        <li>页面不直接处理链逻辑，而是通过 WalletAdapter 消费统一能力。</li>
        <li>
          EVM 可以切链和 EIP-712；Solana/BTC 更偏 message sign / transaction
          signature / PSBT。
        </li>
        <li>钱包连接态和业务绑定态是两层状态，不能混在一起。</li>
        <li>错误统一归一成 MultiChainError，页面不用识别各 SDK 的原始报错。</li>
      </ul>
    </section>
  );
}
