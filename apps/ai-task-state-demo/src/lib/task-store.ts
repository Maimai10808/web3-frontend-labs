import { taskEventBus } from "@/lib/task-events";
import type { CreateTaskInput, Task } from "@/types/task";
import { taskCanCancel } from "@/types/task";

function nowIso() {
  return new Date().toISOString();
}

function sortTasksByCreatedAtDesc(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

class TaskStore {
  private tasks = new Map<string, Task>();

  listTasks() {
    return sortTasksByCreatedAtDesc(Array.from(this.tasks.values()));
  }

  getTask(taskId: string) {
    return this.tasks.get(taskId) ?? null;
  }

  createTask(input: CreateTaskInput) {
    const timestamp = nowIso();
    const id = `task_${crypto.randomUUID()}`;

    const base = {
      id,
      prompt: input.prompt,
      progress: 0,
      status: "queued" as const,
      createdAt: timestamp,
      updatedAt: timestamp,
      retryOfTaskId: input.retryOfTaskId,
    };

    const task: Task =
      input.type === "image-to-image"
        ? {
            ...base,
            type: "image-to-image",
            sourceImage: input.sourceImage,
          }
        : {
            ...base,
            type: "text-to-image",
          };

    this.tasks.set(task.id, task);
    taskEventBus.emit({ type: "task.created", task });

    return task;
  }

  updateTask(taskId: string, updater: (current: Task) => Task) {
    const current = this.tasks.get(taskId);
    if (!current) {
      return null;
    }

    const next = {
      ...updater(current),
      updatedAt: nowIso(),
    } satisfies Task;

    this.tasks.set(taskId, next);
    taskEventBus.emit({ type: "task.updated", task: next });

    return next;
  }

  cancelTask(taskId: string) {
    const current = this.tasks.get(taskId);
    if (!current || !taskCanCancel(current)) {
      return null;
    }

    const next: Task = {
      ...current,
      status: "cancelled",
      updatedAt: nowIso(),
    };

    this.tasks.set(taskId, next);
    taskEventBus.emit({ type: "task.cancelled", task: next });

    return next;
  }

  retryTask(sourceTaskId: string) {
    const sourceTask = this.tasks.get(sourceTaskId);
    if (!sourceTask || sourceTask.status !== "failed") {
      return null;
    }

    const nextTask =
      sourceTask.type === "image-to-image"
        ? this.createTask({
            type: "image-to-image",
            prompt: sourceTask.prompt,
            sourceImage: sourceTask.sourceImage,
            retryOfTaskId: sourceTask.id,
          })
        : this.createTask({
            type: "text-to-image",
            prompt: sourceTask.prompt,
            retryOfTaskId: sourceTask.id,
          });

    taskEventBus.emit({
      type: "task.retried",
      task: nextTask,
      sourceTaskId,
    });

    return nextTask;
  }

  reset() {
    this.tasks.clear();
  }
}

export const taskStore = new TaskStore();
