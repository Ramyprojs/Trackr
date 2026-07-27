import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Kanban, ListFilter, Zap, ArrowRight, ArrowLeft, CheckCircle2, HelpCircle, Key, ExternalLink } from 'lucide-react'

const STEPS = [
  {
    icon: Kanban,
    title: '1. Kanban Workflow Board',
    description:
      'Manage issues across To Do, In Progress, In Review, and Done columns. Click any card to open the issue detail drawer, change status, or view discussion threads.',
    highlight: 'Tip: Click any issue card to inspect its metadata and post comments.',
  },
  {
    icon: ListFilter,
    title: '2. High-Density List View',
    description:
      'Switch to the List tab for a compact, tabular view of all issues. Click column headers to sort by Key, Priority, Status, or Story Points.',
    highlight: 'Tip: Use the search bar in the top header to filter issues in real-time.',
  },
  {
    icon: Zap,
    title: '3. Sprint Velocity & AI Risk Analysis',
    description:
      'Navigate to Sprints & Risk to track completed story points vs remaining capacity. Click "Run Risk Analysis" to trigger Gemini LLM sprint completion risk scoring.',
    highlight: 'Tip: The risk score badge (Low, Medium, High, Critical) automatically updates with an explanation.',
  },
  {
    icon: Sparkles,
    title: '4. AI Auto-Triage & Thread Summarization',
    description:
      'Click "+ New Issue" in the sidebar to create an issue — Gemini AI auto-triages it by predicting priority, labels, and story points. On multi-comment threads, click "Summarize" to get a 1-sentence action summary.',
    highlight: 'Tip: Try creating a new issue to watch AI triage run live!',
  },
  {
    icon: Key,
    title: '5. Adding Your Free Gemini API Key',
    description:
      'To enable live Gemini LLM AI responses in your workspace: 1) Go to aistudio.google.com/app/apikey 2) Click "Create API key" 3) Copy key starting with AIzaSy... 4) Paste key in the Settings & AI tab.',
    highlight: 'Tip: Google AI Studio key generation is 100% free with no credit card required.',
    link: 'https://aistudio.google.com/app/apikey',
  },
]

export default function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = STEPS[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 relative overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Quick Navigation Guide</h2>
              <p className="text-[11px] text-zinc-400">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">{step.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{step.description}</p>
              {step.link && (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs font-medium text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Google AI Studio Key Generator</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 italic">
            {step.highlight}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-zinc-100' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm flex items-center gap-1 transition cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md shadow-sm flex items-center gap-1 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Got it!</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
