import React from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Kanban,
  ListFilter,
  Zap,
  ChevronDown,
  Plus,
  Github,
  Linkedin,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ openNewTicketModal }) {
  const location = useLocation()
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    projects,
    currentProject,
    setCurrentProject,
  } = useAuth()

  const navItems = [
    { path: '/', label: 'Board', icon: Kanban, end: true },
    { path: '/list', label: 'List', icon: ListFilter, end: false },
    { path: '/sprints', label: 'Sprints & Risk', icon: Zap, end: false },
  ]

  return (
    <aside className="w-56 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-screen shrink-0 select-none justify-between">
      <div>
        {/* Brand Header — Animated Clickable Logo pointing to Home */}
        <div className="h-14 px-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <Link to="/" title="Home">
            <motion.img
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              src="/logo.png"
              alt="Home"
              className="h-8 w-auto object-contain cursor-pointer drop-shadow-sm"
            />
          </Link>
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

        {/* Navigation Links with Active Motion Pill */}
        <div className="px-2 py-1 space-y-4">
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Workspace
            </p>
            <nav className="space-y-0.5 relative">
              {navItems.map((item) => {
                const isActive = item.end
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors z-10 ${
                      isActive
                        ? 'text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-zinc-800/90 border border-zinc-700/60 rounded-md -z-10"
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar Footer — Developer Hyperlinks */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 space-y-2">
        <div className="text-[11px] font-medium text-zinc-400 leading-tight">
          Developed by <span className="text-zinc-200 font-semibold">Ramy Abdelamalak</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a
            href="https://github.com/Ramyprojs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="text-[11px]">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ramyabdelamalak/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-sky-400 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">LinkedIn</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
