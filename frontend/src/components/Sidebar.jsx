import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Kanban,
  ListFilter,
  Zap,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ openNewTicketModal }) {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    projects,
    currentProject,
    setCurrentProject,
  } = useAuth()

  return (
    <aside className="w-56 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-13 px-3.5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
            <span className="font-mono font-bold text-xs text-zinc-200">T</span>
          </div>
          <span className="font-bold text-sm text-zinc-100 tracking-tight">
            Trackr
          </span>
        </div>
        <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
          v1.0
        </span>
      </div>

      {/* Workspace & Project Selector */}
      <div className="p-2.5 border-b border-zinc-800/60 space-y-1.5">
        <div className="relative">
          <select
            value={currentWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value)
              if (ws) setCurrentWorkspace(ws)
            }}
            className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:border-zinc-700 transition cursor-pointer"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {projects.length > 0 && (
          <div className="relative">
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const p = projects.find((proj) => proj.id === e.target.value)
                if (p) setCurrentProject(p)
              }}
              className="w-full appearance-none bg-zinc-900/60 border border-zinc-800/60 rounded-md px-2.5 py-1 text-[11px] text-zinc-400 focus:outline-none focus:border-zinc-700 transition cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-2.5">
        <button
          onClick={openNewTicketModal}
          className="w-full py-1.5 px-3 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Issue</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-2 py-1 space-y-4 overflow-y-auto">
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace
          </p>
          <nav className="space-y-0.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`
              }
            >
              <Kanban className="w-3.5 h-3.5 text-zinc-400" />
              <span>Board</span>
            </NavLink>

            <NavLink
              to="/list"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`
              }
            >
              <ListFilter className="w-3.5 h-3.5 text-zinc-400" />
              <span>List</span>
            </NavLink>

            <NavLink
              to="/sprints"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`
              }
            >
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sprints & Risk</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </aside>
  )
}
