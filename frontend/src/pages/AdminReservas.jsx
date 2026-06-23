import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertCircle, X } from 'lucide-react'
import api from '../services/api'

// Função para formatar moeda brasileira com separador de milhar
const formatarMoeda = (valor) => {
  const num = parseFloat(valor || 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

export default function AdminReservas() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reservas, setReservas] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totals, setTotals] = useState({
    qty_reservas: 0,
    total_reserva: 0,
    total_limpeza: 0,
    total_pet: 0,
    total_geral: 0,
    total_comissao: 0,
    total_outros_desc: 0,
    total_descontos: 0,
    total_rendimento: 0
  })

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    numero_reserva: '',
    condominio_id: '',
    status: '',
    platform: '',
    check_in_mes: '',
    check_in_ano: new Date().getFullYear().toString(),
    check_out_mes: '',
    check_out_ano: new Date().getFullYear().toString(),
    periodo: ''
  })

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Condominios e Propriedades
  const [condominios, setCondominios] = useState([])
  const [propriedades, setPropriedades] = useState([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [formData, setFormData] = useState({
    // Dados básicos
    numero_reserva: '',
    nome_hospede: '',
    telefone: '',
    endereco: '',
    nomes_hospedes: '',
    // Datas e acomodação
    cidade_uf: '',
    condominio_predio: '',
    condominio_id: '',
    bloco_torre: '',
    quartos: '',
    propriedade_id: '',
    check_in: '',
    check_out: '',
    duracao_diarias: 0,
    // Hóspedes
    qtd_adultos: 0,
    qtd_criancas: 0,
    // Financeiro
    r_reserva: 0,
    r_comissao: 0,
    r_tx_limpeza: 0,
    r_tx_pet: 0,
    r_outros_desc: 0,
    // Operacional
    status: 'Pendente',
    politica_cancelamento: 'Flexível',
    plataforma: 'particular',
    motivo_viagem: '',
    forma_pagamento: '',
    status_pagamento: 'Pendente'
  })

  const limit = 25

  // Carregar condominios uma única vez ao montar o componente
  useEffect(() => {
    loadCondominiosAndPropriedades()
  }, [])

  // Carregar reservas quando filtros OU página mudam
  useEffect(() => {
    loadReservas()
  }, [filters, page])

  async function loadReservas() {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit,
        search: filters.search,
        numero_reserva: filters.numero_reserva,
        condominio_id: filters.condominio_id,
        status: filters.status,
        platform: filters.platform,
        check_in_mes: filters.check_in_mes,
        check_in_ano: filters.check_in_ano,
        check_out_mes: filters.check_out_mes,
        check_out_ano: filters.check_out_ano,
        periodo: filters.periodo
      }

      const res = await api.get('/reservas.php', { params })
      setReservas(res.data.data || [])
      setTotal(res.data.total || 0)
      setTotals(res.data.totals || {
        qty_reservas: 0,
        total_reserva: 0,
        total_limpeza: 0,
        total_pet: 0,
        total_geral: 0,
        total_comissao: 0,
        total_outros_desc: 0,
        total_descontos: 0,
        total_rendimento: 0
      })
    } catch (err) {
      setError('Erro ao carregar reservas: ' + err.message)
      console.error('Erro em loadReservas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadCondominiosAndPropriedades() {
    setLoadingDropdowns(true)
    try {
      const [condRes, propRes] = await Promise.all([
        api.get('/condominios.php'),
        api.get('/propriedades.php')
      ])
      setCondominios(condRes.data.condominios || [])
      setPropriedades(propRes.data.propriedades || [])
      console.log('✓ Condominios carregados:', condRes.data.condominios?.length || 0)
      console.log('✓ Propriedades carregadas:', propRes.data.propriedades?.length || 0)
    } catch (err) {
      console.error('Erro ao carregar condominios/propriedades:', err)
    } finally {
      setLoadingDropdowns(false)
    }
  }

  function openNewModal() {
    setEditingId(null)
    setFormData({
      numero_reserva: '',
      nome_hospede: '',
      telefone: '',
      endereco: '',
      nomes_hospedes: '',
      cidade_uf: '',
      condominio_predio: '',
      condominio_id: 0,
      bloco_torre: '',
      quartos: '',
      propriedade_id: 0,
      check_in: '',
      check_out: '',
      duracao_diarias: 0,
      qtd_adultos: 0,
      qtd_criancas: 0,
      r_reserva: 0,
      r_comissao: 0,
      r_tx_limpeza: 0,
      r_tx_pet: 0,
      r_outros_desc: 0,
      status: 'Pendente',
      status_pagamento: 'Pendente',
      forma_pagamento: '',
      politica_cancelamento: 'Flexível',
      plataforma: 'particular',
      motivo_viagem: '',
      observacoes: ''
    })
    loadCondominiosAndPropriedades()
    setShowModal(true)
  }

  function openEditModal(reserva) {
    setEditingId(reserva.id)
    setFormData({
      numero_reserva: reserva.numero_reserva || '',
      nome_hospede: reserva.nome_hospede || '',
      telefone: reserva.telefone || '',
      endereco: reserva.endereco || '',
      nomes_hospedes: reserva.nomes_hospedes || '',
      cidade_uf: reserva.cidade_uf || '',
      condominio_predio: reserva.condominio_predio || '',
      condominio_id: reserva.condominio_id || '',
      bloco_torre: reserva.bloco_torre || '',
      quartos: reserva.quartos || '',
      propriedade_id: reserva.propriedade_id || '',
      check_in: reserva.check_in || '',
      check_out: reserva.check_out || '',
      duracao_diarias: reserva.duracao_diarias || 0,
      qtd_adultos: reserva.qtd_adultos || 0,
      qtd_criancas: reserva.qtd_criancas || 0,
      r_reserva: reserva.r_reserva || reserva.valor_total || 0,
      r_comissao: reserva.r_comissao || 0,
      r_tx_limpeza: reserva.r_tx_limpeza || 0,
      r_tx_pet: reserva.r_tx_pet || 0,
      r_outros_desc: reserva.r_outros_desc || 0,
      status: reserva.status || 'Pendente',
      status_pagamento: reserva.status_pagamento || 'Pendente',
      forma_pagamento: reserva.forma_pagamento || '',
      politica_cancelamento: reserva.politica_cancelamento || 'Flexível',
      plataforma: reserva.plataforma || 'particular',
      motivo_viagem: reserva.motivo_viagem || '',
      observacoes: reserva.observacoes || ''
    })
    loadCondominiosAndPropriedades()
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.nome_hospede || !formData.quartos || !formData.check_in || !formData.check_out) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    // Validar datas
    const checkInDate = new Date(formData.check_in)
    const checkOutDate = new Date(formData.check_out)
    if (checkOutDate <= checkInDate) {
      setError('Data de saída deve ser após entrada')
      return
    }

    setIsSaving(true)
    setError('')

    // Preparar dados para salvar
    const dataToSave = { ...formData }

    // Extrair condominio, bloco e apartamento da coluna quartos se estiverem no formato "Condominio - Bl XX | Apt YYY"
    if (dataToSave.quartos && dataToSave.quartos.includes(' - Bl ') && dataToSave.quartos.includes('|')) {
      const match = dataToSave.quartos.match(/^(.+?)\s*-\s*Bl\s*(\d+)\s*\|\s*Apt\s*(\d+)/)
      if (match) {
        const [, condominio, bloco, apartamento] = match
        dataToSave.condominio_predio = condominio.trim()
        dataToSave.bloco_torre = bloco
        dataToSave.quartos = apartamento
        console.log(`Quartos extraído: condominio="${dataToSave.condominio_predio}", bloco="${bloco}", apto="${apartamento}"`)
      }
    }

    // Converter valores financeiros para números
    dataToSave.r_reserva = parseFloat(dataToSave.r_reserva) || 0
    dataToSave.r_comissao = parseFloat(dataToSave.r_comissao) || 0
    dataToSave.r_tx_limpeza = parseFloat(dataToSave.r_tx_limpeza) || 0
    dataToSave.r_tx_pet = parseFloat(dataToSave.r_tx_pet) || 0
    dataToSave.r_outros_desc = parseFloat(dataToSave.r_outros_desc) || 0

    // Se cancelada, zerar valores financeiros
    if (dataToSave.status === 'Cancelada') {
      dataToSave.r_comissao = 0
      dataToSave.r_tx_limpeza = 0
      dataToSave.r_tx_pet = 0
      dataToSave.r_outros_desc = 0
    }

    // Remover perc_comissao pois é calculado no frontend
    delete dataToSave.perc_comissao

    try {
      console.log('=== INICIANDO SALVAMENTO ===')
      console.log('Modo:', editingId ? `EDIÇÃO (ID: ${editingId})` : 'NOVA RESERVA')
      console.log('Dados financeiros:', {
        r_reserva: dataToSave.r_reserva,
        r_comissao: dataToSave.r_comissao,
        r_tx_limpeza: dataToSave.r_tx_limpeza,
        r_tx_pet: dataToSave.r_tx_pet,
        r_outros_desc: dataToSave.r_outros_desc
      })
      console.log('Dados a enviar:', dataToSave)
      console.log('=========================')

      let response
      if (editingId) {
        console.log(`Enviando PUT para /reservas?id=${editingId}`)
        response = await api.put(`/reservas?id=${editingId}`, dataToSave)
      } else {
        console.log('Enviando POST para /reservas')
        response = await api.post('/reservas', dataToSave)
      }

      console.log('✓ SUCESSO - Resposta da API:', response.data)
      setError('')

      // Mostrar mensagem de sucesso
      const msg = editingId ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!'
      setSuccessMessage(msg)

      // Manter modal aberto por 1 segundo para mostrar sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Carregando reservas atualizadas...')
      await loadReservas()
      console.log('✓ Reservas carregadas')

      setShowModal(false)
      setSuccessMessage('')
    } catch (err) {
      console.error('❌ ERRO ao salvar:')
      console.error('  Status:', err.response?.status)
      console.error('  Dados do erro:', err.response?.data)
      console.error('  Mensagem:', err.message)

      const errorMsg = err.response?.data?.error || err.message || 'Erro ao salvar'
      setError(errorMsg)

      // Mostrar o erro completo no console para debug
      console.error('Detalhes completos do erro:', err)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return

    try {
      await api.delete(`/reservas?id=${id}`)
      loadReservas()
    } catch (err) {
      setError('Erro ao deletar')
    }
  }

  const pages = Math.ceil(total / limit)

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2 items-start">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-600">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Botão Nova Reserva */}
      <div className="flex justify-end">
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
        >
          <Plus size={18} />
          Nova Reserva
        </button>
      </div>

      {/* Filtros - Design Melhorado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search size={16} className="text-blue-600" />
          Filtros
        </h3>

        {/* Linha 1: Condominio, Status, Plataforma, Check-in */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Condominio</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.condominio_id}
              onChange={(e) => {
                setFilters({ ...filters, condominio_id: e.target.value })
                setPage(1)
              }}
            >
              <option value="">Todos</option>
              {condominios.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Status</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPage(1)
              }}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="confirmada">Confirmada</option>
              <option value="check-in">Check-in</option>
              <option value="check-out">Check-out</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Plataforma</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.platform}
              onChange={(e) => {
                setFilters({ ...filters, platform: e.target.value })
                setPage(1)
              }}
            >
              <option value="">Todas</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Particular">Particular</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Check-in</label>
            <input
              type="month"
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.check_in_mes && filters.check_in_ano ? `${filters.check_in_ano}-${String(filters.check_in_mes).padStart(2, '0')}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [ano, mes] = e.target.value.split('-')
                  setFilters({ ...filters, check_in_mes: mes, check_in_ano: ano })
                } else {
                  setFilters({ ...filters, check_in_mes: '', check_in_ano: '' })
                }
                setPage(1)
              }}
            />
          </div>
        </div>

        {/* Linha 2: Check-out, Hóspede, Nº Reserva, Período */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Check-out</label>
            <input
              type="month"
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.check_out_mes && filters.check_out_ano ? `${filters.check_out_ano}-${String(filters.check_out_mes).padStart(2, '0')}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [ano, mes] = e.target.value.split('-')
                  setFilters({ ...filters, check_out_mes: mes, check_out_ano: ano })
                } else {
                  setFilters({ ...filters, check_out_mes: '', check_out_ano: '' })
                }
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Hóspede</label>
            <input
              type="text"
              placeholder="Digite o nome..."
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Nº Reserva</label>
            <input
              type="text"
              placeholder="Digite o número..."
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.numero_reserva}
              onChange={(e) => {
                setFilters({ ...filters, numero_reserva: e.target.value })
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Período</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={filters.periodo}
              onChange={(e) => {
                setFilters({ ...filters, periodo: e.target.value })
                setPage(1)
              }}
            >
              <option value="">Selecionar período</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Carregando...</div>
        ) : reservas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhuma reserva encontrada</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr className="bg-slate-700 text-white text-xs">
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Nº</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Hóspede</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Tel</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Check-in</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Check-out</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">D</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Cond.</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Bloco</th>
                    <th className="px-1.5 py-2 text-left font-semibold whitespace-nowrap">Apto</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">Plat.</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">A</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">C</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">Status</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">Pgto</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-green-700 whitespace-nowrap">Res.</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-green-700 whitespace-nowrap">Limp.</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-green-700 whitespace-nowrap">Pet</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-blue-700 whitespace-nowrap">TOTAL</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-red-700 whitespace-nowrap">Com.</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-red-700 whitespace-nowrap">%</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-red-700 whitespace-nowrap">Out.</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-orange-700 whitespace-nowrap">Desc.</th>
                    <th className="px-1.5 py-2 text-right font-semibold bg-emerald-600 whitespace-nowrap">Lucro</th>
                    <th className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservas.map((r) => {
                    const dias = Math.floor((new Date(r.check_out) - new Date(r.check_in)) / (1000 * 60 * 60 * 24))
                    const telefoneFormatado = r.telefone?.replace(/\D/g, '').replace(/^55/, '')
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition text-xs">
                        <td className="px-1.5 py-1.5 font-medium text-gray-900">{r.numero_reserva || '-'}</td>
                        <td className="px-1.5 py-1.5 text-gray-900 font-medium">{r.nome_hospede}</td>
                        <td className="px-1.5 py-1.5">
                          {r.telefone ? (
                            <a
                              href={`https://wa.me/55${telefoneFormatado}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 underline"
                            >
                              {r.telefone}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 text-gray-600">
                          {(() => {
                            const [year, month, day] = r.check_in.split('-');
                            return `${day}/${month}`;
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-gray-600">
                          {(() => {
                            const [year, month, day] = r.check_out.split('-');
                            return `${day}/${month}`;
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-center font-medium text-gray-900">{dias}</td>
                        <td className="px-1.5 py-1.5 text-gray-600 font-medium">{r.condominio_nome || r.condominio_predio || '-'}</td>
                        <td className="px-1.5 py-1.5 text-gray-600 font-medium">{r.bloco_torre || '-'}</td>
                        <td className="px-1.5 py-1.5 text-gray-600 font-medium">
                          {(() => {
                            const apto = r.apartamento_id || r.quartos || r.propriedade_nome || '-'
                            if (typeof apto === 'string' && apto.includes('Apto')) {
                              const num = apto.replace(/.*Apto\s*/, '')
                              return num || apto
                            }
                            return apto
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-center">
                          <PlatformBadge platform={r.plataforma || r.platform || 'particular'} />
                        </td>
                        <td className="px-1.5 py-1.5 text-center text-gray-600">{r.qtd_adultos || 0}</td>
                        <td className="px-1.5 py-1.5 text-center text-gray-600">{r.qtd_criancas || 0}</td>
                        <td className="px-1.5 py-1.5 text-center">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-1.5 py-1.5 text-center">
                          <PaymentBadge status={r.status_pagamento || 'Pendente'} />
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-medium text-green-700 bg-green-50">
                          {formatarMoeda(r.r_reserva || r.valor_total || 0)}
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-medium text-green-700 bg-green-50">
                          {formatarMoeda(r.r_tx_limpeza || 0)}
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-medium text-green-700 bg-green-50">
                          {formatarMoeda(r.r_tx_pet || 0)}
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-bold text-blue-700 bg-blue-50">
                          {(() => {
                            const totalReserva = parseFloat(r.r_reserva || 0) + parseFloat(r.r_tx_limpeza || 0) + parseFloat(r.r_tx_pet || 0)
                            return formatarMoeda(totalReserva)
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-medium text-red-700 bg-red-50">
                          {formatarMoeda(r.r_comissao || 0)}
                        </td>
                        <td className="px-1.5 py-1.5 text-right text-red-700 bg-red-50 font-medium">{r.perc_comissao || 0}%</td>
                        <td className="px-1.5 py-1.5 text-right font-medium text-red-700 bg-red-50">
                          {formatarMoeda(r.r_outros_desc || 0)}
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-bold text-orange-700 bg-orange-50">
                          {(() => {
                            const totalDescontos = parseFloat(r.r_comissao || 0) + parseFloat(r.r_outros_desc || 0)
                            return formatarMoeda(totalDescontos)
                          })()}
                        </td>
                        <td className={`px-1.5 py-1.5 text-right font-bold ${
                          (() => {
                            const totalReserva = parseFloat(r.r_reserva || 0) + parseFloat(r.r_tx_limpeza || 0) + parseFloat(r.r_tx_pet || 0)
                            const totalDescontos = parseFloat(r.r_comissao || 0) + parseFloat(r.r_outros_desc || 0)
                            const rendimento = totalReserva - totalDescontos
                            return rendimento >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                          })()
                        }`}>
                          {(() => {
                            const totalReserva = parseFloat(r.r_reserva || 0) + parseFloat(r.r_tx_limpeza || 0) + parseFloat(r.r_tx_pet || 0)
                            const totalDescontos = parseFloat(r.r_comissao || 0) + parseFloat(r.r_outros_desc || 0)
                            const rendimento = totalReserva - totalDescontos
                            return formatarMoeda(rendimento)
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 flex gap-0.5 justify-center">
                          <button
                            onClick={() => openEditModal(r)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Editar"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="Cancelar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                {/* Rodapé com Totalizadores */}
                <tfoot className="bg-gray-100 border-t-4 border-gray-400 font-bold text-xs">
                  <tr className="h-12 align-middle">
                    <td colSpan="5" className="px-1.5 py-2 text-right font-extrabold">TOTAIS ({totals.qty_reservas}):</td>
                    <td className="px-1.5 py-2 text-center">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2 text-center">-</td>
                    <td className="px-1.5 py-2 text-center">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2">-</td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-green-700 bg-green-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_reserva || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-green-700 bg-green-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_limpeza || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-green-700 bg-green-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_pet || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-blue-700 bg-blue-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_geral || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-red-700 bg-red-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_comissao || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-center">-</td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-red-700 bg-red-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_outros_desc || 0)}
                    </td>
                    <td className="px-1.5 py-2 text-right font-extrabold text-orange-700 bg-orange-50 whitespace-nowrap">
                      {formatarMoeda(totals.total_descontos || 0)}
                    </td>
                    <td className={`px-1.5 py-2 text-right font-extrabold whitespace-nowrap ${
                      (totals.total_rendimento || 0) >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                    }`}>
                      {formatarMoeda(totals.total_rendimento || 0)}
                    </td>
                    <td className="px-1.5 py-2">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Paginação */}
            {pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex gap-2 justify-center">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg transition ${
                      page === p ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ReservaModal
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isEdit={!!editingId}
          isSaving={isSaving}
          successMessage={successMessage}
          condominios={condominios}
          propriedades={propriedades}
          loadingDropdowns={loadingDropdowns}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const statusLower = status?.toLowerCase() || 'pendente'
  const colors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    'check-in': 'bg-blue-100 text-blue-800',
    'check-out': 'bg-purple-100 text-purple-800',
    cancelada: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[statusLower] || colors.pendente}`}>
      {status}
    </span>
  )
}

function PlatformBadge({ platform }) {
  const platformLower = platform?.toLowerCase() || 'particular'
  const colors = {
    booking: 'bg-orange-100 text-orange-800',
    airbnb: 'bg-pink-100 text-pink-800',
    particular: 'bg-green-100 text-green-800'
  }

  const labels = {
    booking: 'Booking',
    airbnb: 'Airbnb',
    particular: 'Particular'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[platformLower] || colors.particular}`}>
      {labels[platformLower] || platform}
    </span>
  )
}

function PaymentBadge({ status }) {
  const statusLower = status?.toLowerCase() || 'pendente'
  const colors = {
    pago: 'bg-green-100 text-green-800',
    pendente: 'bg-yellow-100 text-yellow-800',
    parcial: 'bg-blue-100 text-blue-800',
    reembolsado: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[statusLower] || colors.pendente}`}>
      {status}
    </span>
  )
}

function ReservaModal({ formData, setFormData, onSave, onClose, isEdit, isSaving, successMessage, condominios, propriedades, loadingDropdowns }) {
  const handleChange = useCallback((field, value) => {
    console.log('handleChange chamado:', field, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [setFormData])

  const handleCondominioChange = useCallback((e) => {
    const id = parseInt(e.target.value) || 0
    console.log('handleCondominioChange:', id, 'target.value:', e.target.value)

    const condominioSelecionado = condominios.find(c => c.id === id)

    // Atualizar tudo de uma vez em um único setState
    setFormData(prev => ({
      ...prev,
      condominio_id: id,
      condominio_predio: condominioSelecionado?.nome || '',
      propriedade_id: 0,
      quartos: '',
      bloco_torre: ''
    }))
  }, [condominios])

  const handlePropriedadeChange = useCallback((e) => {
    const id = parseInt(e.target.value) || 0
    console.log('handlePropriedadeChange:', id, 'target.value:', e.target.value)

    const propriedadeSelecionada = propriedades.find(p => p.id === id)

    // Atualizar tudo de uma vez
    setFormData(prev => ({
      ...prev,
      propriedade_id: id,
      quartos: propriedadeSelecionada?.nome || ''
    }))
  }, [propriedades])

  const handleBlocoChange = useCallback((e) => {
    const bloco = e.target.value
    console.log('handleBlocoChange:', bloco)

    // Atualizar tudo de uma vez
    setFormData(prev => ({
      ...prev,
      bloco_torre: bloco,
      propriedade_id: 0,
      quartos: ''
    }))
  }, [])

  // Filtrar propriedades pelo condominio_id selecionado
  const propriedadesFiltradas = formData.condominio_id
    ? propriedades.filter(p => p.condominio_id == formData.condominio_id)
    : []

  // Extrair blocos únicos para o condominio selecionado
  const blocosFiltrados = formData.condominio_id
    ? [...new Set(
        propriedadesFiltradas
          .filter(p => p.bloco_torre && p.bloco_torre.trim() !== '')
          .map(p => p.bloco_torre)
      )].sort()
    : []

  // Se há bloco selecionado, filtrar apartamentos apenas por esse bloco
  const apartamentosFiltrados = formData.bloco_torre
    ? propriedadesFiltradas.filter(p => p.bloco_torre === formData.bloco_torre)
    : propriedadesFiltradas

  // Verificar se condominio tem blocos
  const temBlocos = blocosFiltrados.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? 'Editar' : 'Nova'} Reserva</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-b border-green-200 p-4 flex items-center gap-2">
            <div className="text-green-600 font-semibold">✓ {successMessage}</div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Seção: Dados Básicos */}
          <div className="bg-blue-50/40 p-4 rounded-lg border border-blue-100/40">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados Básicos</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nº Reserva</label>
                <input
                  type="text"
                  placeholder="Número da reserva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.numero_reserva}
                  onChange={(e) => handleChange('numero_reserva', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Hóspede *</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.nome_hospede}
                  onChange={(e) => handleChange('nome_hospede', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                <input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                <input
                  type="text"
                  placeholder="Endereço completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção: Hóspedes */}
          <div className="bg-purple-50/40 p-4 rounded-lg border border-purple-100/40">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Hóspedes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adultos</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.qtd_adultos}
                  onChange={(e) => handleChange('qtd_adultos', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Crianças</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.qtd_criancas}
                  onChange={(e) => handleChange('qtd_criancas', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Seção: Datas e Acomodação */}
          <div className="bg-amber-50/40 p-4 rounded-lg border border-amber-100/40">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Datas e Acomodação</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cidade/UF</label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo, SP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.cidade_uf}
                    onChange={(e) => handleChange('cidade_uf', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cond/Prédio</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.condominio_id ? String(formData.condominio_id) : ''}
                    onChange={handleCondominioChange}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Selecione um condomínio</option>
                    {condominios.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Bloco/Torre e Apartamento - sempre visíveis */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bloco/Torre</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.bloco_torre}
                    onChange={handleBlocoChange}
                    disabled={formData.condominio_id === 0 || loadingDropdowns}
                  >
                    <option value="">Sem bloco</option>
                    {blocosFiltrados.map(bloco => (
                      <option key={bloco} value={bloco}>{bloco}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apartamento *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.propriedade_id ? String(formData.propriedade_id) : ''}
                    onChange={handlePropriedadeChange}
                    disabled={formData.condominio_id === 0 || loadingDropdowns}
                  >
                    <option value="">Selecione um apartamento</option>
                    {apartamentosFiltrados.map(p => (
                      <option key={p.id} value={String(p.id)}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-in *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.check_in}
                    onChange={(e) => handleChange('check_in', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-out *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.check_out}
                    onChange={(e) => handleChange('check_out', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Financeiro */}
          <div className="bg-green-50/40 p-4 rounded-lg border border-green-100/40">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Financeiro</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">R$ Reserva *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor da reserva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.r_reserva}
                  onChange={(e) => handleChange('r_reserva', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">R$ Comissão</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.r_comissao}
                    onChange={(e) => handleChange('r_comissao', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">% Comissão</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Calculado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-gray-50"
                    value={
                      (() => {
                        const reserva = parseFloat(formData.r_reserva) || 0
                        const limpeza = parseFloat(formData.r_tx_limpeza) || 0
                        const comissao = parseFloat(formData.r_comissao) || 0
                        const divisor = reserva + limpeza
                        return divisor > 0 ? ((comissao / divisor) * 100).toFixed(2) : '0'
                      })()
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">R$ Limpeza</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.r_tx_limpeza}
                    onChange={(e) => handleChange('r_tx_limpeza', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">R$ Pet</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.r_tx_pet}
                    onChange={(e) => handleChange('r_tx_pet', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">R$ Outros/Desc</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.r_outros_desc}
                    onChange={(e) => handleChange('r_outros_desc', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="bg-blue-100/60 p-3 rounded-lg border border-blue-200/60">
                <label className="block text-xs font-medium text-gray-700 mb-2">= Total da Reserva</label>
                <div className="text-lg font-bold text-blue-700">
                  {formatarMoeda(
                    (parseFloat(formData.r_reserva) || 0) +
                    (parseFloat(formData.r_tx_limpeza) || 0) +
                    (parseFloat(formData.r_tx_pet) || 0) -
                    (parseFloat(formData.r_outros_desc) || 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Operacional */}
          <div className="bg-slate-50/40 p-4 rounded-lg border border-slate-100/40">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Operacional</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Check-in">Check-in</option>
                    <option value="Check-out">Check-out</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plataforma</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.plataforma}
                    onChange={(e) => handleChange('plataforma', e.target.value)}
                  >
                    <option value="particular">Particular</option>
                    <option value="booking">Booking</option>
                    <option value="airbnb">Airbnb</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Política de Cancelamento</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={formData.politica_cancelamento}
                  onChange={(e) => handleChange('politica_cancelamento', e.target.value)}
                >
                  <option value="Flexível">Flexível</option>
                  <option value="Reembolsável">Reembolsável</option>
                  <option value="Não Reembolsável">Não Reembolsável</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              isEdit ? 'Atualizar' : 'Criar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
