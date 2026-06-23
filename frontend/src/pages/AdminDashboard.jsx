import { useState, useEffect } from 'react'
import { Users, Calendar, DollarSign, AlertCircle, PawPrint, Lock, Wind, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import MonthlyRevenueChart from '../components/MonthlyRevenueChart'
import RevenueByApartmentTable from '../components/RevenueByApartmentTable'
import BreakdownCard from '../components/BreakdownCard'
import FinancialAnalysis from '../components/FinancialAnalysis'
import ApartmentCards from '../components/ApartmentCards'
import ApartmentPerformanceTable from '../components/ApartmentPerformanceTable'
import ThreeMonthsComparison from '../components/ThreeMonthsComparison'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState({
    occupancyRate: 0,
    totalRevenue: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    pendingReservations: 0,
    monthlyMetrics: [],
    apartmentStatus: [],
    financialMetrics: null,
    threeMonthsComparison: []
  })

  const [period, setPeriod] = useState({
    type: 'year',
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`
  })

  useEffect(() => {
    loadDashboard()
  }, [period])

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const params = {
        period: period.type,
        startDate: period.startDate,
        endDate: period.endDate
      }

      const res = await api.get('/dashboard.php', { params })
      console.log('Dashboard API Response:', res.data)
      console.log('Financial Metrics:', res.data.financialMetrics)
      if (res.data.financialMetrics && res.data.financialMetrics.byApartment) {
        console.log('By Apartment Data:', res.data.financialMetrics.byApartment)
      }
      setMetrics({
        occupancyRate: res.data.occupancyRate || 0,
        totalRevenue: res.data.totalRevenue || 0,
        checkInsToday: res.data.checkInsToday || 0,
        checkOutsToday: res.data.checkOutsToday || 0,
        pendingReservations: res.data.pendingReservations || 0,
        monthlyMetrics: res.data.monthlyMetrics || [],
        apartmentStatus: res.data.apartmentStatus || [],
        financialMetrics: res.data.financialMetrics || null,
        revenueBreakdown: res.data.revenueBreakdown || null,
        threeMonthsComparison: res.data.threeMonthsComparison || []
      })
    } catch (err) {
      setError('Erro ao carregar dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canViewFinancial = user && ['gerente', 'super_admin', 'anfitrião', 'manutenção'].includes(user.role || user.nivel)

  const handlePeriodChange = (periodType) => {
    const today = new Date()
    let startDate, endDate

    switch (periodType) {
      case 'week':
        const firstDayOfWeek = new Date(today)
        firstDayOfWeek.setDate(today.getDate() - today.getDay())
        startDate = firstDayOfWeek.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break

      case 'month':
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
        endDate = today.toISOString().split('T')[0]
        break

      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = `${today.getFullYear()}-${String(quarter * 3 + 1).padStart(2, '0')}-01`
        endDate = today.toISOString().split('T')[0]
        break

      case 'year':
        startDate = `${today.getFullYear()}-01-01`
        endDate = today.toISOString().split('T')[0]
        break

      default:
        startDate = `${today.getFullYear()}-01-01`
        endDate = today.toISOString().split('T')[0]
    }

    setPeriod({ type: periodType, startDate, endDate })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard Executivo</h1>
          <p className="text-slate-500 text-lg">Visão geral da operação e métricas financeiras</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Operações - KPI Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            Operações do Dia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Taxa de Ocupação"
              value={`${(metrics.occupancyRate || 0)}%`}
              icon={Calendar}
              color="blue"
            />
            <KPICard
              title="Check-ins Hoje"
              value={metrics.checkInsToday}
              icon={Users}
              color="green"
            />
            <KPICard
              title="Check-outs Hoje"
              value={metrics.checkOutsToday}
              icon={Users}
              color="purple"
            />
            <KPICard
              title="Reservas Pendentes"
              value={metrics.pendingReservations}
              icon={AlertCircle}
              color="orange"
            />
          </div>
        </div>

        {/* Análise Financeira Completa */}
        <FinancialAnalysis
          data={metrics.revenueBreakdown}
          period={period}
          onPeriodChange={handlePeriodChange}
        />


      {/* Apartment Performance Cards */}
      <ApartmentCards
        apartments={metrics.apartmentStatus}
        financialData={metrics.financialMetrics}
      />

      {/* Comparativo 3 Meses */}
      {metrics.threeMonthsComparison && metrics.threeMonthsComparison.length > 0 && (
        <ThreeMonthsComparison data={metrics.threeMonthsComparison} />
      )}

      {/* Gráficos e Análises */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-600 rounded"></span>
          Análises e Relatórios
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-screen">
            <MonthlyRevenueChart data={metrics.monthlyMetrics || []} />
          </div>

          {/* Apartment Performance Table */}
          {metrics.financialMetrics && (
            <ApartmentPerformanceTable financialData={metrics.financialMetrics} />
          )}

          {/* Revenue by Apartment Table */}
          {metrics.financialMetrics && metrics.financialMetrics.byApartment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <RevenueByApartmentTable data={metrics.financialMetrics.byApartment} />
            </div>
          )}
        </div>
      </div>

      {/* Message for non-gerente users */}
      {!canViewFinancial && user && user.role !== 'gerente' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 font-medium">
            ℹ️ Métricas financeiras detalhadas estão disponíveis apenas para gerentes.
          </p>
        </div>
      )}
    </div>
    </div>
  )
}

function PeriodButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-slate-900 text-white shadow-md'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

function KPICard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-700',
      text: 'text-slate-700',
      value: 'text-blue-900'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-slate-700',
      value: 'text-emerald-900'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-700',
      text: 'text-slate-700',
      value: 'text-purple-900'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-700',
      text: 'text-slate-700',
      value: 'text-orange-900'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-700',
      text: 'text-slate-700',
      value: 'text-red-900'
    }
  }

  const scheme = colors[color] || colors.blue

  return (
    <div className={`${scheme.bg} border ${scheme.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${scheme.text} text-sm font-semibold uppercase tracking-wide mb-2`}>{title}</p>
          <p className={`${scheme.value} text-3xl font-bold tracking-tight`}>{value}</p>
        </div>
        <div className={`${scheme.icon} rounded-xl p-3 flex-shrink-0`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
