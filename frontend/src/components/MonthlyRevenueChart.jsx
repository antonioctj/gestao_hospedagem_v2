import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useState } from 'react'

export default function MonthlyRevenueChart({ data = [] }) {
  const [chartType, setChartType] = useState('area')

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const chartData = payload[0].payload
      return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-lg shadow-2xl border border-slate-700">
          <p className="font-semibold text-white text-sm">{chartData.month}</p>
          <p className="text-emerald-400 font-bold text-sm mt-2">
            Receita: R$ {(chartData.gross || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-red-400 font-bold text-sm">
            Despesas: R$ {(chartData.expenses || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-blue-400 font-bold text-sm">
            Lucro: R$ {(chartData.profit || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Receita Mensal</h2>
          <p className="text-sm text-gray-600 mt-1">Evolução da receita ao longo dos meses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('area')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chartType === 'area'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Área
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chartType === 'line'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Linha
          </button>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="gross"
                  name="Receita Bruta"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorGross)"
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Despesas"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={600}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gross"
                  name="Receita Bruta"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Despesas"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={600}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
        </div>
      )}

      {/* Resumo de estatísticas */}
      {data && data.length > 0 && (() => {
        const totalGross = data.reduce((sum, item) => sum + (item.gross || 0), 0)
        const totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0)
        const totalProfit = data.reduce((sum, item) => sum + (item.profit || 0), 0)
        const monthsWithData = data.filter(item => (item.gross || 0) > 0)
        const weightedAverage = monthsWithData.length > 0
          ? totalGross / monthsWithData.length
          : 0

        const maxMonth = data.reduce((max, item) => ((item.gross || 0) > ((max.gross || 0)) ? item : max), {})
        const monthNames = {
          'jan': 'Janeiro', 'feb': 'Fevereiro', 'mar': 'Março', 'apr': 'Abril',
          'may': 'Maio', 'jun': 'Junho', 'jul': 'Julho', 'aug': 'Agosto',
          'sep': 'Setembro', 'oct': 'Outubro', 'nov': 'Novembro', 'dec': 'Dezembro',
          'Jan': 'Janeiro', 'Feb': 'Fevereiro', 'Mar': 'Março', 'Apr': 'Abril',
          'May': 'Maio', 'Jun': 'Junho', 'Jul': 'Julho', 'Aug': 'Agosto',
          'Sep': 'Setembro', 'Oct': 'Outubro', 'Nov': 'Novembro', 'Dec': 'Dezembro'
        }

        const fullMonthName = monthNames[maxMonth.month] || maxMonth.month

        return (
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-2">Receita Bruta Total</p>
              <p className="text-xl font-bold text-blue-900">
                R$ {totalGross.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
              <p className="text-xs font-medium text-emerald-700 mb-2">Média Mensal (Ponderada)</p>
              <p className="text-xl font-bold text-emerald-900">
                R$ {weightedAverage.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-emerald-600 mt-1">{monthsWithData.length} meses com dados</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-xs font-medium text-purple-700 mb-2">Mês com Maior Receita</p>
              <p className="text-lg font-bold text-purple-900">{fullMonthName}</p>
              <p className="text-sm text-purple-700 mt-1">
                R$ {(maxMonth.gross || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
