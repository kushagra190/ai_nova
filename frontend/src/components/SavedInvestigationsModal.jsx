import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Database, FolderOpen, Loader2, RefreshCw, X } from 'lucide-react'
import { fetchSavedInvestigations, loadExistingInvestigation } from '../store/rcaSlice.js'
import { Badge } from './ui.jsx'

export default function SavedInvestigationsModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { savedList, savedListLoading, savedId } = useSelector((state) => state.rca)

  useEffect(() => {
    if (isOpen) dispatch(fetchSavedInvestigations())
  }, [isOpen, dispatch])

  if (!isOpen) return null

  const handleOpen = (record) => {
    dispatch(loadExistingInvestigation(record))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Database className="w-5 h-5 text-teal-600" /> Saved Investigations
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={() => dispatch(fetchSavedInvestigations())} className="text-slate-500 hover:text-slate-800" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedListLoading && (
            <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</p>
          )}
          {!savedListLoading && savedList.length === 0 && (
            <p className="text-sm text-slate-500">No investigations saved yet (or the backend / database is not reachable).</p>
          )}

          {savedList.map((record) => (
            <div
              key={record.id}
              className={`rounded-lg border p-4 ${record.id === savedId ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-slate-500">#{record.id} · {record.deviation_id}</p>
                  <p className="font-semibold text-slate-800">{record.title}</p>
                  <p className="text-xs text-slate-500">
                    {record.api_product_name} · Batch {record.batch_number} · {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleOpen(record)}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <FolderOpen className="w-4 h-4" /> Open
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge text={record.severity} />
                <Badge text={record.status} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
