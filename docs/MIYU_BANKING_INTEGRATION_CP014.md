# Miyu Contoh Banking Knowledge Integration (CP-014)

Integrated into the existing Hostinger-compatible Node/Express/SQLite app:
- `banking.js` auto-creates isolated `banking_*` SQLite tables in the pre-existing database (idempotent `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE`).
- 94 synthetic product families in 12 categories, plus 50 fictional customers.
- `/banking` responsive web workspace; entry link from existing Knowledge Hub.
- `GET /api/banking/products`, `GET /api/banking/catalog-summary`.
- `POST /api/banking/simulate/deposit` and `POST /api/banking/simulate/loan`.
- `GET /api/banking/customers` available only when `RM_ENABLE_BANKING_DEMO=true`.
- Proposal/approval write endpoints explicitly return **403**; they are not authorized by the existing global `X-App-Token`.

## Deployment
Use existing `npm install` and `npm start` through Hostinger's Node application setup. Configure `RM_APP_TOKEN` (already required), `RM_DB_PATH` (persistent writable volume), `OLLAMA_BASE_URL`, and `OLLAMA_MODEL`. Do not enable banking demo on a production instance. Existing app data is not deliberately deleted or overwritten. Take a DB backup before redeploy.

## Safety and limits
Numbers are synthetic, no verified rates, no actual bank decision. This integration does **not** implement SSO/JWT/RBAC. Shared application token cannot establish individual RM identity or approval authority. Browsers call the same authenticated API as the main app. Calculator results are demonstration-only; deposit uses simple months/12 and an illustrative 20% tax, loan uses fixed effective annuity and excludes fees. Customer list consists solely of invented demo profiles.
Production requires ID/role authentication, customer assignment, human approval authority and maker-checker separation, detailed audit trail, backup recovery test, data governance and end-to-end tests.

## CP-014 status
Code integrated on GitHub main branch; not verified on Hostinger. No deploy success or production permission claimed. Approval workflow remains HOLD.
