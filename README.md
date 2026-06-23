# 🏠 UBERHOST - Sistema de Gestão de Hospedagem v2

> **Sistema completo de gestão de propriedades, reservas e finanças para plataformas de hospedagem (Airbnb, Booking.com, etc)**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-100%25%20Funcional-brightgreen)](https://github.com/antonioctj/gestao_hospedagem_v2)
![GitHub last commit](https://img.shields.io/github/last-commit/antonioctj/gestao_hospedagem_v2)

## 📋 Visão Geral

**UBERHOST** é um sistema moderno de gestão de hospedagem que permite gerenciar:
- ✅ Múltiplas propriedades e condominios
- ✅ Reservas em tempo real de várias plataformas
- ✅ Dashboard com métricas financeiras
- ✅ Calendário interativo de ocupação
- ✅ Importação automática de reservas (Booking, Airbnb)
- ✅ Sistema de permissões por módulo
- ✅ Análise financeira completa

## 🚀 Características Principais

### Dashboard Executivo
- 📊 Receita bruta, descontos e lucro líquido
- 📈 Taxa de ocupação e check-ins/check-outs do dia
- 🏢 Desempenho por apartamento
- 💰 Análise financeira detalhada

### Gestão de Reservas
- 📅 Tabela completa com 244+ reservas
- 🔍 Filtros avançados (condominio, status, plataforma, datas)
- 🏷️ Status: Confirmada, Cancelada, Pendente
- 📝 Edição e gerenciamento de reservas
- 💳 Informações de pagamento e comissões

### Calendário Interativo
- 📆 Visualização de ocupação por dia
- 🏠 Múltiplos apartamentos simultâneos
- 🎨 Código de cores por status
- ⚡ Carregamento rápido e responsivo

### Importação de Dados
- 📥 Upload de arquivos Excel/CSV
- 🔗 Suporte para Booking.com e Airbnb
- ⚙️ Processamento inteligente de dados
- ✨ Extração automática de condominio/bloco/apartamento

### Configurações
- ⚙️ Gestão de propriedades e condominios
- 👥 Gerenciamento de usuários
- 📋 Planos de assinatura
- 🔐 Controle de permissões por módulo

## 🛠️ Stack Tecnológico

### Frontend
```
⚛️  React 18+ com Vite
📱 Responsive Design
📊 Recharts para gráficos
🧭 React Router v6
🎨 CSS Modules
📡 Axios para requisições HTTP
🔐 JWT Authentication
```

### Backend
```
🐘 PHP 8+
🗄️  MySQL 5.7+
🔒 JWT (JSON Web Tokens)
📡 API RESTful
🔌 Apache com .htaccess routing
```

### DevOps
```
🐳 Docker ready
📦 npm/yarn para dependências
🔄 Git com versionamento completo
```

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ e npm/yarn
- PHP 8.0+
- MySQL 5.7+
- Apache com mod_rewrite

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Backend

```bash
# Copiar arquivos PHP para pasta do Apache
# Tipicamente: C:\xampp\htdocs\uberhost\

# Importar banco de dados
mysql -u root -p uberhost_dev < database.sql

# Configurar variáveis de ambiente em .env.php
```

## 🔧 Configuração

### Variáveis de Ambiente (Frontend)

```env
# .env
VITE_API_URL=/api
```

### Variáveis de Ambiente (Backend)

```php
// api/config.php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'uberhost_dev');
define('JWT_SECRET', 'sua-chave-secreta-aqui');
```

## 📁 Estrutura do Projeto

```
gestao_hospedagem_v2/
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminReservas.jsx
│   │   │   ├── AdminCalendario.jsx
│   │   │   ├── AdminConfiguracoes.jsx
│   │   │   └── ImportarReservas.jsx
│   │   ├── services/        # API e serviços
│   │   ├── context/         # Context API
│   │   └── styles/          # CSS global
│   ├── vite.config.js       # Configuração Vite
│   └── package.json
│
├── api/
│   ├── config.php           # Configuração e JWT
│   ├── auth.php             # Autenticação
│   ├── dashboard.php        # Endpoint dashboard
│   ├── reservas.php         # Endpoint reservas
│   ├── apartamentos.php     # Endpoint apartamentos
│   ├── propriedades.php     # Endpoint propriedades
│   ├── condominios.php      # Endpoint condominios
│   ├── usuarios.php         # Endpoint usuários
│   ├── planos.php           # Endpoint planos
│   └── configuracoes.php    # Endpoint configurações
│
├── .htaccess                # Rewrite rules
├── database.sql             # Schema do banco
└── README.md
```

## 🔐 Autenticação

Sistema usa **JWT (JSON Web Tokens)** para autenticação:

```javascript
// Login
POST /api/auth.php
{
  "email": "usuario@example.com",
  "password": "senha123"
}

// Response
{
  "token": "eyJhbGc...",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nivel": "super_admin",
    "role": "super_admin"
  }
}
```

## 📡 API Endpoints

### Autenticação
```
POST   /api/auth.php          # Login
GET    /api/me.php            # Dados do usuário atual
POST   /api/logout.php        # Logout
```

### Dashboard
```
GET    /api/dashboard.php     # Métricas gerais
```

### Reservas
```
GET    /api/reservas.php      # Listar reservas
POST   /api/reservas.php      # Criar reserva
PUT    /api/reservas.php      # Atualizar reserva
DELETE /api/reservas.php      # Deletar reserva
POST   /api/reservas.php?action=preview   # Preview de importação
POST   /api/reservas.php?action=importar  # Importar reservas
```

### Apartamentos
```
GET    /api/apartamentos.php  # Listar apartamentos
POST   /api/apartamentos.php  # Criar apartamento
```

### Propriedades
```
GET    /api/propriedades.php  # Listar propriedades
POST   /api/propriedades.php  # Criar propriedade
```

### Condominios
```
GET    /api/condominios.php   # Listar condominios
POST   /api/condominios.php   # Criar condominio
```

## 📊 Dados e Modelos

### Usuário
```php
{
  "id": 1,
  "nome": "Antonio Tavares",
  "email": "antonio.actj@gmail.com",
  "nivel": "super_admin",
  "plano_id": 1,
  "ativo": true,
  "data_criacao": "2024-01-15"
}
```

### Condominio
```php
{
  "id": 1,
  "user_id": 1,
  "nome": "Spazio Único",
  "endereco": "Rua Principal, 100",
  "cidade": "São Paulo",
  "ativo": true
}
```

### Propriedade
```php
{
  "id": 1,
  "condominio_id": 1,
  "user_id": 1,
  "bloco": "63",
  "apartamento": "104",
  "quartos": 2,
  "ativa": true
}
```

### Reserva
```php
{
  "id": 5550417389,
  "propriedade_id": 1,
  "user_id": 1,
  "hospede": "João Silva",
  "email_hospede": "joao@example.com",
  "check_in": "2024-06-20",
  "check_out": "2024-06-25",
  "plataforma": "Booking",
  "status": "Confirmada",
  "receita_bruta": 1500.00,
  "desconto": 100.00,
  "comissao": 150.00,
  "lucro": 1250.00,
  "pgto": "PAGO"
}
```

## 🧪 Testes

### Verificação Manual (Auditoria Completa)

✅ **Todas as 5 páginas funcionando:**
- Dashboard: Receita bruta, descontos, lucro, ocupação 83.3%
- Reservas: 244+ reservas carregadas com filtros
- Calendário: Calendário junho 2026, 6 apartamentos
- Importar: Interface Booking e Airbnb pronta
- Configurações: Propriedades e condominios carregados

### Erros Corrigidos
```
✅ AdminDashboard.jsx (linha 49)
   api.get('/dashboard.php')

✅ AdminCalendario.jsx (linhas 65, 71)
   api.get('/apartamentos.php')
   api.get('/reservas.php')

✅ AdminConfiguracoes.jsx (múltiplas linhas)
   api.get('/propriedades.php')
   api.get('/condominios.php')
   api.get('/usuarios.php')
   api.get('/configuracoes.php')
```

## 📈 Funcionalidades Avançadas

### Importação de Reservas
- **Booking.com**: Extração de data, hóspede, valor
- **Airbnb**: Parsing de título para condominio/bloco/apartamento
- **Processamento**: Validação, deduplicação, cálculo de comissões

### Regras de Cancelamento
- Se Status ≠ OK/Cancelado + Comissão > 0 → Cancelada (valores mantidos)
- Caso contrário → Valores zerados

### Cálculos Financeiros
- **Receita Bruta**: Valor total da reserva
- **Desconto**: Cancelamentos ou deduções
- **Comissão**: Taxa da plataforma
- **Lucro**: Receita - Desconto - Comissão

## 🔄 Fluxo de Sincronização

```
Booking/Airbnb
    ↓
Upload de Arquivo
    ↓
Preview (validação)
    ↓
Importar (banco de dados)
    ↓
Dashboard (atualiza métricas)
    ↓
Calendário (mostra ocupação)
```

## 🐛 Troubleshooting

### Erro: "Erro ao carregar dashboard"
**Solução**: Verificar se `/api/dashboard.php` existe e está retornando JSON válido

### Erro: "Request failed with status code 404"
**Solução**: Confirmar que todos os endpoints têm `.php` (ex: `/api/reservas.php`)

### Erro: "Token inválido"
**Solução**: Fazer novo login para gerar novo JWT token

### Reservas não carregam
**Solução**: Verificar se banco de dados está ativo e tabelas existem

## 📚 Documentação Adicional

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 👤 Autor

**Antonio Tavares**
- 📧 Email: antonio.actj@gmail.com
- 🔗 GitHub: [@antonioctj](https://github.com/antonioctj)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- React e Vite pela excelente developer experience
- Recharts pelos gráficos responsivos
- Axios pelos interceptors de autenticação
- Comunidade open-source PHP e JavaScript

## 📞 Suporte

Para reportar bugs ou sugerir features:
1. Abra uma [Issue](https://github.com/antonioctj/gestao_hospedagem_v2/issues)
2. Descreva o problema com detalhes
3. Inclua screenshots se relevante

---

**Desenvolvido com ❤️ para gerenciar hospedagens de forma inteligente**

⭐ Se este projeto foi útil, considere dar uma star!
