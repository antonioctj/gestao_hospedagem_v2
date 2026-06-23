import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import PlansSection from '../components/PlansSection'
import Footer from '../components/Footer'

export default function Landpage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="plans">
        <PlansSection />
      </section>
      <Footer />
    </div>
  )
}
