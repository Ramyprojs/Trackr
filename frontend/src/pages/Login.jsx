import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, User, AlertCircle, Sparkles, Github, Linkedin, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, fullName, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const demoEmail = `demo-${Math.floor(Math.random() * 8999 + 1000)}@trackr.dev`
      await login(demoEmail, 'demo123456')
      navigate('/')
    } catch (err) {
      console.info('Backend unreachable, transitioning to local demo mode.')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 md:p-10 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Header Navigation — Clickable Animated Logo */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <Link to="/" title="Home">
          <motion.img
            whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            src="/logo.png"
            alt="Home"
            className="h-9 md:h-11 w-auto object-contain cursor-pointer drop-shadow-md"
          />
        </Link>

        {/* Social / Author Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Ramyprojs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/ramyabdelamalak/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-8">
        {/* Left Column — Hero & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI-Powered Project Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 leading-tight">
            Agile issue tracking built for velocity & LLM triage.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            Combines high-density Kanban workflows with background Gemini AI automation: automated ticket labeling, comment thread summaries, and sprint risk prediction.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Automated Triage</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                LLM predicts priority, labels, and story points on issue creation.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sprint Risk Scoring</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Predicts completion probability and velocity bottlenecks.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column — Auth Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative"
        >
          {/* Tab Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Workspace'
                : 'Create Workspace Account'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Quick Demo Trigger */}
          <div className="mt-5 pt-4 border-t border-zinc-800/80">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              type="button"
              className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Try Instant Demo (User-Based Workspace)</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer with Hyperlinks */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
        <p>© 2026 All rights reserved.</p>
        <div className="flex items-center gap-4 font-medium">
          <a
            href="https://github.com/Ramyprojs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Ramyprojs</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ramyabdelamalak/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <Linkedin className="w-3.5 h-3.5 text-sky-400" />
            <span>Ramy Abdelamalak</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
