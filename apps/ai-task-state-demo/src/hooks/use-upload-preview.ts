"use client";

import { useEffect, useState } from "react";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/validators";
import type { UploadAsset } from "@/types/task";

function isAcceptedType(type: string): type is UploadAsset["type"] {
  return ACCEPTED_UPLOAD_TYPES.includes(type as UploadAsset["type"]);
}

export function useUploadPreview() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleSelectFile = (file: File | null) => {
    setValidationError(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!isAcceptedType(file.type)) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationError("Unsupported file type. Use PNG, JPEG, or WEBP.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationError("File size must be 5MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const toUploadAsset = (): UploadAsset | null => {
    if (!selectedFile || !previewUrl || !isAcceptedType(selectedFile.type)) {
      return null;
    }

    return {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      previewUrl,
    };
  };

  const resetUploadPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
  };

  return {
    selectedFile,
    previewUrl,
    validationError,
    handleSelectFile,
    toUploadAsset,
    resetUploadPreview,
  };
}
