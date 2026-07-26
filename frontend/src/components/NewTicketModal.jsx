import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Plus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export default function NewTicketModal({ onClose, onCreated }) {
  const { currentProject } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [estimate, setEstimate] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentProject) {
      setError('Please select or create a project first.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const ticket = await apiFetch('/tickets/', {
        method: 'POST',
        body: JSON.stringify({
          project_id: currentProject.id,
          title,
          description,
          priority,
          estimate: parseInt(estimate, 10),
        }),
      })

      // Auto-trigger background AI triage
      try {
        await apiFetch(`/ai/triage/${ticket.id}`, { method: 'POST' })
      } catch (aiErr) {
        console.warn('AI Triage trigger warning:', aiErr)
      }

      if (onCreated) onCreated(ticket)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Create New Ticket</h2>
              <p className="text-xs text-slate-400">AI triage will automatically suggest labels & points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 login flow with Google"
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical context, steps to reproduce, or acceptance criteria..."
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Initial Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Estimate (Points)
              </label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="1">1 pt — T-Shirt S</option>
                <option value="2">2 pts — T-Shirt M</option>
                <option value="3">3 pts — T-Shirt L</option>
                <option value="5">5 pts — T-Shirt XL</option>
                <option value="8">8 pts — Complex Task</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Triage Active</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
