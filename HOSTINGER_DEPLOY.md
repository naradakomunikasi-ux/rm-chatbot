# Hostinger Cloud Startup deployment — Node candidate

**Status: Engineering candidate / PRODUCTION HOLD** until live smoke, persistence, security and access tests pass.

## Findings on `main`
`app/main.py` is FastAPI. Its existing API serves chat, models, conversations, knowledge, explicit memory, skills, capabilities and audit. The old middleware uses a shared optional token, **not** production authentication/RBAC. The full v2 PDF ingestion, crawler, DOCX/XLSX/PDF exports, and user RBAC described in README are **not present in `main`** and thus are not represented as migrated features here.

## Deploy

1. Review and merge `engineering/hostinger-node-migration` into `main` after checks.
2. In Hostinger **Web Apps / Node.js**, import repository `naradakomunikasi-ux/rm-chatbot`, branch `main`; app root = repository root, not `public_html/app`.
3. Build: `npm install` or `npm ci` after a lockfile is generated. Start: `npm start`. Node >=20 recommended; native `better-sqlite3` requires a supported binary/build environment.
4. Configure `RM_ADMIN_PASSWORD` (12+ characters), `RM_ADMIN_USER`, `NODE_ENV=production`, `TRUST_PROXY=1`, `OLLAMA_BASE_URL`, optional `OLLAMA_API_KEY`, and `RM_DB_PATH` via Hostinger environment secrets. Ollama must be reachable via HTTPS or secure network tunnel; `localhost:11434` on Hostinger is not your own laptop.
5. `RM_DB_PATH` must point to an **existing writable persistent private directory**, not a build artifact or web-accessible path. Verify this with Hostinger before production; if Web Apps has ephemeral filesystem, use managed persistent database/storage or change deployment model. SQLite WAL files need persistent local-disk semantics.
6. Deploy. Test `GET /api/health`, visit `/login`, sign in, then test model discovery, chat save/reload, login protections, cross-account access and service restart persistence.
7. Set up backups for the SQLite database (including WAL safe backups), retention, restore drills, monitoring and TLS verification.

## API compatibility
Existing frontend at `app/index.html` is retained and uses same `/api/` routes. Browser login session cookie replaces the old shared application token. Role restrictions: Admin can manage users/models/skills/audit; Supervisor may curate draft knowledge; RM may chat/create own memory; Viewer has read-only access. Chat histories are scoped to the owning user; legacy conversations have `owner_id=NULL` and are visible only to Admin.

## Security caveats / blockers
- Basic local password + HTTP-only cookie is **not banking-production IAM**. Requires SSO/OIDC, MFA, CSRF token policy, rate limiting across multiple instances, account lockout policy and penetration testing.
- Existing knowledge entries marked approved remain approved as-is; a proper reviewer approval workflow, source provenance and isolation are pending.
- `RM_APP_TOKEN` is no longer required; do not treat it as authentication.
- Users are provisioned through admin-only `POST /api/users`, not yet through UI.
- PDF crawling/extraction and DOCX/XLSX/PDF exports are not implemented in the authoritative baseline and remain separate migration work.
- Verify Hostinger's current Node runtime/build capabilities and disk persistence; do not assume SQLite deploy durability without tests.
