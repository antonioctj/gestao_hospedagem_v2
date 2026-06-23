import { Building2 } from 'lucide-react'

export default function RevenueByApartmentTable({ data = [] }) {
  const calculateTotal = (field) => {
    return data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0)
  }

  const totalReservations = calculateTotal('reservations')
  const totalDays = calculateTotal('totalDays')
  const totalGross = calculateTotal('gross')
  const totalCommissions = calculateTotal('commissions')
  const totalCleaning = calculateTotal('cleaning')
  const totalPets = calculateTotal('pets')
  const totalOtherDiscounts = calculateTotal('otherDiscounts')
  const totalNet = calculateTotal('net')

  const averageOccupancy = data.length > 0
    ? (data.reduce((sum, item) => sum + item.occupancy, 0) / data.length).toFixed(1)
    : 0

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const getCurrentMonthYear = () => {
    const date = new Date()
    return date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-3 rounded-lg">
          <Building2 className="w-6 h-6 text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Receita por Apartamento - {getCurrentMonthYear()}</h2>
      </div>

      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <th className="px-4 py-3 text-left font-bold">Apartamento</th>
                <th className="px-4 py-3 text-center font-bold">Reservas</th>
                <th className="px-4 py-3 text-center font-bold">Diárias</th>
                <th className="px-4 py-3 text-center font-bold">Taxa Ocup.</th>
                <th className="px-4 py-3 text-right font-bold">R$ Reservas</th>
                <th className="px-4 py-3 text-right font-bold">R$ Comissão</th>
                <th className="px-4 py-3 text-right font-bold">R$ Limpeza</th>
                <th className="px-4 py-3 text-right font-bold">R$ Pet</th>
                <th className="px-4 py-3 text-right font-bold">R$ Outros/Desc</th>
                <th className="px-4 py-3 text-right font-bold">R$ LÍQUIDO</th>
              </tr>
            </thead>
            <tbody>
              {data.map((apt, idx) => (
                <tr
                  key={apt.id || idx}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">{apt.nome}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{apt.reservations}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{apt.totalDays}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs ${
                      apt.occupancy >= 80 ? 'bg-green-100 text-green-700' :
                      apt.occupancy >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {apt.occupancy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatCurrency(apt.gross)}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">
                    {formatCurrency(apt.commissions)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">
                    {formatCurrency(apt.cleaning)}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-600 font-medium">
                    {formatCurrency(apt.pets)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatCurrency(apt.otherDiscounts)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {formatCurrency(apt.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 font-bold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-900">TOTAL GERAL:</td>
                <td className="px-4 py-3 text-center text-slate-900">{totalReservations}</td>
                <td className="px-4 py-3 text-center text-slate-900">{totalDays}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {parseFloat(averageOccupancy).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(totalGross)}</td>
                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(totalCommissions)}</td>
                <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(totalCleaning)}</td>
                <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(totalPets)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(totalOtherDiscounts)}</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
        </div>
      )}
    </div>
  )
}
