import React, { useState } from 'react';
import { Client, PhoneType, Phone } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, Plus } from 'lucide-react';

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
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Format based on length
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  } else if (numbers.length <= 9) {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
  } else {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)} ${numbers.slice(9, 13)}`;
  }
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
      // Update existing client
      updateClient(client.id, formData);
    } else {
      // Add new client
      addClient(formData as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          {client ? 'Edit Client' : 'New Client'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              name="branchId"
              value={formData.branchId || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status || 'ACTIVE'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Phone Numbers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Phone Numbers</h3>
        
        {formData.phones?.map((phone, index) => (
          <div key={phone.id} className="flex items-center mb-3 space-x-2">
            <select
              value={phone.type}
              onChange={(e) => handlePhoneTypeChange(phone.id, e.target.value as PhoneType)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              placeholder="+55 11 98765 4321"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required={index === 0}
            />
            
            {index > 0 && (
              <button
                type="button"
                onClick={() => removePhone(phone.id)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addPhone}
          className="flex items-center text-sm text-orange-500 hover:text-orange-600"
        >
          <Plus size={16} className="mr-1" />
          Add Phone
        </button>
      </div>
      
      {/* Tags */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Tags</h3>
        
        <div className="flex flex-wrap mb-3 gap-2">
          {formData.tags?.map(tag => (
            <div
              key={tag}
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
            >
              <span className="text-sm text-gray-700">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Observations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Observations</h3>
        
        <div className="mb-4 space-y-3">
          {formData.observations?.map(obs => (
            <div key={obs.id} className="bg-gray-50 p-3 rounded">
              <p className="text-gray-700">{obs.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(obs.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Add a new observation..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={2}
          />
          <button
            type="button"
            onClick={addObservation}
            className="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600"
          >
            Add
          </button>
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
          {client ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;