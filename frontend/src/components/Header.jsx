import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id) => {
    setIsOpen(false)
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="UberHost" className="h-12 w-auto" />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-orange-600 transition cursor-pointer font-medium">Recursos</button>
          <button onClick={() => scrollToSection('plans')} className="text-gray-700 hover:text-orange-600 transition cursor-pointer font-medium">Planos</button>
          <button onClick={() => scrollToSection('faq')} className="text-gray-700 hover:text-orange-600 transition cursor-pointer font-medium">FAQ</button>
          <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">
            Entrar
          </Link>
        </div>

        {/* Menu Mobile */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-gray-700 hover:text-orange-600">Recursos</button>
          <button onClick={() => scrollToSection('plans')} className="block w-full text-left py-2 text-gray-700 hover:text-orange-600">Planos</button>
          <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-gray-700 hover:text-orange-600">FAQ</button>
          <Link to="/login" className="block w-full bg-orange-600 text-white px-6 py-2 rounded-lg mt-4 text-center hover:bg-orange-700">
            Entrar
          </Link>
        </div>
      )}
    </header>
  )
}
