import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <img src="/logo.png" alt="UberHost" className="h-10 w-auto mb-4" />
            <p className="text-sm">Solução completa para gestão profissional de hospedagens.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#features" className="hover:text-primary transition">Recursos</Link></li>
              <li><Link to="#plans" className="hover:text-primary transition">Planos</Link></li>
              <li><Link to="#faq" className="hover:text-primary transition">FAQ</Link></li>
              <li><a href="#" className="hover:text-primary transition">Documentação</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-bold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Sobre</a></li>
              <li><a href="#" className="hover:text-primary transition">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition">Contato</a></li>
              <li><a href="#" className="hover:text-primary transition">Carreiras</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-4 text-xl">
              <a href="#" className="hover:text-primary transition">f</a>
              <a href="#" className="hover:text-primary transition">𝕏</a>
              <a href="#" className="hover:text-primary transition">📷</a>
              <a href="#" className="hover:text-primary transition">in</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 UberHost. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition">Privacidade</a>
              <a href="#" className="hover:text-primary transition">Termos</a>
              <a href="#" className="hover:text-primary transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
