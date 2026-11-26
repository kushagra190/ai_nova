import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bot, CheckCircle2, ClipboardPaste, FileText, FlaskConical, Loader2, Upload } from 'lucide-react'
import { analyzePdf, analyzeText, loadSampleText, setIntakeText, setSelectedMethod } from '../store/rcaSlice.js'
import { Select } from './ui.jsx'
import MissingEvidenceAlert from './MissingEvidenceAlert.jsx'

const STEPS = ['Extracting Deviation Data', 'Running Root Cause Analysis', 'Generating CAPA']

export default function AiIntakePanel() {
  const dispatch = useDispatch()
  const { intakeText, selectedMethod, loading, hasAnalysis } = useSelector((state) => state.rca)

  const [inputMode, setInputMode] = useState('text')
  const [pdfFile, setPdfFile] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 3500)
    return () => clearInterval(timer)
  }, [loading])

  const canAnalyze = !loading && (inputMode === 'text' ? intakeText.trim().length > 20 : Boolean(pdfFile))

  const handleAnalyze = () => {
    setStepIndex(0)
    if (inputMode === 'text') dispatch(analyzeText({ text: intakeText, method: selectedMethod }))
    else dispatch(analyzePdf({ file: pdfFile, method: selectedMethod }))
  }

  const handleLoadSample = () => {
    setInputMode('text')
    dispatch(loadSampleText())
  }

  const tabClass = (mode) =>
    `flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${
      inputMode === mode ? 'bg-white text-teal-700 shadow' : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Bot className="w-5 h-5 text-teal-600" /> AI Investigation Assistant
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Provide the deviation details. The AI drafts the RCA &amp; CAPA for QA review.
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button className={tabClass('text')} onClick={() => setInputMode('text')}>
            <ClipboardPaste className="w-4 h-4" /> Paste Incident / Email
          </button>
          <button className={tabClass('pdf')} onClick={() => setInputMode('pdf')}>
            <FileText className="w-4 h-4" /> Upload Deviation PDF
          </button>
        </div>

        {inputMode === 'text' ? (
          <textarea
            rows={12}
            value={intakeText}
            onChange={(e) => dispatch(setIntakeText(e.target.value))}
            placeholder="Paste the deviation report, incident email, shift log or batch record notes here..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-teal-500">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-600">{pdfFile ? pdfFile.name : 'Click to choose a deviation report (PDF)'}</span>
            {pdfFile && <span className="text-xs text-slate-400">{(pdfFile.size / 1024).toFixed(0)} KB</span>}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0] || null)} />
          </label>
        )}

        <button
          onClick={handleLoadSample}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-teal-600 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50"
        >
          <FlaskConical className="w-4 h-4" /> Load Sample API Incident
        </button>

        <Select
          label="Primary RCA Methodology"
          value={selectedMethod}
          onChange={(value) => dispatch(setSelectedMethod(value))}
          options={[{ value: '5 Whys', label: '5 Whys' }, { value: 'Fishbone', label: 'Fishbone (6M)' }]}
        />

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 py-3 font-semibold text-white shadow hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
          {loading ? 'Analyzing...' : 'Extract & Populate RCA Form'}
        </button>

        {loading && (
          <ol className="space-y-1.5 rounded-lg bg-teal-50 p-3 text-sm">
            {STEPS.map((step, i) => (
              <li key={step} className={`flex items-center gap-2 ${i <= stepIndex ? 'text-teal-800' : 'text-slate-400'}`}>
                {i < stepIndex && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                {i === stepIndex && <Loader2 className="w-4 h-4 animate-spin" />}
                {i > stepIndex && <span className="w-4 h-4 rounded-full border border-slate-300" />}
                {step}
              </li>
            ))}
          </ol>
        )}
      </section>

      {hasAnalysis && !loading && <MissingEvidenceAlert />}
    </div>
  )
}
