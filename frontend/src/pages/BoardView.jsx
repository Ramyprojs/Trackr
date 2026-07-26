import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'
import KanbanBoard from '../components/KanbanBoard'
import TicketDetailModal from '../components/TicketDetailModal'
import { Sparkles, RefreshCw } from 'lucide-react'

export default function BoardView() {
  const { searchFilter, openNewTicketModal } = useOutletContext()
  const { currentProject } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    if (currentProject) {
      fetchTickets()
    } else {
      setLoading(false)
    }
  }, [currentProject?.id])

  const fetchTickets = async () => {
    if (!currentProject) return
    setLoading(true)
    try {
      const data = await apiFetch(`/tickets/?project_id=${currentProject.id}`)
      setTickets(data)
    } catch (e) {
      console.error('Failed to fetch tickets:', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (!searchFilter) return true
    const query = searchFilter.toLowerCase()
    return (
      t.title.toLowerCase().includes(query) ||
      t.ticket_key.toLowerCase().includes(query) ||
      (t.labels && t.labels.some((l) => l.toLowerCase().includes(query)))
    )
  })

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Board Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Kanban Workflow</span>
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 font-mono rounded-full font-medium">
              {filteredTickets.length} tickets
            </span>
          </h1>
        </div>

        <button
          onClick={fetchTickets}
          className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          title="Refresh Tickets"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <KanbanBoard
            tickets={filteredTickets}
            onTicketClick={(ticket) => setSelectedTicket(ticket)}
            openNewTicketModal={openNewTicketModal}
          />
        )}
      </div>

      {/* Ticket Detail Drawer/Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => fetchTickets()}
        />
      )}
    </div>
  )
}
