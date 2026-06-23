export default function FinancialChart({ metrics }) {
  if (!metrics || !metrics.monthlyBreakdown || metrics.monthlyBreakdown.length === 0) {
    return null
  }

  const maxGross = Math.max(...metrics.monthlyBreakdown.map(m => m.gross), 1)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Receita Mensal vs Ocupação</h2>
      <div className="space-y-4">
        {metrics.monthlyBreakdown.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.month}</span>
              <div className="flex gap-3 text-xs">
                <span className="text-blue-600">
                  R$ {item.gross.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-purple-600">{item.occupancy.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Barra de Receita Bruta */}
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(item.gross / maxGross) * 100}%` }}
                />
              </div>
              {/* Barra de Ocupação */}
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.occupancy}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Líquido: R$ {item.net.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-gray-600">Receita Bruta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          <span className="text-gray-600">Ocupação</span>
        </div>
      </div>
    </div>
  )
}
