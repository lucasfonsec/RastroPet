import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, MapPin, BellRing, Eye, Shield, Zap, Star, ArrowRight } from 'lucide-react';

const pets = [
  {
    name: 'Rex',
    status: 'Seguro',
    statusColor: 'bg-green-500',
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&auto=format',
  },
  {
    name: 'Luna',
    status: 'Perdida',
    statusColor: 'bg-red-500',
    img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop&auto=format',
  },
  {
    name: 'Thor',
    status: 'Avistado',
    statusColor: 'bg-yellow-500',
    img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop&auto=format',
  },
  {
    name: 'Mel',
    status: 'Encontrada',
    statusColor: 'bg-green-500',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&auto=format',
  },
];

const steps = [
  {
    n: '01',
    icon: PawPrint,
    title: 'Cadastre',
    desc: 'Registre seu pet com fotos. A IA cria uma identidade visual única.',
  },
  {
    n: '02',
    icon: Eye,
    title: 'Detecte',
    desc: 'Câmeras urbanas capturam imagens. Nossa IA identifica animais em tempo real.',
  },
  {
    n: '03',
    icon: BellRing,
    title: 'Alerte',
    desc: 'Match encontrado? Você recebe um alerta instantâneo com a localização.',
  },
];

const features = [
  { icon: Shield, title: 'Segurança total', desc: 'Seus dados e do seu pet protegidos com criptografia de ponta a ponta.' },
  { icon: Zap, title: 'Detecção instantânea', desc: 'Nossa IA analisa frames em milissegundos para máxima velocidade.' },
  { icon: MapPin, title: 'Cobertura urbana', desc: 'Rede crescente de câmeras parceiras em toda a cidade.' },
  { icon: Star, title: '+2.400 pets encontrados', desc: 'Histórico comprovado de reunir famílias com seus pets.' },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-100 overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-cream-200">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">RastroPet</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-brand-500 transition-colors">Como funciona</a>
            <a href="#recursos" className="hover:text-brand-500 transition-colors">Recursos</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-brand-500 transition-colors px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full shadow-brand transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Criar conta grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-brand-200">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                IA + CÂMERAS DE SEGURANÇA
              </span>

              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Encontramos<br />
                seu{' '}
                <span className="text-gradient-brand">pet perdido</span>
                <br />
                com tecnologia
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                RastroPet usa inteligência artificial para vasculhar câmeras de segurança e identificar seu pet
                através de fotos. Rápido, preciso e humano.
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-4 rounded-full shadow-brand transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <PawPrint size={18} />
                  Reportar pet perdido
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-7 py-4 rounded-full border border-gray-200 hover:border-brand-300 hover:text-brand-500 transition-all shadow-card"
                >
                  Ver avistamentos
                  <ArrowRight size={16} />
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {[
                  { value: '2.4k', label: 'Pets encontrados' },
                  { value: '187', label: 'Avistamentos hoje' },
                  { value: '42', label: 'Câmeras ativas' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-brand-500">{s.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — pet grid */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up animation-delay-200">
              {pets.map((pet, i) => (
                <div
                  key={pet.name}
                  className={`relative rounded-2xl overflow-hidden shadow-card group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${i === 0 ? 'mt-8' : i === 1 ? '' : i === 2 ? 'mt-0' : 'mt-4'}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <img
                    src={pet.img}
                    alt={pet.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${pet.statusColor} flex-shrink-0`} />
                    <span className="text-sm font-semibold text-gray-800">{pet.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">• {pet.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Como funciona</h2>
            <p className="text-gray-500 text-lg">Três passos simples para reencontrar seu pet</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className="relative bg-cream-100 rounded-2xl p-8 border border-cream-200 hover:border-brand-200 hover:shadow-card-hover transition-all duration-300 group"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span className="absolute top-6 right-6 text-5xl font-black text-brand-100 group-hover:text-brand-200 transition-colors select-none">
                    {step.n}
                  </span>
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 border border-brand-100 group-hover:bg-brand-100 transition-colors">
                    <Icon size={24} className="text-brand-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section id="recursos" className="py-24 px-6 bg-cream-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Por que o RastroPet?</h2>
            <p className="text-gray-500 text-lg">Tecnologia de ponta para proteger quem você ama</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 border border-brand-100">
                    <Icon size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-brand-500">
        <div className="max-w-3xl mx-auto text-center">
          <PawPrint size={48} className="text-white/40 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Seu pet merece proteção real</h2>
          <p className="text-brand-100 text-lg mb-8">
            Cadastre-se gratuitamente e deixe nossa IA trabalhar por você 24h por dia.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-full hover:bg-cream-100 transition-all shadow-lg hover:-translate-y-1"
          >
            Começar agora — é grátis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <PawPrint size={20} className="text-brand-400" />
            <span className="font-bold">RastroPet</span>
            <span className="text-gray-500 text-sm ml-2">— Encontre seu pet com IA</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 RastroPet. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
