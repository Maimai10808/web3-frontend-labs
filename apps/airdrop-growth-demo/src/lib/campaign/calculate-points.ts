import type { GrowthTask } from "./types";

export function calculatePoints(tasks: GrowthTask[]): number {
  return tasks.reduce((total, task) => {
    if (task.status !== "verified") {
      return total;
    }

    return total + task.points;
  }, 0);
}
