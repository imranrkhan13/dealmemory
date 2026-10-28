#!/usr/bin/env python3
import sys
import argparse
from pathlib import Path

# Add packages/python to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "packages" / "python"))

from agentlens.client import AgentLens

parser = argparse.ArgumentParser(description="Send events from Python client")
parser.add_argument("--project-key", required=True, help="Public project key (pk_live_...)")
parser.add_argument("--api-url", required=True, help="Ingestion API URL")
args = parser.parse_args()

client = AgentLens(project_key=args.project_key, api_url=args.api_url)
client.identify("user_bob_python")
client.set_goal("Optimize enterprise onboarding")
client.track("meaningful_action", {"step": "integration_setup"})

prefix = "_".join(args.project_key.split("_")[:3])
print(f"[Python Client] Sent events for user_bob_python using projectKey prefix: {prefix}")
