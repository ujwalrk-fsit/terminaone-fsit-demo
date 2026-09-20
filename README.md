# TerminaOne — Marketplace Reference (mock frontend)

Forge-benchmarked, Vercel-ready reference. **All data synthetic. No real securities.**
Naming: `opportunities` everywhere (marketplace items, routes, types, CMS tab). A forbidden-string gate (`pnpm lint:forbidden`) scans `src/` for legacy marketplace names.

## Quick start

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc + vite -> dist
```

Env (`.env.example`): `VITE_API_URL`, `VITE_MOCK_MODE=true`, `VITE_SESSION_TIMEOUT_MIN=15`.

Demo logins: `investor@demo.local / investor123`, `admin@demo.local / admin123`, plus one-click role switch on login page (admin, advisor, affiliate, fund_manager, monitor, investor).

## What is mocked

- Auth: fake native-JWT payload `{sub,email,roleGroup,permissions}` in `localStorage:tsg.auth`. Swap to real NestJS JWT by `VITE_MOCK_MODE=false`.
- Persistence: `tsg.auth`, `tsg.watchlist`, `tsg.iois` (+ drafts). No Atlas in v1.
- Pay: manual `bankDetails` per fund + proof upload + `I have transferred`. No Stripe.
- Sign: native type/draw/upload, 3-leg order investor→advisor→fund_manager. No SignNow.
- CMS: markdown textarea + preview (no rich-text dep).
- Storage/email/queue: local only. Phase-2 abstractions: `StorageService local|R2`, `MailService console|resend`, in-process events.

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
- `v0.2-domain` — types + mocks + api client + store
- `v0.3-app` — all routes/pages + bank/sign + persistence
- `v1.0-vercel` — green build + README

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
