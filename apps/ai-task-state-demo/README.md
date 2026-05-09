# AI Task State Demo

A frontend demo for modeling long-running AI task lifecycles from creation to completion.

## Overview

`ai-task-state-demo` focuses on async state transitions that are common in real AI products: `queued`, `processing`, `succeeded`, `failed`, and `cancelled`.
It demonstrates how to keep UI stable while tasks run in the background and status updates arrive over time.

## Features

Implemented:

- **Text-to-Image task creation**
- **Image-to-Image task creation** with file upload validation and preview
- **Task lifecycle modeling** (`queued` -> `processing` -> terminal states)
- **Dual sync modes**: SSE push updates and polling fallback
- **Task queue UI** with progress bars, status badges, and per-task metadata
- **Retry failed tasks**
- **Cancel active tasks**
- **Result gallery** for successful outputs
- **Local API + in-memory task store** for simulation
- **Optional Cloudflare Workers AI generation** with mock image fallback

Planned / future improvements:

- Stronger optimistic task insertion/update strategy
- Persistent task history (database-backed instead of in-memory only)
- Additional task types beyond image generation

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- TanStack React Query
- Zod
- Server routes (`/api/tasks`, `/api/tasks/stream`, `/api/upload`)
- SSE + polling status synchronization
- Cloudflare AI SDK (optional, server-side only)

## Demo Flow

1. Enter a prompt (or upload an image + prompt).
2. Create a task.
3. Task appears as `queued`, then `processing`.
4. Status/progress sync through SSE or polling.
5. Task ends as `succeeded` / `failed` / `cancelled`.
6. Successful results appear in the gallery.
7. Failed tasks can be retried; active tasks can be cancelled.

## Local Development

From monorepo root:

```bash
npm install
```

Run this app:

```bash
npm run dev -w apps/ai-task-state-demo
```

Alternative:

```bash
cd apps/ai-task-state-demo
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

Optional Cloudflare image generation:

```bash
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_AI_IMAGE_MODEL=@cf/black-forest-labs/flux-1-schnell
```

If Cloudflare variables are missing (or Cloudflare generation fails), the demo automatically falls back to mock result images.

## Project Structure

```txt
apps/ai-task-state-demo/
  src/
    app/
      page.tsx
      api/
        tasks/
        upload/
    components/
      ai-task-state-demo-shell.tsx
      ai-task-state-demo-view.tsx
      task-create-panel.tsx
      task-queue.tsx
      task-card.tsx
      result-gallery.tsx
    hooks/
      use-ai-task-state-demo-controller.ts
      use-tasks-query.ts
      use-task-stream.ts
      use-create-task.ts
      use-cancel-task.ts
      use-retry-task.ts
      use-upload-preview.ts
    lib/
      task-store.ts
      task-simulator.ts
      cloudflare-image-generator.ts
      image-prompt-enhancer.ts
      validators.ts
    types/
      task.ts
  package.json
```

## Why This Demo Matters

- It proves async lifecycle handling beyond instant CRUD.
- It shows practical UI strategies for long-running background jobs.
- It demonstrates retry/cancel/result flows that appear in real AI products.
- It is highly relevant for frontend/system-design interviews, including non-Web3 roles.

## Roadmap

- Add automatic sync failover strategies between SSE and polling.
- Improve retry/cancel UX with richer action feedback.
- Add persistent storage and task history views.
- Extend the demo with more AI task categories.

[Back to Web3 Frontend Labs](../../README.md)
