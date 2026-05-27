import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, MapPin, Video, BellRing } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1 items-center">
            <PawPrint className="h-8 w-8 text-brand-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RastroPet</span>
          </div>
          <div className="flex flex-1 justify-end space-x-4">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 px-3 py-2">
              Entrar
            </Link>
            <Link to="/register" className="text-sm font-semibold leading-6 bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition">
              Criar Conta
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate px-6 pt-14 lg:px-8 bg-brand-50 min-h-screen flex items-center">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Encontre seu pet com ajuda da Inteligência Artificial
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 mb-10">
              O RastroPet conecta câmeras de segurança pela cidade e utiliza visão computacional para identificar e localizar animais perdidos em tempo real.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link to="/register" className="rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition">
                Começar agora
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                Como funciona <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-brand-600">Busca Inteligente</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Tudo o que você precisa para proteger quem você ama
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-6">
                  <Video size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Monitoramento IA</h3>
                <p className="text-gray-600">Nossa IA analisa horas de vídeos de câmeras cadastradas buscando padrões do seu pet.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-6">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Mapa em Tempo Real</h3>
                <p className="text-gray-600">Veja exatamente onde seu animal foi visto pela última vez através do nosso mapa interativo.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-6">
                  <BellRing size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Alertas Imediatos</h3>
                <p className="text-gray-600">Receba notificações assim que a inteligência artificial encontrar um possível match visual.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
