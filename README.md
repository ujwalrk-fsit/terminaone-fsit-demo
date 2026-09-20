# TerminaOne — Marketplace

Forge-benchmarked, Vercel-ready private-markets front end. **All figures illustrative. No real securities.**
Naming: `opportunities` everywhere (marketplace items, routes, types, CMS tab). A forbidden-string gate (`pnpm lint:forbidden`) scans `src/` for legacy marketplace names.

## Quick start

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc + vite -> dist
```

Env (`.env.example`): `VITE_API_URL`, `VITE_MOCK_MODE=true`, `VITE_SESSION_TIMEOUT_MIN=15`.

Sample logins: `investor@demo.local / investor123`, `admin@demo.local / admin123`, plus role switch on the login page (admin, advisor, affiliate, fund_manager, monitor, investor).

## How it works

- Auth: local session shaped like the future JWT payload `{sub,email,roleGroup,permissions}`, kept in `localStorage:tsg.auth`. Point `VITE_API_URL` at the API and set `VITE_MOCK_MODE=false` to go live.
- Persistence: `tsg.auth`, `tsg.watchlist`, `tsg.iois` (+ drafts) in the browser.
- Pay: manual `bankDetails` per fund + proof upload + `I have transferred`.
- Sign: native type/draw/upload, 3-leg order investor→advisor→fund_manager.
- CMS: markdown textarea + preview.
- Storage/email/queue: local only. Backend abstractions planned: `StorageService local|R2`, `MailService console|resend`, in-process events.

## Theme & UI kit (v2 — blue, Mintlify-derived)

- Light mode default, dark mode via the user menu (persisted as `tsg.theme`, SSR-safe init in `index.html`, `color-scheme` set per theme).
- Type: Inter for prose, Geist Mono (tabular) for every numeric value.
- Single blue accent `#3772cf` (deep `#2c5aa6`) for CTAs/active/chart series; gains `#1ba673`, losses `#d45656` — blue is never a gain signal. AA-graded text tokens (`--success-text`, `--warning-text`) keep small text at ≥4.5:1.
- Black-pill primary buttons, blue accent money-CTAs, 6–8px control radii, flat surfaces, 12px cards.
- All styling lives in `src/index.css` CSS variables — change a token, retheme the platform.
- Open `/ui-kit` in the app to review every token and core component in one place before requesting changes.

## Shared modules (small interfaces, reused everywhere)

- `src/format.ts` — `fmtMoney`, `fmtCompact`, `fmtNum`, `fmtPct`, `fmtDate`.
- `src/url.ts` — `useQueryState(key, initial)`; filter/tab/range state deep-links via query params.
- `src/components/Confirm.tsx` — `confirm({title, body, confirmLabel, danger}): Promise<boolean>` + `<ConfirmHost/>`; all destructive actions confirm first.
- `src/components/Live.tsx` — `announce(msg)` + `<LiveHost/>` polite region for toasts and errors.
- `src/components/Field.tsx` — `<Field label required hint error>` for labelled controls + `focusFirstError()`.
- `src/components/Tables.tsx` — `useSort`, `usePagination`, `SortTh`, `TableTabs`, `Toolbar`, `Pager`, `Avatar`, `ExpandBtn`, `toCsv`.
- Lean bundle: chart routes (`/dashboard`, `/portfolio`, `/opportunities/:id`) lazy-load recharts on demand.

## Routes (selection)

/`, `/opportunities`, `/opportunities/:id`, `/funds`, `/data-room`, `/data-room/:fundId`,
`/dashboard`, `/portfolio`, `/indications`, `/indications/new`, `/onboarding`, `/documents`,
`/transactions`, `/watchlist`, `/notifications`, `/settings`, `/insights`, `/admin`, `/ui-kit`, `/auth/*`.

## Working back office (admin / fund_manager)

Funds (create/edit + bank details), users (create/role/status), role-permission matrix,
indication queue (approve/reject/allocate/signature), articles CMS (create/edit/publish),
market-data editor, audit log. All edits persist in-browser (`tsg.db.v1`) and render
everywhere immediately; reset from Settings.

## API contract (Phase-2 NestJS monolith, unchanged)

| UI service | Method/Path |
|---|---|
| auth | POST `/api/auth/signup|login|refresh|logout` |
| users/roles | GET `/api/users`, `/api/roles` |
| portfolio | GET `/api/investor-portfolio` |
| indications | GET/POST `/api/indications` |
| funds | GET `/api/fund-offerings` (+ bankDetails upload by admin/FM) |
| opportunities | GET `/api/opportunities`, `/api/opportunities/:id` |
| documents/sign | GET `/api/documents`, `/api/signatures` |
| transfers | GET/POST `/api/transfers` (bank; replaces Stripe) |
| cms | GET `/api/cms` |
| misc | GET `/api/notifications|dashboard|search` |

Legacy ER map: old vault collection/type = new **`opportunities`** UI/routes. Old `paymenttransactions+stripe` = new `transfers (BANK_TRANSFER)`.

## Phase 2 (free OSS backend, not in this repo yet)

- 1 DB `tsg_app_db`, Atlas M0 free, `ap-south-1`. Collections: users, roles, investoraccounts, indicationofinterests, investorfunds, fundofferings, opportunities, transfers, refunds, documents, documentversions, signaturerequests, signatureaudits, media_news, audit_logs (TTL 3y), notifications.
- NestJS monolith, native JWT (access 15m + refresh 7d rotation, HttpOnly), email+password only, RBAC guard.
- Render free web service for API; Vercel stays frontend-only.

## Rollback checkpoints (do not rewrite history)

- `v0.0-base` — empty root
- `v0.1-scaffold` — toolchain + shell + forbidden gate
- `v0.2-domain` — types + sample data + api client + store
- `v0.3-app` — all routes/pages + bank/sign + persistence
- `v1.0-vercel` — green build + README
- `v1.1-polish` — Venture Dark theme + hero + cards

```sh
git log --oneline --decorate
git tag -l
# rollback (safe, no data loss):
git status && git stash push -m "wip" || true
git checkout -b rollback/<date> <tag>   # e.g. v0.2-domain
# return:
git checkout main
```

Future changes: branch per feature (`feat/<x>`), commit small, tag `v1.x-*` before risky edits.
