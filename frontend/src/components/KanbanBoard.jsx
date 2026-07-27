import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import TicketCard from './TicketCard'

const COLUMNS = [
  { id: 'todo', title: 'To Do', accent: 'bg-zinc-500' },
  { id: 'in_progress', title: 'In Progress', accent: 'bg-blue-500' },
  { id: 'in_review', title: 'In Review', accent: 'bg-amber-500' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-500' },
]

export default function KanbanBoard({ tickets, onTicketClick, onStatusChange, openNewTicketModal }) {
  const getTicketsByStatus = (status) => tickets.filter((t) => t.status === status)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 h-full items-start overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTickets = getTicketsByStatus(col.id)
        const totalPoints = colTickets.reduce((acc, t) => acc + (t.estimate || 1), 0)

        return (
          <div
            key={col.id}
            className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex flex-col max-h-full min-w-[250px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                <h3 className="font-semibold text-xs text-zinc-200">
                  {col.title}
                </h3>
                <span className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded">
                  {colTickets.length}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {totalPoints} pts
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 min-h-[140px]">
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
                <div className="h-24 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-xs font-medium italic">
                  No issues
                </div>
              )}
            </div>

            {/* Add Issue Button */}
            {col.id === 'todo' && (
              <button
                onClick={openNewTicketModal}
                className="mt-2.5 w-full py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add issue</span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
