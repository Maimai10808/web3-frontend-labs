# AI Task State Demo: Technical Walkthrough

This document is the developer-facing walkthrough for `apps/ai-task-state-demo`.
It explains how the async task system is modeled, how data flows through the app, and where to extend it safely.

## 1. Mental Model

Treat this demo as a **long-running task state machine**, not a one-shot request/response page.

There are two layers of state:

1. **Task domain state** (`src/types/task.ts`)
   - `queued`
   - `processing`
   - `succeeded`
   - `failed`
   - `cancelled`
2. **UI operation state** (`src/hooks/use-ai-task-state-demo-controller.ts`)
   - idle
   - creating (`isCreatingTask`)
   - cancelling (`pendingAction.type === "cancel"`)
   - retrying (`pendingAction.type === "retry"`)

Why this is harder than normal CRUD:

- task completion is delayed and uncertain
- status updates can arrive from different channels (SSE vs polling)
- UI must remain coherent while actions overlap (create, cancel, retry, refresh)
- terminal states must be explicit and actionable

## 2. High-Level Runtime Flow

1. App boots at `src/app/page.tsx` and renders `AiTaskStateDemoShell`.
2. `AiTaskStateDemoShell` builds controller state via `useAiTaskStateDemoController`.
3. `AiTaskStateDemoView` renders the presentational UI (`AppHeader`, `TaskCreatePanel`, `ResultGallery`, `TaskQueue`).
4. User submits text-to-image or image-to-image task.
5. API route `POST /api/tasks` validates payload with Zod and creates in-memory task via `taskStore`.
6. `startTaskSimulation(taskId)` begins mock lifecycle progression (`queued -> processing -> terminal`).
7. Frontend synchronizes state through:
   - SSE (`/api/tasks/stream`) when sync mode is `sse`
   - timer-based `refetchTasks` every 2s when sync mode is `polling`
8. `TaskQueue` and `TaskCard` update status/progress/actions.
9. `ResultGallery` derives successful tasks with `resultImageUrl`.
10. Retry/cancel actions call mutation routes and update task state through event stream + query invalidation.

## 3. File and Module Architecture

```txt
apps/ai-task-state-demo/
  src/
    app/
      page.tsx
      layout.tsx
      api/
        tasks/
          route.ts
          stream/route.ts
          [taskId]/route.ts
          [taskId]/cancel/route.ts
          [taskId]/retry/route.ts
        upload/route.ts
    components/
      ai-task-state-demo-shell.tsx
      ai-task-state-demo-view.tsx
      app-header.tsx
      sync-mode-toggle.tsx
      task-create-panel.tsx
      text-to-image-form.tsx
      image-upload-form.tsx
      task-queue.tsx
      task-card.tsx
      task-actions.tsx
      task-progress.tsx
      task-status-badge.tsx
      result-gallery.tsx
      empty-state.tsx
    hooks/
      use-ai-task-state-demo-controller.ts
      use-tasks-query.ts
      use-task-stream.ts
      use-create-task.ts
      use-cancel-task.ts
      use-retry-task.ts
      use-upload-preview.ts
    lib/
      api-client.ts
      validators.ts
      task-store.ts
      task-simulator.ts
      task-events.ts
      cloudflare-image-generator.ts
      image-prompt-enhancer.ts
    types/
      task.ts
```

Module responsibilities:

- **App entry/layout**: page composition + global providers.
- **Controller hook**: orchestration of server-state hooks + local UI action state.
- **Form components**: collect prompt/image inputs and submit.
- **Queue components**: render lifecycle states and controls.
- **Gallery component**: render succeeded outputs only.
- **API routes**: mock backend contract (create/list/get/cancel/retry/stream/upload).
- **Store + simulator**: in-memory domain model and lifecycle engine.
- **Cloudflare adapter**: optional server-side real image generation.

## 4. Core Flow 1: Task Creation

### Text-to-image

- `TextToImageForm` collects prompt and validates non-empty + max length in UI.
- Calls `controller.handleCreateTextTask`.
- `useCreateTask` mutation calls `taskApiClient.createTask`.

### Image-to-image

