# Backend Workspace Guide

This folder is the shared backend area for `web3-frontend-labs`.

If a demo app later needs a simple backend service (API, mock data, task processing, verification, etc.), create it here under `backend/src/modules/*`.

## Current Stack

- Express
- TypeScript
- `tsx` for local dev
- `dotenv` for env loading

## Run Backend

From repo root:

```bash
cd backend
npm install
npm run dev
```

Default URL:

```text
http://localhost:4000
```

Quick checks:

- `GET /` -> backend status
- `GET /api/health` -> health check

## Env

Create `backend/.env` when needed:

```env
PORT=4000
NODE_ENV=development
```

(`PORT` defaults to `4000` if not set.)

## Where to Add New Backend Features

Use module-based structure:

```text
backend/src/modules/<module-name>/
  <module-name>.routes.ts
  <module-name>.types.ts
  <module-name>.data.ts (optional for mock/demo data)
  <module-name>.service.ts (optional)
```

### Step 1: Create routes

Example:

```ts
// src/modules/example/example.routes.ts
import { Router } from "express";

export const exampleRoutes = Router();

exampleRoutes.get("/", (_req, res) => {
  res.json({ data: "ok" });
});
```

### Step 2: Register routes

Add module route in:

`backend/src/routes/index.ts`

Example:

```ts
apiRoutes.use("/example", exampleRoutes);
```

Then endpoint becomes:

```text
/api/example
```

## Recommended Rule

- App private logic stays in each app.
- Shared or reusable backend logic goes to `backend/src/modules/*`.
- Keep cross-demo backend code modular and avoid hard-coding one app's UI behavior into shared modules.
