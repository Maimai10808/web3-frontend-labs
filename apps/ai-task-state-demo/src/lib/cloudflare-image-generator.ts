import "server-only";

import Cloudflare from "cloudflare";
import { enhanceImagePrompt } from "@/lib/image-prompt-enhancer";
import type { TaskType } from "@/types/task";

const DEFAULT_CLOUDFLARE_AI_IMAGE_MODEL =
  "@cf/black-forest-labs/flux-1-schnell";
const DEFAULT_IMAGE_MIME_TYPE = "image/jpeg";

type GenerateImageInput = {
  prompt: string;
  taskType: TaskType;
  sourceImageUrl?: string;
  sourceImageName?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLikelyByteArray(value: unknown): value is Array<number> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)
  );
}

function isLikelyBase64(value: string) {
  const normalized = value.trim().replace(/\s+/g, "");

  if (normalized.length < 16) {
    return false;
  }

  return /^[A-Za-z0-9+/]+={0,2}$/.test(normalized);
}

function normalizeBase64(value: string) {
  return value.trim().replace(/\s+/g, "");
}

function toDataUrlFromBase64(
  base64: string,
  mimeType = DEFAULT_IMAGE_MIME_TYPE,
) {
  return `data:${mimeType};base64,${normalizeBase64(base64)}`;
}

function toDataUrlFromBytes(
  bytes: Uint8Array,
  mimeType = DEFAULT_IMAGE_MIME_TYPE,
) {
  const base64 = Buffer.from(bytes).toString("base64");
  return toDataUrlFromBase64(base64, mimeType);
}

function extractBase64FromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+)?;base64,(.+)$/i);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1] ?? DEFAULT_IMAGE_MIME_TYPE,
    base64: normalizeBase64(match[2]),
  };
}

function normalizeStringImageOutput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Cloudflare AI returned an empty image string.");
  }

  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  if (isLikelyBase64(trimmed)) {
    return toDataUrlFromBase64(trimmed);
  }

  throw new Error("Cloudflare AI returned a non-image string.");
}

async function normalizeUploadableImageOutput(value: unknown) {
  if (
    !isPlainObject(value) ||
    typeof value.blob !== "function"
  ) {
    return null;
  }

  const blobLike = await value.blob();

  if (
    !blobLike ||
    typeof blobLike !== "object" ||
    typeof (blobLike as Blob).arrayBuffer !== "function"
  ) {
    return null;
  }

  const blob = blobLike as Blob;
  const arrayBuffer = await blob.arrayBuffer();
  const mimeType = blob.type || DEFAULT_IMAGE_MIME_TYPE;
  return toDataUrlFromBytes(new Uint8Array(arrayBuffer), mimeType);
}

async function normalizeCloudflareImageResult(result: unknown): Promise<string> {
  if (typeof result === "string") {
    return normalizeStringImageOutput(result);
  }

  if (result instanceof ArrayBuffer) {
    return toDataUrlFromBytes(new Uint8Array(result));
  }

  if (ArrayBuffer.isView(result)) {
    const view = result as ArrayBufferView;
    return toDataUrlFromBytes(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
    );
  }

  if (isLikelyByteArray(result)) {
    return toDataUrlFromBytes(Uint8Array.from(result));
  }

  if (isPlainObject(result)) {
    if (typeof result.image === "string") {
      return normalizeStringImageOutput(result.image);
    }

    if (typeof result.b64_json === "string") {
      return toDataUrlFromBase64(result.b64_json);
    }

    if (typeof result.data === "string") {
      return normalizeStringImageOutput(result.data);
    }

    if (typeof result.url === "string") {
      return normalizeStringImageOutput(result.url);
    }

    if ("result" in result) {
      return normalizeCloudflareImageResult(result.result);
    }
  }

  const uploadableImage = await normalizeUploadableImageOutput(result);
  if (uploadableImage) {
    return uploadableImage;
  }

  throw new Error("Cloudflare AI returned an unsupported image response shape.");
}

export async function generateImageWithCloudflare(
  input: GenerateImageInput,
): Promise<string> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    throw new Error("Cloudflare image generation is not configured.");
  }

  const model =
    process.env.CLOUDFLARE_AI_IMAGE_MODEL ??
    DEFAULT_CLOUDFLARE_AI_IMAGE_MODEL;

  const client = new Cloudflare({
    apiToken,
  });

  const requestBody: {
    account_id: string;
    prompt: string;
    image_b64?: string;
  } = {
    account_id: accountId,
    prompt: enhanceImagePrompt({
      userPrompt: input.prompt,
      taskType: input.taskType,
      sourceImageName: input.sourceImageName,
    }),
  };

  // If source is a data URL, pass base64 to support img2img-compatible models.
  if (input.taskType === "image-to-image" && input.sourceImageUrl) {
    const extracted = extractBase64FromDataUrl(input.sourceImageUrl);
    if (extracted) {
      requestBody.image_b64 = extracted.base64;
    }
  }

  const result = await client.ai.run(model, requestBody);
  return normalizeCloudflareImageResult(result);
}