- `ImageUploadForm` collects file + prompt.
- Runs client validation with `useUploadPreview`.
- Calls `taskApiClient.uploadImage` first, then `createTask`.

### Backend create flow

- `POST /api/tasks`:
  - parses JSON
  - validates with `createTaskSchema` (`lib/validators.ts`)
  - creates record in `taskStore.createTask(...)`
  - triggers `startTaskSimulation(task.id)`

### Optimistic behavior

- There is **no explicit optimistic insertion** in client cache before API success.
- UI updates after mutation invalidation + refetch and/or SSE `task.created` event.

## 5. Core Flow 2: Upload and Validation

Validation layers:

1. **Client-side precheck** (`use-upload-preview.ts`)
   - accepted MIME: `image/png`, `image/jpeg`, `image/webp`
   - max size: 5MB
   - local object URL preview
2. **Server-side schema check** (`/api/upload`, `validators.ts`)
   - validates file name/type/size with Zod

Prompt validation:

- UI trims and checks required prompt.
- API also enforces prompt constraints via `createTaskSchema` (max 300 chars).

Upload implementation note:

- Current upload route is a **mock metadata endpoint** in the same Next.js app.
- It does not persist binary files to external storage.

## 6. Core Flow 3: Task Queue State Modeling

Task status model lives in `src/types/task.ts`:

- active: `queued`, `processing`
- terminal: `succeeded`, `failed`, `cancelled`

UI behavior per status:

- **Badge**: `TaskStatusBadge` maps status to color/label.
- **Progress**: `TaskProgress` clamps progress and applies status-specific bar colors.
- **Actions** (`TaskActions`):
  - Cancel allowed only for `queued`/`processing` (`taskCanCancel`)
  - Retry allowed only for `failed` (`taskCanRetry`)
- **Error block**: failed tasks show `errorMessage`.
- **Result preview**: succeeded tasks render image preview.
- **Button disabled state**:
  - global pending action lock via `pendingAction`, `isCancellingTask`, `isRetryingTask`

Retrying is represented as a UI mutation state, not a distinct `TaskStatus`.

## 7. Core Flow 4: Polling-Based Synchronization

Polling is controlled in `useAiTaskStateDemoController`:

- active only when `syncMode === "polling"`
- interval: `2_000ms`
- action: calls `refetchTasks()` from React Query

React Query task list:

- `useTasksQuery` query key: `["ai-task-state-demo", "tasks"]`
- query fn: `GET /api/tasks`
- `staleTime`: 5s

Mutation hooks (`create/cancel/retry`) invalidate the same query key on success.

## 8. Core Flow 5: SSE-Based Synchronization

SSE is fully implemented.

### Server side

- Route: `GET /api/tasks/stream`
- Uses `ReadableStream`
- Emits:
  - `ready` event on connect
  - `task` events from `taskEventBus`
  - `heartbeat` every 15s
- Cleanup handles abort/unsubscribe/interval clear to avoid closed-controller errors.

### Client side

- Hook: `useTaskStream`
- Opens `EventSource("/api/tasks/stream")` when enabled
- On `task` events:
  - parse JSON payload as `TaskEvent`
  - update React Query cache with `applyTaskEventToList(...)`

SSE and React Query are integrated by directly mutating query cache on push events.

## 9. Core Flow 6: Result Rendering

`ResultGallery` renders only tasks where:

- `status === "succeeded"`
- `resultImageUrl` is a non-empty string

Result origin:

- `task-simulator.ts` attempts Cloudflare generation through `generateImageWithCloudflare`.
- On Cloudflare success: stores returned image URL/data URL.
- On Cloudflare failure or missing config: falls back to generated mock SVG data URL.

Failed tasks remain in queue with error message and no gallery image.

## 10. Core Flow 7: Retry and Cancel

Implemented endpoints:

- `POST /api/tasks/[taskId]/cancel`
- `POST /api/tasks/[taskId]/retry`

Cancel flow:

- only allowed for active tasks
- `taskStore.cancelTask` changes status to `cancelled`
- `stopTaskSimulation(taskId)` clears timers

Retry flow:

