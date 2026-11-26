import { useDispatch, useSelector } from 'react-redux'
import { FileWarning } from 'lucide-react'
import { updateField } from '../../store/rcaSlice.js'
import { Badge, Section, Select, TextArea, TextInput } from '../ui.jsx'

export default function DeviationSummarySection() {
  const dispatch = useDispatch()
  const form = useSelector((state) => state.rca.formData)

  const set = (field) => (value) => dispatch(updateField({ field, value }))

  return (
    <Section number={1} title="Deviation Summary" icon={FileWarning} right={<Badge text={form.severity} prefix="Severity: " />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput label="Deviation ID" value={form.deviation_id} onChange={set('deviation_id')} />
        <div className="md:col-span-2">
          <TextInput label="Title" value={form.title} onChange={set('title')} />
        </div>
        <TextInput label="API Product" value={form.api_product_name} onChange={set('api_product_name')} />
        <TextInput label="Batch No." value={form.batch_number} onChange={set('batch_number')} />
        <TextInput label="Department" value={form.department} onChange={set('department')} />
        <TextInput label="Incident Date" value={form.incident_date} onChange={set('incident_date')} placeholder="YYYY-MM-DD" />
        <Select label="Severity" value={form.severity} onChange={set('severity')} options={['Critical', 'Major', 'Minor']} />
      </div>
      <TextArea label="Incident Summary" rows={4} value={form.incident_summary} onChange={set('incident_summary')} />
    </Section>
  )
}
