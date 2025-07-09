import React, { useState } from 'react';
import { Client, PhoneType, Phone } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Phone as PhoneIcon, Mail, Building2, User, Tag as TagIcon } from 'lucide-react';

interface ClientFormProps {
  client?: Client;
  onSave: () => void;
  onCancel: () => void;
}

const initialPhones: Phone[] = [
  {
    id: `phone-${Date.now()}`,
    type: PhoneType.MAIN,
    number: '',
    isPrimary: true,
  },
];

const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters and return just numbers
  return value.replace(/\D/g, '');
};

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const { branches, addClient, updateClient } = useData();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: '',
      email: '',
      company: '',
      position: '',
      department: '',
      phones: initialPhones,
      status: 'ACTIVE',
      tags: [],
      branchId: user?.branchIds[0] || '',
      ownerId: user?.id || '',
      observations: [],
      customFields: {},
    }
  );

  const [phoneInput, setPhoneInput] = useState('');
  const [tag, setTag] = useState('');
  const [observation, setObservation] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (id: string, value: string) => {
    const formattedValue = formatPhoneNumber(value);
    setFormData({
      ...formData,
      phones: formData.phones?.map(phone =>
        phone.id === id ? { ...phone, number: formattedValue } : phone
      ) || [],
    });
  };

  const handlePhoneTypeChange = (id: string, type: PhoneType) => {
    setFormData({
      ...formData,
      phones: formData.phones?.map(phone =>
        phone.id === id ? { ...phone, type } : phone
      ) || [],
    });
  };

  const addPhone = () => {
    const newPhone: Phone = {
      id: `phone-${Date.now()}`,
      type: PhoneType.MOBILE,
      number: '',
      isPrimary: false,
    };
    setFormData({
      ...formData,
      phones: [...(formData.phones || []), newPhone],
    });
  };

  const removePhone = (id: string) => {
    setFormData({
      ...formData,
      phones: formData.phones?.filter(phone => phone.id !== id) || [],
    });
  };

  const addTag = () => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag.trim()],
      });
      setTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tagToRemove) || [],
    });
  };

  const addObservation = () => {
    if (observation.trim() && user) {
      const newObservation = {
        id: `obs-${Date.now()}`,
        userId: user.id,
        text: observation.trim(),
        createdAt: new Date(),
      };
      setFormData({
        ...formData,
        observations: [...(formData.observations || []), newObservation],
      });
      setObservation('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (client) {
      updateClient(client.id, formData);
    } else {
      addClient(formData as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    onSave();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-blue-100">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {client ? 'Atualize as informações do cliente' : 'Preencha os dados para cadastrar um novo cliente'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="mr-2 text-blue-500" />
                Nome Completo*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} className="mr-2 text-green-500" />
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Building2 size={16} className="mr-2 text-purple-500" />
                Empresa
              </label>
              <input
                type="text"
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Nome da empresa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cargo
              </label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Cargo na empresa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departamento
              </label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Departamento"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filial*
              </label>
              <select
                name="branchId"
                value={formData.branchId || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="">Selecione uma Filial</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'ACTIVE'}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      
      {/* Phone Numbers */}
      <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <PhoneIcon size={20} className="mr-2 text-green-500" />
          Números de Telefone
        </h3>
        
        {formData.phones?.map((phone, index) => (
          <div key={phone.id} className="flex flex-col sm:flex-row items-start sm:items-center mb-3 space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={phone.type}
              onChange={(e) => handlePhoneTypeChange(phone.id, e.target.value as PhoneType)}
              className="w-full sm:w-auto px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {Object.values(PhoneType).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={phone.number}
              onChange={(e) => handlePhoneChange(phone.id, e.target.value)}
              placeholder="Digite o número"
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              required={index === 0}
            />
            
            {index > 0 && (
              <button
                type="button"
                onClick={() => removePhone(phone.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addPhone}
          className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
        >
          <Plus size={16} className="mr-1" />
          Adicionar Telefone
        </button>
      </div>
      
      {/* Tags */}
      <div className="bg-gradient-to-br from-white to-purple-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <TagIcon size={20} className="mr-2 text-purple-500" />
          Tags
        </h3>
        
        <div className="flex flex-wrap mb-4 gap-2">
          {formData.tags?.map(tag => (
            <div
              key={tag}
              className="flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200"
            >
              <span className="text-sm text-purple-700 font-medium">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-purple-500 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Adicionar uma tag..."
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      {/* Observations */}
      <div className="bg-gradient-to-br from-white to-orange-50 p-4 sm:p-6 rounded-2xl shadow-xl border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
        
        <div className="mb-4 space-y-3">
          {formData.observations?.map(obs => (
            <div key={obs.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <p className="text-gray-700 text-sm">{obs.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(obs.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Adicionar uma nova observação..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
            rows={2}
          />
          <button
            type="button"
            onClick={addObservation}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 font-medium text-sm self-start"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base"
        >
          Cancelar
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm sm:text-base"
        >
          {client ? 'Atualizar Cliente' : 'Criar Cliente'}
        </button>
      </div>
    </div>
  );
};

export default ClientForm;