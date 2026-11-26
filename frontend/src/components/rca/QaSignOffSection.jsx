import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Save, UserCheck } from 'lucide-react'
import { saveInvestigation, updateField } from '../../store/rcaSlice.js'
import { Section, Select, TextArea } from '../ui.jsx'
import { listToText, textToList } from '../../utils/listText.js'

const STATUSES = ['Draft - AI Suggested', 'Under QA Review', 'Verified & Approved']

export default function QaSignOffSection() {
  const dispatch = useDispatch()
  const { formData, saving, savedId } = useSelector((state) => state.rca)
  const set = (field) => (value) => dispatch(updateField({ field, value }))

  const noVerifiedCause = !formData.potential_root_causes.some((c) => c.is_verified)
  const blockApproval = formData.status === 'Verified & Approved' && noVerifiedCause
  const canSave = !saving && formData.title.trim() && !blockApproval

  return (
    <Section number={5} title="QA Reviewer Sign-Off & Save" icon={UserCheck}>
      <TextArea
        label="Missing Evidence still to collect (one per line)"
        rows={3}
        value={listToText(formData.missing_evidence)}
        onChange={(text) => set('missing_evidence')(textToList(text))}
      />
      <TextArea
        label="QA Reviewer Notes"
        rows={4}
        value={formData.qa_reviewer_notes}
        onChange={set('qa_reviewer_notes')}
        placeholder="Evidence reviewed, interviews done, rationale for accepting / rejecting causes..."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <Select label="Status" value={formData.status} onChange={set('status')} options={STATUSES} />
        <button
          onClick={() => dispatch(saveInvestigation())}
          disabled={!canSave}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white shadow hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {savedId ? `Update Investigation #${savedId}` : 'Save Investigation to Database'}
        </button>
      </div>
      {blockApproval && (
        <p className="text-sm text-red-600">Verify at least one root cause before setting status to "Verified &amp; Approved".</p>
      )}
      {!formData.title.trim() && <p className="text-xs text-slate-500">A title is required before saving.</p>}
    </Section>
  )
}
