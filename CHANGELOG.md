# Changelog - UBERHOST

## [1.0.0] - 2026-06-23

### ✅ Adicionado
- Sistema de gestão de hospedagem completo
- Dashboard com métricas financeiras
- Tabela de reservas com 244+ registros
- Calendário interativo de ocupação
- Sistema de importação de arquivos (Booking, Airbnb)
- Configurações de propriedades e condominios
- Autenticação JWT
- API RESTful completa

### 🔧 Corrigido
- AdminDashboard.jsx: Adicionado `.php` em endpoint dashboard
- AdminCalendario.jsx: Adicionado `.php` em endpoints apartamentos e reservas
- AdminConfiguracoes.jsx: Adicionado `.php` em todos os endpoints
- Proxy Vite corretamente configurado para `/api`

### 📚 Documentação
- README.md com stack completo
- Instruções de instalação
- Endpoints da API documentados
- Modelos de dados
- Guia de troubleshooting

### 🧪 Testes
- ✅ Dashboard: Funcionando (Receita R$ 88.875,09)
- ✅ Reservas: Funcionando (244+ reservas carregadas)
- ✅ Calendário: Funcionando (Junho 2026, 6 apartamentos)
- ✅ Importar: Funcionando (Interface Booking e Airbnb)
- ✅ Configurações: Funcionando (Propriedades carregadas)

### 🔒 Segurança
- JWT tokens implementados
- Validação de autenticação
- Controle de permissões por módulo
- Proteção de endpoints

## Versões Anteriores

### [0.1.0] - 2026-06-21
- Implementação inicial do sistema
- Modelo de dados com condominio e propriedade
- Sistema de reservas com IDs
