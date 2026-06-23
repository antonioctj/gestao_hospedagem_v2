# UberHost Frontend

Frontend React + Tailwind CSS para o sistema de gerenciamento de hospedagens UberHost.

## 🚀 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas principais
│   ├── layouts/        # Layouts
│   ├── services/       # Serviços de API
│   ├── context/        # Contextos React
│   ├── hooks/          # Hooks customizados
│   ├── utils/          # Funções utilitárias
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Entrada da aplicação
│   └── index.css       # Estilos globais
├── public/             # Arquivos públicos
├── .env.example        # Exemplo de variáveis de ambiente
├── tailwind.config.js  # Configuração do Tailwind
└── vite.config.js      # Configuração do Vite
```

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com a URL da sua API:
```
VITE_API_URL=http://localhost/api
```

## 🏃 Rodando o Projeto

Desenvolvimento:
```bash
npm run dev
```

Build para produção:
```bash
npm run build
```

Preview da build:
```bash
npm run preview
```

## 📚 Stack de Tecnologias

- **React 18** - Biblioteca de UI
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 🚀 Próximas Etapas

- [ ] Página de Login/Registro
- [ ] Dashboard do Admin
- [ ] Painel do Hóspede
- [ ] Formulários de edição
- [ ] Sistema de notificações
