# DealMemory Console User Guide

The DealMemory Console provides a clean, high-performance interface for observing real-time product activation, managing telemetry namespaces, inspecting ingested events, and managing developer keys.

The interface is inspired by the **Supermemory.ai** console design, featuring a crisp white and light-blue aesthetic, dynamic greeting cards, monthly request bar charts, and quick-access developer tools.

---

## Table of Contents

1. [Navigation Architecture (Public vs Console)](#1-navigation-architecture-public-vs-console)
2. [Console Layout Overview](#2-console-layout-overview)
3. [The Overview Dashboard](#3-the-overview-dashboard)
4. [Namespaces & Data Management](#4-namespaces--data-management)
5. [Requests & Event Inspector](#5-requests--event-inspector)
6. [User Journeys & Funnel Insights](#6-user-journeys--funnel-insights)
7. [API Keys & Developer Tools](#7-api-keys--developer-tools)

---

## 1. Navigation Architecture (Public vs Console)

DealMemory enforces a clean separation of concerns between public landing views and authenticated workspace operations:

### Public Mode (Before Sign-in)
When visiting DealMemory without an active session:
- **Clean Top Navigation**: Only public links are visible (`Demo`, `Pricing`, `Docs`, `Sign in`, and `Get started`).
- **No Console Clutter**: All internal operational menus (Overview, Namespaces, Requests, Settings) remain hidden until authenticated.

### Console Mode (After Sign-in)
Once authenticated, the console layout activates:
- **Left Sidebar**: Hosts all data, developer, and memory tools.
- **Top Header Bar**: Displays the active workspace switcher (`[F] Fella Free ⌵`), status indicators, Help button, and Docs link.
- **Floating Assist Bubble**: Available at the bottom-right corner for quick actions.

---

## 2. Console Layout Overview

```
+---------------------------------------------------------------------------------------+
|  dealmemory™   [F] Fella Free ⌵                                    Help   Docs ↗     |
+-------------------+-------------------------------------------------------------------+
|  🔍 Search   ⌘K   |  Good afternoon, Imran                                            |
|                   |  Onboard your agent to dealmemory ☀️ ⚙️ 🖥️ 📱              1d 7d [30d] All |
|  🏠 Overview      +-------------------------------------------------------------------+
|  💬 Playground    |  [DOCUMENTS]   [MEMORIES]   [SEARCH REQUESTS]   [NAMESPACES] [CONNECTORS] |
|                   |       1            6               34                2            0   |
|  DATA             +-------------------------------------------------+-----------------+
|  🏷️ Namespaces    |  Requests this month                            |  Namespaces     |
|  🕸️ Memory Graph  |  ||||||||||||||||||||||||||||||||||||||||||||| |  sm_default === |
|  🔌 Connectors    |  30D AGO                                   NOW  |  fella       --- |
|  📥 Import        +--------------------------------+----------------+-----------------+
|                   |  Recent memories               |  Latest searches                 |
|  DEVELOPER        |  📄 Personal Memory Assistant  |  🔍 activation memory...  144 MS |
|  🔑 API Keys      |                                |  🔍 recent active work... 146 MS |
|  🤖 Agents & MCP  +--------------------------------+----------------------------------+
|  📡 Requests      |                                                                   |
|  📊 User Insights |                                                               💬  |
+-------------------+-------------------------------------------------------------------+
```

---

## 3. The Overview Dashboard

The Overview page (`/overview`) provides a real-time pulse of your application's product actions and search activity:

### 1. Dynamic Greeting & Timeline Pills
- Greets the logged-in user dynamically based on local time (`Good morning`, `Good afternoon`, `Good evening`).
- Interactive time-range selector: `1d`, `7d`, `30d`, and `All`.

### 2. Five Core Metric Cards
- **DOCUMENTS**: Count of ingested documentation files and indexed guides.
- **MEMORIES**: Active customer memory context entries generated from user milestones.
- **SEARCH REQUESTS**: Total semantic and keyword queries processed.
- **NAMESPACES**: Active tenant or project partitions.
- **CONNECTORS**: Third-party integrations configured (GitHub, Slack, Google Drive).

### 3. Monthly Request Bar Chart
- Displays daily event volume across a 30-day timeline.
- Color-coded legend: `MEMORIES`, `SEARCHES`, and `LIVE`.
- Highlights peak activity days with light-blue accents.

### 4. Namespaces Progress
- Visual progress bars showing relative distribution of memories across your workspaces (`sm_project_default`, `fella`).

### 5. Latest Searches & Latency Badges
- Live feed of queries run against your memory graph with millisecond latency tags (`144 MS`, `146 MS`, `221 MS`).

---

## 4. Namespaces & Data Management

Organize telemetry and context by tenant, environment, or microservice:

- **Namespaces (`/namespaces`)**: Partition event streams between staging, production, or customer tenants.
- **Memory Graph (`/graph`)**: Visualize relational links between user sessions, actions, and activation milestones.
- **Connectors (`/connectors`)**: Link external providers like GitHub OAuth, Slack webhooks, and Google Drive.
- **Import (`/import`)**: Ingest historical log files, CSVs, or OpenAPI specs into your memory pool.

---

## 5. Requests & Event Inspector

Inspect the raw stream of events arriving from your client apps:

- Access via **DEVELOPER > Requests** (`/events`).
- Lists the most recent 500 events in real time.
- Click any event row to expand its metadata payload, verified timestamp, session ID, and sanitized attributes.
- Filter by event name (`trial_started`, `integration_connected`, etc.) or user ID.

---

## 6. Customer Memory, Timelines & Breakpoint Diagnosis

Traditional product analytics tools tell you *how many* users did something. **DealMemory sits between product analytics and customer memory**: it shows *what a specific user did* and *what context your team should remember*.

- Access via `/journeys` and `/journeys/[userId]`.
- **Chronological Action Sequences**:
  - Reconstructs every user's progression as a visual timeline (e.g. `User signed up` → `Opened dashboard` → `Created project` → `Attempted integration connection` → `Stopped`).
- **Last Recorded Action**:
  - Highlights the exact last action the user performed with relative timestamp (`14m ago`, `2h ago`) so founders never need to dig through raw logs.
- **Where Onboarding Broke**:
  - Pinpoints where the user stalled (e.g. `Integration connection failed: OAuth authorization error`, `Created project but stopped before connecting integration`, or `First value not reached`).
- **Context the Team Should Remember (Customer Memory Capsule)**:
  - Synthesizes the user's stated goal/intent, discovered tech stack, known friction points, and team action items.
  - **Founder Notes**: Editable team memory notes persisted directly to PostgreSQL.

---

## 7. API Keys & Developer Tools

- Access via **DEVELOPER > API Keys** (`/settings`).
- Generate new public project keys (`pk_live_...`).
- Copy zero-dependency client integration snippets in JavaScript, Python, or cURL.
- Configure `SDK_CORS_ORIGINS` for cross-origin browser streaming.
- Manage billing subscriptions and Dodo Payments customer portal.
