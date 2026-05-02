"use client";

import { useMemo, useState } from "react";
import { validateTokenLaunchForm } from "@/lib/token-launch/schema";
import type {
  TokenLaunchEvent,
  TokenLaunchFormValues,
  UploadedTokenMetadata,
} from "@/lib/token-launch/types";
import { useUploadTokenLogo } from "@/hooks/token-launch/use-upload-token-logo";
import { useUploadTokenMetadata } from "@/hooks/token-launch/use-upload-token-metadata";
import { useCreateToken } from "@/hooks/token-launch/use-create-token";
import { TokenEventLog, type TokenLaunchLogEntry } from "./token-event-log";
import { TokenMetadataPreview } from "./token-metadata-preview";
import { TokenResultCard } from "./token-result-card";
import { TokenInfoReader } from "./token-info-reader";

const initialFormValues: TokenLaunchFormValues = {
  tokenName: "",
  tokenSymbol: "",
  description: "",
  website: "",
  twitter: "",
  telegram: "",
  logoFile: null,
};

function createLogEntry(entry: TokenLaunchEvent): TokenLaunchLogEntry {
  return {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString(),
  };
}

export function TokenLaunchForm() {
  const [formValues, setFormValues] =
    useState<TokenLaunchFormValues>(initialFormValues);
  const [maxSupply, setMaxSupply] = useState("1000000");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [eventLogs, setEventLogs] = useState<TokenLaunchLogEntry[]>([]);
  const [latestMetadata, setLatestMetadata] =
    useState<UploadedTokenMetadata | null>(null);

  const { uploadTokenLogo, isUploadingLogo, uploadLogoError } =
    useUploadTokenLogo();

  const {
    uploadTokenMetadata,
    uploadedMetadata,
    isUploadingMetadata,
    uploadMetadataError,
  } = useUploadTokenMetadata();

  const { createToken, createTokenResult, isCreatingToken, createTokenError } =
    useCreateToken();

  const isBusy = isUploadingLogo || isUploadingMetadata || isCreatingToken;

  const currentMetadata = uploadedMetadata ?? latestMetadata ?? null;

  const combinedError = useMemo(() => {
    return uploadLogoError ?? uploadMetadataError ?? createTokenError ?? null;
  }, [uploadLogoError, uploadMetadataError, createTokenError]);

  const appendLog = (entry: TokenLaunchEvent) => {
    setEventLogs((prev) => [createLogEntry(entry), ...prev]);
  };

  const handleChange = (
    key: keyof Omit<TokenLaunchFormValues, "logoFile">,
    value: string,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFormValues((prev) => ({
      ...prev,
      logoFile: file,
    }));
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setLatestMetadata(null);

    const parsed = validateTokenLaunchForm(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      appendLog({
        type: "token_create_failed",
        message: "Form validation failed.",
      });
      return;
    }

    const validated = parsed.data;

    try {
      appendLog({
        type: "logo_upload_started",
        message: "Uploading token logo to IPFS...",
      });

      const logo = await uploadTokenLogo(validated.logoFile);

      appendLog({
        type: "logo_upload_succeeded",
        message: "Token logo uploaded successfully.",
        imageUrl: logo.imageUrl,
      });

      appendLog({
        type: "metadata_upload_started",
        message: "Building and uploading token metadata...",
      });

      const metadata = await uploadTokenMetadata({
        input: {
          name: validated.tokenName,
          symbol: validated.tokenSymbol,
          description: validated.description,
          website: validated.website,
          twitter: validated.twitter,
          telegram: validated.telegram,
        },
        imageUrl: logo.imageUrl,
      });

      setLatestMetadata(metadata);

      appendLog({
        type: "metadata_upload_succeeded",
        message: "Token metadata uploaded successfully.",
        metadataUrl: metadata.metadataUrl,
      });

      appendLog({
        type: "token_create_started",
        message: "Submitting createToken transaction...",
      });

      const result = await createToken({
        form: {
          tokenName: validated.tokenName,
          tokenSymbol: validated.tokenSymbol,
          description: validated.description,
        },
        metadataUrl: metadata.metadataUrl,
        maxSupply,
      });

      appendLog({
        type: "token_create_submitted",
        message: "Create token transaction confirmed.",
        txHash: result.txHash,
      });

      appendLog({
        type: "token_create_succeeded",
        message: "Token launched successfully.",
        txHash: result.txHash,
        tokenAddress: result.tokenAddress,
      });
    } catch (error) {
      appendLog({
        type: "token_create_failed",
        message:
          error instanceof Error ? error.message : "Token launch failed.",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Token Launch Form
        </h2>

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
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="block w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </FormField>
        </div>

        {combinedError ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {combinedError instanceof Error
              ? combinedError.message
              : "Something went wrong."}
          </div>
        ) : null}

        <div className="mt-6">
          <button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isBusy}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Processing..." : "Launch Token"}
          </button>
        </div>
      </section>

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
    <label className="block">
      <div className="mb-2 text-sm font-medium text-gray-200">{label}</div>
      {children}
      {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
    </label>
  );
}
