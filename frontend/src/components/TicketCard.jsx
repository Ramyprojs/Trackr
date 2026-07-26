import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Tag } from 'lucide-react'

const PRIORITY_COLORS = {
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
}

export default function TicketCard({ ticket, onClick, onStatusChange }) {
  const priorityClass = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(ticket)}
      className="p-3.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl shadow-md backdrop-blur-sm cursor-pointer group transition-all duration-200"
    >
      {/* Header: Key & Priority */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-indigo-400 transition">
          {ticket.ticket_key}
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${priorityClass}`}
        >
          {ticket.priority}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 mb-2 leading-relaxed">
        {ticket.title}
      </h3>

      {/* Labels / AI Chips */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.labels.map((label, idx) => (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={idx}
              className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium rounded-full flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              {label}
            </motion.span>
          ))}
        </div>
      )}

      {/* Footer: Points, Comments & Assignee */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-500 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono font-semibold text-[10px]">
            {ticket.estimate} pt{ticket.estimate > 1 ? 's' : ''}
          </span>
          {ticket.ai_triage_status === 'completed' && (
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium" title="AI Triaged">
              <Sparkles className="w-3 h-3" />
              Triaged
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {ticket.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-[10px] flex items-center justify-center shadow-inner"
              title={ticket.assignee.full_name}
            >
              {ticket.assignee.full_name.charAt(0)}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center border border-dashed border-slate-700">
              ?
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
