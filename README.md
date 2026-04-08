# Calculator (monorepo)

React + Vite frontend and Node/Express API, organized as an **npm workspaces** monorepo for hosting tools like AWS Amplify.

## Layout

| Path        | Package        | Description                    |
| ----------- | -------------- | ------------------------------ |
| `apps/web`  | `@calc-app/web` | React calculator UI (Vite)     |
| `apps/api`  | `@calc-app/api` | Express `POST /calculate` API  |

## Local development

From the repository root:

```bash
npm install
npm run dev
```

- Frontend: Vite dev server (default `http://localhost:5173`)
- API: `http://localhost:3001` (set in `apps/web/.env.development` as `VITE_API_URL`)

Run only one app:

```bash
npm run dev:web
npm run dev:api
```

## Production / Amplify

1. In Amplify, enable **monorepo** and set **Monorepo root directory** to: `apps/web`
2. Use the root `amplify.yml` (runs `npm ci` at repo root, then builds the web workspace). **Artifacts** are `apps/web/dist`.
3. For the deployed site to call your API, set an environment variable in the **web** build: `VITE_API_URL` to your API’s public URL (no trailing slash). Example: `https://your-api.execute-api.us-east-1.amazonaws.com`

Amplify Hosting serves static files only; deploy `apps/api` separately (e.g. App Runner, ECS, Lambda + API Gateway, or another Node host).

## Build (from root)

```bash
npm install
npm run build
```
