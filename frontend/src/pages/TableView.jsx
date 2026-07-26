import React, { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'
import TicketDetailModal from '../components/TicketDetailModal'
import { ArrowUpDown, Tag, Sparkles } from 'lucide-react'

export default function TableView() {
  const { searchFilter } = useOutletContext()
  const { currentProject } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState([])
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

  const columns = useMemo(
    () => [
      {
        accessorKey: 'ticket_key',
        header: 'Key',
        cell: (info) => (
          <span className="font-mono font-bold text-indigo-400">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: (info) => (
          <span className="font-semibold text-slate-100 line-clamp-1">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue()
          const colorMap = {
            todo: 'bg-slate-800 text-slate-300 border-slate-700',
            in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            in_review: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          }
          return (
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                colorMap[val] || colorMap.todo
              }`}
            >
              {val}
            </span>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: (info) => (
          <span className="text-xs font-semibold uppercase text-slate-300">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'estimate',
        header: 'Estimate',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-400">
            {info.getValue()} pts
          </span>
        ),
      },
      {
        accessorKey: 'labels',
        header: 'AI Labels',
        cell: (info) => {
          const labels = info.getValue() || []
          return (
            <div className="flex flex-wrap gap-1">
              {labels.map((l, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>
          )
        },
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    if (!searchFilter) return tickets
    const query = searchFilter.toLowerCase()
    return tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.ticket_key.toLowerCase().includes(query) ||
        (t.labels && t.labels.some((l) => l.toLowerCase().includes(query)))
    )
  }, [tickets, searchFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100">TanStack Table List</h1>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredData.length} records
        </span>
      </div>

      <div className="flex-1 border border-slate-800/80 rounded-2xl bg-slate-900/40 backdrop-blur-md overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3.5 cursor-pointer hover:text-slate-200 transition"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown className="w-3 h-3 text-slate-600" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedTicket(row.original)}
                  className="hover:bg-slate-800/40 transition cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-slate-500 italic"
                  >
                    No tickets match criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
