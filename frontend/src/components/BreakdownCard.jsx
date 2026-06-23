import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function BreakdownCard({ title, total, items, icon: Icon, color = 'blue' }) {
  const [expanded, setExpanded] = useState(false)

  const colorScheme = {
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'bg-emerald-100 text-emerald-700',
      header: 'text-slate-500',
      total: 'text-emerald-900'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-orange-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'bg-red-100 text-red-700',
      header: 'text-slate-500',
      total: 'text-red-900'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'bg-blue-100 text-blue-700',
      header: 'text-slate-500',
      total: 'text-blue-900'
    }
  }

  const scheme = colorScheme[color] || colorScheme.blue

  return (
    <div className={`${scheme.bg} border ${scheme.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-4 group"
      >
        <div className="flex items-start gap-4 flex-1">
          {Icon && (
            <div className={`${scheme.icon} rounded-xl p-3 flex-shrink-0`}>
              <Icon size={24} />
            </div>
          )}
          <div className="text-left flex-1">
            <p className={`${scheme.header} text-sm font-semibold uppercase tracking-wide mb-2`}>
              {title}
            </p>
            <p className={`${scheme.total} text-3xl font-bold tracking-tight`}>
              {typeof total === 'number' ? `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : total}
            </p>
          </div>
        </div>
        <ChevronDown
          size={24}
          className={`${scheme.text} flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && items && items.length > 0 && (
        <div className="mt-6 pt-6 border-t border-current border-opacity-10 space-y-3">
          {items.map((item, idx) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
            return (
              <div key={idx} className="flex items-center justify-between px-2 py-2 hover:bg-white hover:bg-opacity-40 rounded-lg transition-colors">
                <div className="flex-1">
                  <span className={`${scheme.text} text-sm font-medium`}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className={`${scheme.total} text-sm font-bold`}>
                    R$ {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : item.value}
                  </span>
                  <span className={`${scheme.text} text-xs font-bold bg-white bg-opacity-50 px-2 py-1 rounded min-w-[40px] text-center`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
