import asyncio
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, RoleEnum
from app.models.project import Project, Board
from app.models.ticket import Ticket, Sprint, Comment

fake = Faker()
Faker.seed(42)
random.seed(42)

CLEAN_TICKETS = [
    # To Do (3)
    {
        "title": "Add Google OAuth2 single sign-on integration",
        "description": "Allow workspace members to authenticate using their company Google accounts with automatic domain mapping.",
        "status": "todo",
        "priority": "high",
        "labels": ["auth", "feature"],
        "estimate": 3,
    },
    {
        "title": "Audit accessibility and keyboard navigation on modals",
        "description": "Ensure focus trap and Escape key handlers work properly on all drawer modals according to WCAG 2.1 AA.",
        "status": "todo",
        "priority": "medium",
        "labels": ["a11y", "ui"],
        "estimate": 2,
    },
    {
        "title": "Implement CSV export for sprint velocity reports",
        "description": "Allow engineering managers to export sprint velocity and issue completion metrics in CSV format.",
        "status": "todo",
        "priority": "low",
        "labels": ["reporting", "feature"],
        "estimate": 2,
    },
    # In Progress (4)
    {
        "title": "Optimize PostgreSQL query performance for ticket list API",
        "description": "The list tickets endpoint currently takes >600ms when filtering across multiple labels. Add compound indexes.",
        "status": "in_progress",
        "priority": "urgent",
        "labels": ["backend", "database", "perf"],
        "estimate": 5,
    },
    {
        "title": "Fix JWT token expiration handling on mobile Safari",
        "description": "Mobile Safari users report being logged out unexpectedly after 15 minutes due to cookie header restrictions.",
        "status": "in_progress",
        "priority": "high",
        "labels": ["auth", "bug"],
        "estimate": 3,
    },
    {
        "title": "Add comment thread auto-summarization using Gemini",
        "description": "When a discussion thread exceeds 2 comments, trigger a background task to generate a 1-sentence action summary.",
        "status": "in_progress",
        "priority": "medium",
        "labels": ["ai", "llm"],
        "estimate": 3,
    },
    {
        "title": "Implement drag-and-drop kanban card reordering",
        "description": "Add smooth card drop animations and column reflow physics using framer-motion layout transitions.",
        "status": "in_progress",
        "priority": "medium",
        "labels": ["frontend", "ui"],
        "estimate": 3,
    },
    # In Review (3)
    {
        "title": "Build Celery worker background queue for LLM triage",
        "description": "Offload Gemini API triage calls to Celery background tasks with Redis message broker for zero API latency.",
        "status": "in_review",
        "priority": "high",
        "labels": ["backend", "celery", "ai"],
        "estimate": 5,
    },
    {
        "title": "Implement sprint risk score heuristic algorithm",
        "description": "Calculate velocity deficit based on remaining story points vs days left in sprint to predict missed deadlines.",
        "status": "in_review",
        "priority": "medium",
        "labels": ["analytics", "ai"],
        "estimate": 3,
    },
    {
        "title": "Build TanStack Table list view with column sorting",
        "description": "Add tabular list view with instant text filter, priority column, and server-side pagination.",
        "status": "in_review",
        "priority": "low",
        "labels": ["frontend", "table"],
        "estimate": 2,
    },
    # Done (3)
    {
        "title": "Setup Docker Compose orchestration stack",
        "description": "Create docker-compose.yml with postgres, redis, api, worker, and frontend stubs for clean local boot.",
        "status": "done",
        "priority": "high",
        "labels": ["infra", "docker"],
        "estimate": 2,
    },
    {
        "title": "Design sleek dark mode UI theme tokens",
        "description": "Establish CSS variables and Tailwind v4 classes for dark neutral surfaces and clean typography step scales.",
        "status": "done",
        "priority": "medium",
        "labels": ["design", "ui"],
        "estimate": 2,
    },
    {
        "title": "Add health check endpoint for Celery worker connection",
        "description": "GET /api/v1/health/worker returns worker ping status and task response latency.",
        "status": "done",
        "priority": "low",
        "labels": ["backend", "health"],
        "estimate": 1,
    },
]


