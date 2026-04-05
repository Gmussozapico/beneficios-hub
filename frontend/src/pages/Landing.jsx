import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Zap, LayoutGrid, Star, CheckCircle2 } from 'lucide-react';

const PROVIDERS = [
  { name: 'BCI', category: 'Banco', emoji: '🏦' },
  { name: 'Santander', category: 'Banco', emoji: '🏦' },
  { name: 'Banco de Chile', category: 'Banco', emoji: '🏦' },
  { name: 'Itaú', category: 'Banco', emoji: '🏦' },
  { name: 'BancoEstado', category: 'Banco', emoji: '🏦' },
  { name: 'Entel', category: 'Telefonía', emoji: '📱' },
  { name: 'Movistar', category: 'Telefonía', emoji: '📱' },
  { name: 'Claro', category: 'Telefonía', emoji: '📱' },
  { name: 'WOM', category: 'Telefonía', emoji: '📱' },
  { name: 'CMR Falabella', category: 'Retail', emoji: '🛍️' },
  { name: 'Ripley Card', category: 'Retail', emoji: '🛍️' },
  { name: 'La Polar', category: 'Retail', emoji: '🛍️' },
  { name: 'MetLife', category: 'Seguros', emoji: '🛡️' },
  { name: 'Scotiabank', category: 'Banco', emoji: '🏦' },
];

const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Centraliza todo',
    description: 'Agrega todas tus tarjetas, bancos y compañías de teléfono en un solo lugar.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Zap,
    title: 'Descubre beneficios',
    description: 'Explora más de 40 beneficios exclusivos y nunca pierdas un descuento.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Shield,
    title: 'Siempre actualizado',
    description: 'Recibe los últimos descuentos y promociones de todas tus entidades.',
    color: 'from-purple-500 to-purple-600',
  },
];

const TESTIMONIALS = [
  { name: 'María G.', text: 'Ahorro $50.000 al mes usando los beneficios que no sabía que tenía.', rating: 5 },
  { name: 'Carlos R.', text: 'Por fin un lugar donde ver todos mis beneficios juntos. Genial.', rating: 5 },
  { name: 'Ana P.', text: 'Descubrí beneficios de mi tarjeta que llevaban años sin usar.', rating: 5 },
];

export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>+40 beneficios de 16 proveedores</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Todos tus descuentos y
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              beneficios en un lugar
            </span>
          </h1>

          <p className="text-indigo-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Centraliza los beneficios de tus tarjetas de banco, compañías de teléfono y tarjetas de retail.
            Nunca pierdas un descuento por no recordarlo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-lg"
            >
              Comenzar gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-lg"
            >
              Iniciar sesión
            </Link>
          </div>

          <p className="mt-4 text-indigo-300 text-sm">
            Sin tarjeta de crédito requerida · Gratis para siempre
          </p>
        </div>
      </section>

      {/* Providers marquee */}
      <section className="bg-white border-b border-gray-100 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Proveedores incluidos</p>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
          {PROVIDERS.map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl"
            >
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué usar Perksly?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Dejamos de perder descuentos porque simplemente no los recordamos.
              Nosotros los centralizamos por ti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comenzar es muy simple
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis en menos de 1 minuto.' },
              { step: '2', title: 'Agrega tus proveedores', desc: 'Selecciona tus bancos, telefonías y tarjetas de retail.' },
              { step: '3', title: 'Descubre y ahorra', desc: 'Ve todos tus beneficios en un solo tablero.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Lo que dicen nuestros usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
                <p className="font-semibold text-gray-900 text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Empieza a ahorrar hoy mismo
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Únete a miles de chilenos que ya centralizan sus beneficios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg shadow-lg"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-indigo-200 text-sm">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Gratis para siempre</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Sin tarjeta requerida</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Setup en 2 minutos</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Perksly</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Perksly. Hecho con ♥ en Chile.</p>
        </div>
      </footer>
    </div>
  );
}
