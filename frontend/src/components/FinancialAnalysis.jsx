import { DollarSign } from 'lucide-react'

export default function FinancialAnalysis({ data }) {
  if (!data) return null

  const { totalBruto, totalDescontos, totalLiquido, percentualLiquido } = data

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded"></span>
        Análise Financeira
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita Bruta */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">Receita Bruta</h3>
          <p className="text-3xl font-bold text-emerald-900 mb-4">{formatCurrency(totalBruto?.total || 0)}</p>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-0.5">
            {totalBruto && Object.entries(totalBruto).map(([key, value], idx, arr) => {
              if (key === 'total') return null
              const filteredArr = Object.entries(totalBruto).filter(([k]) => k !== 'total')
              const isLast = idx === filteredArr.length - 1
              const percentage = totalBruto.total > 0 ? ((value / totalBruto.total) * 100).toFixed(0) : 0
              const labels = {
                reserva: 'Reserva',
                limpeza: 'Limpeza',
                pet: 'Pet'
              }

              return (
                <div key={key} className={`flex justify-between items-center text-sm px-2 py-1 ${!isLast ? 'border-b border-emerald-200' : ''}`}>
                  <span className="text-emerald-900 font-medium">{labels[key]}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-900">{formatCurrency(value)}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
            </div>
        </div>

        {/* Descontos */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">Descontos</h3>
          <p className="text-3xl font-bold text-red-900 mb-4">{formatCurrency(totalDescontos?.total || 0)}</p>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-0.5">
            {totalDescontos && Object.entries(totalDescontos).map(([key, value], idx, arr) => {
              if (key === 'total') return null
              const filteredArr = Object.entries(totalDescontos).filter(([k]) => k !== 'total')
              const isLast = idx === filteredArr.length - 1
              const percentageOfTotal = totalDescontos.total > 0 ? ((value / totalDescontos.total) * 100).toFixed(0) : 0
              const percentageOfBruto = totalBruto?.total > 0 ? ((value / totalBruto.total) * 100).toFixed(1) : 0
              const labels = {
                comissao: 'Comissão',
                outros: 'Outros'
              }

              return (
                <div key={key} className={`flex justify-between items-center text-sm px-2 py-1 ${!isLast ? 'border-b border-red-200' : ''}`}>
                  <span className="text-red-900 font-medium">{labels[key]}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-900">{formatCurrency(value)}</span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold">
                      {percentageOfBruto}%
                    </span>
                  </div>
                </div>
              )
            })}
            </div>
        </div>

        {/* Líquido */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Resultado Líquido</h3>
          <p className="text-3xl font-bold text-blue-900 mb-4">{formatCurrency((totalBruto?.total || 0) - (totalDescontos?.total || 0))}</p>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Receita Bruta</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-900">{formatCurrency(totalBruto?.total || 0)}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">100%</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
              <span className="text-red-700 font-medium">Descontos</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-red-700">-{formatCurrency(totalDescontos?.total || 0)}</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold">
                  {totalBruto?.total > 0 ? ((totalDescontos?.total / totalBruto.total) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
              <span className="font-bold text-blue-900">Resultado Líquido</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-900">{formatCurrency((totalBruto?.total || 0) - (totalDescontos?.total || 0))}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {totalBruto?.total > 0 ? (((totalBruto.total - totalDescontos?.total) / totalBruto.total) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
