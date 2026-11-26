import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Database, FlaskConical } from 'lucide-react'
import AiIntakePanel from './components/AiIntakePanel.jsx'
import RcaFormPanel from './components/RcaFormPanel.jsx'
import SavedInvestigationsModal from './components/SavedInvestigationsModal.jsx'

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const savedCount = useSelector((state) => state.rca.savedList.length)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-teal-900 text-white shadow">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/20 p-2">
              <FlaskConical className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                AIVOA.AI <span className="font-normal text-teal-200">— Pharma API Quality &amp; RCA Workbench</span>
              </h1>
              <p className="text-xs text-slate-300">Deviation → Root Cause Analysis → CAPA</p>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            <Database className="w-4 h-4" />
            Saved Investigations
            {savedCount > 0 && <span className="rounded-full bg-teal-500 px-2 text-xs">{savedCount}</span>}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[35fr_65fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AiIntakePanel />
        </div>
        <RcaFormPanel />
      </main>

      <SavedInvestigationsModal isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}

export default App
