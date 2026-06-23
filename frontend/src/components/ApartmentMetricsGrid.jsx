export default function ApartmentMetricsGrid({ metrics }) {
  if (!metrics || !metrics.byApartment || metrics.byApartment.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Métricas por Apartamento</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Apartamento</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Reservas</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Dias Ocupados</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Ocupação</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receita Bruta</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receita Líquida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.byApartment.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{apt.nome}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{apt.reservations}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{apt.totalDays}</td>
                <td className="px-6 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(apt.occupancy, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 min-w-10">
                      {apt.occupancy.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                  R$ {apt.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-sm text-green-600 font-medium">
                  R$ {apt.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
