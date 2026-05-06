import { taskStore } from "@/lib/task-store";
import type { Task } from "@/types/task";
import { isTerminalTask } from "@/types/task";

type SimulationHandle = {
  queueTimer?: ReturnType<typeof setTimeout>;
  progressTimer?: ReturnType<typeof setInterval>;
};

const simulations = new Map<string, SimulationHandle>();

function clearSimulation(taskId: string) {
  const handle = simulations.get(taskId);

  if (!handle) {
    return;
  }

  if (handle.queueTimer) {
    clearTimeout(handle.queueTimer);
  }

  if (handle.progressTimer) {
    clearInterval(handle.progressTimer);
  }

  simulations.delete(taskId);
}

function buildMockResultImageUrl(task: Task) {
  const title =
    task.type === "text-to-image"
      ? `text ${task.prompt}`
      : `image ${task.prompt}`;

  const escaped = encodeURIComponent(title.slice(0, 60));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="720" height="720" fill="url(#bg)" rx="48" />
      <rect x="44" y="44" width="632" height="632" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" />
      <text x="80" y="140" fill="#cbd5e1" font-size="28" font-family="Arial, Helvetica, sans-serif">
        ai-task-state-demo
      </text>
      <text x="80" y="210" fill="#ffffff" font-size="44" font-family="Arial, Helvetica, sans-serif">
        ${task.type}
      </text>
      <foreignObject x="80" y="260" width="560" height="260">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, Helvetica, sans-serif; color: white; font-size: 28px; line-height: 1.5;">
          ${escaped}
        </div>
      </foreignObject>
      <text x="80" y="620" fill="#93c5fd" font-size="24" font-family="Arial, Helvetica, sans-serif">
        task id: ${task.id}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function shouldForceFailure(task: Task) {
  return task.prompt.toLowerCase().includes("fail");
}

export function startTaskSimulation(taskId: string) {
  clearSimulation(taskId);

  const queueTimer = setTimeout(() => {
    const queuedTask = taskStore.getTask(taskId);

    if (!queuedTask || queuedTask.status !== "queued") {
      clearSimulation(taskId);
      return;
    }

    taskStore.updateTask(taskId, (task) => ({
      ...task,
      status: "processing",
      progress: 10,
      errorMessage: undefined,
    }));

    const progressTimer = setInterval(() => {
      const current = taskStore.getTask(taskId);

      if (!current || isTerminalTask(current)) {
        clearSimulation(taskId);
        return;
      }

      if (current.status !== "processing") {
        clearSimulation(taskId);
        return;
      }

      const nextProgress = Math.min(current.progress + 15, 100);
      const isFinalTick = nextProgress >= 100;

      if (!isFinalTick) {
        taskStore.updateTask(taskId, (task) => ({
          ...task,
          progress: nextProgress,
        }));
        return;
      }

      if (shouldForceFailure(current)) {
        taskStore.updateTask(taskId, (task) => ({
          ...task,
          status: "failed",
          progress: 100,
          errorMessage:
            "Mock task failed because the prompt contains the word fail.",
        }));
      } else {
        taskStore.updateTask(taskId, (task) => ({
          ...task,
          status: "succeeded",
          progress: 100,
          resultImageUrl: buildMockResultImageUrl(task),
          errorMessage: undefined,
        }));
      }

      clearSimulation(taskId);
    }, 1200);

    simulations.set(taskId, {
      queueTimer,
      progressTimer,
    });
  }, 1000);

  simulations.set(taskId, { queueTimer });
}

export function stopTaskSimulation(taskId: string) {
  clearSimulation(taskId);
}
