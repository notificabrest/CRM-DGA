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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          {deal ? 'Edit Deal' : 'New Deal'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client*
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salesperson*
            </label>
            <select
              value={formData.ownerId || ''}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Salesperson</option>
              {salespeople.map(salesperson => (
                <option key={salesperson.id} value={salesperson.id}>
                  {salesperson.name} ({salesperson.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value*
            </label>
            <input
              type="number"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Probability*
            </label>
            <input
              type="number"
              value={formData.probability || ''}
              onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) })}
              required
              min="0"
              max="1"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status*
            </label>
            <select
              value={formData.statusId || ''}
              onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {pipelineStatuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          {deal ? 'Update Deal' : 'Create Deal'}
        </button>
      </div>
    </form>
  );
};

export default DealForm;