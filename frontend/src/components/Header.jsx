import React from 'react'
import { LogOut, Search, Github, Linkedin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ searchFilter, setSearchFilter }) {
  const { user, currentProject, logout } = useAuth()

  return (
    <header className="h-13 border-b border-zinc-800/80 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter || ''}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search issues (e.g. TRK-1)..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Project Banner, Author Links & User Profile */}
      <div className="flex items-center gap-3">
        {currentProject && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              {currentProject.key}
            </span>
          </div>
        )}

        {/* Hyperlinks */}
        <div className="hidden md:flex items-center gap-2 border-l border-zinc-800/80 pl-3">
          <a
            href="https://github.com/Ramyprojs"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded transition cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.linkedin.com/in/ramyabdelamalak/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            className="p-1 text-zinc-400 hover:text-sky-400 hover:bg-zinc-900 rounded transition cursor-pointer"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-[10px] flex items-center justify-center">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-zinc-300">
              {user?.full_name || 'User'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
