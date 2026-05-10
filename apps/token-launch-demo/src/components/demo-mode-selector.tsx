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
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Choose Demo Flow
        </h2>
        <p className="mt-1 text-sm text-slate-600">
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
                  ? "border-blue-300 bg-blue-50 shadow-sm shadow-blue-200/50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  {mode.title}
                </h3>
                {selected ? (
                  <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Active
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
