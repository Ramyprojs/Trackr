import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShieldAlert, Zap, Calendar, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

const RISK_BADGES = {
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', glow: 'shadow-emerald-500/20' },
  medium: { label: 'Medium Risk', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', glow: 'shadow-amber-500/20' },
  high: { label: 'High Risk', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', glow: 'shadow-orange-500/20' },
  critical: { label: 'Critical Risk', color: 'bg-red-500/10 border-red-500/30 text-red-400', glow: 'shadow-red-500/20' },
}

export default function SprintView() {
  const { currentProject } = useAuth()
  const [sprints, setSprints] = useState([])
  const [activeSprint, setActiveSprint] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzingRisk, setAnalyzingRisk] = useState(false)

  useEffect(() => {
    if (currentProject) {
      fetchSprintsAndTickets()
    } else {
      setLoading(false)
    }
  }, [currentProject?.id])

  const fetchSprintsAndTickets = async () => {
    if (!currentProject) return
    setLoading(true)
    try {
      const sprintData = await apiFetch(`/sprints/?project_id=${currentProject.id}`)
      setSprints(sprintData)

      let current = sprintData.find((s) => s.status === 'active') || sprintData[0]
      if (!current && sprintData.length === 0) {
        // Create initial sprint if none exists
        current = await apiFetch('/sprints/', {
          method: 'POST',
          body: JSON.stringify({
            project_id: currentProject.id,
            name: 'Sprint 1',
            goal: 'Complete core features and launch MVP',
          }),
        })
        setSprints([current])
      }

      setActiveSprint(current)

      if (current) {
        const ticketData = await apiFetch(`/tickets/?project_id=${currentProject.id}`)
        setTickets(ticketData)
      }
    } catch (e) {
      console.error('Failed to fetch sprint details:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRunRiskAnalysis = async () => {
    if (!activeSprint) return
    setAnalyzingRisk(true)
    try {
      const res = await apiFetch(`/ai/sprint-risk/${activeSprint.id}`, { method: 'POST' })
      setActiveSprint((prev) => ({
        ...prev,
        risk_score: res.risk.risk_score,
        risk_reason: res.risk.risk_reason,
      }))
    } catch (e) {
      console.error('Failed to analyze risk:', e)
    } finally {
      setAnalyzingRisk(false)
    }
  }

  const totalPoints = tickets.reduce((sum, t) => sum + (t.estimate || 1), 0)
  const donePoints = tickets.filter((t) => t.status === 'done').reduce((sum, t) => sum + (t.estimate || 1), 0)
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0

  const riskInfo = RISK_BADGES[activeSprint?.risk_score || 'low']

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Sprint Velocity & AI Risk Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time sprint progress monitoring and Gemini LLM risk prediction</p>
        </div>

        <button
          onClick={handleRunRiskAnalysis}
          disabled={analyzingRisk || !activeSprint}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${analyzingRisk ? 'animate-spin' : ''}`} />
          <span>{analyzingRisk ? 'Analyzing Risk...' : 'Run AI Risk Analysis'}</span>
        </button>
      </div>

      {/* Main Active Sprint Card */}
      {activeSprint && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Active Sprint
                </span>
                <h2 className="text-lg font-bold text-slate-100">{activeSprint.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{activeSprint.goal || 'No goal set'}</p>
              </div>

              {/* AI Risk Score Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-lg ${riskInfo.color} ${riskInfo.glow}`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{riskInfo.label}</span>
              </motion.div>
            </div>

            {/* Velocity Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Sprint Completion</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {donePoints} / {totalPoints} story points ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Risk Assessment Explanation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {activeSprint.risk_reason ||
                  'Sprint risk analysis has not been triggered yet. Click "Run AI Risk Analysis" above.'}
              </p>
            </div>
          </div>

          {/* Metrics Summary Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sprint Metrics Summary
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Scope</span>
                <span className="font-mono font-bold text-slate-200">{tickets.length} tickets</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Completed Tickets</span>
                <span className="font-mono font-bold text-emerald-400">
                  {tickets.filter((t) => t.status === 'done').length}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Remaining Tickets</span>
                <span className="font-mono font-bold text-amber-400">
                  {tickets.filter((t) => t.status !== 'done').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
