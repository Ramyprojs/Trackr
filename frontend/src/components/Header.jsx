import React from 'react'
import { Sparkles, LogOut, User, Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ searchFilter, setSearchFilter }) {
  const { user, currentProject, logout } = useAuth()

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter || ''}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search tickets by title, key (TRK-1), or labels..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Project Banner & User Profile */}
      <div className="flex items-center gap-4">
        {currentProject && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              {currentProject.name} ({currentProject.key})
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
