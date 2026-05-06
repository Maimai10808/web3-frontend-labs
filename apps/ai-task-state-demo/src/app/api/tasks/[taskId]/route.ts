import { NextResponse } from "next/server";
import { taskStore } from "@/lib/task-store";
import { taskIdParamSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
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

  const task = taskStore.getTask(parsed.data.taskId);

  if (!task) {
    return NextResponse.json(
      {
        message: "Task not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ task });
}
