"use client";

import { useAiTaskStateDemoController } from "@/hooks/use-ai-task-state-demo-controller";
import { AiTaskStateDemoView } from "./ai-task-state-demo-view";

export function AiTaskStateDemoShell() {
  const controller = useAiTaskStateDemoController();

  return <AiTaskStateDemoView controller={controller} />;
}
