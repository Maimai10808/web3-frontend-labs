"use client";

import { Loader2 } from "lucide-react";
import type { UploadedTokenLogo } from "@/lib/token-launch/types";
import { useTokenLaunchForm } from "@/hooks/token-launch/use-token-launch-form";
import { TokenEventLog } from "./token-event-log";
import { TokenMetadataPreview } from "./token-metadata-preview";
import { TokenResultCard } from "./token-result-card";
import { TokenInfoReader } from "./token-info-reader";
import { TokenLaunchProgress } from "./token-launch-progress";

export function TokenLaunchForm() {
  const {
    buttonLabel,
    combinedError,
    createTokenResult,
    currentMetadata,
    eventLogs,
    fieldErrors,
    formValues,
    handleChange,
    handleFileChange,
    handleSubmit,
    isBusy,
    launchStep,
    logoInputRef,
    logoPreviewUrl,
    maxSupply,
    setMaxSupply,
    submittedTxHash,
    uploadedLogoResult,
  } = useTokenLaunchForm();

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Token Launch Form
        </h2>

        {launchStep !== "idle" ? (
          <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-100">
            {launchStep === "success"
              ? "Token launch completed successfully."
              : launchStep === "error"
                ? "Token launch needs attention."
                : "Token launch is in progress. Follow the steps below."}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Token Name" error={fieldErrors.tokenName?.[0]}>
            <input
              value={formValues.tokenName}
              onChange={(event) =>
                handleChange("tokenName", event.target.value)
              }
              placeholder="Crazy Demo Token"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>

          <FormField label="Token Symbol" error={fieldErrors.tokenSymbol?.[0]}>
            <input
              value={formValues.tokenSymbol}
              onChange={(event) =>
                handleChange("tokenSymbol", event.target.value)
              }
              placeholder="CDT"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>

          <FormField label="Website" error={fieldErrors.website?.[0]}>
            <input
              value={formValues.website}
              onChange={(event) => handleChange("website", event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>

          <FormField label="Twitter" error={fieldErrors.twitter?.[0]}>
            <input
              value={formValues.twitter}
              onChange={(event) => handleChange("twitter", event.target.value)}
              placeholder="https://x.com/example"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>

          <FormField label="Telegram" error={fieldErrors.telegram?.[0]}>
            <input
              value={formValues.telegram}
              onChange={(event) => handleChange("telegram", event.target.value)}
              placeholder="https://t.me/example"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>

          <FormField label="Max Supply">
            <input
              value={maxSupply}
              onChange={(event) => setMaxSupply(event.target.value)}
              placeholder="1000000"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Description" error={fieldErrors.description?.[0]}>
            <textarea
              value={formValues.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              rows={5}
              placeholder="Describe your token launch."
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Token Logo" error={fieldErrors.logoFile?.[0]}>
            <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                className="sr-only"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isBusy}
                  className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Choose File
                </button>
                <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-sm text-gray-400">
                  <span className="block truncate">
                    {formValues.logoFile
                      ? formValues.logoFile.name
                      : "No file selected"}
                  </span>
                </div>
              </div>
            </div>
            <LogoUploadStatus
              file={formValues.logoFile}
              uploadedLogo={uploadedLogoResult}
              isUploading={launchStep === "logo_uploading"}
              previewUrl={logoPreviewUrl}
            />
          </FormField>
        </div>

        {combinedError ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {combinedError}
          </div>
        ) : null}

        <div className="mt-6">
          <button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {buttonLabel}
          </button>
        </div>
      </section>

      <TokenLaunchProgress
        step={launchStep}
        errorMessage={combinedError}
        txHash={submittedTxHash}
        metadataURI={currentMetadata?.metadataUrl}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TokenMetadataPreview metadata={currentMetadata?.metadata ?? null} />
        <TokenResultCard result={createTokenResult} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TokenInfoReader
          defaultTokenAddress={createTokenResult?.tokenAddress}
        />
        <TokenEventLog entries={eventLogs} />
      </div>
    </div>
  );
}

function LogoUploadStatus({
  file,
  uploadedLogo,
  isUploading,
  previewUrl,
}: {
  file: File | null;
  uploadedLogo: UploadedTokenLogo | null;
  isUploading: boolean;
  previewUrl: string | null;
}) {
  if (!file && !uploadedLogo) {
    return null;
  }

  const imageUrl = previewUrl ?? uploadedLogo?.imageUrl ?? null;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="flex items-start gap-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={file?.name ?? "Token logo"}
            className="h-14 w-14 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-gray-500">
            Logo
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm text-white">
              {file?.name ?? "Uploaded token logo"}
            </div>
            <div
              className={`rounded-full border px-2 py-0.5 text-xs ${
                isUploading
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-100"
                  : uploadedLogo
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : uploadedLogo
                  ? "Uploaded"
                  : "Selected"}
            </div>
          </div>
          {uploadedLogo?.imageUrl ? (
            <div className="mt-2 break-all text-xs text-gray-400">
              {uploadedLogo.imageUrl}
            </div>
          ) : previewUrl ? (
            <div className="mt-2 text-xs text-gray-500">
              Local preview ready. IPFS URL will appear after upload.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-2 text-sm font-medium text-gray-200">{label}</div>
      {children}
      {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
    </div>
  );
}
