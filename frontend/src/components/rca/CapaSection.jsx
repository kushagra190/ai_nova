import { useDispatch, useSelector } from 'react-redux'
import { ListChecks, Plus, Trash2 } from 'lucide-react'
import { addCapa, removeCapa, updateCapa } from '../../store/rcaSlice.js'
import { Badge, Section, Select, TextArea, TextInput } from '../ui.jsx'

export default function CapaSection() {
  const dispatch = useDispatch()
  const capas = useSelector((state) => state.rca.formData.capa_recommendations)

  const addButton = (
    <button
      onClick={() => dispatch(addCapa())}
      className="flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
    >
      <Plus className="w-4 h-4" /> Add CAPA
    </button>
  )

  return (
    <Section number={4} title="Recommended CAPA Plan" icon={ListChecks} right={addButton}>
      {capas.length === 0 && <p className="text-sm text-slate-500">No CAPA actions yet.</p>}

      {capas.map((capa, i) => {
        const set = (field) => (value) => dispatch(updateCapa({ index: i, field, value }))
        return (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">CAPA-{i + 1}</span>
                <Badge text={capa.action_type} />
              </div>
              <button onClick={() => dispatch(removeCapa(i))} className="text-slate-400 hover:text-red-600" title="Remove CAPA">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Type" value={capa.action_type} onChange={set('action_type')} options={['Corrective', 'Preventive']} />
              <TextInput label="Owner Department" value={capa.owner_department} onChange={set('owner_department')} />
              <TextInput label="Target (days)" type="number" value={capa.target_days} onChange={set('target_days')} />
            </div>
            <TextArea label="Action Description" rows={2} value={capa.action_description} onChange={set('action_description')} />
            <TextArea label="Rationale (which root cause it addresses)" rows={2} value={capa.rationale} onChange={set('rationale')} />
          </div>
        )
      })}
    </Section>
  )
}
