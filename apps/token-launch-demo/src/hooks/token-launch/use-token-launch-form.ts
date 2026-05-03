import { useEffect, useMemo, useRef, useState } from "react";
import { validateTokenLaunchForm } from "@/lib/token-launch/schema";
import type {
  TokenLaunchEvent,
  TokenLaunchFormValues,
  TokenLaunchStep,
  UploadedTokenLogo,
  UploadedTokenMetadata,
} from "@/lib/token-launch/types";
import { normalizeTokenLaunchError } from "@/lib/token-launch/normalize-token-launch-error";
import { useUploadTokenLogo } from "@/hooks/token-launch/use-upload-token-logo";
import { useUploadTokenMetadata } from "@/hooks/token-launch/use-upload-token-metadata";
import { useCreateToken } from "@/hooks/token-launch/use-create-token";
import type { TokenLaunchLogEntry } from "@/components/token-launch/token-event-log";

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

export function useTokenLaunchForm() {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [formValues, setFormValues] =
    useState<TokenLaunchFormValues>(initialFormValues);
  const [maxSupply, setMaxSupply] = useState("1000000");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [eventLogs, setEventLogs] = useState<TokenLaunchLogEntry[]>([]);
  const [launchStep, setLaunchStep] = useState<TokenLaunchStep>("idle");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [uploadedLogoResult, setUploadedLogoResult] =
    useState<UploadedTokenLogo | null>(null);
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

  const logoPreviewUrl = useMemo(() => {
    if (!formValues.logoFile) {
      return null;
    }

    return URL.createObjectURL(formValues.logoFile);
  }, [formValues.logoFile]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const combinedError = useMemo(() => {
    return (
      launchError ??
      (uploadLogoError ? normalizeTokenLaunchError(uploadLogoError) : null) ??
      (uploadMetadataError
        ? normalizeTokenLaunchError(uploadMetadataError)
        : null) ??
      (createTokenError ? normalizeTokenLaunchError(createTokenError) : null)
    );
  }, [launchError, uploadLogoError, uploadMetadataError, createTokenError]);

  const buttonLabel = useMemo(() => {
    if (launchStep === "logo_uploading") {
      return "Uploading logo...";
    }

    if (
      launchStep === "metadata_building" ||
      launchStep === "metadata_uploading"
    ) {
      return "Uploading metadata...";
    }

    if (launchStep === "wallet_confirming") {
      return "Confirm in wallet...";
    }

    if (launchStep === "tx_pending" || launchStep === "tx_confirming") {
      return "Creating token...";
    }

    if (launchStep === "error") {
      return "Retry Launch Token";
    }

    return "Launch Token";
  }, [launchStep]);

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
    setUploadedLogoResult(null);
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setLatestMetadata(null);
    setUploadedLogoResult(null);
    setSubmittedTxHash(null);
    setLaunchError(null);
    setLaunchStep("idle");

    const parsed = validateTokenLaunchForm(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setLaunchStep("error");
      setLaunchError("Form validation failed. Check required fields.");
      appendLog({
        type: "token_create_failed",
        message: "Form validation failed.",
      });
      return;
    }

    const validated = parsed.data;

    try {
      setLaunchStep("logo_uploading");
      appendLog({
        type: "logo_upload_started",
        message: "Uploading token logo to IPFS...",
      });

      const logo = await uploadTokenLogo(validated.logoFile);
      setUploadedLogoResult(logo);

      appendLog({
        type: "logo_upload_succeeded",
        message: "Token logo uploaded successfully.",
        imageUrl: logo.imageUrl,
      });

      setLaunchStep("metadata_building");
      appendLog({
        type: "metadata_built",
        message: "Token metadata JSON built.",
      });

      setLaunchStep("metadata_uploading");
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
      setLaunchStep("wallet_confirming");

      appendLog({
        type: "metadata_upload_succeeded",
        message: "Token metadata uploaded successfully.",
        metadataUrl: metadata.metadataUrl,
      });

      appendLog({
        type: "wallet_confirmation_requested",
        message: "Wallet confirmation requested.",
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
        onStepChange: setLaunchStep,
        onTransactionSubmitted: (txHash) => {
          setSubmittedTxHash(txHash);
          appendLog({
            type: "transaction_submitted",
            message: "Transaction submitted.",
            txHash,
          });
        },
      });

      setLaunchStep("success");

      appendLog({
        type: "transaction_confirmed",
        message: "Transaction receipt confirmed.",
        txHash: result.txHash,
      });

      appendLog({
        type: "token_create_succeeded",
        message: "Token launched successfully.",
        txHash: result.txHash,
        tokenAddress: result.tokenAddress,
      });
    } catch (error) {
      const normalizedError = normalizeTokenLaunchError(error);
      setLaunchStep("error");
      setLaunchError(normalizedError);
      appendLog({
        type: "token_create_failed",
        message: normalizedError,
      });
    }
  };

  return {
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
  };
}
