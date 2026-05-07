"use client";

import { useState, type FormEvent } from "react";

const PROMPT_MAX_LENGTH = 300;

type TextToImageFormProps = {
  onSubmit: (prompt: string) => Promise<void>;
  isSubmitting?: boolean;
};

export function TextToImageForm({
  onSubmit,
  isSubmitting = false,
}: TextToImageFormProps) {
  const [prompt, setPrompt] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const submit = async () => {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setSubmitError("Prompt is required.");
      return;
    }

    setSubmitError(null);

    try {
      await onSubmit(normalizedPrompt);
      setPrompt("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create task.",
      );
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor="text-to-image-prompt"
          className="text-sm font-medium text-zinc-700"
        >
          Prompt
        </label>
        <textarea
          id="text-to-image-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={PROMPT_MAX_LENGTH}
          disabled={isSubmitting}
          placeholder="A cyberpunk city at night with neon reflections..."
          className="h-28 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Tip: include `fail` to simulate failure case.</span>
        <span>
          {prompt.length}/{PROMPT_MAX_LENGTH}
        </span>
      </div>

      {submitError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Creating..." : "Create Text-to-Image Task"}
      </button>
    </form>
  );
}
