import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShieldAlert, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

const RISK_BADGES = {
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
  medium: { label: 'Medium Risk', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  high: { label: 'High Risk', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
  critical: { label: 'Critical Risk', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
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
        current = await apiFetch('/sprints/', {
          method: 'POST',
          body: JSON.stringify({
            project_id: currentProject.id,
            name: 'Sprint 1',
            goal: 'Complete core MVP features',
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
    <div className="h-full flex flex-col space-y-5 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-zinc-400" />
            <span>Sprint Velocity & AI Risk Analytics</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time sprint progress monitoring and Gemini LLM risk prediction</p>
        </div>

        <button
          onClick={handleRunRiskAnalysis}
          disabled={analyzingRisk || !activeSprint}
          className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${analyzingRisk ? 'animate-spin' : ''}`} />
          <span>{analyzingRisk ? 'Analyzing...' : 'Run Risk Analysis'}</span>
        </button>
      </div>

      {/* Active Sprint Section */}
      {activeSprint && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Progress Card */}
          <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Active Sprint
                </span>
                <h2 className="text-base font-bold text-zinc-100">{activeSprint.name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{activeSprint.goal || 'No goal set'}</p>
              </div>

              {/* AI Risk Score Badge */}
              <div
                className={`px-2.5 py-1 rounded-md border font-semibold text-xs flex items-center gap-1.5 ${riskInfo.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dot}`} />
                <span>{riskInfo.label}</span>
              </div>
            </div>

            {/* Velocity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">Sprint Progress</span>
                <span className="font-mono text-zinc-400">
                  {donePoints} / {totalPoints} pts ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-zinc-200 rounded-full"
                />
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI Risk Assessment Explanation</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                {activeSprint.risk_reason ||
                  'Sprint risk analysis has not been triggered yet. Click "Run Risk Analysis" above.'}
              </p>
            </div>
          </div>

          {/* Metrics Summary Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3.5 flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Sprint Summary
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center text-xs">
                <span className="text-zinc-400">Total Scope</span>
                <span className="font-mono font-bold text-zinc-200">{tickets.length} issues</span>
              </div>
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center text-xs">
                <span className="text-zinc-400">Completed Issues</span>
                <span className="font-mono font-bold text-emerald-400">
                  {tickets.filter((t) => t.status === 'done').length}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center text-xs">
                <span className="text-zinc-400">Remaining Issues</span>
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
