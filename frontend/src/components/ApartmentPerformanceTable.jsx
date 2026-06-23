export default function ApartmentPerformanceTable({ financialData }) {
  // Fallback se não houver dados
  const apartamentos = financialData?.byApartment || []

  if (apartamentos.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-orange-500 font-bold text-sm">Receita por Apartamento - Sem dados</h3>
        </div>
        <div className="p-4 text-slate-400 text-sm">Nenhuma reserva no período selecionado</div>
      </div>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Calcular totais
  const totais = {
    reservations: apartamentos.reduce((sum, apt) => sum + (apt.reservations || 0), 0),
    totalDays: apartamentos.reduce((sum, apt) => sum + (apt.totalDays || 0), 0),
    gross: apartamentos.reduce((sum, apt) => sum + (apt.gross || 0), 0),
    commissions: apartamentos.reduce((sum, apt) => sum + (apt.commissions || 0), 0),
    cleaning: apartamentos.reduce((sum, apt) => sum + (apt.cleaning || 0), 0),
    pets: apartamentos.reduce((sum, apt) => sum + (apt.pets || 0), 0),
    otherDiscounts: apartamentos.reduce((sum, apt) => sum + (apt.otherDiscounts || 0), 0),
    net: apartamentos.reduce((sum, apt) => sum + (apt.net || 0), 0)
  }

  const currentDate = new Date()
  const monthYear = currentDate.toLocaleString('pt-BR', { month: '2-digit', year: 'numeric' })

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-orange-500 font-bold text-sm">Receita por Apartamento - {monthYear}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800 text-white border-b border-slate-700">
              <th className="text-left py-3 px-4 font-bold">Condomínio</th>
              <th className="text-left py-3 px-4 font-bold">Localização</th>
              <th className="text-center py-3 px-4 font-bold">Reservas</th>
              <th className="text-center py-3 px-4 font-bold">Diárias</th>
              <th className="text-center py-3 px-4 font-bold">Tx Ocup.</th>
              <th className="text-right py-3 px-4 font-bold text-emerald-400">R$ Reservas</th>
              <th className="text-right py-3 px-4 font-bold text-red-400">R$ Comissão</th>
              <th className="text-right py-3 px-4 font-bold text-blue-400">R$ Limpeza</th>
              <th className="text-right py-3 px-4 font-bold text-slate-300">R$ Pet</th>
              <th className="text-right py-3 px-4 font-bold text-slate-300">R$ Outros/Desc</th>
              <th className="text-right py-3 px-4 font-bold text-green-400">R$ LÍQUIDO</th>
            </tr>
          </thead>
          <tbody>
            {apartamentos.map((apt, idx) => (
              <tr
                key={idx}
                className={`border-b border-slate-700 ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'} hover:bg-slate-700 transition-colors`}
              >
                <td className="py-2.5 px-4 font-medium text-slate-200">{apt.condominio}</td>
                <td className="py-2.5 px-4 font-medium text-slate-100">{apt.bloco !== '-' ? `${apt.bloco} ` : ''}{apt.apartamento}</td>
                <td className="text-center py-2.5 px-4 text-slate-300">{apt.reservations || 0}</td>
                <td className="text-center py-2.5 px-4 text-slate-300">{apt.totalDays || 0}</td>
                <td className="text-center py-2.5 px-4">
                  <span className="font-bold text-emerald-400">{apt.occupancy}%</span>
                </td>
                <td className="text-right py-2.5 px-4 font-bold text-emerald-400">{formatCurrency(apt.gross)}</td>
                <td className="text-right py-2.5 px-4 font-bold text-red-400">{formatCurrency(apt.commissions)}</td>
                <td className="text-right py-2.5 px-4 font-bold text-blue-400">{formatCurrency(apt.cleaning)}</td>
                <td className="text-right py-2.5 px-4 text-slate-300">{formatCurrency(apt.pets)}</td>
                <td className="text-right py-2.5 px-4 text-slate-300">{formatCurrency(apt.otherDiscounts)}</td>
                <td className="text-right py-2.5 px-4 font-bold text-green-400">{formatCurrency(apt.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-orange-900 border-t-2 border-orange-600 text-orange-100">
              <td colSpan="2" className="py-3 px-4 font-bold">TOTAL GERAL:</td>
              <td className="text-center py-3 px-4 font-bold">{totais.reservations}</td>
              <td className="text-center py-3 px-4 font-bold">{totais.totalDays}</td>
              <td className="text-center py-3 px-4 font-bold">-</td>
              <td className="text-right py-3 px-4 font-bold text-emerald-400">{formatCurrency(totais.gross)}</td>
              <td className="text-right py-3 px-4 font-bold text-red-400">{formatCurrency(totais.commissions)}</td>
              <td className="text-right py-3 px-4 font-bold text-blue-400">{formatCurrency(totais.cleaning)}</td>
              <td className="text-right py-3 px-4 font-bold text-orange-200">{formatCurrency(totais.pets)}</td>
              <td className="text-right py-3 px-4 font-bold text-orange-200">{formatCurrency(totais.otherDiscounts)}</td>
              <td className="text-right py-3 px-4 font-bold text-green-400">{formatCurrency(totais.net)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
