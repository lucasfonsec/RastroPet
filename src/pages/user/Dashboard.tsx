import React from 'react';

export const UserDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Painel</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">Bem-vindo ao RastroPet! Aqui você poderá gerenciar seus pets e emitir alertas.</p>
      </div>
    </div>
  );
};
