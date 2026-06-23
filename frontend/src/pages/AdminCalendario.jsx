import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Phone, Home } from 'lucide-react'
import { format, addDays, subDays, getDaysInMonth, getDate, startOfMonth, differenceInDays } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import '../styles/calendario.css'

export default function AdminCalendario() {
  const { user } = useAuth()
  const [reservas, setReservas] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filtroApartamento, setFiltroApartamento] = useState('')

  // Cores por plataforma
  const colorMap = {
    booking: '#2196F3',      // Azul
    airbnb: '#E91E63',       // Rosa/Vermelho
    particular: '#4CAF50',   // Verde
  }

  // Função para fazer parsing de datas YYYY-MM-DD como LOCAL, não UTC
  function parseLocalDate(dateString) {
    if (!dateString) return null
    // Formato esperado: "2026-05-15"
    const [year, month, day] = dateString.split('-').map(Number)
    // month é 0-indexed no constructor do Date
    return new Date(year, month - 1, day)
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadReservas()
  }, [currentDate, filtroApartamento])

  async function loadReservas() {
    setLoading(true)
    setError('')
    try {
      // Mostrar mês inteiro
      const startDate = startOfMonth(currentDate)
      const endDate = addDays(startDate, getDaysInMonth(currentDate) - 1)

      const reservasParams = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      }

      // Se for anfitrião, filtrar apenas seus apartamentos
      if (user && user.role === 'anfitrião') {
        reservasParams.user_id = user.id
      }

      // Carregar APARTAMENTOS
      let aptParams = {}
      if (user && user.role === 'anfitrião') {
        aptParams.user_id = user.id
      }

      const resApt = await api.get('/apartamentos.php', { params: aptParams })
      const dataApt = (resApt.data && resApt.data.data) || resApt.data || []
      const apartamentosData = Array.isArray(dataApt) ? dataApt : []
      setApartamentos(apartamentosData)

      // Carregar RESERVAS
      const resReservas = await api.get('/reservas.php', { params: reservasParams })
      const dataReservas = (resReservas.data && resReservas.data.data) || resReservas.data || []
      setReservas(Array.isArray(dataReservas) ? dataReservas : [])
    } catch (err) {
      setError('Erro ao carregar calendário: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Obter cor baseada na plataforma
  function getColorForPlatform(reserva) {
    let platformKey = 'particular'
    const platLower = reserva.plataforma?.toLowerCase() || ''
    if (platLower.includes('booking')) {
      platformKey = 'booking'
    } else if (platLower.includes('airbnb')) {
      platformKey = 'airbnb'
    }
    return colorMap[platformKey]
  }

  // Extrair dia da string YYYY-MM-DD sem depender de parsing de Date
  function getDayFromString(dateString) {
    // dateString formato: "2026-05-15"
    const parts = dateString.split('-')
    return parseInt(parts[2], 10)
  }

  // Calcular dia da coluna (1-31)
  function getDayOfMonth(dateString) {
    return getDayFromString(dateString)
  }

  // Handler para clique em evento
  const handleSelectReserva = (reserva) => {
    setSelectedReserva(reserva)
    setShowModal(true)
  }

  // Função para enviar WhatsApp
  const handleWhatsApp = () => {
    if (selectedReserva?.telefone) {
      const phone = selectedReserva.telefone.replace(/\D/g, '')
      const message = `Olá ${selectedReserva.nome_hospede}, tudo bem? Segue os detalhes da sua reserva: ${selectedReserva.numero_reserva}`
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // Função para cancelar reserva
  const handleCancelar = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return
    }

    try {
      await api.put(`/reservas/${selectedReserva.id}`, {
        status: 'Cancelada',
      })
      setShowModal(false)
      loadReservas()
    } catch (err) {
      setError('Erro ao cancelar reserva')
      console.error(err)
    }
  }

  // Função para editar
  const handleEditar = () => {
    console.log('Editar reserva:', selectedReserva.id)
  }

  // Verificar permissões
  const canEdit = user && ['gerente', 'anfitrião'].includes(user.role)
  const canCancel = user && ['gerente', 'anfitrião'].includes(user.role)

  if (loading && reservas.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Carregando calendário...</div>
      </div>
    )
  }

  // Datas do mês
  const startOfMonthDate = startOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)
  const endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Array com números dos dias (1 a 31)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Hoje
  const today = new Date()
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear()

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
          <X className="text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário de Reservas</h1>
          <p className="text-gray-600 mt-1">Visualize todas as reservas por apartamento</p>
        </div>

        {/* Navegação de mês */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subDays(currentDate, 30))}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[180px]">
            <div className="text-gray-900 font-bold text-lg">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </div>
          </div>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 30))}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.booking }}></div>
            <span className="text-gray-700">Booking.com</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.airbnb }}></div>
            <span className="text-gray-700">Airbnb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.particular }}></div>
            <span className="text-gray-700">Particular</span>
          </div>
        </div>
      </div>

      {/* Filtro por Apartamento */}
      <div>
        <select
          value={filtroApartamento}
          onChange={(e) => setFiltroApartamento(e.target.value)}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">Todos os Apartamentos</option>
          {apartamentos.map((apt) => (
            <option key={apt.apartamento_id} value={apt.apartamento_id}>
              {apt.quartos}
            </option>
          ))}
        </select>
      </div>

      {/* Calendário Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header com dias */}
          <div className="flex">
            {/* Coluna de apartamentos */}
            <div className="w-48 bg-primary text-white font-bold p-4 flex items-center border-r border-gray-200">
              APARTAMENTOS
            </div>

            {/* Dias */}
            {daysArray.map((day) => (
              <div
                key={day}
                className={`w-24 text-center py-3 border-l border-gray-200 font-semibold ${
                  isCurrentMonth && day === today.getDate()
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-gray-900'
                }`}
              >
                <div className="text-lg">{day}</div>
              </div>
            ))}
          </div>

          {/* Linhas de apartamentos */}
          {apartamentos.length > 0 ? (
            apartamentos.map((apto) => {
              // Filtrar reservas deste apartamento
              let aptoReservas = reservas.filter((r) => {
                // Tentar corresponder por apartamento_id ou quartos
                return r.apartamento_id === apto.apartamento_id ||
                       r.quartos === apto.apartamento_id ||
                       r.quartos === apto.quartos
              })

              // Filtrar por apartamento selecionado
              if (filtroApartamento && filtroApartamento !== '') {
                aptoReservas = aptoReservas.filter((r) => {
                  return r.apartamento_id === filtroApartamento ||
                         r.quartos === filtroApartamento
                })
              }

              // Calcular altura dinâmica baseada no número máximo de slots necessários
              let maxSlots = 0
              aptoReservas.forEach((reserva, idx) => {
                const checkIn = parseLocalDate(reserva.check_in)
                const checkOut = parseLocalDate(reserva.check_out)
                const monthStart = startOfMonth(currentDate)
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

                // Se checkout é antes do mês ou check-in é depois, não contar
                if (checkOut <= monthStart || checkIn > endOfMonth) return

                // Calcular slot index
                let slotIndex = 0
                for (let i = 0; i < idx; i++) {
                  const otherReserva = aptoReservas[i]
                  const otherCheckIn = new Date(otherReserva.check_in)
                  const otherCheckOut = new Date(otherReserva.check_out)
                  const hasOverlap = !(checkOut <= otherCheckIn || checkIn >= otherCheckOut)
                  if (hasOverlap) slotIndex++
                }
                maxSlots = Math.max(maxSlots, slotIndex + 1)
              })

              const minHeight = Math.max(128, maxSlots * 35 + 36)

              return (
                <div key={apto.apartamento_id} className="flex border-t border-gray-200">
                  {/* Nome do apartamento */}
                  <div className="w-48 bg-gray-50 p-4 border-r border-gray-200 flex items-center" style={{ minHeight: `${minHeight}px` }}>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      <div className="text-sm font-medium text-gray-900">{apto.quartos}</div>
                    </div>
                  </div>

                  {/* Grid de dias com reservas contínuas */}
                  <div className="flex-1 relative bg-white">
                    {/* Linhas de grade dos dias */}
                    <div className="flex" style={{ height: `${minHeight}px` }}>
                      {daysArray.map((day) => (
                        <div key={day} className="flex-1 border-l border-gray-100 min-w-24" />
                      ))}
                    </div>

                    {/* Reservas como barras contínuas */}
                    <div className="absolute inset-0 overflow-visible px-1">
                      {aptoReservas.map((reserva, idx) => {
                        // Extrair ano, mês, dia direto das strings para evitar problemas de timezone
                        const checkInParts = reserva.check_in.split('-').map(Number) // [2026, 5, 15]
                        const checkOutParts = reserva.check_out.split('-').map(Number) // [2026, 5, 18]
                        const checkInYear = checkInParts[0]
                        const checkInMonth = checkInParts[1] // 1-12
                        const checkInDay = checkInParts[2]
                        const checkOutYear = checkOutParts[0]
                        const checkOutMonth = checkOutParts[1]
                        const checkOutDay = checkOutParts[2]

                        const currentYear = currentDate.getFullYear()
                        const currentMonth = currentDate.getMonth() + 1 // getMonth() retorna 0-11, mas estamos usando 1-12

                        // Se checkout é antes do mês ou check-in é depois, não mostrar
                        if ((checkOutYear < currentYear) ||
                            (checkOutYear === currentYear && checkOutMonth < currentMonth) ||
                            (checkInYear > currentYear) ||
                            (checkInYear === currentYear && checkInMonth > currentMonth)) {
                          return null
                        }

                        // Calcular dia inicial (dentro do mês visível)
                        let startDay = (checkInYear !== currentYear || checkInMonth !== currentMonth)
                          ? 0.5
                          : checkInDay - 0.5
                        let endDay = (checkOutYear !== currentYear || checkOutMonth !== currentMonth)
                          ? daysInMonth + 0.5
                          : checkOutDay - 0.5

                        // Ainda preciso dos Date objects para cálculos de sobreposição
                        const checkIn = parseLocalDate(reserva.check_in)
                        const checkOut = parseLocalDate(reserva.check_out)

                        // Calcular slot vertical apenas quando há conflito (múltiplas reservas no mesmo dia)
                        let slotIndex = 0
                        for (let i = 0; i < idx; i++) {
                          const otherReserva = aptoReservas[i]
                          const otherCheckIn = parseLocalDate(otherReserva.check_in)
                          const otherCheckOut = parseLocalDate(otherReserva.check_out)

                          // Verificar se há sobreposição
                          const hasOverlap = !(checkOut <= otherCheckIn || checkIn >= otherCheckOut)
                          if (hasOverlap) {
                            slotIndex++
                          }
                        }


                        // Posição em porcentagem (com offset para começar/terminar no meio do dia)
                        const percentStart = (startDay / daysInMonth) * 100
                        const percentEnd = (endDay / daysInMonth) * 100
                        const percentWidth = percentEnd - percentStart
                        const topPosition = (slotIndex * 35) + 4

                        return (
                          <div
                            key={reserva.id}
                            onClick={() => handleSelectReserva(reserva)}
                            className="absolute h-8 rounded cursor-pointer hover:shadow-lg transition-shadow border border-opacity-20 border-gray-700 flex items-center px-2 text-white text-xs font-semibold overflow-hidden"
                            style={{
                              backgroundColor: getColorForPlatform(reserva),
                              left: `${percentStart}%`,
                              width: `${percentWidth}%`,
                              top: `${topPosition}px`,
                            }}
                            title={`${reserva.nome_hospede} - R$ ${Number(reserva.r_reserva).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}`}
                          >
                            <span className="truncate">
                              {reserva.numero_reserva} - {reserva.nome_hospede}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="w-full p-8 text-center text-gray-500">
              <p>Nenhum apartamento encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedReserva.numero_reserva}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Informações principais */}
            <div className="space-y-4 mb-6">
              {/* Hóspede */}
              <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-600">Hóspede</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedReserva.nome_hospede}
                </p>
                {selectedReserva.telefone && (
                  <div className="flex items-center gap-2 mt-2 text-gray-700">
                    <Phone size={16} />
                    <a
                      href={`tel:${selectedReserva.telefone}`}
                      className="hover:underline"
                    >
                      {selectedReserva.telefone}
                    </a>
                  </div>
                )}
              </div>

              {/* Apartamento */}
              <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-600">Apartamento</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedReserva.quartos}
                </p>
              </div>

              {/* Datas */}
              <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Período</p>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    <span className="font-semibold">Check-in:</span>{' '}
                    {format(parseLocalDate(selectedReserva.check_in), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">Check-out:</span>{' '}
                    {format(parseLocalDate(selectedReserva.check_out), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {/* Plataforma */}
              <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-600">Plataforma</p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getColorForPlatform(selectedReserva) }}
                  ></div>
                  <p className="text-gray-900 capitalize font-semibold">
                    {selectedReserva.plataforma}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    <span className="font-semibold">Reserva:</span>{' '}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selectedReserva.status === 'Confirmada'
                          ? 'bg-green-100 text-green-800'
                          : selectedReserva.status === 'Cancelada'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedReserva.status}
                    </span>
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">Pagamento:</span>{' '}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selectedReserva.status_pagamento === 'Pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedReserva.status_pagamento || 'Pendente'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Valor */}
              {selectedReserva.r_reserva && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Valor da Reserva
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {Number(selectedReserva.r_reserva).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              {selectedReserva.telefone && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                >
                  WhatsApp
                </button>
              )}
              {canEdit && (
                <button
                  onClick={handleEditar}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition font-semibold text-sm"
                >
                  Editar
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancelar}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
