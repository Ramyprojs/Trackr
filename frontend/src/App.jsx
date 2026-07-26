import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 border border-slate-800 rounded-xl p-8 bg-slate-900/60 shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Trackr
        </h1>
        <p className="text-slate-400 text-sm">
          AI-Powered Project Management & Automated Ticket Triage
        </p>
        <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full">
          Frontend Operational
        </div>
      </div>
    </div>
  )
}
