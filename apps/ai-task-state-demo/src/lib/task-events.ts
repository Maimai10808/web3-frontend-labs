import type { TaskEvent } from "@/types/task";

type TaskEventListener = (event: TaskEvent) => void;

class TaskEventBus {
  private listeners = new Set<TaskEventListener>();

  subscribe(listener: TaskEventListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: TaskEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Task event listener failed:", error);
      }
    }
  }

  listenerCount() {
    return this.listeners.size;
  }
}

export const taskEventBus = new TaskEventBus();
