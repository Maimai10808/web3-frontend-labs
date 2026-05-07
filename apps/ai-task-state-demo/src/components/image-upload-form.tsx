"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { taskApiClient } from "@/lib/api-client";
import { ACCEPTED_UPLOAD_TYPES } from "@/lib/validators";
import { useUploadPreview } from "@/hooks/use-upload-preview";
import type { UploadAsset } from "@/types/task";

const PROMPT_MAX_LENGTH = 300;

type ImageUploadFormProps = {
  onSubmit: (input: {
    prompt: string;
    sourceImage: UploadAsset;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function ImageUploadForm({
  onSubmit,
  isSubmitting = false,
}: ImageUploadFormProps) {
  const {
    selectedFile,
    previewUrl,
    validationError,
    handleSelectFile,
    toUploadAsset,
    resetUploadPreview,
  } = useUploadPreview();

  const [prompt, setPrompt] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const disabled = isSubmitting || isUploadingImage;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSelectFile(event.target.files?.[0] ?? null);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const submit = async () => {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setSubmitError("Prompt is required.");
      return;
    }

    if (!selectedFile) {
      setSubmitError("Source image is required.");
      return;
    }

    const localAsset = toUploadAsset();

    if (!localAsset || !previewUrl) {
      setSubmitError("Please select a valid image (PNG/JPEG/WEBP, <=5MB).");
      return;
    }

    setSubmitError(null);
    setIsUploadingImage(true);

    try {
      const uploadedAsset = await taskApiClient.uploadImage(
        selectedFile,
        localAsset.previewUrl,
      );

      await onSubmit({
        prompt: normalizedPrompt,
        sourceImage: uploadedAsset,
      });

      setPrompt("");
      resetUploadPreview();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700">
          Source Image
        </label>
        <input
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={disabled}
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
        {selectedFile ? (
          <p className="text-xs text-zinc-500">
            {selectedFile.name} · {formatFileSize(selectedFile.size)}
          </p>
        ) : null}
        {validationError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {validationError}
          </p>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="h-48 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <Image
            src={previewUrl}
            alt="Source preview"
            width={720}
            height={720}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-1">
        <label
          htmlFor="image-to-image-prompt"
          className="text-sm font-medium text-zinc-700"
        >
          Prompt
        </label>
        <textarea
          id="image-to-image-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={PROMPT_MAX_LENGTH}
          disabled={disabled}
          placeholder="Enhance this image with cinematic lighting..."
          className="h-24 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
        <div className="flex justify-end text-xs text-zinc-500">
          {prompt.length}/{PROMPT_MAX_LENGTH}
        </div>
      </div>

      {submitError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isUploadingImage
          ? "Uploading..."
          : isSubmitting
            ? "Creating..."
            : "Create Image-to-Image Task"}
      </button>
    </form>
  );
}

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))}KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`;
}
