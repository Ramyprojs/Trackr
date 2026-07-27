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
import { ArrowUpDown, Tag } from 'lucide-react'

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
          <span className="font-mono font-medium text-zinc-300">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: (info) => (
          <span className="font-medium text-zinc-100 line-clamp-1">
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
            todo: 'bg-zinc-900 text-zinc-400 border-zinc-800',
            in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          }
          return (
            <span
              className={`px-2 py-0.5 text-[10px] font-medium uppercase rounded border ${
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
          <span className="text-xs font-medium uppercase text-zinc-400">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'estimate',
        header: 'Estimate',
        cell: (info) => (
          <span className="font-mono text-xs text-zinc-400">
            {info.getValue()} pts
          </span>
        ),
      },
      {
        accessorKey: 'labels',
        header: 'Labels',
        cell: (info) => {
          const labels = info.getValue() || []
          return (
            <div className="flex flex-wrap gap-1">
              {labels.map((l, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded"
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
    <div className="h-full flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-zinc-100">All Issues Table</h1>
        <span className="text-xs text-zinc-500 font-mono">
          {filteredData.length} total
        </span>
      </div>

      <div className="flex-1 border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-medium select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 cursor-pointer hover:text-zinc-200 transition"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedTicket(row.original)}
                  className="hover:bg-zinc-900/60 transition cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
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
                    className="p-8 text-center text-zinc-500 italic"
                  >
                    No matching issues.
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
