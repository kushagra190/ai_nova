import { useDispatch, useSelector } from 'react-redux'
import { Microscope, Plus, Trash2 } from 'lucide-react'
import { addFiveWhy, removeFiveWhy, setActiveTab, updateFishbone, updateFiveWhy } from '../../store/rcaSlice.js'
import { Section, TextArea, TextInput } from '../ui.jsx'
import { listToText, textToList } from '../../utils/listText.js'

const FISHBONE_CATEGORIES = [
  ['machine_equipment', 'Machine / Equipment'],
  ['method_process', 'Method / Process'],
  ['material', 'Material'],
  ['manpower', 'Manpower'],
  ['measurement', 'Measurement'],
  ['environment', 'Environment'],
]

export default function InvestigationSection() {
  const dispatch = useDispatch()
  const { activeTab, formData } = useSelector((state) => state.rca)

  const tabClass = (tab) =>
    `px-3 py-1 text-xs font-semibold rounded-md ${activeTab === tab ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`

  const tabs = (
    <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
      <button className={tabClass('5whys')} onClick={() => dispatch(setActiveTab('5whys'))}>5 Whys</button>
      <button className={tabClass('fishbone')} onClick={() => dispatch(setActiveTab('fishbone'))}>Fishbone (6M)</button>
    </div>
  )

  return (
    <Section number={2} title="Investigation Analysis" icon={Microscope} right={tabs}>
      {activeTab === '5whys' ? (
        <div className="space-y-3">
          {formData.five_whys.length === 0 && <p className="text-sm text-slate-500">No 5 Whys steps yet.</p>}
          {formData.five_whys.map((step, i) => {
            const set = (field) => (value) => dispatch(updateFiveWhy({ index: i, field, value }))
            return (
              <div key={i} className="relative rounded-lg border-l-4 border-teal-500 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-teal-700">Why #{step.why_number}</span>
                  <button onClick={() => dispatch(removeFiveWhy(i))} className="text-slate-400 hover:text-red-600" title="Remove step">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <TextInput label="Question" value={step.question} onChange={set('question')} />
                <TextArea label="Answer" rows={2} value={step.answer} onChange={set('answer')} />
                <TextInput label="Evidence Reference" value={step.evidence_reference} onChange={set('evidence_reference')} />
              </div>
            )
          })}
          <button onClick={() => dispatch(addFiveWhy())} className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
            <Plus className="w-4 h-4" /> Add Why Step
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs text-slate-500">Enter one possible cause per line.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FISHBONE_CATEGORIES.map(([key, label]) => (
              <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-xs font-bold uppercase text-teal-700">{label}</h4>
                <TextArea
                  rows={4}
                  value={listToText(formData.fishbone[key])}
                  onChange={(text) => dispatch(updateFishbone({ category: key, items: textToList(text) }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
