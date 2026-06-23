import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-32 pb-20 px-4 overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Conteúdo Esquerdo */}
          <div>
            <div className="inline-block bg-primary bg-opacity-20 border border-primary px-4 py-2 rounded-full mb-6">
              <span className="text-primary font-semibold text-sm">🚀 Solução Completa para Hospedagens</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Gerencie Seus Imóveis com Excelência
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Controle completo de hospedagens, reservas, hóspedes e financeiro. Integração com fechaduras inteligentes Tuya e notificações em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-primary/50 transition transform hover:scale-105 text-center"
              >
                Começar Gratuitamente →
              </Link>
              <button className="border-2 border-blue-400 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 hover:bg-opacity-10 transition">
                Agendar Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-gray-400 mt-1">Usuários Ativos</p>
              </div>
              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-400">50k+</p>
                <p className="text-sm text-gray-400 mt-1">Reservas/Mês</p>
              </div>
              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-400">99%</p>
                <p className="text-sm text-gray-400 mt-1">Uptime</p>
              </div>
            </div>
          </div>

          {/* Card Ilustrativo Direito */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600 rounded-3xl opacity-10 blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white border-opacity-20 rounded-3xl p-8 backdrop-blur">
              {/* Header Card */}
              <div className="mb-8 pb-6 border-b border-white border-opacity-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-lg">🏢</div>
                  <div>
                    <p className="font-semibold">Dashboard Principal</p>
                    <p className="text-xs text-gray-400">Seu gerenciador online</p>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Receita Mensal</span>
                    <span className="text-primary font-bold">R$ 45.230</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-orange-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                    <p className="text-gray-400 text-xs mb-2">🏠 Imóveis</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                    <p className="text-gray-400 text-xs mb-2">👥 Hóspedes</p>
                    <p className="text-2xl font-bold">248</p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                    <p className="text-gray-400 text-xs mb-2">📅 Reservas</p>
                    <p className="text-2xl font-bold">32</p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                    <p className="text-gray-400 text-xs mb-2">📈 Ocupação</p>
                    <p className="text-2xl font-bold text-green-400">87%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
