const features = [
  {
    emoji: '🏢',
    title: 'Gestão de Imóveis',
    description: 'Cadastre e organize seus imóveis com informações completas, fotos e características.',
    color: 'from-blue-600 to-blue-400'
  },
  {
    emoji: '📅',
    title: 'Reservas Inteligentes',
    description: 'Controle de reservas em tempo real com check-in/check-out automático.',
    color: 'from-purple-600 to-purple-400'
  },
  {
    emoji: '👥',
    title: 'Hóspedes',
    description: 'Mantenha informações detalhadas de todos os seus hóspedes e histórico de estadia.',
    color: 'from-pink-600 to-pink-400'
  },
  {
    emoji: '💰',
    title: 'Gestão Financeira',
    description: 'Dashboards intuitivos com receitas, comissões, despesas e relatórios detalhados.',
    color: 'from-green-600 to-green-400'
  },
  {
    emoji: '🔐',
    title: 'Fechaduras Inteligentes',
    description: 'Integração com fechaduras eletrônicas Tuya para acesso remoto e segurança.',
    color: 'from-red-600 to-red-400'
  },
  {
    emoji: '🔔',
    title: 'Notificações em Tempo Real',
    description: 'Alertas automáticos sobre novas reservas, pagamentos, check-in e eventos importantes.',
    color: 'from-yellow-600 to-yellow-400'
  },
  {
    emoji: '📊',
    title: 'Relatórios e Analytics',
    description: 'Dados detalhados sobre performance, ocupação e rentabilidade dos seus imóveis.',
    color: 'from-indigo-600 to-indigo-400'
  },
  {
    emoji: '📱',
    title: 'App Mobile',
    description: 'Gerencie tudo de qualquer lugar, a qualquer hora, pelo seu celular ou tablet.',
    color: 'from-cyan-600 to-cyan-400'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-20">
          <div className="inline-block bg-primary bg-opacity-10 border border-primary px-4 py-2 rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">✨ RECURSOS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tudo que você precisa
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Recursos poderosos e integrados para gerenciar suas hospedagens com profissionalismo e eficiência
          </p>
        </div>

        {/* Grid de Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradiente de fundo */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Conteúdo */}
              <div className="relative z-10">
                {/* Emoji grande */}
                <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.emoji}
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Descrição */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Link hover */}
                <div className="flex items-center text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Saiba mais →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Pronto para transformar sua gestão de hospedagens?</p>
          <a
            href="/register"
            className="inline-block bg-gradient-to-r from-primary to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-primary/50 transition transform hover:scale-105"
          >
            Comece Agora Gratuitamente
          </a>
        </div>
      </div>
    </section>
  )
}
