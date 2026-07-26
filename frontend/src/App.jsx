import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Trackr workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PlaceholderView({ title, description }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
      <h2 className="text-xl font-bold text-slate-200">{title}</h2>
      <p className="text-sm text-slate-400 max-w-sm mt-1">{description}</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <PlaceholderView
                  title="Kanban Board View"
                  description="Interactive status columns & drag-and-drop ticket cards will render here in Phase 6."
                />
              }
            />
            <Route
              path="list"
              element={
                <PlaceholderView
                  title="TanStack Table List View"
                  description="Tabular list view with sorting, filtering, and inline edits will render here in Phase 6."
                />
              }
            />
            <Route
              path="sprints"
              element={
                <PlaceholderView
                  title="Sprints & AI Risk Analysis"
                  description="Sprint velocity tracking and Gemini AI risk scoring indicator will render here in Phase 6."
                />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
