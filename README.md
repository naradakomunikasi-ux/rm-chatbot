# RM SmartKit Copilot
**Production-Oriented Candidate v2 · FastAPI · SQLite · Responsive Web UI · Ollama**

RM SmartKit is an AI sales-enablement copilot for bank relationship managers working with Retail, SME, Corporate, and Branch customers. It combines a unified conversation workspace, customer-facing document drafting, governed knowledge, capability-specific model selection, and auditable local storage.

> **Status: Engineering Candidate / Production HOLD.** Do not process actual customer data without bank security, privacy, operational-risk and compliance approval.

## Target features (v2 candidate package)

| Capability | Description |
| --- | --- |
| Unified Home Chat | Minimal, mobile-first chatbot UI; conversations persisted in SQLite |
| Knowledge ingestion | PDF text extraction and restricted public HTTPS page extraction |
| Knowledge governance | Draft → Review → Approved; only approved content may ground answers |
| Document conversion | Server-generated DOCX, XLSX and PDF exports |
| Model runtime | Ollama connected server-side; one assigned model per capability, **no fallback** |
| Skill configuration | Configurable domain instructions for RM, credit, macroeconomic research and business documents |
| Authentication | Local username/password, hashed passwords and HTTP-only sessions |
| RBAC | Admin, Supervisor, RM and Viewer permission boundaries |
| Storage | SQLite for conversations, messages, explicit memory, knowledge, skills, configurations and audit |

**Important release distinction:** v1 source is currently on the GitHub main branch. The full v2 candidate lives in the associated downloadable ZIP until the source-file synchronization is confirmed. Do not assume all features above are deployed from main.

## Quick start (v2 source package)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export RM_ADMIN_PASSWORD='replace-with-long-unique-password'
export OLLAMA_BASE_URL='http://127.0.0.1:11434'
export OLLAMA_MODEL='gemma3:4b'
export RM_SECURE_COOKIE=0
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000` and authenticate as `admin` using the password configured in the environment. Set `RM_SECURE_COOKIE=1` **only** when deployed behind verified HTTPS termination. Never commit a production password or provider API key.

Run checks:

```bash
pytest -q tests/test_production.py
```

## Architecture

```text
Responsive HTML/CSS/JavaScript
            |
    FastAPI session gateway
            |
    RBAC / CSRF / endpoints
       /      |      \
   SQLite   Ollama  Export generators
       |
  Knowledge (draft / approved)
       |
 PDF text extraction / restricted public HTTPS extraction
```

## Access roles

- **Admin:** user administration, model/provider policy, knowledge operations, audit.
- **Supervisor:** knowledge ingestion/review and RM workflows.
- **RM:** chat, personal workflows, memo/proposal creation, approved reference usage.
- **Viewer:** limited read access.

The v2 role checks are a baseline only; **per-user and per-tenant data isolation is not complete.**

## Production blockers (mandatory before real banking deployment)

1. SSO/OIDC, MFA, token/session rotation, login throttling and managed identity lifecycle.
2. Tenant-scoped RBAC/ABAC and ownership checks on every conversation, memory item and document.
3. Secure secrets vault, encrypted database volume, backup/restore drills and retention/deletion policy.
4. Egress proxy and hardened SSRF controls (including DNS rebinding protection), PDF malware scanning and extraction sandbox.
5. Secure evidence-bound retrieval, document provenance, citation and compliance approval enforcement.
6. Load/concurrency testing, browser/mobile accessibility QA, live Ollama inference tests, logging and penetration testing.

## Repository safety

`data/`, `*.sqlite3`, `.env`, local venv/cache files and customer data must never be committed. Public source repository only; no secret or customer records.

## Project checkpoint

- **v1:** committed to `main`.
- **v2:** candidate packaged and tested locally; repository source synchronization must be checked.
- **Release decision:** **PRODUCTION HOLD** pending implementation/security/QA evidence.

© RM SmartKit project. No banking advice or automated lending decisions are authorized by the prototype.
