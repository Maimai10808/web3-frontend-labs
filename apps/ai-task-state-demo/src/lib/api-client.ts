import type {
  CreateTaskInput,
  Task,
  TaskEvent,
  TaskListResponse,
  TaskMutationResponse,
  UploadAsset,
} from "@/types/task";

type ApiErrorPayload = {
  message?: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await parseJson<ApiErrorPayload>(response).catch(
      () => null,
    );

    throw new Error(
      payload?.message ?? `Request failed with ${response.status}`,
    );
  }

  return parseJson<T>(response);
}

type UploadResponse = {
  file: {
    name: string;
    type: UploadAsset["type"];
    size: number;
  };
};

export const taskApiClient = {
  async listTasks() {
    return handleResponse<TaskListResponse>(
      await fetch("/api/tasks", {
        method: "GET",
      }),
    );
  },

  async getTask(taskId: string) {
    return handleResponse<TaskMutationResponse>(
      await fetch(`/api/tasks/${taskId}`, {
        method: "GET",
      }),
    );
  },

  async createTask(input: CreateTaskInput) {
    return handleResponse<TaskMutationResponse>(
      await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    );
  },

  async cancelTask(taskId: string) {
    return handleResponse<TaskMutationResponse>(
      await fetch(`/api/tasks/${taskId}/cancel`, {
        method: "POST",
      }),
    );
  },

  async retryTask(taskId: string) {
    return handleResponse<TaskMutationResponse>(
      await fetch(`/api/tasks/${taskId}/retry`, {
        method: "POST",
      }),
    );
  },

  async uploadImage(file: File, previewUrl: string): Promise<UploadAsset> {
    const formData = new FormData();
    formData.append("file", file);

    const payload = await handleResponse<UploadResponse>(
      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }),
    );

    return {
      ...payload.file,
      previewUrl,
    };
  },
};

export type TaskStreamMessage =
  | {
      event: "ready";
      data: {
        connectedAt: string;
      };
    }
  | {
      event: "heartbeat";
      data: {
        timestamp: string;
      };
    }
  | {
      event: "task";
      data: TaskEvent;
    };

export function applyTaskEventToList(tasks: Task[], event: TaskEvent): Task[] {
  switch (event.type) {
    case "task.created":
    case "task.updated":
    case "task.cancelled": {
      const existingIndex = tasks.findIndex(
        (task) => task.id === event.task.id,
      );

      if (existingIndex === -1) {
        return [event.task, ...tasks];
      }

      const next = [...tasks];
      next[existingIndex] = event.task;
      return next;
    }

    case "task.retried": {
      const existingIndex = tasks.findIndex(
        (task) => task.id === event.task.id,
      );

      if (existingIndex !== -1) {
        const next = [...tasks];
        next[existingIndex] = event.task;
        return next;
      }

      return [event.task, ...tasks];
    }

    default:
      return tasks;
  }
}
