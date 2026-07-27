import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Sparkles, Key, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { apiFetch } from '../services/api'

export default function SettingsView() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [configStatus, setConfigStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchAIConfig()
    // Also load key from localStorage if saved on frontend
    const localKey = localStorage.getItem('trackr_gemini_api_key')
    if (localKey) setApiKey(localKey)
  }, [])

  const fetchAIConfig = async () => {
    setLoadingStatus(true)
    try {
      const data = await apiFetch('/settings/ai-config')
      setConfigStatus(data)
    } catch (e) {
      console.error('Failed to fetch AI config:', e)
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleSaveKey = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    setSaving(true)

    try {
      const keyToSave = apiKey.trim()
      if (!keyToSave) {
        setErrorMsg('Please enter a valid API key.')
        setSaving(false)
        return
      }

      // Save to backend runtime
      const updated = await apiFetch('/settings/ai-config', {
        method: 'POST',
        body: JSON.stringify({ gemini_api_key: keyToSave }),
      })

      // Also persist in localStorage for frontend persistence
      localStorage.setItem('trackr_gemini_api_key', keyToSave)

      setConfigStatus(updated)
      setSuccessMsg('Gemini API Key successfully saved! AI features are now active in Live LLM mode.')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save API key.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
            <span>Workspace & AI Configuration</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage Gemini API Key integration and AI model behavior</p>
        </div>

        {/* Current Active Mode Badge */}
        <div className="flex items-center gap-2">
          {configStatus?.has_api_key ? (
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Gemini LLM Active
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Heuristic Fallback Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Key Settings Form */}
        <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Gemini API Key</h2>
              <p className="text-[11px] text-zinc-400">Save key here to enable live LLM triage & summarization without editing code</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Enter API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Encrypted & stored in workspace session</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving Key...' : 'Save API Key'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: How to Generate Gemini API Key Tutorial */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">How to Get a Free Gemini Key</h2>
              <p className="text-[11px] text-zinc-400">Takes less than 1 minute — 100% Free</p>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-zinc-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="font-semibold text-zinc-200">Open Google AI Studio</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <span>aistudio.google.com/app/apikey</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="font-semibold text-zinc-200">Sign in with Google</p>
                <p className="text-[11px] text-zinc-400">Use any personal or work Google account.</p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
              <div>
                <p className="font-semibold text-zinc-200">Click "Create API key"</p>
                <p className="text-[11px] text-zinc-400">Generate a free key instantly (no credit card required).</p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0">4</span>
              <div>
                <p className="font-semibold text-zinc-200">Copy & Paste</p>
                <p className="text-[11px] text-zinc-400">Copy key starting with <code className="font-mono text-zinc-300">AIzaSy...</code> and paste into the box on the left.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
