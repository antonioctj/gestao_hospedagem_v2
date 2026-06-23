import { Home, Users, DollarSign, CheckCircle } from 'lucide-react'

export default function ApartmentCards({ apartments, financialData }) {
  if (!apartments || apartments.length === 0) {
    return <div className="text-center text-slate-500 py-8">Nenhum apartamento cadastrado</div>
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const getApartmentFinancials = (apartmentName) => {
    if (!financialData?.byApartment) return null
    return financialData.byApartment.find(apt => apt.nome === apartmentName)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ocupado':
        return { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' }
      case 'vazio':
        return { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' }
      case 'bloqueado':
        return { bg: 'bg-gradient-to-br from-purple-50 to-violet-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' }
      default:
        return { bg: 'bg-gradient-to-br from-slate-50 to-gray-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' }
    }
  }

  const statusLabel = {
    ocupado: 'Ocupado',
    vazio: 'Vazio',
    bloqueado: 'Bloqueado'
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-600 rounded"></span>
        Desempenho por Apartamento
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apartments.map((apt) => {
          const colors = getStatusColor(apt.status)
          const financials = getApartmentFinancials(apt.nome)

          return (
            <div
              key={apt.id}
              className={`${colors.bg} border ${colors.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={16} className={colors.text} />
                    <h3 className="text-sm font-bold text-slate-900">{apt.nome}</h3>
                  </div>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                    {statusLabel[apt.status] || apt.status}
                  </span>
                </div>
              </div>

              {/* Informações de Ocupação */}
              {apt.guest && (
                <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-600 font-medium mb-1">Hóspede</p>
                  <p className="text-sm font-bold text-slate-900">{apt.guest}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-600">
                    {apt.check_in && <span>In: {new Date(apt.check_in).toLocaleDateString('pt-BR')}</span>}
                    {apt.check_out && <span>Out: {new Date(apt.check_out).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              )}

              {/* Dados de Hóspedes */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {apt.qtd_adultos > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-2 text-center">
                    <Users size={16} className={`mx-auto ${colors.text} mb-1`} />
                    <p className="text-xs font-bold text-slate-900">{apt.qtd_adultos}</p>
                    <p className="text-xs text-slate-600">Adultos</p>
                  </div>
                )}
                {apt.qtd_criancas > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-2 text-center">
                    <Users size={16} className={`mx-auto ${colors.text} mb-1`} />
                    <p className="text-xs font-bold text-slate-900">{apt.qtd_criancas}</p>
                    <p className="text-xs text-slate-600">Crianças</p>
                  </div>
                )}
                {apt.tem_pet > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-2 text-center">
                    <CheckCircle size={16} className={`mx-auto ${colors.text} mb-1`} />
                    <p className="text-xs font-bold text-slate-900">Pet</p>
                  </div>
                )}
              </div>

              {/* Dados Financeiros */}
              {financials && (
                <div className="border-t border-current border-opacity-10 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className={colors.text} />
                      <span className={`${colors.text} font-medium`}>Receita</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(financials.gross)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className={colors.text} />
                      <span className={`${colors.text} font-medium`}>Ocupação</span>
                    </div>
                    <span className="font-bold text-slate-900">{financials.occupancy}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-current border-opacity-10">
                    <span>{financials.reservations || 0} reservas</span>
                    <span>{financials.totalDays || 0} dias</span>
                  </div>
                </div>
              )}

              {/* Status de Limpeza */}
              {apt.status_limpeza && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                  <p className="text-xs text-slate-600 font-medium mb-1">Status Limpeza</p>
                  <p className="text-xs font-bold text-slate-900">{apt.status_limpeza}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
