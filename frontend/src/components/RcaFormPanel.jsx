import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, ClipboardList, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { clearMessages, resetForm } from '../store/rcaSlice.js'
import DeviationSummarySection from './rca/DeviationSummarySection.jsx'
import InvestigationSection from './rca/InvestigationSection.jsx'
import RootCausesSection from './rca/RootCausesSection.jsx'
import CapaSection from './rca/CapaSection.jsx'
import QaSignOffSection from './rca/QaSignOffSection.jsx'

export default function RcaFormPanel() {
  const dispatch = useDispatch()
  const { hasAnalysis, error, successMessage, savedId } = useSelector((state) => state.rca)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <ClipboardList className="w-5 h-5 text-teal-600" />
          Structured RCA &amp; CAPA Workbench
          {savedId && <span className="text-sm font-normal text-slate-500">(record #{savedId})</span>}
        </h2>
        {hasAnalysis && (
          <button onClick={() => dispatch(resetForm())} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <RotateCcw className="w-4 h-4" /> New Investigation
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
        <p>
          <strong>AI-generated root causes are preliminary suggestions.</strong> Verify supporting evidence before QA sign-off.
        </p>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <span className="flex gap-2"><XCircle className="w-5 h-5 shrink-0" /> {error}</span>
          <button onClick={() => dispatch(clearMessages())} className="font-semibold">✕</button>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          <span className="flex gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" /> {successMessage}</span>
          <button onClick={() => dispatch(clearMessages())} className="font-semibold">✕</button>
        </div>
      )}

      {!hasAnalysis ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardList className="mx-auto w-12 h-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-600">No investigation loaded yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Paste an incident or upload a deviation PDF on the left, then click <strong>Extract &amp; Populate RCA Form</strong>.
            <br />Or open a record from <strong>Saved Investigations</strong>.
          </p>
        </div>
      ) : (
        <>
          <DeviationSummarySection />
          <InvestigationSection />
          <RootCausesSection />
          <CapaSection />
          <QaSignOffSection />
        </>
      )}
    </div>
  )
}
