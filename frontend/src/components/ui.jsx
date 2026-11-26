export function Section({ number, title, icon: Icon, children, right }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs">
            {number}
          </span>
          {Icon && <Icon className="w-4 h-4 text-teal-700" />}
          {title}
        </h3>
        {right}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

export function TextInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </label>
  )
}

export function TextArea({ label, value, onChange, rows = 3, placeholder = '' }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </label>
  )
}

export function Select({ label, value, onChange, options }) {
  const values = options.map((opt) => (typeof opt === 'string' ? opt : opt.value))
  if (value && !values.includes(value)) options = [...options, value]

  return (
    <label className="block">
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {options.map((opt) => {
          const { value: v, label: l } = typeof opt === 'string' ? { value: opt, label: opt } : opt
          return (
            <option key={v} value={v}>
              {l}
            </option>
          )
        })}
      </select>
    </label>
  )
}

const BADGE_COLORS = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  Major: 'bg-orange-100 text-orange-700 border-orange-200',
  Minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Corrective: 'bg-blue-100 text-blue-700 border-blue-200',
  Preventive: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function Badge({ text, prefix = '' }) {
  const color = BADGE_COLORS[text] || 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {prefix}
      {text || '—'}
    </span>
  )
}
