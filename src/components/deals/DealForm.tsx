import React, { useState } from 'react';
import { Deal, Client } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface DealFormProps {
  deal?: Deal;
  onSave: () => void;
  onCancel: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ deal, onSave, onCancel }) => {
  const { clients, pipelineStatuses, users, addDeal, updateDeal } = useData();
  const { user } = useAuth();

  // Filter users to show only salespeople and managers
  const salespeople = users.filter(u => 
    u.role === UserRole.SALESPERSON || 
    u.role === UserRole.MANAGER ||
    u.role === UserRole.DIRECTOR ||
    u.role === UserRole.ADMIN
  );

  const [formData, setFormData] = useState<Partial<Deal>>(
    deal || {
      title: '',
      clientId: '',
      value: 0,
      probability: 0.5,
      statusId: pipelineStatuses[0]?.id || '',
      ownerId: user?.id || '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deal) {
      updateDeal(deal.id, formData);
    } else {
      addDeal(formData as Omit<Deal, 'id' | 'history' | 'createdAt' | 'updatedAt'>);
    }
    
    onSave();
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-blue-100">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {deal ? 'Editar Negócio' : 'Novo Negócio'}
        </h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {deal ? 'Atualize as informações do negócio' : 'Preencha os dados para criar um novo negócio'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título do Negócio*
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
              placeholder="Ex: Venda de Software Empresarial"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cliente*
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
            >
              <option value="">Selecione um Cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company || 'Sem empresa'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vendedor Responsável*
            </label>
            <select
              value={formData.ownerId || ''}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
            >
              <option value="">Selecione um Vendedor</option>
              {salespeople.map(salesperson => (
                <option key={salesperson.id} value={salesperson.id}>
                  {salesperson.name} ({salesperson.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Valor do Negócio*
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
              <input
                type="number"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Probabilidade de Fechamento*
            </label>
            <div className="relative">
              <input
                type="range"
                value={formData.probability || 0}
                onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) })}
                required
                min="0"
                max="1"
                step="0.1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-semibold text-blue-600">{((formData.probability || 0) * 100).toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status do Pipeline*
            </label>
            <select
              value={formData.statusId || ''}
              onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
            >
              {pipelineStatuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Value Preview */}
        {formData.value && formData.probability && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Valor Esperado</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format((formData.value || 0) * (formData.probability || 0))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">
                  {((formData.probability || 0) * 100).toFixed(0)}% de {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(formData.value || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm sm:text-base"
          >
            {deal ? 'Atualizar Negócio' : 'Criar Negócio'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default DealForm;