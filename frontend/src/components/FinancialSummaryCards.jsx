import { DollarSign, TrendingDown, Droplet, Heart } from 'lucide-react'

export default function FinancialSummaryCards({ metrics }) {
  if (!metrics || !metrics.summary) {
    return null
  }

  const { receivedGross, discounts, cleaning, pets, netRevenue, averageDailyRate } = metrics.summary

  const cards = [
    {
      title: 'Receita Bruta',
      value: `R$ ${receivedGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Descontos',
      value: `R$ ${discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Limpeza',
      value: `R$ ${cleaning.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Droplet,
      color: 'purple'
    },
    {
      title: 'Pet',
      value: `R$ ${pets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Heart,
      color: 'pink'
    },
    {
      title: 'Receita Líquida',
      value: `R$ ${netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'ADR',
      value: `R$ ${averageDailyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'orange'
    }
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`border rounded-lg p-4 ${colorClasses[card.color]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-75">{card.title}</p>
              <p className="text-lg font-bold mt-1">{card.value}</p>
            </div>
            <card.icon size={20} className="opacity-50" />
          </div>
        </div>
      ))}
    </div>
  )
}
