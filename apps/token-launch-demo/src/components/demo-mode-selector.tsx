"use client";

export type DemoMode = "token-launch" | "nft-collection";

type DemoModeSelectorProps = {
  value: DemoMode;
  onValueChange: (value: DemoMode) => void;
};

const demoModes: Array<{
  value: DemoMode;
  title: string;
  description: string;
}> = [
  {
    value: "token-launch",
    title: "Token Launch",
    description:
      "Create ERC20 token, upload logo metadata, launch through factory, and verify on-chain token info.",
  },
  {
    value: "nft-collection",
    title: "NFT Collection",
    description:
      "Create ERC721 collections, upload collection/NFT metadata, mint NFTs, and verify ownership on-chain.",
  },
];

export function DemoModeSelector({
  value,
  onValueChange,
}: DemoModeSelectorProps) {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Choose Demo Flow</h2>
        <p className="mt-1 text-sm text-gray-400">
          Switch between the ERC20 token launch flow and the ERC721 collection
          flow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {demoModes.map((mode) => {
          const selected = value === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onValueChange(mode.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-blue-400/70 bg-blue-500/10 shadow-lg shadow-blue-950/30"
                  : "border-white/10 bg-gray-950 hover:border-white/20 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">
                  {mode.title}
                </h3>
                {selected ? (
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-100">
                    Active
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
