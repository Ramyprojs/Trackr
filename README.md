# Trackr — AI-Powered Project Management Tool

Trackr is an AI-augmented project management tool (Linear/Jira-style clone) featuring automated ticket triage, comment thread summarization, and LLM/heuristic sprint risk prediction.

## Tech Stack
- **Backend:** FastAPI, Async SQLAlchemy, Alembic, Pydantic v2
- **Database:** PostgreSQL 16
- **Queue/Cache:** Redis + Celery
- **AI Service:** Google Gemini API
- **Frontend:** React, Vite, Tailwind CSS v4, TanStack Table
- **Infrastructure:** Docker Compose

## Features Implemented
- [x] **Phase 0:** Project scaffolding and docker-compose setup
- [x] **Phase 1:** Core backend architecture, JWT Auth (`/signup`, `/login`, `/me`), Async SQLAlchemy models (User, Workspace, WorkspaceMember, Project, Board), and Workspace/Project CRUD APIs
- [x] **Phase 2:** Ticket, Sprint, and Comment models with full CRUD, filtering, pagination, and Kanban status transitions (todo → in_progress → in_review → done)
- [x] **Phase 3:** Celery worker service connected to Redis broker with job dispatch pattern and worker health check endpoint (`/api/v1/health/worker`)
- [x] **Phase 4:** Gemini-powered ticket auto-triage (suggesting labels, priority & story points), comment thread summarization, and sprint risk prediction with background task execution

## Repository Structure
```
├── backend/        # FastAPI application, database models, AI service & Celery tasks
├── frontend/       # React + Vite + Tailwind CSS v4 UI application
├── infra/          # Infrastructure configurations
├── docs/           # Project documentation and architecture diagrams
├── docker-compose.yml
└── .env.example
```

## Running locally with Docker Compose

1. Clone the repository and copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Start the services:
   ```bash
   docker-compose up --build
   ```

3. Access the endpoints:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **API Health:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - **Worker Health:** [http://localhost:8000/api/v1/health/worker](http://localhost:8000/api/v1/health/worker)
