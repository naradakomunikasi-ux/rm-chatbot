# RM SmartKit Copilot — SQLite baseline

Full-stack prototype (FastAPI + SQLite), unified Home/Chat, Ollama server proxy, conversations, memory, knowledge, skills and capability model configuration.

Run:
```bash
pip install -r requirements.txt
export RM_APP_TOKEN='set-a-long-random-secret'
export OLLAMA_BASE_URL=http://127.0.0.1:11434
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open http://127.0.0.1:8000. Enter RM_APP_TOKEN in profile. SQLite DB is generated in data/, ignored by Git.

**Not production approved:** use SSO/RBAC, secret vault, tenant isolation, encryption, backups, privacy/security review before banking deployment. Website and PDF sources currently require pasted text (no crawler/parser). No model fallback or automated approval.
