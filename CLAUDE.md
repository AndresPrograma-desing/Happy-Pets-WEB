# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Happy Pets Vet System WEB — a React/Vite frontend for veterinary clinic management, with role-based panels for Administrador, Doctor, and Secretaria, plus a separate public Portal de Clientes. Covers appointments (citas), clinical consultations (consultas), customers/pets, product inventory, invoicing (facturas) with QR/docx generation, and internal messaging. Includes a local Node/Express mock backend (`server/`) used only for auth/messaging testing — it does not implement citas, productos, or facturas.

## Commands

Frontend (run from repo root):
- `npm install` — install frontend deps
- `npm run dev` — start Vite dev server (default mode)
- `npm run dev:local` — Vite dev server, `--mode localhost` (forces `baseURL_LocalHost` in `config/config.js`)
- `npm run dev:server` — Vite dev server, `--mode tunnel` (forces the devtunnel base URL)
- `npm run build` — production build
- `npm run preview` — preview a production build
- `npm run lint` — ESLint over the whole repo
- `npm run documentation` — opens `public/Documentation/index.html`

Mock backend (only covers auth + messaging):
- `cd server && npm install && npm start`

There is no configured test runner/script in `package.json`; `Tests/Playground` holds manual/visual dev playgrounds (wired into `App.jsx` at `/test`), not automated tests.

Environment variables (`.env` at repo root): `VITE_API_URL`, `VITE_HEALTH_URL` (falls back to hardcoded URLs in `config/config.js` if unset).

## Architecture

### Routing and shell (`src/App.jsx`)
- `App` wraps everything in `useHealthCheck()`; while the first health check is pending nothing renders, and once online/offline status is known, `AppRouterWrapper` redirects to `/witing` (offline) or restores the last route (back online) via `sessionStorage['redirectAfterWiting']`.
- Authenticated routes share one persistent shell: they're nested under `<Route element={<PanelLayout />}>` (`src/components/GenericPanel/PanelLayout`) using `<Outlet>`, so the TopBar/panel chrome doesn't remount on navigation. New authenticated pages should be added inside that route group, not as siblings of it.
- `/portal-cliente` mounts the independent `PortalClientes` app (own `Components/`, `Constants.js`, `utils.js` at repo root, outside `src/`).

### API layer — must go through `src/services/api/`
- `src/services/api/client.js` exports `request(path, opts)`, the single fetch chokepoint: normalizes path prefixes (`/api/...`) against `API_BASE`, injects the Bearer token from storage, redacts it in dev-mode logging, parses JSON/blob/text responses, and on a 401 calls `logout()` and dispatches a global `api-error` event.
- `src/services/api/index.js` (plus `Dashboard/`, `pdf/`, `emails.js`) expose business-level functions (e.g. `getProducts()`, `createUser()`) built on top of `request`. **Raw `fetch` calls in components or hooks are prohibited** — add a new endpoint function here instead and consume it from a hook/component.
- Backend field naming is inconsistent (Spanish/English: `rol`/`role`, `contenido`/`content`; varying envelope shapes: `data`/`result`/`items`/bare arrays). Handle this heterogeneity in the service/hook layer the way existing code does, not with ad-hoc guesses per component.
- `config/config.js` (repo root, not `src/config/`) resolves `DEV_URL_API.baseURL` from `VITE_API_URL` / Vite mode (`localhost` vs `tunnel`/prod), and exposes `isDummyModeActive()`.

### Dummy/offline mode
- When dummy mode is active, `client.js` short-circuits `request()` and returns canned data from `src/dummy/db.json` (or an inline fallback) instead of hitting the network — used to develop without a live backend. Toggled via the `USE_DUMMY_DATA` localStorage key (read through `isDummyModeActive()`).
- `useHealthCheck` (`src/hooks/useHealthCheck.js`) polls `${DEV_URL_API.baseURL}/Health` every 10s (60s timeout on the very first check, 8s after) to distinguish "no internet" from "backend down," driving the `/witing` redirect and the dummy-mode "backend is back" banner in `App.jsx`.

### Session/auth
- Session data (token, login payload, doctor id) is written to both `sessionStorage` and `localStorage` via `src/services/api/storage.js`; reads prefer `sessionStorage` and lazily backfill it from `localStorage`. Use the existing `get*FromLoginSession`/`extract*` helpers there rather than reaching into storage keys directly — payload shapes vary by role/backend version and those helpers already account for it.
- `logout()` in `storage.js` is the single place that clears session + dummy-mode keys; it's invoked automatically on 401 by the API client.

### State: hooks-first, Redux is new
- Most cross-cutting logic (polling, per-feature data fetching, health, notifications) lives in custom hooks in `src/hooks/`, one file per concern (e.g. `usePolling.js`, `useUsers.js`, `useRoles.js`). Prefer this pattern for new data-fetching logic.
- `src/redux/` (`store.js`, `slices/rolesSlice.js`) is a newer addition using Redux Toolkit — currently scoped to role state. Don't assume broader app state lives in Redux; check whether a hook already owns the data before introducing a new slice.

### Directory map (see `FRONTEND_STRUCTURE.md` for the full narrative version)
- `src/components/screens/components/` — the base component library (buttons, inputs, cards, tables). Reuse these before building new primitives.
- `src/pages/` — routed views grouped by role (`AdminSystem/`, `DoctorSystem/`, `SecretariSystem/`).
- `src/features/` — self-contained features (e.g. internal messaging).
- `src/constants/` — centralized UI text (`TEXT.js`, `constants.js`).
- `src/utils/` — API error handling, currency/invoice formatting helpers.
- `src/context/` — small persistence utilities (e.g. `getUserId`).
- `PortalClientes/` (repo root) — the client-facing portal, structured like a mini-app parallel to `src/`.

## Project conventions (previously in `GEMINI.md`)

These are enforced project rules, not suggestions:
- Every component lives in its own subfolder as `<ComponentName>/index.jsx` (+ `index.module.css` if it has styles), never as a bare file dropped next to its siblings — this applies everywhere in `src/`, not just `screens/components/`. A feature's own subcomponents go under `<Feature>/components/<ComponentName>/index.jsx` (e.g. `Dashboard/components/Filters/index.jsx`), dropping the feature name as a prefix since the path already carries it. The feature's own top-level component (e.g. `Dashboard/Dashboard.jsx`) is the one exception and stays flat alongside its `utils.js`.
- Reuse components from `src/components/screens/components/` first; if a new one is truly needed, build it there following existing conventions.
- No inline logic in JSX — extract non-trivial JS into a `utils.js` or a hook.
- No inline or hardcoded CSS in JSX — all styles go in a co-located `.module.css` file.
- No hardcoded UI text — centralize strings in a `constants.js`/`TEXT.js`.
- No raw `fetch`/raw endpoint strings outside `src/services/api/` (see API layer above).
- Don't add new npm dependencies without checking with the user first.
- Don't make substantial changes to existing business logic without checking with the user first — the system is described as sensitive to regressions.
- Don't push/commit changes to the repo unless explicitly authorized by the user for that action.

## Build quirk

`vite.config.js` includes a custom `caseInsensitiveResolver` plugin: relative imports are resolved case-insensitively to paper over Windows (dev) vs. Linux/Vercel (prod build) filesystem case-sensitivity mismatches. Don't rely on this for new files — match import casing to actual filenames exactly.
