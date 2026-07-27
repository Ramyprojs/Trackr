import React from 'react'
import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'

const PRIORITY_BADGES = {
  urgent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  medium: 'text-zinc-300 bg-zinc-800 border-zinc-700/60',
  low: 'text-zinc-400 bg-zinc-900 border-zinc-800',
}

export default function TicketCard({ ticket, onClick }) {
  const priorityClass = PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.medium

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -1 }}
      onClick={() => onClick(ticket)}
      className="p-3 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg shadow-sm cursor-pointer group transition-colors duration-150"
    >
      {/* Header: Key & Priority */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
          {ticket.ticket_key}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded border ${priorityClass}`}
        >
          {ticket.priority}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs font-medium text-zinc-100 line-clamp-2 mb-2 leading-snug">
        {ticket.title}
      </h3>

      {/* Labels */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {ticket.labels.map((label, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] rounded flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-zinc-500" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-zinc-500 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="px-1 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded font-mono font-medium text-[10px]">
            {ticket.estimate} pts
          </span>
          {ticket.ai_triage_status === 'completed' && (
            <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Triaged
            </span>
          )}
        </div>

        <div>
          {ticket.assignee ? (
            <div
              className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[9px] flex items-center justify-center"
              title={ticket.assignee.full_name}
            >
              {ticket.assignee.full_name.charAt(0)}
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-zinc-950 text-zinc-600 text-[9px] flex items-center justify-center border border-zinc-800">
              ?
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
