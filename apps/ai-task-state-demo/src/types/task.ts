export const TASK_STATUSES = [
  "queued",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const ACTIVE_TASK_STATUSES = ["queued", "processing"] as const;
export const TERMINAL_TASK_STATUSES = [
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type ActiveTaskStatus = (typeof ACTIVE_TASK_STATUSES)[number];
export type TerminalTaskStatus = (typeof TERMINAL_TASK_STATUSES)[number];

export const TASK_TYPES = ["text-to-image", "image-to-image"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_SYNC_MODES = ["polling", "sse"] as const;
export type TaskSyncMode = (typeof TASK_SYNC_MODES)[number];

export type UploadAsset = {
  name: string;
  type: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  previewUrl: string;
};

export type TaskBase = {
  id: string;
  type: TaskType;
  status: TaskStatus;
  prompt: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  retryOfTaskId?: string;
  errorMessage?: string;
  resultImageUrl?: string;
};

export type TextToImageTask = TaskBase & {
  type: "text-to-image";
};

export type ImageToImageTask = TaskBase & {
  type: "image-to-image";
  sourceImage: UploadAsset;
};

export type Task = TextToImageTask | ImageToImageTask;

export type CreateTextToImageTaskInput = {
  type: "text-to-image";
  prompt: string;
  retryOfTaskId?: string;
};

export type CreateImageToImageTaskInput = {
  type: "image-to-image";
  prompt: string;
  sourceImage: UploadAsset;
  retryOfTaskId?: string;
};

export type CreateTaskInput =
  | CreateTextToImageTaskInput
  | CreateImageToImageTaskInput;

export type TaskListResponse = {
  tasks: Task[];
};

export type TaskMutationResponse = {
  task: Task;
};

export type TaskEvent =
  | {
      type: "task.created";
      task: Task;
    }
  | {
      type: "task.updated";
      task: Task;
    }
  | {
      type: "task.cancelled";
      task: Task;
    }
  | {
      type: "task.retried";
      task: Task;
      sourceTaskId: string;
    };

export function isActiveTaskStatus(
  status: TaskStatus,
): status is ActiveTaskStatus {
  return ACTIVE_TASK_STATUSES.includes(status as ActiveTaskStatus);
}

export function isTerminalTaskStatus(
  status: TaskStatus,
): status is TerminalTaskStatus {
  return TERMINAL_TASK_STATUSES.includes(status as TerminalTaskStatus);
}

export function isTerminalTask(task: Task) {
  return isTerminalTaskStatus(task.status);
}

export function taskCanCancel(task: Task) {
  return task.status === "queued" || task.status === "processing";
}

export function taskCanRetry(task: Task) {
  return task.status === "failed";
}
