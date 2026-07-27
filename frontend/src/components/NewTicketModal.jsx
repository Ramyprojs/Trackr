import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, AlertCircle } from 'lucide-react'
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
      setError(err.message || 'Failed to create issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-5 relative overflow-hidden text-zinc-100"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 leading-tight">Create Issue</h2>
              <p className="text-[11px] text-zinc-400">AI triage automatically tags priority & points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 authentication flow"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, technical requirements, or reproduction steps..."
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Estimate
              </label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="1">1 point</option>
                <option value="2">2 points</option>
                <option value="3">3 points</option>
                <option value="5">5 points</option>
                <option value="8">8 points</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm transition cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