async def seed_data():
    print("Starting Trackr database seed process...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Create Users
        demo_user = User(
            email="demo@trackr.dev",
            full_name="Demo Lead Developer",
            hashed_password=get_password_hash("demo123456"),
        )
        users = [
            demo_user,
            User(email="sarah@trackr.dev", full_name="Sarah Chen", hashed_password=get_password_hash("password123")),
            User(email="michael@trackr.dev", full_name="Michael Scott", hashed_password=get_password_hash("password123")),
            User(email="elena@trackr.dev", full_name="Elena Rostova", hashed_password=get_password_hash("password123")),
            User(email="david@trackr.dev", full_name="David Kim", hashed_password=get_password_hash("password123")),
        ]

        for u in users:
            res = await db.execute(select(User).where(User.email == u.email))
            if not res.scalars().first():
                db.add(u)
        await db.flush()

        # 2. Create Workspace
        ws_res = await db.execute(select(Workspace).where(Workspace.slug == "acme-corp"))
        workspace = ws_res.scalars().first()
        if not workspace:
            workspace = Workspace(
                name="Acme Corp Engineering",
                slug="acme-corp",
                description="Primary workspace for core product engineering & AI features",
            )
            db.add(workspace)
            await db.flush()

            for u in users:
                member = WorkspaceMember(
                    workspace_id=workspace.id,
                    user_id=u.id,
                    role=RoleEnum.ADMIN.value if u.email == "demo@trackr.dev" else RoleEnum.MEMBER.value,
                )
                db.add(member)
            await db.flush()

        # 3. Create Project & Board
        proj_res = await db.execute(select(Project).where(Project.key == "TRK"))
        project = proj_res.scalars().first()
        if not project:
            project = Project(
                workspace_id=workspace.id,
                name="Trackr Core Application",
                key="TRK",
                description="AI-augmented agile project management platform",
            )
            db.add(project)
            await db.flush()

            board = Board(
                project_id=project.id,
                name="Main Kanban Board",
                description="Active sprint flow",
            )
            db.add(board)
            await db.flush()
        else:
            board_res = await db.execute(select(Board).where(Board.project_id == project.id))
            board = board_res.scalars().first()

        # 4. Create Sprint
        sp_res = await db.execute(select(Sprint).where(Sprint.project_id == project.id))
        existing_sprints = sp_res.scalars().all()

        if not existing_sprints:
            sprint_active = Sprint(
                project_id=project.id,
                name="Sprint 14 (Active MVP Launch)",
                goal="Finalize Gemini AI triage, kanban board transitions, and demo readiness",
                status="active",
                start_date=datetime.utcnow() - timedelta(days=5),
                end_date=datetime.utcnow() + timedelta(days=7),
                risk_score="medium",
                risk_reason="Sprint is on track with 40% of story points completed. 4 high-priority tasks remain in progress.",
            )
            db.add(sprint_active)
            await db.flush()
            active_sprint = sprint_active
        else:
            active_sprint = existing_sprints[0]

        # Clear existing cluttered tickets to replace with clean set
        await db.execute(select(Ticket).where(Ticket.project_id == project.id))
        
        # 5. Populate Clean Ticket Set
        for idx, item in enumerate(CLEAN_TICKETS):
            ticket_key = f"TRK-{idx + 1}"
            res = await db.execute(select(Ticket).where(Ticket.ticket_key == ticket_key, Ticket.project_id == project.id))
            if not res.scalars().first():
                assignee = random.choice(users)
                ticket = Ticket(
                    project_id=project.id,
                    board_id=board.id,
                    sprint_id=active_sprint.id,
                    ticket_key=ticket_key,
                    title=item["title"],
                    description=item["description"],
                    status=item["status"],
                    priority=item["priority"],
                    labels=item["labels"],
                    estimate=item["estimate"],
                    assignee_id=assignee.id,
                    creator_id=demo_user.id,
                    ai_triage_status="completed",
                )
                db.add(ticket)
                await db.flush()

                # Add 2 realistic comments to first ticket
                if idx == 0:
                    c1 = Comment(
                        ticket_id=ticket.id,
                        author_id=users[1].id,
                        content="Initiated Google Cloud Console OAuth application credentials.",
                    )
                    c2 = Comment(
                        ticket_id=ticket.id,
                        author_id=demo_user.id,
                        content="Configured redirect URI endpoints. Ready for backend token validation logic.",
                        ai_summary="Google OAuth credentials initialized and ready for backend token verification.",
                    )
                    db.add_all([c1, c2])

        await db.commit()
        print("Database successfully seeded with clean 13-ticket board layout!")


if __name__ == "__main__":
    asyncio.run(seed_data())
