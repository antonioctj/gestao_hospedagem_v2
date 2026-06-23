import { useState, useEffect } from 'react'
import { Trash2, AlertCircle, Edit2, X, Home, Calendar, Zap, Pencil, Trash, Plus } from 'lucide-react'
import api from '../services/api'

export default function AdminConfiguracoes() {
  const [activeTab, setActiveTab] = useState('propriedades')
  const [activeReservaTab, setActiveReservaTab] = useState('calculo')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [propriedades, setPropriedades] = useState([])
  const [condominios, setCondominios] = useState([])
  const [planos, setPlanos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [configReservas, setConfigReservas] = useState({ colunas: [], formulario: [], parametros: { taxa_limpeza: 15 } })
  const [savedMessage, setSavedMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showModalUsuario, setShowModalUsuario] = useState(false)
  const [editingUsuarioId, setEditingUsuarioId] = useState(null)
  const [formUsuario, setFormUsuario] = useState({ nome: '', email: '', nivel: 'anfitrião', plano_id: null, senha: '', confirmaSenha: '' })
  const [validacaoErro, setValidacaoErro] = useState('')
  const [showModalPlano, setShowModalPlano] = useState(false)
  const [editingPlanoId, setEditingPlanoId] = useState(null)
  const [formPlano, setFormPlano] = useState({ nome: '', descricao: '', preco: '', quantidade_propriedades: 3, quantidade_reservas: 30 })
  const [validacaoErroPlano, setValidacaoErroPlano] = useState('')
  const [showModalPerfil, setShowModalPerfil] = useState(false)
  const [formPerfil, setFormPerfil] = useState({ nome: '', email: '', usuario: '', senha: '', confirmaSenha: '', nivel: 'anfitrião', plano_id: null })
  const [validacaoErroPerfil, setValidacaoErroPerfil] = useState('')
  const [showTabelaProp, setShowTabelaProp] = useState(false)
  const [showModalPropriedade, setShowModalPropriedade] = useState(false)
  const [editingPropriedadeId, setEditingPropriedadeId] = useState(null)
  const [formPropriedade, setFormPropriedade] = useState({
    descricao: '', tipo_propriedade: '', endereco: '', cidade: '', estado: '', cep: '',
    quantidade_quartos: 1, quantidade_hospedes: '', bloco_torre: '', numero_apartamento: '',
    wifi: '', senha_wifi: '', senha_porta: '', senha_bloco: '', condominio_id: null
  })
  const [validacaoErroPropriedade, setValidacaoErroPropriedade] = useState('')

  const [showModalCondominio, setShowModalCondominio] = useState(false)
  const [editingCondominioId, setEditingCondominioId] = useState(null)
  const [formCondominio, setFormCondominio] = useState({ nome: '', tipo: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' })
  const [validacaoErroCondominio, setValidacaoErroCondominio] = useState('')
  const [tiposCondominio] = useState(['Apartamento', 'Studio', 'Flat', 'Casa', 'Pousada', 'Quarto'])

  const sectionColors = {
    'Dados Básicos': 'bg-blue-50 border-blue-100',
    'Datas e Acomodação': 'bg-green-50 border-green-100',
    'Hóspedes': 'bg-purple-50 border-purple-100',
    'Financeiro': 'bg-yellow-50 border-yellow-100',
    'Operacional': 'bg-orange-50 border-orange-100',
    'Customizado': 'bg-pink-50 border-pink-100'
  }

  useEffect(() => {
    carregarTodosDados()
  }, [])

  // Monitor do modal
  useEffect(() => {
    console.log('useEffect: showModalPropriedade mudou para:', showModalPropriedade)
    if (showModalPropriedade) {
      console.log('MODAL DEVE ESTAR VISÍVEL AGORA!')
      console.log('editingPropriedadeId:', editingPropriedadeId)
      console.log('formPropriedade:', formPropriedade)

      // Procurar pelo modal no DOM
      setTimeout(() => {
        const modalElement = document.querySelector('.fixed.inset-0.bg-black')
        console.log('Modal no DOM?', !!modalElement)
        if (modalElement) {
          console.log('✅ Modal encontrado no DOM!')
          console.log('Display:', window.getComputedStyle(modalElement).display)
          console.log('Visibility:', window.getComputedStyle(modalElement).visibility)
          console.log('Opacity:', window.getComputedStyle(modalElement).opacity)
        } else {
          console.log('❌ Modal NÃO encontrado no DOM')
        }
      }, 100)
    }
  }, [showModalPropriedade])

  // Atualizar endereço ao selecionar novo condomínio
  function handleCondominioChange(e) {
    const condominioId = e.target.value ? parseInt(e.target.value) : null
    const condominioSelecionado = condominios.find(c => c.id === condominioId)

    let novoFormulario = { ...formPropriedade, condominio_id: condominioId }

    if (condominioSelecionado) {
      novoFormulario = {
        ...novoFormulario,
        tipo_propriedade: condominioSelecionado.tipo || '',
        cidade: condominioSelecionado.cidade || '',
        estado: condominioSelecionado.estado || '',
        cep: condominioSelecionado.cep || '',
        numero: condominioSelecionado.numero || '',
        rua: condominioSelecionado.rua || condominioSelecionado.endereco || ''
      }
    }

    setFormPropriedade(novoFormulario)
  }

  async function carregarTodosDados() {
    try {
      setLoading(true)
      setError('')

      const userStr = localStorage.getItem('user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      }

      const [propRes, condRes, planosRes, configRes, usuariosRes] = await Promise.all([
        api.get('/propriedades.php').catch(e => {
          console.error('Erro propriedades:', e.message, e.response?.status, e.response?.data)
          return { data: { propriedades: [] } }
        }),
        api.get('/condominios.php').catch(e => {
          console.error('Erro condominios:', e.message, e.response?.status, e.response?.data)
          return { data: { condominios: [] } }
        }),
        api.get('/planos.php').catch(() => ({ data: { planos: [] } })),
        api.get('/configuracoes.php').catch(() => ({ data: { data: { colunas: [], formulario: [], parametros: { taxa_limpeza: 15 } } } })),
        api.get('/usuarios.php').catch(() => ({ data: { usuarios: [] } }))
      ])


      console.log('✓ Setando states:')
      console.log('  - Condominios:', condRes.data.condominios?.length)
      setPropriedades(propRes.data.propriedades || [])
      setCondominios(condRes.data.condominios || [])
      setPlanos(planosRes.data.planos || planosRes.data.data?.planos || [])
      setConfigReservas(configRes.data.data || { colunas: [], formulario: [], parametros: { taxa_limpeza: 15 } })
      setUsuarios(usuariosRes.data.usuarios || [])
      console.log('✓ States definidos')
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function salvarConfigReservas() {
    try {
      setIsSaving(true)
      await api.post('/configuracoes', configReservas)
      setSavedMessage('✓ Configurações salvas com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setError('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  function toggleFieldAtivo(type, id) {
    if (type === 'colunas') {
      setConfigReservas({
        ...configReservas,
        colunas: configReservas.colunas.map(c =>
          c.id === id ? { ...c, ativo: !c.ativo } : c
        )
      })
    } else {
      setConfigReservas({
        ...configReservas,
        formulario: configReservas.formulario.map(f =>
          f.id === id ? { ...f, ativo: !f.ativo } : f
        )
      })
    }
  }

  function updateField(type, id, field, value) {
    if (type === 'colunas') {
      setConfigReservas({
        ...configReservas,
        colunas: configReservas.colunas.map(c =>
          c.id === id ? { ...c, [field]: value } : c
        )
      })
    } else {
      setConfigReservas({
        ...configReservas,
        formulario: configReservas.formulario.map(f =>
          f.id === id ? { ...f, [field]: value } : f
        )
      })
    }
  }

  function removeField(type, id) {
    if (type === 'colunas') {
      setConfigReservas({
        ...configReservas,
        colunas: configReservas.colunas.filter(c => c.id !== id)
      })
    } else {
      setConfigReservas({
        ...configReservas,
        formulario: configReservas.formulario.filter(f => f.id !== id)
      })
    }
  }

  async function editarUsuario(usuario) {
    setEditingUsuarioId(usuario.id)
    setFormUsuario({
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel,
      plano_id: usuario.plano_id,
      senha: '',
      confirmaSenha: ''
    })
    setValidacaoErro('')
    setShowModalUsuario(true)
  }

  async function salvarUsuario() {
    // Validações
    setValidacaoErro('')

    if (!formUsuario.nome || formUsuario.nome.trim().length === 0) {
      setValidacaoErro('Nome é obrigatório')
      return
    }

    if (!formUsuario.email || formUsuario.email.trim().length === 0) {
      setValidacaoErro('Email é obrigatório')
      return
    }

    if (!formUsuario.email.includes('@')) {
      setValidacaoErro('Email inválido')
      return
    }

    if (formUsuario.senha || formUsuario.confirmaSenha) {
      if (formUsuario.senha.length < 6) {
        setValidacaoErro('Senha deve ter no mínimo 6 caracteres')
        return
      }

      if (formUsuario.senha !== formUsuario.confirmaSenha) {
        setValidacaoErro('Senhas não correspondem')
        return
      }
    }

    try {
      setIsSaving(true)
      const payload = {
        nome: formUsuario.nome,
        email: formUsuario.email,
        nivel: formUsuario.nivel,
        plano_id: formUsuario.plano_id
      }

      if (formUsuario.senha) {
        payload.senha = formUsuario.senha
      }

      await api.put(`/usuarios?id=${editingUsuarioId}`, payload)

      // Recarregar lista
      const res = await api.get('/usuarios.php')
      setUsuarios(res.data.usuarios || [])
      setShowModalUsuario(false)
      setSavedMessage('✓ Usuário atualizado com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setValidacaoErro('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function deletarUsuario(id) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return

    try {
      setIsSaving(true)
      await api.delete(`/usuarios?id=${id}`)

      // Recarregar lista
      const res = await api.get('/usuarios.php')
      setUsuarios(res.data.usuarios || [])
      setSavedMessage('✓ Usuário deletado com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setError('Erro ao deletar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function criarOuEditarPlano() {
    // Validações
    setValidacaoErroPlano('')

    if (!formPlano.nome || formPlano.nome.trim().length === 0) {
      setValidacaoErroPlano('Nome do plano é obrigatório')
      return
    }

    if (!formPlano.preco || parseFloat(formPlano.preco) <= 0) {
      setValidacaoErroPlano('Preço deve ser maior que 0')
      return
    }

    if (!formPlano.quantidade_propriedades || parseInt(formPlano.quantidade_propriedades) <= 0) {
      setValidacaoErroPlano('Quantidade de propriedades deve ser maior que 0')
      return
    }

    if (!formPlano.quantidade_reservas || parseInt(formPlano.quantidade_reservas) <= 0) {
      setValidacaoErroPlano('Quantidade de reservas deve ser maior que 0')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        nome: formPlano.nome,
        descricao: formPlano.descricao,
        preco: parseFloat(formPlano.preco),
        quantidade_propriedades: parseInt(formPlano.quantidade_propriedades),
        quantidade_reservas: parseInt(formPlano.quantidade_reservas),
        ativo: 1
      }

      if (editingPlanoId) {
        await api.put(`/planos.php?id=${editingPlanoId}`, payload)
        setSavedMessage('✓ Plano atualizado com sucesso!')
      } else {
        await api.post('/planos.php', payload)
        setSavedMessage('✓ Plano criado com sucesso!')
      }

      // Recarregar lista de planos
      const res = await api.get('/planos.php')
      setPlanos(res.data.planos || [])
      setShowModalPlano(false)
      setEditingPlanoId(null)
      setFormPlano({ nome: '', descricao: '', preco: '', quantidade_propriedades: 3, quantidade_reservas: 30 })
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setValidacaoErroPlano('Erro: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  function editarPlano(plano) {
    setEditingPlanoId(plano.id)
    setFormPlano({
      nome: plano.nome,
      descricao: plano.descricao,
      preco: plano.preco,
      quantidade_propriedades: plano.quantidade_propriedades,
      quantidade_reservas: plano.quantidade_reservas
    })
    setValidacaoErroPlano('')
    setShowModalPlano(true)
  }

  async function deletarPlano(id) {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return

    try {
      setIsSaving(true)
      await api.delete(`/planos.php?id=${id}`)

      // Recarregar lista
      const res = await api.get('/planos.php')
      setPlanos(res.data.planos || [])
      setSavedMessage('✓ Plano deletado com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setError('Erro ao deletar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // PROPRIEDADES CRUD
  function editarPropriedade(propriedade) {
    setEditingPropriedadeId(propriedade.id)

    // Carregar dados do condomínio se existir
    const condominio = condominios.find(c => c.id === propriedade.condominio_id)

    setFormPropriedade({
      descricao: propriedade.descricao || '',
      tipo_propriedade: propriedade.tipo_propriedade || '',
      rua: condominio?.rua || '',
      cidade: condominio?.cidade || '',
      estado: condominio?.estado || '',
      cep: condominio?.cep || '',
      numero: condominio?.numero || '',
      quantidade_quartos: propriedade.quantidade_quartos || 1,
      quantidade_hospedes: propriedade.quantidade_hospedes || '',
      bloco_torre: propriedade.bloco_torre || '',
      numero_apartamento: propriedade.numero_apartamento || '',
      wifi: propriedade.wifi || '',
      senha_wifi: propriedade.senha_wifi || '',
      senha_porta: propriedade.senha_porta || '',
      senha_bloco: propriedade.senha_bloco || '',
      condominio_id: propriedade.condominio_id
    })
    setValidacaoErroPropriedade('')
    setShowModalPropriedade(true)
  }

  function novaPropriedadeNoCond(condominioId) {
    // Verificar limite de plano
    const planoAtual = planos.find(p => p.id === user?.plano_id)
    if (planoAtual && propriedades.length >= planoAtual.quantidade_propriedades) {
      setValidacaoErroPropriedade(`Limite de ${planoAtual.quantidade_propriedades} propriedades atingido. Upgrade seu plano para adicionar mais.`)
      return
    }

    setEditingPropriedadeId(null)
    setFormPropriedade({
      descricao: '', tipo_propriedade: '', endereco: '', cidade: '', estado: '', cep: '',
      quantidade_quartos: 1, quantidade_hospedes: '', bloco_torre: '', numero_apartamento: '',
      wifi: '', senha_wifi: '', senha_porta: '', senha_bloco: '', condominio_id: condominioId
    })
    setValidacaoErroPropriedade('')
    setShowModalPropriedade(true)
  }

  async function salvarPropriedade() {
    setValidacaoErroPropriedade('')

    if (!formPropriedade.numero_apartamento || formPropriedade.numero_apartamento.trim().length === 0) {
      setValidacaoErroPropriedade('Apartamento/Unidade é obrigatório')
      return
    }

    if (!formPropriedade.condominio_id) {
      setValidacaoErroPropriedade('Condomínio é obrigatório')
      return
    }

    // Verificar limite ao criar nova
    if (!editingPropriedadeId) {
      const planoAtual = planos.find(p => p.id === user?.plano_id)
      if (planoAtual && propriedades.length >= planoAtual.quantidade_propriedades) {
        setValidacaoErroPropriedade(`Limite de ${planoAtual.quantidade_propriedades} propriedades atingido`)
        return
      }
    }

    try {
      setIsSaving(true)
      const nomeGerado = formPropriedade.bloco_torre
        ? `${formPropriedade.bloco_torre} ${formPropriedade.numero_apartamento}`
        : formPropriedade.numero_apartamento

      const payload = {
        nome: nomeGerado,
        descricao: formPropriedade.descricao,
        tipo_propriedade: formPropriedade.tipo_propriedade,
        rua: formPropriedade.rua,
        numero: formPropriedade.numero,
        cidade: formPropriedade.cidade,
        estado: formPropriedade.estado,
        cep: formPropriedade.cep,
        quantidade_quartos: parseInt(formPropriedade.quantidade_quartos) || 1,
        quantidade_hospedes: formPropriedade.quantidade_hospedes,
        bloco_torre: formPropriedade.bloco_torre || null,
        numero_apartamento: formPropriedade.numero_apartamento,
        wifi: formPropriedade.wifi,
        senha_wifi: formPropriedade.senha_wifi,
        senha_porta: formPropriedade.senha_porta,
        senha_bloco: formPropriedade.senha_bloco,
        condominio_id: formPropriedade.condominio_id
      }

      if (editingPropriedadeId) {
        await api.put(`/propriedades?id=${editingPropriedadeId}`, payload)
      } else {
        await api.post('/propriedades', payload)
      }

      // Recarregar lista
      const res = await api.get('/propriedades.php')
      setPropriedades(res.data.propriedades || [])
      setShowModalPropriedade(false)
      setSavedMessage('✓ Propriedade ' + (editingPropriedadeId ? 'atualizada' : 'criada') + ' com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setValidacaoErroPropriedade('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function deletarPropriedade(id) {
    try {
      setIsSaving(true)
      await api.delete(`/propriedades?id=${id}`)

      // Recarregar lista
      const res = await api.get('/propriedades.php')
      setPropriedades(res.data.propriedades || [])
      setSavedMessage('✓ Propriedade deletada com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setError('Erro ao deletar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function buscarEnderecoPorCEP(cep) {
    setFormCondominio({ ...formCondominio, cep })

    if (!cep || cep.length < 8) return

    try {
      const cepLimpo = cep.replace(/\D/g, '')
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setFormCondominio(prev => ({
          ...prev,
          cep,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    }
  }

  function editarCondominio(condominio) {
    setEditingCondominioId(condominio.id)
    setFormCondominio({
      nome: condominio.nome || '',
      tipo: condominio.tipo || '',
      rua: condominio.rua || '',
      numero: condominio.numero || '',
      bairro: condominio.bairro || '',
      cidade: condominio.cidade || '',
      estado: condominio.estado || '',
      cep: condominio.cep || ''
    })
    setValidacaoErroCondominio('')
    setShowModalCondominio(true)
  }

  async function salvarCondominio() {
    setValidacaoErroCondominio('')

    if (!formCondominio.nome || formCondominio.nome.trim().length === 0) {
      setValidacaoErroCondominio('Nome do condomínio é obrigatório')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        nome: formCondominio.nome,
        tipo: formCondominio.tipo,
        rua: formCondominio.rua,
        numero: formCondominio.numero,
        bairro: formCondominio.bairro,
        cidade: formCondominio.cidade,
        estado: formCondominio.estado,
        cep: formCondominio.cep
      }

      if (editingCondominioId) {
        await api.put(`/condominios?id=${editingCondominioId}`, payload)
      } else {
        await api.post('/condominios', payload)
      }

      // Recarregar lista
      const res = await api.get('/condominios.php')
      setCondominios(res.data.condominios || [])
      setShowModalCondominio(false)
      setSavedMessage('✓ Condomínio ' + (editingCondominioId ? 'atualizado' : 'criado') + ' com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setValidacaoErroCondominio('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function deletarCondominio(id) {
    try {
      setIsSaving(true)
      await api.delete(`/condominios?id=${id}`)

      // Recarregar lista
      const res = await api.get('/condominios.php')
      setCondominios(res.data.condominios || [])
      setSavedMessage('✓ Condomínio deletado com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setError('Erro ao deletar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function criarPerfil() {
    setValidacaoErroPerfil('')

    if (!formPerfil.nome || formPerfil.nome.trim().length === 0) {
      setValidacaoErroPerfil('Nome é obrigatório')
      return
    }

    if (!formPerfil.email || !formPerfil.email.includes('@')) {
      setValidacaoErroPerfil('Email inválido')
      return
    }

    if (!formPerfil.usuario || formPerfil.usuario.trim().length === 0) {
      setValidacaoErroPerfil('Usuário é obrigatório')
      return
    }

    if (!formPerfil.senha || formPerfil.senha.length < 6) {
      setValidacaoErroPerfil('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formPerfil.senha !== formPerfil.confirmaSenha) {
      setValidacaoErroPerfil('Senhas não correspondem')
      return
    }

    try {
      setIsSaving(true)
      // Usar endpoint de registro do auth.php
      const response = await api.post('/auth.php?action=register', {
        name: formPerfil.nome,
        email: formPerfil.email,
        usuario: formPerfil.usuario,
        password: formPerfil.senha
      })

      // Agora atualizar o nível e plano se necessário
      if (response.data.usuario?.id && (formPerfil.nivel !== 'user' || formPerfil.plano_id)) {
        await api.put(`/usuarios?id=${response.data.usuario.id}`, {
          nivel: formPerfil.nivel,
          plano_id: formPerfil.plano_id
        })
      }

      // Recarregar usuários
      const res = await api.get('/usuarios.php')
      setUsuarios(res.data.usuarios || [])
      setShowModalPerfil(false)
      setFormPerfil({ nome: '', email: '', usuario: '', senha: '', confirmaSenha: '', nivel: 'anfitrião', plano_id: null })
      setSavedMessage('✓ Perfil criado com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      setValidacaoErroPerfil('Erro ao criar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando configurações...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div style={{position: 'fixed', top: '10px', right: '10px', backgroundColor: 'blue', color: 'white', padding: '10px', zIndex: 99999, fontSize: '14px'}}>
        📍 showModalPropriedade: {showModalPropriedade.toString()}
      </div>

      <h1 className="text-3xl font-bold">Configurações</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* ABAS PRINCIPAIS */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {['propriedades', 'reservas', 'perfil', 'planos'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ABA: PROPRIEDADES */}
      {activeTab === 'propriedades' && (
        <div className="space-y-4">
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Seu Plano</h3>
              <p className="text-sm text-blue-800 mt-2">
                <strong>{user.name || 'Usuário'}</strong>
              </p>

              {user.plano_id ? (
                <>
                  <p className="text-sm text-blue-800 mt-1">
                    Plano: <strong>{planos.find(p => p.id === user.plano_id)?.nome || 'Desconhecido'}</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    Limite: <strong>{planos.find(p => p.id === user.plano_id)?.quantidade_propriedades || '∞'}</strong> propriedades
                  </p>
                </>
              ) : (
                <p className="text-sm text-blue-800 mt-1">Plano: <strong>Gratuito</strong></p>
              )}

              <p className="text-sm text-blue-800 mt-2">
                Cadastradas: <strong>{propriedades.length}</strong>
              </p>

              {user.plano_id && (
                <div className="mt-3 bg-white rounded h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{
                      width: `${Math.min(
                        (propriedades.length / (planos.find(p => p.id === user.plano_id)?.quantidade_propriedades || 1)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {user?.nivel === 'super_admin' && (() => {
            const planoAtual = planos.find(p => p.id === user?.plano_id)
            const podeAdicionarMais = !planoAtual || propriedades.length < planoAtual.quantidade_propriedades
            return (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Propriedades</h2>
                <div className="flex gap-2">
                  {podeAdicionarMais && (
                    <button
                      onClick={() => novaPropriedadeNoCond(null)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Adicionar Propriedade
                    </button>
                  )}
                  <button
                    onClick={() => setShowTabelaProp(!showTabelaProp)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    {showTabelaProp ? 'Ver por Condomínio' : 'Ver Tabela'}
                  </button>
                </div>
              </div>

              {showTabelaProp && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Condomínio</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Quartos</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {propriedades.map(prop => (
                        <tr key={prop.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{prop.nome}</td>
                          <td className="px-4 py-3 text-sm">{condominios.find(c => c.id === prop.condominio_id)?.nome || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{prop.tipo_propriedade}</td>
                          <td className="px-4 py-3 text-sm">{prop.quantidade_quartos}</td>
                          <td className="px-4 py-3 text-sm flex gap-2">
                            <button
                              onClick={() => editarPropriedade(prop)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deletarPropriedade(prop.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Deletar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!showTabelaProp && (
                <div className="space-y-6">
                  {condominios.map(cond => {
                    const props = propriedades.filter(p => p.condominio_id === cond.id)
                    const planoAtual = planos.find(p => p.id === user?.plano_id)
                    const podeAdicionarMais = !planoAtual || propriedades.length < planoAtual.quantidade_propriedades

                    return (
                      <div key={cond.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{cond.nome}</h4>
                            <p className="text-xs text-gray-500">{props.length} propriedade(s)</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                console.log('Clicou editar condomínio:', cond.id)
                                editarCondominio(cond)
                              }}
                              title="Editar condomínio"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/edit"
                            >
                              <Edit2 className="w-5 h-5 group-hover/edit:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => {
                                console.log('Clicou deletar condomínio:', cond.id)
                                if (confirm(`Tem certeza que deseja deletar o condomínio "${cond.nome}"?`)) {
                                  deletarCondominio(cond.id)
                                }
                              }}
                              title="Deletar condomínio"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group/delete"
                            >
                              <Trash className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {props.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500 italic">Nenhuma propriedade cadastrada</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {props.map(prop => (
                              <div
                                key={prop.id}
                                className="group relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-300"
                              >
                                {/* Background gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Content */}
                                <div className="relative p-2 flex flex-col justify-between h-full min-h-[120px]">
                                  {/* Número da propriedade */}
                                  <div className="mb-2">
                                    <div className="inline-flex items-baseline gap-0.5 px-2 py-1 bg-blue-50 rounded border border-blue-200">
                                      <span className="text-xs font-medium text-gray-600">
                                        {prop.bloco_torre ? (
                                          <>
                                            <span className="text-gray-500 text-xs">BL</span>
                                            <span className="font-bold text-gray-900 text-xs mx-0.5">{prop.bloco_torre}</span>
                                            <span className="text-gray-400 text-xs">|</span>
                                            <span className="text-gray-500 text-xs mx-0.5">AP</span>
                                            <span className="font-bold text-blue-600 text-xs">{prop.numero_apartamento}</span>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-gray-500 text-xs">AP</span>
                                            <span className="font-bold text-blue-600 text-xs ml-0.5">{prop.numero_apartamento}</span>
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Quartos */}
                                  <div className="mb-2 flex-grow">
                                    <span className="inline-block px-1.5 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                                      {prop.quantidade_quartos}q
                                    </span>
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex gap-1 pt-1.5 border-t border-gray-200">
                                    <button
                                      onClick={() => {
                                        console.log('Clicou editar:', prop.id)
                                        editarPropriedade(prop)
                                      }}
                                      title="Editar propriedade"
                                      className="flex-1 flex items-center justify-center p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors group/edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 group-hover/edit:scale-110 transition-transform" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        console.log('Clicou deletar:', prop.id)
                                        if (confirm('Tem certeza que deseja deletar esta propriedade?')) {
                                          deletarPropriedade(prop.id)
                                        }
                                      }}
                                      title="Deletar propriedade"
                                      className="flex-1 flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors group/delete"
                                    >
                                      <Trash className="w-3.5 h-3.5 group-hover/delete:scale-110 transition-transform" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            )
          })()}

          {user?.nivel !== 'super_admin' && (
            <div className="space-y-3">
              <h3 className="font-semibold">Propriedades por Condomínio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {condominios.map(cond => {
                  const props = propriedades.filter(p => p.condominio_id === cond.id)
                  return (
                    <div key={cond.id} className="border rounded-lg p-3 hover:shadow-md bg-white">
                      <h4 className="font-semibold text-sm">{cond.nome}</h4>
                      <p className="text-xs text-gray-600">{props.length} propriedades</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: RESERVAS */}
      {activeTab === 'reservas' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b">
            {['calculo', 'formulario'].map(subTab => (
              <button
                key={subTab}
                onClick={() => setActiveReservaTab(subTab)}
                className={`px-3 py-2 text-sm font-medium transition ${
                  activeReservaTab === subTab
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-600'
                }`}
              >
                {subTab === 'calculo' ? 'Cálculo de Reservas' : 'Layout do Formulário'}
              </button>
            ))}
          </div>

          {/* SUB-ABA: CÁLCULO DE RESERVAS */}
          {activeReservaTab === 'calculo' && (
            <div className="space-y-4">
              {/* Parâmetros de Cálculo */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Parâmetros de Cálculo</h3>
                <div className="space-y-3">
                  <div className="bg-white border rounded-lg p-4 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxa de Limpeza (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={configReservas.parametros?.taxa_limpeza || 0}
                        onChange={(e) => setConfigReservas({
                          ...configReservas,
                          parametros: { ...configReservas.parametros, taxa_limpeza: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border rounded text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Valor fixo em reais abatido do valor da reserva</p>
                    </div>
                    <button
                      onClick={() => salvarConfigReservas()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>

              {/* Colunas de Cálculo */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Colunas de Cálculo</h3>
                <div className="space-y-3">
                  {configReservas.colunas?.length > 0 ? (
                    configReservas.colunas.map(col => (
                      <div key={col.id} className="bg-white border rounded-lg p-3 flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={col.ativo}
                          onChange={() => toggleFieldAtivo('colunas', col.id)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={col.nome}
                          onChange={(e) => updateField('colunas', col.id, 'nome', e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                        <select
                          value={col.operador}
                          onChange={(e) => updateField('colunas', col.id, 'operador', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option>+</option>
                          <option>-</option>
                          <option>=</option>
                          <option>info</option>
                        </select>
                        <button
                          onClick={() => removeField('colunas', col.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma coluna configurada</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUB-ABA: LAYOUT DO FORMULÁRIO */}
          {activeReservaTab === 'formulario' && (
            <div className="space-y-4">
              {Object.keys(sectionColors).map(section => {
                const fields = configReservas.formulario?.filter(f => f.secao === section) || []
                if (fields.length === 0) return null

                return (
                  <div key={section} className={`border rounded-lg p-4 ${sectionColors[section]}`}>
                    <h3 className="font-semibold mb-3">{section}</h3>
                    <div className="space-y-2">
                      {fields.map(field => (
                        <div key={field.id} className="bg-white border rounded-lg p-3 flex gap-2 items-center flex-wrap">
                          <input
                            type="checkbox"
                            checked={field.ativo}
                            onChange={() => toggleFieldAtivo('formulario', field.id)}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={field.nome}
                            onChange={(e) => updateField('formulario', field.id, 'nome', e.target.value)}
                            placeholder="Nome"
                            className="flex-1 px-2 py-1 border rounded text-sm min-w-[150px]"
                          />
                          <select
                            value={field.tipo}
                            onChange={(e) => updateField('formulario', field.id, 'tipo', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="tel">Telefone</option>
                            <option value="email">Email</option>
                            <option value="date">Data</option>
                            <option value="select">Seleção</option>
                            <option value="textarea">Texto Longo</option>
                          </select>
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={field.obrigatorio}
                              onChange={(e) => updateField('formulario', field.id, 'obrigatorio', e.target.checked)}
                              className="w-4 h-4"
                            />
                            Obrigatório
                          </label>
                          <button
                            onClick={() => removeField('formulario', field.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* BOTÃO SALVAR */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={salvarConfigReservas}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
            {savedMessage && (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">{savedMessage}</div>
            )}
          </div>
        </div>
      )}

      {/* ABA: PERFIL */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Meu Perfil</h2>

            {user && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <p className="px-3 py-2 bg-gray-50 border rounded text-gray-800">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="px-3 py-2 bg-gray-50 border rounded text-gray-800">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                  <p className="px-3 py-2 bg-gray-50 border rounded text-gray-800 capitalize">
                    {user.nivel === 'super_admin' ? 'Super Admin' : user.nivel}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plano Atual</label>
                  <p className="px-3 py-2 bg-gray-50 border rounded text-gray-800">
                    {planos.find(p => p.id === user.plano_id)?.nome || 'Gratuito'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Módulos de Acesso</label>
                  <div className="flex flex-wrap gap-2">
                    {user.modulos && user.modulos.map(mod => (
                      <span key={mod} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {mod === 'dashboard' && 'Dashboard'}
                        {mod === 'calendario' && 'Calendário'}
                        {mod === 'reservas' && 'Reservas'}
                        {mod === 'financeiro' && 'Financeiro'}
                        {mod === 'propriedades' && 'Propriedades'}
                        {mod === 'configuracoes' && 'Configurações'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
                      window.location.href = '/login'
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações</h3>
            <p className="text-sm text-blue-800">
              Para alterar nome, email ou senha, entre em contato com o suporte.
            </p>
          </div>

          {user?.nivel === 'super_admin' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gerenciar Todos os Perfis</h2>
                <button
                  onClick={() => {
                    setFormPerfil({ nome: '', email: '', usuario: '', senha: '', confirmaSenha: '', nivel: 'anfitrião', plano_id: null })
                    setValidacaoErroPerfil('')
                    setShowModalPerfil(true)
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                >
                  + Novo Perfil
                </button>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nível</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Plano</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usuarios.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{u.nome}</td>
                        <td className="px-4 py-3 text-sm">{u.email}</td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {u.nivel === 'super_admin' ? 'Super Admin' : u.nivel}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {planos.find(p => p.id === u.plano_id)?.nome || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          <button
                            onClick={() => editarUsuario(u)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deletarUsuario(u.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {savedMessage && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">{savedMessage}</div>
          )}

          {showModalUsuario && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="border-b p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Editar Usuário</h2>
                  <button onClick={() => setShowModalUsuario(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {validacaoErro && (
                    <div className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm">{validacaoErro}</div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={formUsuario.nome}
                      onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formUsuario.email}
                      onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha (deixar em branco para não alterar)</label>
                    <input
                      type="password"
                      value={formUsuario.senha}
                      onChange={(e) => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  {formUsuario.senha && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                      <input
                        type="password"
                        value={formUsuario.confirmaSenha}
                        onChange={(e) => setFormUsuario({ ...formUsuario, confirmaSenha: e.target.value })}
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Confirme a senha"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                    <select
                      value={formUsuario.nivel}
                      onChange={(e) => setFormUsuario({ ...formUsuario, nivel: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="gerente">Gerente</option>
                      <option value="anfitrião">Anfitrião</option>
                      <option value="manutenção">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                    <select
                      value={formUsuario.plano_id || ''}
                      onChange={(e) => setFormUsuario({ ...formUsuario, plano_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sem Plano</option>
                      {planos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={salvarUsuario}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => setShowModalUsuario(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showModalPerfil && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="border-b p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Criar Novo Perfil</h2>
                  <button onClick={() => setShowModalPerfil(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {validacaoErroPerfil && (
                    <div className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm">{validacaoErroPerfil}</div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={formPerfil.nome}
                      onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formPerfil.email}
                      onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                    <input
                      type="text"
                      value={formPerfil.usuario}
                      onChange={(e) => setFormPerfil({ ...formPerfil, usuario: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      type="password"
                      value={formPerfil.senha}
                      onChange={(e) => setFormPerfil({ ...formPerfil, senha: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <input
                      type="password"
                      value={formPerfil.confirmaSenha}
                      onChange={(e) => setFormPerfil({ ...formPerfil, confirmaSenha: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Confirme a senha"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                    <select
                      value={formPerfil.nivel}
                      onChange={(e) => setFormPerfil({ ...formPerfil, nivel: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="gerente">Gerente</option>
                      <option value="anfitrião">Anfitrião</option>
                      <option value="manutenção">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano (Opcional)</label>
                    <select
                      value={formPerfil.plano_id || ''}
                      onChange={(e) => setFormPerfil({ ...formPerfil, plano_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sem Plano</option>
                      {planos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={criarPerfil}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                    >
                      {isSaving ? 'Criando...' : 'Criar Perfil'}
                    </button>
                    <button
                      onClick={() => setShowModalPerfil(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: PLANOS */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Nossos Planos</h2>
              <p className="text-gray-600 mt-1">Escolha o plano ideal para sua hospedagem</p>
            </div>
            {user?.nivel === 'super_admin' && (
              <button
                onClick={() => {
                  setFormPlano({ nome: '', descricao: '', preco: '', quantidade_propriedades: 3, quantidade_reservas: 30 })
                  setValidacaoErroPlano('')
                  setShowModalPlano(true)
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                + Novo Plano
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planos.sort((a, b) => a.quantidade_propriedades - b.quantidade_propriedades).map((plano, idx) => {
              const colors = ['from-blue-50 to-blue-100/50', 'from-green-50 to-green-100/50', 'from-purple-50 to-purple-100/50', 'from-orange-50 to-orange-100/50']
              const badgeColors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700']

              return (
                <div key={plano.id} className={`bg-gradient-to-br ${colors[idx % 4]} border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden group`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>

                  <div className="relative z-10 space-y-4">
                    {/* Nome e Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{plano.nome}</h3>
                        <p className="text-xs text-gray-600 mt-1">{plano.descricao}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeColors[idx % 4]}`}>
                        Nível {idx + 1}
                      </span>
                    </div>

                    {/* Preço em destaque */}
                    <div className="border-t border-b border-gray-300/50 py-4">
                      <p className="text-gray-600 text-sm">A partir de</p>
                      <p className="text-4xl font-bold text-gray-900">R$ {plano.preco}</p>
                      <p className="text-xs text-gray-600 mt-1">/mês</p>
                    </div>

                    {/* Features em grid */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                        <Home className={`w-6 h-6 flex-shrink-0`} style={{color: ['#3b82f6', '#16a34a', '#a855f7', '#f97316'][idx % 4]}} />
                        <div>
                          <p className="text-xs text-gray-600">Propriedades</p>
                          <p className="font-bold text-lg text-gray-900">{plano.quantidade_propriedades}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                        <Calendar className={`w-6 h-6 flex-shrink-0`} style={{color: ['#3b82f6', '#16a34a', '#a855f7', '#f97316'][idx % 4]}} />
                        <div>
                          <p className="text-xs text-gray-600">Reservas/mês</p>
                          <p className="font-bold text-lg text-gray-900">{plano.quantidade_reservas}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-700 font-medium">Capacidade</span>
                          <span className="text-xs text-gray-600">{Math.round((plano.quantidade_propriedades / planos.reduce((max, p) => Math.max(max, p.quantidade_propriedades), 1)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${badgeColors[idx % 4].split(' ')[0]}`}
                            style={{width: `${(plano.quantidade_propriedades / planos.reduce((max, p) => Math.max(max, p.quantidade_propriedades), 1)) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    {user?.nivel === 'super_admin' && (
                      <div className="flex gap-2 pt-2 border-t border-gray-300/50">
                        <button
                          onClick={() => editarPlano(plano)}
                          className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarPlano(plano.id)}
                          className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {savedMessage && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">{savedMessage}</div>
          )}

          {showModalPlano && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="border-b p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">{editingPlanoId ? 'Editar Plano' : 'Criar Novo Plano'}</h2>
                  <button onClick={() => {
                    setShowModalPlano(false)
                    setEditingPlanoId(null)
                  }} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {validacaoErroPlano && (
                    <div className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm">{validacaoErroPlano}</div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                    <input
                      type="text"
                      value={formPlano.nome}
                      onChange={(e) => setFormPlano({ ...formPlano, nome: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Premium Host"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formPlano.descricao}
                      onChange={(e) => setFormPlano({ ...formPlano, descricao: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder="Descreva o plano..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPlano.preco}
                      onChange={(e) => setFormPlano({ ...formPlano, preco: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="99.90"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Propriedades</label>
                    <input
                      type="number"
                      value={formPlano.quantidade_propriedades}
                      onChange={(e) => setFormPlano({ ...formPlano, quantidade_propriedades: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Reservas</label>
                    <input
                      type="number"
                      value={formPlano.quantidade_reservas}
                      onChange={(e) => setFormPlano({ ...formPlano, quantidade_reservas: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="30"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={criarOuEditarPlano}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                    >
                      {isSaving ? (editingPlanoId ? 'Salvando...' : 'Criando...') : (editingPlanoId ? 'Salvar Plano' : 'Criar Plano')}
                    </button>
                    <button
                      onClick={() => {
                        setShowModalPlano(false)
                        setEditingPlanoId(null)
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: PROPRIEDADE - FORA DA DIV CONDICIONAL */}
      {showModalPropriedade ? (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
          <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px'}}>
              {editingPropriedadeId ? 'Editar Propriedade' : 'Nova Propriedade'}
            </h2>

            {validacaoErroPropriedade && (
              <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', fontSize: '14px'}}>
                {validacaoErroPropriedade}
              </div>
            )}

            {/* SEÇÃO 1: IDENTIFICAÇÃO */}
            <div style={{borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px'}}>
              <div style={{marginBottom: '12px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Condominio/Prédio *</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <select value={formPropriedade.condominio_id || ''} onChange={handleCondominioChange} style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}>
                    <option value="">Selecione um condomínio</option>
                    {condominios.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                  </select>
                  <button
                    onClick={() => {
                      setEditingCondominioId(null)
                      setFormCondominio({ nome: '', tipo: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' })
                      setValidacaoErroCondominio('')
                      setShowModalCondominio(true)
                    }}
                    style={{padding: '8px 12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', minWidth: '40px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                    title="Adicionar novo condominio"
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Tipo</label>
                  <select value={formPropriedade.tipo_propriedade} onChange={(e) => setFormPropriedade({ ...formPropriedade, tipo_propriedade: e.target.value })} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}>
                    <option value="">Selecione um tipo</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Studio">Studio</option>
                    <option value="Flat">Flat</option>
                    <option value="Casa">Casa</option>
                    <option value="Pousada">Pousada</option>
                    <option value="Quarto">Quarto</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Closet </label>
                  <input type="text" value={formPropriedade.cidade} disabled placeholder="Uberlândia" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f9f9f9'}} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Estado </label>
                  <input type="text" value={formPropriedade.estado} disabled placeholder="MG" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f9f9f9'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>CEP </label>
                  <input type="text" value={formPropriedade.cep} disabled style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f9f9f9'}} />
                </div>
              </div>

              <div style={{marginBottom: '12px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Endereço </label>
                <input type="text" value={formPropriedade.rua} disabled placeholder="Rua SU1" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f9f9f9'}} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Bloco/Torre *</label>
                  <input type="text" value={formPropriedade.bloco_torre} onChange={(e) => setFormPropriedade({ ...formPropriedade, bloco_torre: e.target.value })} placeholder="Ex: A, 01" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Apartamento *</label>
                  <input type="text" value={formPropriedade.numero_apartamento} onChange={(e) => setFormPropriedade({ ...formPropriedade, numero_apartamento: e.target.value })} placeholder="Ex: 101, 202, 1001" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Quartos</label>
                  <input type="number" min="1" max="10" value={formPropriedade.quantidade_quartos} onChange={(e) => setFormPropriedade({ ...formPropriedade, quantidade_quartos: parseInt(e.target.value) || 1 })} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Hóspedes</label>
                  <input type="text" value={formPropriedade.quantidade_hospedes} onChange={(e) => setFormPropriedade({ ...formPropriedade, quantidade_hospedes: e.target.value })} placeholder="6" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Descrição</label>
                <textarea value={formPropriedade.descricao} onChange={(e) => setFormPropriedade({ ...formPropriedade, descricao: e.target.value })} placeholder="Notas adicionais (opcional)" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'Arial'}} />
              </div>
            </div>

            {/* SEÇÃO 2: WiFi */}
            <div style={{backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '4px', marginBottom: '15px'}}>
              <h4 style={{fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px'}}>WiFi</h4>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Rede</label>
                  <input type="text" value={formPropriedade.wifi} onChange={(e) => setFormPropriedade({ ...formPropriedade, wifi: e.target.value })} placeholder="Nome da rede" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Senha</label>
                  <input type="text" value={formPropriedade.senha_wifi} onChange={(e) => setFormPropriedade({ ...formPropriedade, senha_wifi: e.target.value })} placeholder="Senha do WiFi" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: DADOS ADICIONAIS */}
            <div style={{backgroundColor: '#fff5f0', padding: '12px', borderRadius: '4px', marginBottom: '15px'}}>
              <h4 style={{fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px'}}>Dados Adicionais</h4>

              <div style={{marginBottom: '12px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Senha Bloco</label>
                <input type="text" value={formPropriedade.senha_bloco} onChange={(e) => setFormPropriedade({ ...formPropriedade, senha_bloco: e.target.value })} placeholder="Senha de acesso ao bloco" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Senha Porta</label>
                <input type="text" value={formPropriedade.senha_porta} onChange={(e) => setFormPropriedade({ ...formPropriedade, senha_porta: e.target.value })} placeholder="Senha de acesso à porta" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={salvarPropriedade} disabled={isSaving} style={{flex: 1, padding: '12px', backgroundColor: '#ff9500', color: 'white', border: 'none', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: isSaving ? 0.6 : 1}}>
                {isSaving ? 'Salvando...' : (editingPropriedadeId ? 'Atualizar' : 'Criar')}
              </button>
              <button onClick={() => setShowModalPropriedade(false)} style={{flex: 1, padding: '12px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL: CONDOMÍNIO */}
      {showModalCondominio ? (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
          <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px'}}>
              {editingCondominioId ? 'Editar Condomínio' : 'Novo Condomínio'}
            </h2>

            {validacaoErroCondominio && (
              <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', fontSize: '14px'}}>
                {validacaoErroCondominio}
              </div>
            )}

            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Nome do Condomínio *</label>
              <input type="text" value={formCondominio.nome} onChange={(e) => setFormCondominio({ ...formCondominio, nome: e.target.value })} placeholder="Ex: Edifício Principal" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
            </div>

            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Tipo</label>
              <select value={formCondominio.tipo} onChange={(e) => setFormCondominio({ ...formCondominio, tipo: e.target.value })} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}>
                <option value="">Selecione um tipo</option>
                {tiposCondominio.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div style={{borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px', marginBottom: '15px'}}>
              <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '10px'}}>ENDEREÇO</h3>

              <div style={{marginBottom: '12px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Rua</label>
                <input type="text" value={formCondominio.rua} onChange={(e) => setFormCondominio({ ...formCondominio, rua: e.target.value })} placeholder="Ex: Rua Principal" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>N°</label>
                  <input type="text" value={formCondominio.numero} onChange={(e) => setFormCondominio({ ...formCondominio, numero: e.target.value })} placeholder="Ex: 123" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Bairro</label>
                  <input type="text" value={formCondominio.bairro} onChange={(e) => setFormCondominio({ ...formCondominio, bairro: e.target.value })} placeholder="Ex: Centro" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>CEP</label>
                  <input type="text" value={formCondominio.cep} onChange={(e) => buscarEnderecoPorCEP(e.target.value)} placeholder="12345-678" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Cidade</label>
                  <input type="text" value={formCondominio.cidade} onChange={(e) => setFormCondominio({ ...formCondominio, cidade: e.target.value })} placeholder="São Paulo" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '13px'}}>Estado</label>
                  <input type="text" value={formCondominio.estado} onChange={(e) => setFormCondominio({ ...formCondominio, estado: e.target.value })} placeholder="SP" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}} />
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={salvarCondominio} disabled={isSaving} style={{flex: 1, padding: '12px', backgroundColor: '#ff9500', color: 'white', border: 'none', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: isSaving ? 0.6 : 1}}>
                {isSaving ? 'Salvando...' : (editingCondominioId ? 'Atualizar' : 'Criar')}
              </button>
              <button onClick={() => setShowModalCondominio(false)} style={{flex: 1, padding: '12px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
