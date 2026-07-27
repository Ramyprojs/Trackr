import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import NewTicketModal from './NewTicketModal'
import TutorialModal from './TutorialModal'

export default function Layout() {
  const [searchFilter, setSearchFilter] = useState('')
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  useEffect(() => {
    // Auto-open tutorial on first visit if not seen before
    const seen = localStorage.getItem('trackr_tutorial_seen')
    if (!seen) {
      setIsTutorialOpen(true)
      localStorage.setItem('trackr_tutorial_seen', 'true')
    }
  }, [])

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar openNewTicketModal={() => setIsTicketModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          openTutorial={() => setIsTutorialOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-zinc-950 p-5 relative">
          <Outlet context={{ searchFilter, openNewTicketModal: () => setIsTicketModalOpen(true) }} />
        </main>
      </div>

      {isTicketModalOpen && (
        <NewTicketModal onClose={() => setIsTicketModalOpen(false)} />
      )}

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  )
}