- only allowed for failed tasks
- `taskStore.retryTask(sourceTaskId)` creates a new task with `retryOfTaskId`
- simulator restarts for the new task

UI mutation flow:

- controller sets `pendingAction`
- executes mutation
- handles errors into `actionError`
- clears pending state in `finally`

## 11. Core Flow 8: React Query State Management

Query/mutation split:

- **Query**: `useTasksQuery` (list server tasks)
- **Mutations**:
  - `useCreateTask`
  - `useCancelTask`
  - `useRetryTask`

Cache update strategy:

- mutations invalidate task list query on success
- SSE path performs direct cache updates via `setQueryData`

State separation:

- **Local UI state**: sync mode, pendingAction, form-local errors, selected file preview
- **Server task state**: `taskStore` records exposed through API
- **Derived display state**: stats counters and gallery task filtering

## 12. Text-Based Data Flow Diagram

```txt
User Input (prompt/file)
  -> Client Validation (prompt + file checks)
  -> API Mutation (create task)
  -> taskStore.createTask
  -> task-simulator lifecycle progression
  -> Task Events (taskEventBus)
  -> SSE stream (/api/tasks/stream) OR polling refetch
  -> React Query task cache
  -> Task Queue + Result Gallery render
  -> Retry/Cancel mutations
  -> taskStore/task-simulator update + new events
```

## 13. Important Technical Decisions

1. **Controller/View split**
   - business orchestration in `useAiTaskStateDemoController`
   - view component remains presentational
2. **In-memory mock backend**
   - keeps async lifecycle behavior realistic without external infra
3. **Dual sync modes**
   - SSE for push-based updates
   - polling fallback for simpler/debug scenarios
4. **React Query as server-state boundary**
   - clear separation from local UI state
5. **Result gallery separate from queue**
   - queue handles lifecycle operations
   - gallery focuses on terminal successful outputs
6. **Server-only Cloudflare adapter**
   - credentials remain server-side
   - deterministic mock fallback preserves demo reliability

## 14. Error Handling Strategy

Handled error classes:

- invalid prompt: client validation + server schema errors
- invalid file type/size: client precheck and server `/api/upload` schema
- create/cancel/retry request failures: surfaced from mutation errors
- SSE payload parse errors: logged in `useTaskStream`
- processing failures: `prompt` containing `fail` forces simulated failure
- Cloudflare generation parse/request failure: caught and converted to mock result fallback

User-facing error surfaces:

- form-level error blocks
- action-level error block in `TaskQueue`
- failed task card error message
- loading/refreshing states for mutation/query actions

## 15. How to Extend This Demo

Practical extension points:

1. Replace in-memory `taskStore` with DB-backed persistence.
2. Move simulator to real background workers/queue.
3. Add auth + user-scoped task filtering in API routes.
4. Add explicit optimistic insertion for create mutations.
5. Add exponential backoff retry policies for transient failures.
6. Add more task types (audio, video, report generation) through `TaskType` union + form tabs.
7. Add durable file storage (S3/R2) for image uploads.
8. Add SSE reconnect/backfill strategy when connection drops.

## 16. Local Development

From monorepo root:

```bash
npm install
npm run dev -w apps/ai-task-state-demo
```

From app directory:

```bash
cd apps/ai-task-state-demo
npm run dev
```

Useful scripts (app-level):

```bash
npm run build
npm run lint
```

Monorepo-level checks:

```bash
npm run typecheck
npm run build
npm run lint
```

Mock API note:

- No separate backend process is required.
- API routes are part of the same Next.js app.

## 17. Known Limitations

### Implemented

- full task state lifecycle (`queued/processing/succeeded/failed/cancelled`)
- retry/cancel flows
- polling + SSE synchronization
- upload validation + preview
- optional Cloudflare generation with fallback

### Mocked / simplified

- task storage is in-memory only (`taskStore`)
- processing engine is timer-based simulation
- upload route does not persist files to external storage
- failure model is intentionally simple (`prompt.includes("fail")`)

### Planned / missing for production

- persistent multi-user task isolation
- durable job queue/workers
- resilient SSE reconnect + replay strategy
- explicit optimistic create flow
- richer failure taxonomy and retry policy configuration

