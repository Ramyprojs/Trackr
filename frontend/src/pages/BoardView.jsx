import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'
import KanbanBoard from '../components/KanbanBoard'
import TicketDetailModal from '../components/TicketDetailModal'
import { RefreshCw } from 'lucide-react'

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
    <div className="h-full flex flex-col space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-zinc-100">Board</h1>
          <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono rounded">
            {filteredTickets.length} issues
          </span>
        </div>

        <button
          onClick={fetchTickets}
          className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <KanbanBoard
            tickets={filteredTickets}
            onTicketClick={(ticket) => setSelectedTicket(ticket)}
            openNewTicketModal={openNewTicketModal}
          />
        )}
      </div>

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
