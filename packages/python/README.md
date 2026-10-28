# DealMemory Python SDK

Server-side Python SDK for DealMemory. Send explicit, privacy-safe product milestone events to DealMemory projects from FastAPI, Django, Flask, Celery, or background scripts.

```bash
pip install ./packages/python
# or pip install dealmemory
```

```python
from agentlens import DealMemory

dm = DealMemory(
    project_key="pk_live_your_project_key",
    api_url="https://your-dealmemory-domain/api",
)
dm.identify("user_123")
dm.track("report_exported", {"format": "pdf"})
```

Use only the public `pk_` key. DealMemory filters sensitive property names and accepts only simple, non-credential values.
