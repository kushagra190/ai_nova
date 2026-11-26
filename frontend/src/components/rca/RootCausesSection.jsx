import { useDispatch, useSelector } from 'react-redux'
import { ShieldCheck, Target } from 'lucide-react'
import { toggleVerifyCause, updateField, updateRootCause } from '../../store/rcaSlice.js'
import { Badge, Section, Select, TextArea } from '../ui.jsx'
import { listToText, textToList } from '../../utils/listText.js'

const CATEGORIES = ['Equipment', 'Process', 'Human Error', 'Material', 'Measurement', 'Environment']

export default function RootCausesSection() {
  const dispatch = useDispatch()
  const { potential_root_causes: causes, contributing_factors } = useSelector((state) => state.rca.formData)
  const verifiedCount = causes.filter((c) => c.is_verified).length

  return (
    <Section
      number={3}
      title="Candidate Root Causes & Contributing Factors"
      icon={Target}
      right={<span className="text-xs text-slate-500">{verifiedCount} / {causes.length} verified</span>}
    >
      {causes.length === 0 && <p className="text-sm text-slate-500">No root causes suggested yet.</p>}

      {causes.map((cause, i) => {
        const set = (field) => (value) => dispatch(updateRootCause({ index: i, field, value }))
        return (
          <div
            key={i}
            className={`rounded-lg border p-4 space-y-3 ${cause.is_verified ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                <Badge text={cause.confidence} prefix="Confidence: " />
                <Badge text={cause.category} />
                {!cause.is_verified && <span className="text-xs italic text-amber-600">AI suggestion - unverified</span>}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={cause.is_verified}
                  onChange={() => dispatch(toggleVerifyCause(i))}
                  className="h-4 w-4 accent-green-600"
                />
                <ShieldCheck className={`w-4 h-4 ${cause.is_verified ? 'text-green-600' : 'text-slate-400'}`} />
                Confirm / Verify Cause
              </label>
            </div>

            <TextArea label="Root Cause" rows={2} value={cause.cause} onChange={set('cause')} />

            <div className="border-l-4 border-slate-300 pl-3">
              <TextArea label="Supporting Evidence" rows={2} value={cause.supporting_evidence} onChange={set('supporting_evidence')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={cause.category} onChange={set('category')} options={CATEGORIES} />
              <Select label="Confidence" value={cause.confidence} onChange={set('confidence')} options={['High', 'Medium', 'Low']} />
            </div>
          </div>
        )
      })}

      <TextArea
        label="Contributing Factors (one per line)"
        rows={4}
        value={listToText(contributing_factors)}
        onChange={(text) => dispatch(updateField({ field: 'contributing_factors', value: textToList(text) }))}
      />
    </Section>
  )
}
