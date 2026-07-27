import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Sparkles,
  Tag,
  MessageSquare,
  Send,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700/60 font-mono font-medium text-xs text-zinc-300 rounded">
              {ticket.ticket_key}
            </span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs font-medium text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
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
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTriaging ? 'animate-spin' : ''}`} />
              <span>{isTriaging ? 'Triaging...' : 'Re-triage Issue'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title & Description */}
          <div>
            <h1 className="text-lg font-bold text-zinc-100 mb-2 leading-snug">
              {ticket.title}
            </h1>
            <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          {/* AI Triaged Metadata Chips */}
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                AI Triage Classification
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {ticket.estimate} Story Points
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="text-zinc-500">Priority:</span>
              <span className="px-2 py-0.5 text-[11px] font-medium uppercase rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                {ticket.priority}
              </span>

              <span className="text-zinc-500 ml-2">Labels:</span>
              {ticket.labels && ticket.labels.length > 0 ? (
                ticket.labels.map((l, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-[11px] rounded border border-zinc-800 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-zinc-500" />
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500 italic">None</span>
              )}
            </div>
          </div>

          {/* AI Thread Summary */}
          {aiSummary && (
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Discussion Thread Summary</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">{aiSummary}</p>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                Activity ({comments.length})
              </h3>
              {comments.length >= 2 && (
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-semibold text-zinc-200">
                      {c.author?.full_name || 'Member'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(c.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md flex items-center gap-1 transition cursor-pointer"
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
