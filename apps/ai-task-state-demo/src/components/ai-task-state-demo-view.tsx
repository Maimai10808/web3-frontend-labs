"use client";

import type { AiTaskStateDemoController } from "@/hooks/use-ai-task-state-demo-controller";
import { AppHeader } from "./app-header";
import { ResultGallery } from "./result-gallery";
import { TaskCreatePanel } from "./task-create-panel";
import { TaskQueue } from "./task-queue";

type AiTaskStateDemoViewProps = {
  controller: AiTaskStateDemoController;
};

export function AiTaskStateDemoView({ controller }: AiTaskStateDemoViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8">
        <AppHeader
          syncMode={controller.syncMode}
          onSyncModeChange={controller.setSyncMode}
          totalTasks={controller.stats.total}
          activeTasks={controller.stats.active}
          succeededTasks={controller.stats.succeeded}
          failedTasks={controller.stats.failed}
          cancelledTasks={controller.stats.cancelled}
        />

        <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <TaskCreatePanel
            onCreateTextTask={controller.handleCreateTextTask}
            onCreateImageTask={controller.handleCreateImageTask}
            isCreatingTask={controller.isCreatingTask}
            createTaskError={controller.createTaskError}
          />

          <ResultGallery tasks={controller.tasks} />
        </div>

        <TaskQueue
          tasks={controller.tasks}
          isLoading={controller.isLoadingTasks}
          isRefreshing={controller.tasksQuery.isFetching}
          error={controller.tasksError}
          pendingAction={controller.pendingAction}
          isCancellingTask={controller.isCancellingTask}
          isRetryingTask={controller.isRetryingTask}
          actionError={controller.actionError}
          onRefresh={() => {
            void controller.refetchTasks();
          }}
          onCancelTask={controller.handleCancelTask}
          onRetryTask={controller.handleRetryTask}
        />
      </div>
    </main>
  );
}
