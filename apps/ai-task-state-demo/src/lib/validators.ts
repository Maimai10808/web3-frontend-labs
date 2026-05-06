import { z } from "zod";
import { TASK_STATUSES, TASK_TYPES, TASK_SYNC_MODES } from "@/types/task";

export const ACCEPTED_UPLOAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskTypeSchema = z.enum(TASK_TYPES);
export const taskSyncModeSchema = z.enum(TASK_SYNC_MODES);

export const uploadAssetSchema = z.object({
  name: z.string().trim().min(1, "Image name is required."),
  type: z.enum(ACCEPTED_UPLOAD_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_SIZE_BYTES, "Image size must be 5MB or smaller."),
  previewUrl: z.string().trim().min(1, "Preview URL is required."),
});

export const createTextToImageTaskSchema = z.object({
  type: z.literal("text-to-image"),
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required.")
    .max(300, "Prompt must be 300 characters or fewer."),
  retryOfTaskId: z.string().trim().min(1).optional(),
});

export const createImageToImageTaskSchema = z.object({
  type: z.literal("image-to-image"),
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required.")
    .max(300, "Prompt must be 300 characters or fewer."),
  sourceImage: uploadAssetSchema,
  retryOfTaskId: z.string().trim().min(1).optional(),
});

export const createTaskSchema = z.discriminatedUnion("type", [
  createTextToImageTaskSchema,
  createImageToImageTaskSchema,
]);

export const taskIdParamSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required."),
});

export const uploadRequestSchema = z.object({
  name: z.string().trim().min(1, "File name is required."),
  type: z.enum(ACCEPTED_UPLOAD_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_SIZE_BYTES, "Image size must be 5MB or smaller."),
});

export function validateUploadFileMeta(input: {
  name?: string;
  type?: string;
  size?: number;
}) {
  return uploadRequestSchema.safeParse({
    name: input.name ?? "",
    type: input.type,
    size: input.size,
  });
}
