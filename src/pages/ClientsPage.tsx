import React, { useState } from 'react';
import { 
  Plus, Search, Filter, ArrowDownAZ, ArrowUpAZ, RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import ClientCard from '../components/clients/ClientCard';
import ClientForm from '../components/clients/ClientForm';
import { Client } from '../types';

const ClientsPage: React.FC = () => {
  const { clients, users, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Apply filters and sorting
  const filteredClients = clients
    .filter(client => {
      // Apply status filter
      if (filterStatus !== 'ALL' && client.status !== filterStatus) {
        return false;
      }
      
      // Apply search filter
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.company && client.company.toLowerCase().includes(searchLower)) ||
        client.phones.some(phone => phone.number.includes(searchTerm.replace(/\D/g, '')))
      );
    })
    .sort((a, b) => {
      // Apply sorting
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  const handleNewClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={handleNewClient}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          New Client
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? (
              <ArrowDownAZ size={18} className="text-gray-700" />
            ) : (
              <ArrowUpAZ size={18} className="text-gray-700" />
            )}
          </button>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSortOrder('asc');
              setFilterStatus('ALL');
            }}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Reset filters"
          >
            <RefreshCw size={18} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Show Form or Clients Grid */}
      {showForm ? (
        <ClientForm 
          client={editingClient} 
          onSave={handleFormClose} 
          onCancel={handleFormClose} 
        />
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
          
          {/* Clients Grid */}
          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => {
                const owner = users.find(u => u.id === client.ownerId);
                return (
                  <ClientCard 
                    key={client.id} 
                    client={client} 
                    owner={owner} 
                    onClick={() => handleEditClient(client)}
                    onDelete={handleDeleteClient}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No clients found. Try adjusting your filters or create a new client.</p>
              <button
                onClick={handleNewClient}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Create New Client
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientsPage;