export default function PlatformBreakdownTable({ metrics }) {
  if (!metrics || !metrics.byPlatform || metrics.byPlatform.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Receita por Plataforma</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Plataforma</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Reservas</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receita Bruta</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Comissão</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receita Líquida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.byPlatform.map((platform, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 capitalize">
                  {platform.platform}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{platform.count}</td>
                <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                  R$ {platform.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-sm text-red-600">
                  -R$ {platform.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-sm text-green-600 font-medium">
                  R$ {platform.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
