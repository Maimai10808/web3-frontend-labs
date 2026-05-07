"use client";

import Image from "next/image";
import type { Task } from "@/types/task";
import { EmptyState } from "./empty-state";

type ResultGalleryProps = {
  tasks: Task[];
};

export function ResultGallery({ tasks }: ResultGalleryProps) {
  const succeededTasks = tasks.filter(
    (task): task is Task & { resultImageUrl: string } => {
      return (
        task.status === "succeeded" &&
        typeof task.resultImageUrl === "string" &&
        task.resultImageUrl.length > 0
      );
    },
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Result Gallery
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {succeededTasks.length} successful result
          {succeededTasks.length === 1 ? "" : "s"}
        </p>
      </header>

      {succeededTasks.length === 0 ? (
        <EmptyState
          title="No generated results"
          description="Successful tasks will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {succeededTasks.map((task) => (
            <article
              key={task.id}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
            >
              <div className="aspect-square overflow-hidden bg-zinc-100">
                <Image
                  src={task.resultImageUrl}
                  alt={`Result of ${task.id}`}
                  width={720}
                  height={720}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1 p-3">
                <p className="truncate text-xs font-medium text-zinc-500">
                  {task.id}
                </p>
                <p className="line-clamp-2 text-sm text-zinc-800">
                  {task.prompt}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
