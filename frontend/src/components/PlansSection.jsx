import { useState, useEffect } from 'react'
import { Home, Calendar, Check, Zap, Award, Shield } from 'lucide-react'
import api from '../services/api'

export default function PlansSection() {
  const [planos, setPlanos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPlanos()
  }, [])

  async function carregarPlanos() {
    try {
      const res = await api.get('/planos.php')
      setPlanos(res.data.planos || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="py-20 text-center">Carregando planos...</div>
  }

  const plansSorted = planos.sort((a, b) => a.quantidade_propriedades - b.quantidade_propriedades)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Planos para Toda Hospedagem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Comece pequeno e escale conforme cresce seu negócio
          </p>

          {/* Benefícios Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
              <span className="font-medium">Sem contratos</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
              <span className="font-medium">14 dias grátis</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
              <span className="font-medium">Cancele quando quiser</span>
            </div>
          </div>
        </div>

        {/* Plans Grid - 5 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 mb-20">
          {plansSorted.map((plano, idx) => {
            const isPopular = idx === plansSorted.length - 1

            // 3 cores principais
            const colors = [
              { bg: 'bg-slate-50', border: 'border-slate-200', button: 'bg-slate-600 hover:bg-slate-700', icon: 'text-slate-600' },
              { bg: 'bg-emerald-50', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700', icon: 'text-emerald-600' },
              { bg: 'bg-orange-50', border: 'border-orange-200', button: 'bg-orange-600 hover:bg-orange-700', icon: 'text-orange-600' }
            ]

            const colorScheme = colors[idx % 3]

            const isFirst = idx === 0
            const isLast = idx === plansSorted.length - 1

            return (
              <div key={plano.id} className="relative group">
                {/* Card Principal */}
                <div className={`${colorScheme.bg} border-2 ${colorScheme.border} p-5 transition-all duration-300 hover:shadow-xl hover:border-opacity-100 relative z-10 h-full flex flex-col ${
                  isFirst ? 'rounded-l-2xl' : isLast ? 'rounded-r-2xl' : ''
                }`}>

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-bold text-gray-900 truncate">{plano.nome}</h3>
                      {isPopular && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{plano.descricao}</p>
                  </div>

                  {/* Price Section */}
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <span className="text-xs text-gray-600">Começando em</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-gray-900">R$ {plano.preco}</span>
                      <span className="text-xs text-gray-600">/mês</span>
                    </div>
                  </div>

                  {/* Features - Vertical Stack */}
                  <div className="space-y-2 mb-4 flex-grow">
                    {/* Propriedades */}
                    <div className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${colorScheme.bg} border border-gray-200`}>
                      <div className="flex items-center gap-2">
                        <Home className={`w-4 h-4 ${colorScheme.icon} flex-shrink-0`} strokeWidth={2.5} />
                        <span className="text-xs text-gray-600 font-medium">Propriedades</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{plano.quantidade_propriedades}</span>
                    </div>

                    {/* Reservas */}
                    <div className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${colorScheme.bg} border border-gray-200`}>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${colorScheme.icon} flex-shrink-0`} strokeWidth={2.5} />
                        <span className="text-xs text-gray-600 font-medium">Reservas/mês</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{plano.quantidade_reservas}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token')
                      if (token) {
                        alert('Você já está logado! Acesse Configurações para gerenciar seu plano.')
                      } else {
                        window.location.href = '/register?plano=' + plano.id
                      }
                    }}
                    className={`w-full ${colorScheme.button} text-white font-bold py-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-3 flex items-center justify-center gap-2 text-sm`}
                  >
                    <Zap className="w-4 h-4" />
                    Começar Agora
                  </button>

                  {/* Benefícios Inclusos */}
                  <div className="space-y-2.5 border-t border-gray-300/50 pt-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={4} />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">Suporte 24/7</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-blue-600" strokeWidth={4} />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">Painel completo</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-orange-600" strokeWidth={4} />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">Integração Tuya</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section - Limpa */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Dúvidas?</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Posso mudar de plano?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento.' },
              { q: 'Há taxa de cancelamento?', a: 'Não, cancele grátis e sem compromissos quando quiser.' },
              { q: 'Teste gratuito?', a: 'Sim, 14 dias grátis em qualquer plano, sem cartão necessário.' },
              { q: 'Como faço para começar?', a: 'Clique em "Começar Agora" e crie sua conta em 2 minutos.' }
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
