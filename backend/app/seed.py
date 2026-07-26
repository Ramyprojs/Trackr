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
from app.ai.service import ai_service

fake = Faker()
Faker.seed(42)
random.seed(42)

TITLES_AND_DESCS = [
    ("Fix JWT token expiration on mobile safari", "Users report being logged out unexpectedly after 15 minutes of inactivity on Safari iOS."),
    ("Optimize PostgreSQL query performance for ticket list API", "The list tickets endpoint is taking >800ms when filtering by multiple labels."),
    ("Implement drag-and-drop kanban card reordering", "Add smooth card drop animations and column reflow physics using framer-motion."),
    ("Add Google OAuth2 single sign-on integration", "Allow workspace members to authenticate using their company Google accounts."),
    ("Build Celery worker background queue for LLM triage", "Offload Gemini API triage calls to Celery background task with Redis broker."),
    ("Design sleek dark mode UI theme tokens", "Establish CSS variables for dark surface layers, indigo glow accents, and typography scale."),
    ("Add comment thread auto-summarization using Gemini", "When a ticket thread exceeds 3 comments, generate a 1-sentence action summary."),
    ("Setup Docker Compose orchestration stack", "Create docker-compose.yml with postgres, redis, api, worker, and frontend stubs."),
    ("Implement sprint risk score heuristic algorithm", "Calculate velocity deficit based on remaining story points vs days left in sprint."),
    ("Build TanStack Table list view with column sorting", "Add table list view with instant text filter, priority column, and pagination."),
    ("Fix CORS headers for local frontend dev server", "Allow origins localhost:3000 and localhost:5173 on FastAPI middleware."),
    ("Add story point estimate badge to ticket cards", "Display point estimate chips on kanban cards with font-mono styling."),
    ("Create workspace member role permission guards", "Restrict project deletion and workspace settings to admin role users."),
    ("Add toast notification feedback for ticket updates", "Surfaces micro-interactions when status transitions from todo to in_progress."),
    ("Audit accessibility and keyboard navigation on modals", "Ensure trap focus and Escape key handlers work on all drawer modals."),
    ("Refactor database session dependency generator", "Use async_sessionmaker with expire_on_commit=False for AsyncSession."),
    ("Add Faker seed script for demo data population", "Populate 50 realistic tickets across 3 sprints with comments and AI triage."),
    ("Implement Alembic migration scripts for initial database schema", "Generate migrations for user, workspace, project, board, ticket tables."),
    ("Add health check endpoint for Celery worker connection", "GET /api/v1/health/worker returns worker ping status and response latency."),
    ("Optimize React component rendering performance", "Use React.memo and useMemo for ticket status filter calculations."),
]

LABELS_POOL = [["frontend", "bug"], ["backend", "api"], ["auth", "security"], ["database", "perf"], ["ui", "design"], ["ai", "llm"]]
PRIORITIES = ["low", "medium", "high", "urgent"]
STATUSES = ["todo", "in_progress", "in_review", "done"]


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

        # 4. Create Sprints
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
                risk_reason="Sprint is on track with 60% of story points completed. 4 high-priority tasks remain in progress.",
            )
            sprint_upcoming = Sprint(
                project_id=project.id,
                name="Sprint 15 (Analytics & Reporting)",
                goal="Burndown charts, team velocity reports, and export to CSV",
                status="planning",
                start_date=datetime.utcnow() + timedelta(days=8),
                end_date=datetime.utcnow() + timedelta(days=22),
                risk_score="low",
                risk_reason="Sprint in planning phase. Capacity is balanced.",
            )
            db.add_all([sprint_active, sprint_upcoming])
            await db.flush()
            active_sprint = sprint_active
        else:
            active_sprint = existing_sprints[0]

        # 5. Create ~50 Tickets
        t_res = await db.execute(select(Ticket).where(Ticket.project_id == project.id))
        existing_tickets = t_res.scalars().all()

        if len(existing_tickets) < 10:
            for i in range(45):
                title, desc = random.choice(TITLES_AND_DESCS)
                status = random.choices(STATUSES, weights=[30, 35, 15, 20])[0]
                priority = random.choice(PRIORITIES)
                labels = random.choice(LABELS_POOL)
                estimate = random.choice([1, 2, 3, 5, 8])
                assignee = random.choice(users)

                ticket = Ticket(
                    project_id=project.id,
                    board_id=board.id,
                    sprint_id=active_sprint.id,
                    ticket_key=f"TRK-{i+1}",
                    title=f"{title} (#{i+1})",
                    description=desc,
                    status=status,
                    priority=priority,
                    labels=labels,
                    estimate=estimate,
                    assignee_id=assignee.id,
                    creator_id=demo_user.id,
                    ai_triage_status="completed",
                )
                db.add(ticket)
                await db.flush()

                # Add sample comments
                if i % 3 == 0:
                    c1 = Comment(
                        ticket_id=ticket.id,
                        author_id=random.choice(users).id,
                        content="Working on this now. Pushed initial PR to feature branch.",
                    )
                    c2 = Comment(
                        ticket_id=ticket.id,
                        author_id=demo_user.id,
                        content="Reviewed code changes. LGTM! Let's verify on staging environment.",
                        ai_summary="PR reviewed and approved for staging verification.",
                    )
                    db.add_all([c1, c2])

        await db.commit()
        print("Database successfully seeded with demo user, workspace, project, active sprint, and 45+ triaged tickets!")


if __name__ == "__main__":
    asyncio.run(seed_data())
