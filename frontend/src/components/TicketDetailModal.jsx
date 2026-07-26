import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Tag,
  MessageSquare,
  Send,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { apiFetch } from '../services/api'

export default function TicketDetailModal({ ticket: initialTicket, onClose, onUpdated }) {
  const [ticket, setTicket] = useState(initialTicket)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [isTriaging, setIsTriaging] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [aiSummary, setAiSummary] = useState('')

  useEffect(() => {
    fetchComments()
  }, [ticket.id])

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const data = await apiFetch(`/tickets/${ticket.id}/comments`)
      setComments(data)
      // Extract latest AI summary if present
      const latestWithSummary = data.slice().reverse().find((c) => c.ai_summary)
      if (latestWithSummary) {
        setAiSummary(latestWithSummary.ai_summary)
      }
    } catch (e) {
      console.error('Failed to load comments:', e)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await apiFetch(`/tickets/${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setTicket(updated)
      if (onUpdated) onUpdated(updated)
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const handleRunTriage = async () => {
    setIsTriaging(true)
    try {
      const res = await apiFetch(`/ai/triage/${ticket.id}`, { method: 'POST' })
      const updated = await apiFetch(`/tickets/${ticket.id}`)
      setTicket(updated)
      if (onUpdated) onUpdated(updated)
    } catch (e) {
      console.error('Failed to run triage:', e)
    } finally {
      setIsTriaging(false)
    }
  }

  const handleSummarize = async () => {
    setIsSummarizing(true)
    try {
      const res = await apiFetch(`/ai/summarize/${ticket.id}`, { method: 'POST' })
      setAiSummary(res.summary)
    } catch (e) {
      console.error('Failed to summarize:', e)
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await apiFetch(`/tickets/${ticket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      })
      setNewComment('')
      await fetchComments()
    } catch (e) {
      console.error('Failed to add comment:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold text-xs rounded-lg">
              {ticket.ticket_key}
            </span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTriage}
              disabled={isTriaging}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTriaging ? 'animate-spin' : ''}`} />
              <span>{isTriaging ? 'Triaging...' : 'Re-run AI Triage'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h1 className="text-xl font-bold text-slate-100 mb-2 leading-tight">
              {ticket.title}
            </h1>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          {/* AI Triaged Metadata Chips */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Triage Classification
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {ticket.estimate} Story Points
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400 mr-1">Priority:</span>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {ticket.priority}
              </span>

              <span className="text-xs text-slate-400 ml-3 mr-1">Labels:</span>
              {ticket.labels && ticket.labels.length > 0 ? (
                ticket.labels.map((l, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-slate-800 text-slate-200 text-xs rounded-full border border-slate-700 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-indigo-400" />
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No labels</span>
              )}
            </div>
          </div>

          {/* AI Thread Summary */}
          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1.5 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Discussion Summary</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">{aiSummary}</p>
            </motion.div>
          )}

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Activity & Discussion ({comments.length})
              </h3>
              {comments.length >= 2 && (
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSummarizing ? 'Summarizing...' : 'Summarize Thread'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-slate-200">
                      {c.author?.full_name || 'Member'}
                    </span>
                    <span className="text-[10px]">
                      {new Date(c.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or update..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
