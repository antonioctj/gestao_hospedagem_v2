import { TrendingUp, TrendingDown } from 'lucide-react'

export default function ThreeMonthsComparison({ data }) {
  if (!data || data.length === 0) return null

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Calcular variação percentual entre mês anterior e atual
  const prevMonth = data[0]
  const currentMonth = data[1]
  const nextMonth = data[2]

  const variation = prevMonth.gross > 0
    ? ((currentMonth.gross - prevMonth.gross) / prevMonth.gross) * 100
    : 0

  const isPositive = variation >= 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-600 rounded"></span>
          Comparativo de Receita - 3 Meses
        </h2>
        <p className="text-slate-600 text-sm">
          Visualize a receita bruta, descontos e resultado líquido
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((month, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 ${
              idx === 1
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
            }`}
          >
            <div className="mb-4">
              <h3 className={`text-sm font-bold uppercase tracking-wide ${
                idx === 1 ? 'text-blue-700' : 'text-slate-600'
              }`}>
                {month.label}
              </h3>
              <p className="text-xs text-slate-500">{month.month.toUpperCase()} {month.year}</p>
            </div>

            <div className="space-y-3">
              {/* Receita Bruta */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700 font-medium">Receita Bruta</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(month.gross)}</span>
              </div>

              {/* Descontos */}
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                <span className="text-sm text-slate-700 font-medium">Descontos</span>
                <span className="text-sm font-bold text-red-600">-{formatCurrency(month.discounts)}</span>
              </div>

              {/* Líquido */}
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded p-2 border border-slate-200">
                <span className="text-sm text-slate-900 font-bold">Líquido</span>
                <span className="text-sm font-bold text-blue-700">{formatCurrency(month.net)}</span>
              </div>

              {/* Estatísticas */}
              <div className="pt-2 space-y-1 border-t border-slate-200">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Reservas</span>
                  <span className="font-semibold text-slate-700">{month.reservations}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Diárias</span>
                  <span className="font-semibold text-slate-700">{month.totalDays}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Variação */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Variação: Mês Anterior → Mês Atual</p>
            <p className="text-xs text-slate-500 mt-1">
              De {formatCurrency(prevMonth.gross)} para {formatCurrency(currentMonth.gross)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="text-emerald-600" size={24} />
            ) : (
              <TrendingDown className="text-red-600" size={24} />
            )}
            <div className="text-right">
              <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{variation.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600">variação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
