import { useState } from 'react'
import { X } from 'lucide-react'

export default function PeriodSelector({ period, onPeriodChange }) {
  const [showCustom, setShowCustom] = useState(period.type === 'custom')

  const handlePeriodClick = (type) => {
    const today = new Date()
    let startDate = ''
    let endDate = today.toISOString().split('T')[0]

    switch (type) {
      case 'month':
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      case 'quarter':
        const quarter = Math.ceil((today.getMonth() + 1) / 3)
        const qStartMonth = (quarter - 1) * 3 + 1
        startDate = `${today.getFullYear()}-${String(qStartMonth).padStart(2, '0')}-01`
        endDate = new Date(today.getFullYear(), qStartMonth + 2, 0).toISOString().split('T')[0]
        break
      case 'semester':
        const semester = today.getMonth() < 6 ? 1 : 2
        const sStartMonth = (semester - 1) * 6 + 1
        startDate = `${today.getFullYear()}-${String(sStartMonth).padStart(2, '0')}-01`
        endDate = new Date(today.getFullYear(), sStartMonth + 5, 0).toISOString().split('T')[0]
        break
      case 'year':
        startDate = `${today.getFullYear()}-01-01`
        endDate = `${today.getFullYear()}-12-31`
        break
    }

    onPeriodChange({ type, startDate, endDate })
    setShowCustom(false)
  }

  const handleCustomDateChange = (field, value) => {
    onPeriodChange({
      type: 'custom',
      startDate: field === 'start' ? value : period.startDate,
      endDate: field === 'end' ? value : period.endDate
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Período</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {['month', 'quarter', 'semester', 'year'].map((type) => (
          <button
            key={type}
            onClick={() => handlePeriodClick(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period.type === type && !showCustom
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'month' ? 'Mês' : type === 'quarter' ? 'Trimestre' : type === 'semester' ? 'Semestre' : 'Ano'}
          </button>
        ))}

        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            showCustom || period.type === 'custom'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Customizado
        </button>
      </div>

      {(showCustom || period.type === 'custom') && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={period.startDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Final</label>
              <input
                type="date"
                value={period.endDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        {period.startDate} até {period.endDate}
      </div>
    </div>
  )
}
