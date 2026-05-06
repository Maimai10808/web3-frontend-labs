import { NextResponse } from "next/server";
import { stopTaskSimulation } from "@/lib/task-simulator";
import { taskStore } from "@/lib/task-store";
import { taskIdParamSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  const params = await context.params;
  const parsed = taskIdParamSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid task id.",
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existingTask = taskStore.getTask(parsed.data.taskId);

  if (!existingTask) {
    return NextResponse.json(
      {
        message: "Task not found.",
      },
      { status: 404 },
    );
  }

  const task = taskStore.cancelTask(parsed.data.taskId);

  if (!task) {
    return NextResponse.json(
      {
        message: "Task cannot be cancelled.",
      },
      { status: 409 },
    );
  }

  stopTaskSimulation(task.id);

  return NextResponse.json({ task });
}
