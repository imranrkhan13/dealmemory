# agentlens

Server-side Python SDK for AgentLens.

```bash
pip install agentlens
```

```python
from agentlens import AgentLens

agentlens = AgentLens(
    project_key="pk_live_your_project_key",
    api_url="https://your-agentlens-domain/api",
)
agentlens.identify("user_123")
agentlens.track("report_exported", {"format": "pdf"})
```

Use only the public `pk_` key. AgentLens filters sensitive property names and accepts only simple values.
