import React, { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, Eye, Download } from 'lucide-react'
import api from '../services/api'

const ImportarReservas = () => {
  const [file, setFile] = useState(null)
  const [platform, setPlatform] = useState('booking')
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error', 'info'
  const [showPreview, setShowPreview] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  const processFile = (selectedFile) => {
    if (!selectedFile.name.match(/\.(xlsx?|xls|csv)$/i)) {
      setMessage('Por favor, selecione um arquivo válido (.xls, .xlsx ou .csv)')
      setMessageType('error')
      return
    }
    setFile(selectedFile)
    setMessage('')
    setPreview([])
    setResult(null)
  }

  const processExcelFile = async () => {
    if (!file) {
      setMessage('Selecione um arquivo primeiro')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('Processando arquivo...')
    setMessageType('info')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('platform', platform)

      // Usar fetch nativo para garantir que FormData é enviado corretamente
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservas.php?action=preview', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.sucesso) {
        throw new Error(data.error || 'Erro desconhecido')
      }

      setPreview(data.dados || [])
      setMessage(`${data.dados.length} reservas prontas para importar`)
      setMessageType('success')
      setShowPreview(true)
    } catch (err) {
      console.error('Erro:', err)
      setMessage(err.message || 'Erro ao processar arquivo')
      setMessageType('error')
      setPreview([])
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      setMessage('Nenhuma reserva para importar')
      setMessageType('error')
      return
    }

    const confirmImport = window.confirm(
      `Tem certeza que deseja importar ${preview.length} reserva(s)?`
    )

    if (!confirmImport) return

    setImporting(true)
    setMessage('Importando reservas...')
    setMessageType('info')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservas.php?action=importar', {
        method: 'POST',
        body: JSON.stringify({
          reservas: preview,
          plataforma: platform
        }),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setResult(data)
      setMessage(`✓ ${data.importadas || 0} reservas importadas com sucesso!`)
      setMessageType('success')
      setFile(null)
      setPreview([])
      setShowPreview(false)

      // Limpar input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      // Manter mensagem por 3 segundos, mas resultado fica permanente
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setMessage(err.message || 'Erro ao importar')
      setMessageType('error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Importar Reservas
          </h1>
          <p className="text-slate-600">
            Importe suas reservas de plataformas de hospedagem
          </p>
        </div>

        {/* Platform Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Selecione a Plataforma
          </h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setPlatform('booking')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                platform === 'booking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Booking.com
            </button>
            <button
              onClick={() => setPlatform('airbnb')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                platform === 'airbnb'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Airbnb
            </button>
          </div>

          {/* Instruções por Plataforma */}
          {platform === 'booking' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Formato Booking.com</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Exporte o relatório de reservas do Booking em formato Excel (.xlsx) ou CSV</li>
                <li>✓ Deve conter colunas: Confirmação, Hóspede, Check-in, Check-out, Valor, etc.</li>
                <li>✓ O sistema mapeia automaticamente para os apartamentos</li>
              </ul>
            </div>
          )}

          {platform === 'airbnb' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">🏠 Formato Airbnb</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✓ Exporte o arquivo de ganhos (Earnings) do Airbnb em CSV</li>
                <li>✓ Deve conter: Código de Confirmação, Hóspede, Check-in/out, Ganhos Brutos, etc.</li>
                <li>✓ Linhas com "Recebimento do coanfitrião" (negativas) já foram removidas</li>
                <li>✓ O sistema mapeia automaticamente baseado no nome do anúncio</li>
              </ul>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-lg shadow-sm p-8 border-2 border-dashed mb-6 text-center transition ${
            dragActive
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400'
          }`}
        >
          <Upload
            className={`mx-auto mb-4 ${
              dragActive ? 'text-blue-600' : 'text-slate-400'
            }`}
            size={48}
          />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Arraste seu arquivo aqui ou clique para selecionar
          </h3>
          <p className="text-slate-600 mb-6">
            Suportado: Arquivos Excel (.xls, .xlsx) ou CSV
          </p>

          <input
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <button
              onClick={() => document.getElementById('file-input').click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
            >
              Selecionar Arquivo
            </button>
          </label>

          {file && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-medium">✓ {file.name}</p>
              <p className="text-sm text-blue-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={processExcelFile}
            disabled={!file || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Eye size={20} />
            {loading ? 'Processando...' : 'Visualizar'}
          </button>

          <button
            onClick={handleImport}
            disabled={preview.length === 0 || importing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <CheckCircle size={20} />
            {importing ? 'Importando...' : `Importar (${preview.length})`}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 flex items-gap-3 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : messageType === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5 mr-3" />
            <span>{message}</span>
          </div>
        )}

        {/* Resultado da Importação */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                📊 Resultado da Importação
              </h3>
              <button
                onClick={() => setResult(null)}
                className="text-slate-400 hover:text-slate-600 transition"
                title="Fechar resultado"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-1">Novas Reservas</p>
                <p className="text-3xl font-bold text-green-700">
                  {result.importadas || 0}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Atualizadas</p>
                <p className="text-3xl font-bold text-blue-700">
                  {result.atualizadas || 0}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-slate-600 mb-1">Protegidas</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {result.protegidas || 0}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Processadas</p>
                <p className="text-3xl font-bold text-slate-700">
                  {result.total_processadas || 0}
                </p>
              </div>
            </div>

            {result.erros && result.erros.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-700 mb-2">
                  ⚠️ Erros encontrados:
                </p>
                <ul className="text-sm text-red-600">
                  {result.erros.map((erro, idx) => (
                    <li key={idx}>• {erro}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Preview Section */}
        {showPreview && preview.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 overflow-x-auto">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Prévia de Importação ({preview.length} reserva{preview.length !== 1 ? 's' : ''})
            </h2>

            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Nº Reserva
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Hóspede
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Check-in
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Check-out
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Condominio
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Bloco
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Apto
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Preço
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Comissão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {preview.slice(0, 10).map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 text-slate-700 font-medium">
                      {r.numero_reserva}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {r.nome_hospede}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {new Date(r.check_in).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {new Date(r.check_out).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {r.condominio_predio || '-'}
                    </td>
                    <td className="px-4 py-2 text-slate-700 font-medium">
                      {r.bloco_torre || '-'}
                    </td>
                    <td className="px-4 py-2 text-slate-700 font-medium">
                      {r.quartos || '-'}
                    </td>
                    <td className="px-4 py-2 text-green-700 font-medium">
                      R$ {parseFloat(r.r_reserva || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-red-700 font-medium">
                      R$ {parseFloat(r.r_comissao || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {preview.length > 10 && (
              <p className="mt-4 text-sm text-slate-600">
                Mostrando 10 de {preview.length} reservas
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportarReservas
