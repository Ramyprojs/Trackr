import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import TicketCard from './TicketCard'

const COLUMNS = [
  { id: 'todo', title: 'To Do', accent: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', accent: 'bg-blue-500' },
  { id: 'in_review', title: 'In Review', accent: 'bg-purple-500' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-500' },
]

export default function KanbanBoard({ tickets, onTicketClick, onStatusChange, openNewTicketModal }) {
  const getTicketsByStatus = (status) => tickets.filter((t) => t.status === status)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full items-start overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTickets = getTicketsByStatus(col.id)
        const totalPoints = colTickets.reduce((acc, t) => acc + (t.estimate || 1), 0)

        return (
          <div
            key={col.id}
            className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col max-h-full backdrop-blur-md min-w-[260px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.accent}`} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  {col.title}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 rounded-full">
                  {colTickets.length}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {totalPoints} pts
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 min-h-[150px]">
              <AnimatePresence>
                {colTickets.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onClick={onTicketClick}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </AnimatePresence>

              {colTickets.length === 0 && (
                <div className="h-28 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-slate-600 text-xs font-medium italic">
                  Empty column
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            {col.id === 'todo' && (
              <button
                onClick={openNewTicketModal}
                className="mt-3 w-full py-2 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ticket</span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
