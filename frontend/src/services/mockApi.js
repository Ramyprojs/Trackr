// Client-Side Standalone Storage for Vercel Static Deployments & Instant User Demos

const STORAGE_KEYS = {
  USER: 'trackr_demo_user_info',
  TICKETS: 'trackr_demo_tickets',
  SPRINTS: 'trackr_demo_sprints',
  COMMENTS: 'trackr_demo_comments',
  CONFIG: 'trackr_demo_ai_config',
}

const DEFAULT_INITIAL_TICKETS = [
  {
    id: 't-1',
    ticket_key: 'TRK-1',
    title: 'Add Google OAuth2 single sign-on integration',
    description: 'Allow workspace members to authenticate using their company Google accounts with automatic domain mapping.',
    status: 'todo',
    priority: 'high',
    labels: ['auth', 'feature'],
    estimate: 3,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Sarah Chen' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    ticket_key: 'TRK-2',
    title: 'Audit accessibility and keyboard navigation on modals',
    description: 'Ensure focus trap and Escape key handlers work properly on all drawer modals according to WCAG 2.1 AA.',
    status: 'todo',
    priority: 'medium',
    labels: ['a11y', 'ui'],
    estimate: 2,
    ai_triage_status: 'completed',
    assignee: { full_name: 'David Kim' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    ticket_key: 'TRK-3',
    title: 'Implement CSV export for sprint velocity reports',
    description: 'Allow engineering managers to export sprint velocity and issue completion metrics in CSV format.',
    status: 'todo',
    priority: 'low',
    labels: ['reporting', 'feature'],
    estimate: 2,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Elena Rostova' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    ticket_key: 'TRK-4',
    title: 'Optimize PostgreSQL query performance for ticket list API',
    description: 'The list tickets endpoint currently takes >600ms when filtering across multiple labels. Add compound indexes.',
    status: 'in_progress',
    priority: 'urgent',
    labels: ['backend', 'database', 'perf'],
    estimate: 5,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Demo Lead Developer' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-5',
    ticket_key: 'TRK-5',
    title: 'Fix JWT token expiration handling on mobile Safari',
    description: 'Mobile Safari users report being logged out unexpectedly after 15 minutes due to cookie header restrictions.',
    status: 'in_progress',
    priority: 'high',
    labels: ['auth', 'bug'],
    estimate: 3,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Sarah Chen' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-6',
    ticket_key: 'TRK-6',
    title: 'Add comment thread auto-summarization using Gemini',
    description: 'When a discussion thread exceeds 2 comments, trigger a background task to generate a 1-sentence action summary.',
    status: 'in_progress',
    priority: 'medium',
    labels: ['ai', 'llm'],
    estimate: 3,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Michael Scott' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-7',
    ticket_key: 'TRK-7',
    title: 'Implement drag-and-drop kanban card reordering',
    description: 'Add smooth card drop animations and column reflow physics using framer-motion layout transitions.',
    status: 'in_progress',
    priority: 'medium',
    labels: ['frontend', 'ui'],
    estimate: 3,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Elena Rostova' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-8',
    ticket_key: 'TRK-8',
    title: 'Build Celery worker background queue for LLM triage',
    description: 'Offload Gemini API triage calls to Celery background tasks with Redis message broker for zero API latency.',
    status: 'in_review',
    priority: 'high',
    labels: ['backend', 'celery', 'ai'],
    estimate: 5,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Demo Lead Developer' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-9',
    ticket_key: 'TRK-9',
    title: 'Implement sprint risk score heuristic algorithm',
    description: 'Calculate velocity deficit based on remaining story points vs days left in sprint to predict missed deadlines.',
    status: 'in_review',
    priority: 'medium',
    labels: ['analytics', 'ai'],
    estimate: 3,
    ai_triage_status: 'completed',
    assignee: { full_name: 'David Kim' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-10',
    ticket_key: 'TRK-10',
    title: 'Build TanStack Table list view with column sorting',
    description: 'Add tabular list view with instant text filter, priority column, and server-side pagination.',
    status: 'in_review',
    priority: 'low',
    labels: ['frontend', 'table'],
    estimate: 2,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Sarah Chen' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-11',
    ticket_key: 'TRK-11',
    title: 'Setup Docker Compose orchestration stack',
    description: 'Create docker-compose.yml with postgres, redis, api, worker, and frontend stubs for clean local boot.',
    status: 'done',
    priority: 'high',
    labels: ['infra', 'docker'],
    estimate: 2,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Demo Lead Developer' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-12',
    ticket_key: 'TRK-12',
    title: 'Design sleek dark mode UI theme tokens',
    description: 'Establish CSS variables and Tailwind v4 classes for dark neutral surfaces and clean typography step scales.',
    status: 'done',
    priority: 'medium',
    labels: ['design', 'ui'],
    estimate: 2,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Elena Rostova' },
    created_at: new Date().toISOString(),
  },
  {
    id: 't-13',
    ticket_key: 'TRK-13',
    title: 'Add health check endpoint for Celery worker connection',
    description: 'GET /api/v1/health/worker returns worker ping status and task response latency.',
    status: 'done',
    priority: 'low',
    labels: ['backend', 'health'],
    estimate: 1,
    ai_triage_status: 'completed',
    assignee: { full_name: 'Michael Scott' },
    created_at: new Date().toISOString(),
  },
]

function getStored(key, defaultValue) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export function handleMockApi(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : {}

  // 1. Auth endpoints
  if (endpoint.startsWith('/auth/me')) {
    let user = getStored(STORAGE_KEYS.USER, null)
    if (!user) {
      user = {
        id: 'demo-user-1',
        email: 'demo@trackr.dev',
        full_name: 'Demo User',
      }
      setStored(STORAGE_KEYS.USER, user)
    }
    return user
  }

  if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/signup') || endpoint.startsWith('/auth/seed')) {
    let email = body.email || `demo-${Math.floor(Math.random() * 8999 + 1000)}@trackr.dev`
    let fullName = body.full_name || 'Demo Lead Developer'
    const user = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
    }
    setStored(STORAGE_KEYS.USER, user)
    // Initialize default tickets if empty
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      setStored(STORAGE_KEYS.TICKETS, DEFAULT_INITIAL_TICKETS)
    }
    return {
      access_token: `mock-jwt-token-${Date.now()}`,
      user,
    }
  }

  // 2. Workspaces
  if (endpoint.startsWith('/workspaces')) {
    const user = getStored(STORAGE_KEYS.USER, { full_name: 'Demo User' })
    return [
      {
        id: 'ws-demo-1',
        name: `${user.full_name}'s Workspace`,
        slug: 'demo-workspace',
        description: 'Interactive demo workspace',
      },
    ]
  }

  // 3. Projects
  if (endpoint.startsWith('/projects')) {
    return [
      {
        id: 'proj-demo-1',
        name: 'Trackr Core Application',
        key: 'TRK',
        description: 'AI-augmented agile project management platform',
      },
    ]
  }

  // 4. Sprints
  if (endpoint.startsWith('/sprints')) {
    let sprints = getStored(STORAGE_KEYS.SPRINTS, [
      {
        id: 'sprint-demo-1',
        name: 'Sprint 14 (Active MVP Launch)',
        goal: 'Finalize Gemini AI triage, kanban board transitions, and demo readiness',
        status: 'active',
        risk_score: 'medium',
        risk_reason: 'Sprint is on track with 40% of story points completed. 4 high-priority tasks remain in progress.',
      },
    ])

    if (method === 'POST' && endpoint.includes('/ai/sprint-risk')) {
      const updatedSprints = sprints.map((s) => ({
        ...s,
        risk_score: 'low',
        risk_reason: 'AI Analysis: Velocity is balanced across To Do and In Progress tasks. Sprint is on schedule for delivery.',
      }))
      setStored(STORAGE_KEYS.SPRINTS, updatedSprints)
      return {
        risk: {
          risk_score: 'low',
          risk_reason: 'AI Analysis: Velocity is balanced across To Do and In Progress tasks. Sprint is on schedule for delivery.',
        },
      }
    }

    return sprints
  }

  // 5. Tickets
  if (endpoint.startsWith('/tickets')) {
    let tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_INITIAL_TICKETS)

    // GET /tickets/
    if (method === 'GET' && (endpoint === '/tickets/' || endpoint.startsWith('/tickets/?'))) {
      return tickets
    }

    // POST /tickets/ (Create Issue)
    if (method === 'POST' && endpoint === '/tickets/') {
      const nextKeyNum = tickets.length + 1
      const newTicket = {
        id: `t-${Date.now()}`,
        ticket_key: `TRK-${nextKeyNum}`,
        title: body.title || 'New Issue',
        description: body.description || '',
        status: 'todo',
        priority: body.priority || 'medium',
        labels: ['triage-auto', 'frontend'],
        estimate: parseInt(body.estimate || 2, 10),
        ai_triage_status: 'completed',
        assignee: { full_name: 'Demo User' },
        created_at: new Date().toISOString(),
      }
      tickets = [newTicket, ...tickets]
      setStored(STORAGE_KEYS.TICKETS, tickets)
      return newTicket
    }

    // PATCH /tickets/:id (Update Issue)
    if (method === 'PATCH') {
      const ticketId = endpoint.split('/')[2]
      tickets = tickets.map((t) => (t.id === ticketId ? { ...t, ...body } : t))
      setStored(STORAGE_KEYS.TICKETS, tickets)
      return tickets.find((t) => t.id === ticketId) || tickets[0]
    }

    // GET /tickets/:id/comments
    if (endpoint.includes('/comments')) {
      const ticketId = endpoint.split('/')[2]
      let allComments = getStored(STORAGE_KEYS.COMMENTS, {})
      const ticketComments = allComments[ticketId] || [
        {
          id: 'c-1',
          author: { full_name: 'Sarah Chen' },
          content: 'Working on initial feature implementation and unit test coverage.',
          created_at: new Date().toISOString(),
        },
        {
          id: 'c-2',
          author: { full_name: 'Demo User' },
          content: 'Reviewed code changes. LGTM! Let\'s verify on staging environment.',
          ai_summary: 'PR reviewed and approved for staging verification.',
          created_at: new Date().toISOString(),
        },
      ]

      if (method === 'POST') {
        const newC = {
          id: `c-${Date.now()}`,
          author: { full_name: 'Demo User' },
          content: body.content || '',
          created_at: new Date().toISOString(),
        }
        allComments[ticketId] = [...ticketComments, newC]
        setStored(STORAGE_KEYS.COMMENTS, allComments)
        return newC
      }

      return ticketComments
    }
  }

  // 6. AI Endpoints
  if (endpoint.startsWith('/ai/triage/')) {
    return {
      triage: {
        labels: ['ai-triaged', 'feature'],
        priority: 'high',
        estimate: 3,
      },
    }
  }

  if (endpoint.startsWith('/ai/summarize/')) {
    return {
      summary: 'Discussion thread summary: Implementation details verified and approved for staging release.',
    }
  }

  if (endpoint.startsWith('/ai/sprint-risk/')) {
    return {
      risk: {
        risk_score: 'low',
        risk_reason: 'AI Analysis: Velocity is balanced across tasks. Sprint is on schedule for delivery.',
      },
    }
  }

  // 7. Settings AI Config
  if (endpoint.startsWith('/settings/ai-config')) {
    let config = getStored(STORAGE_KEYS.CONFIG, {
      has_api_key: false,
      model_name: 'gemini-1.5-flash',
      mode: 'Heuristic Fallback',
    })

    if (method === 'POST') {
      config = {
        has_api_key: true,
        model_name: 'gemini-1.5-flash',
        mode: 'Live Gemini LLM',
      }
      setStored(STORAGE_KEYS.CONFIG, config)
    }

    return config
  }

  return {}
}
