import { useSelector } from 'react-redux'
import { AlertTriangle } from 'lucide-react'

export default function MissingEvidenceAlert() {
  const missingEvidence = useSelector((state) => state.rca.formData.missing_evidence)
  const items = missingEvidence.filter((item) => item.trim())

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
      <h3 className="flex items-center gap-2 font-semibold text-amber-800">
        <AlertTriangle className="w-5 h-5" />
        Missing Evidence &amp; Investigation Gaps
      </h3>

      {items.length === 0 ? (
        <p className="mt-2 text-sm text-amber-700">No evidence gaps were flagged by the AI.</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-amber-700">
            Collect these documents / logs before confirming any root cause:
          </p>
          <ul className="mt-3 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-900">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
