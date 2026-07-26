import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Kanban,
  ListFilter,
  Zap,
  Sparkles,
  ChevronDown,
  Plus,
  FolderKanban,
  Settings,
  ShieldAlert,
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
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen shrink-0 backdrop-blur-xl select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Trackr
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full uppercase tracking-wider">
          AI
        </span>
      </div>

      {/* Workspace & Project Selector */}
      <div className="p-3 border-b border-slate-800/60 space-y-2">
        <div className="relative">
          <select
            value={currentWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value)
              if (ws) setCurrentWorkspace(ws)
            }}
            className="w-full appearance-none bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {projects.length > 0 && (
          <div className="relative">
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const p = projects.find((proj) => proj.id === e.target.value)
                if (p) setCurrentProject(p)
              }}
              className="w-full appearance-none bg-slate-950/40 border border-slate-800/60 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Quick Action */}
      <div className="p-3">
        <button
          onClick={openNewTicketModal}
          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        <div>
          <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Views
          </p>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Kanban className="w-4 h-4 text-indigo-400" />
              <span>Kanban Board</span>
            </NavLink>

            <NavLink
              to="/list"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <ListFilter className="w-4 h-4 text-purple-400" />
              <span>List Table</span>
            </NavLink>

            <NavLink
              to="/sprints"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sprints & Risk</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </aside>
  )
}
