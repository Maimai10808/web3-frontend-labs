import { NextResponse } from "next/server";
import { taskStore } from "@/lib/task-store";
import { startTaskSimulation } from "@/lib/task-simulator";
import { createTaskSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({
    tasks: taskStore.listTasks(),
  });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createTaskSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid task payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const task = taskStore.createTask(parsed.data);
    startTaskSimulation(task.id);

    return NextResponse.json(
      {
        task,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create task.",
      },
      { status: 500 },
    );
  }
}
