import { NextResponse } from "next/server";
import { startTaskSimulation } from "@/lib/task-simulator";
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

  const sourceTask = taskStore.getTask(parsed.data.taskId);

  if (!sourceTask) {
    return NextResponse.json(
      {
        message: "Task not found.",
      },
      { status: 404 },
    );
  }

  const task = taskStore.retryTask(parsed.data.taskId);

  if (!task) {
    return NextResponse.json(
      {
        message: "Only failed tasks can be retried.",
      },
      { status: 409 },
    );
  }

  startTaskSimulation(task.id);

  return NextResponse.json(
    {
      task,
    },
    { status: 201 },
  );
}
