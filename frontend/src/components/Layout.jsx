import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import NewTicketModal from './NewTicketModal'

export default function Layout() {
  const [searchFilter, setSearchFilter] = useState('')
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar openNewTicketModal={() => setIsTicketModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
        <main className="flex-1 overflow-auto bg-slate-950/90 p-6 relative">
          <Outlet context={{ searchFilter, openNewTicketModal: () => setIsTicketModalOpen(true) }} />
        </main>
      </div>

      {isTicketModalOpen && (
        <NewTicketModal onClose={() => setIsTicketModalOpen(false)} />
      )}
    </div>
  )
}
