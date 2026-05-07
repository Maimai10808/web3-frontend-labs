"use client";

import { useState } from "react";
import type { UploadAsset } from "@/types/task";
import { TextToImageForm } from "./text-to-image-form";
import { ImageUploadForm } from "./image-upload-form";

type CreateTab = "text-to-image" | "image-to-image";

type TaskCreatePanelProps = {
  onCreateTextTask: (prompt: string) => Promise<void>;
  onCreateImageTask: (input: {
    prompt: string;
    sourceImage: UploadAsset;
  }) => Promise<void>;
  isCreatingTask?: boolean;
  createTaskError?: unknown;
};

export function TaskCreatePanel({
  onCreateTextTask,
  onCreateImageTask,
  isCreatingTask = false,
  createTaskError,
}: TaskCreatePanelProps) {
  const [tab, setTab] = useState<CreateTab>("text-to-image");

  const createErrorMessage =
    createTaskError instanceof Error ? createTaskError.message : null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-base font-semibold text-zinc-900">Create Task</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose generation mode and submit a task.
        </p>
      </header>

      <div className="mt-4 inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => setTab("text-to-image")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            tab === "text-to-image"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-white"
          }`}
        >
          Text to Image
        </button>
        <button
          type="button"
          onClick={() => setTab("image-to-image")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            tab === "image-to-image"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-white"
          }`}
        >
          Image to Image
        </button>
      </div>

      <div className="mt-4">
        {tab === "text-to-image" ? (
          <TextToImageForm
            onSubmit={onCreateTextTask}
            isSubmitting={isCreatingTask}
          />
        ) : (
          <ImageUploadForm
            onSubmit={onCreateImageTask}
            isSubmitting={isCreatingTask}
          />
        )}
      </div>

      {createErrorMessage ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {createErrorMessage}
        </p>
      ) : null}
    </section>
  );
}
