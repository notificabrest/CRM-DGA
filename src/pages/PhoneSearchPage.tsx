import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, UserPlus, Search, ArrowRight, Users, CreditCard, 
  Building2, Mail, Tag, Filter, X, Sparkles, Target,
  TrendingUp, Clock, Star
} from 'lucide-react';
import { useData } from '../context/DataContext';
import PhoneSearchInput from '../components/common/PhoneSearchInput';
import ClientCard from '../components/clients/ClientCard';
import ClientForm from '../components/clients/ClientForm';
import { PhoneType } from '../types';

const PhoneSearchPage: React.FC = () => {
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const navigate = useNavigate();
  const { clients, users, deals, pipelineStatuses, getClientByPhone, deleteClient } = useData();
  
  const [searchTerm, setSearchTerm] = useState(phoneNumber || '');
  const [searchResults, setSearchResults] = useState<any>({
    clients: [],
    deals: [],
    phones: []
  });
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchType, setSearchType] = useState<'all' | 'phone' | 'name' | 'email' | 'company'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Perform comprehensive search
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults({ clients: [], deals: [], phones: [] });
      setSearchInitiated(false);
      return;
    }

    setIsLoading(true);
    setSearchInitiated(true);

    const searchLower = term.toLowerCase();
    const phoneDigits = term.replace(/\D/g, '');

    // Search clients
    const matchingClients = clients.filter(client => {
      if (searchType === 'all' || searchType === 'name') {
        if (client.name.toLowerCase().includes(searchLower)) return true;
      }
      if (searchType === 'all' || searchType === 'email') {
        if (client.email.toLowerCase().includes(searchLower)) return true;
      }
      if (searchType === 'all' || searchType === 'company') {
        if (client.company && client.company.toLowerCase().includes(searchLower)) return true;
      }
      if (searchType === 'all' || searchType === 'phone') {
        if (client.phones.some(phone => phone.number.replace(/\D/g, '').includes(phoneDigits))) return true;
      }
      return false;
    });

    // Search deals
    const matchingDeals = deals.filter(deal => {
      const client = clients.find(c => c.id === deal.clientId);
      return deal.title.toLowerCase().includes(searchLower) ||
             (client && client.name.toLowerCase().includes(searchLower));
    });

    // Search phone numbers specifically
    const phoneMatches = clients.filter(client =>
      client.phones.some(phone => phone.number.replace(/\D/g, '').includes(phoneDigits))
    );

    setSearchResults({
      clients: matchingClients,
      deals: matchingDeals,
      phones: phoneMatches
    });

    setTimeout(() => setIsLoading(false), 500);
  };

  // Handle search when component mounts with a phone number in URL
  useEffect(() => {
    if (phoneNumber) {
      setSearchTerm(phoneNumber);
      performSearch(phoneNumber);
    }
  }, [phoneNumber]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    performSearch(term);
    if (term.replace(/\D/g, '').length >= 8) {
      navigate(`/phone-search/${term.replace(/\D/g, '')}`);
    }
  };

  const handleNewClient = (phoneNumber?: string) => {
    setSelectedClient(phoneNumber ? {
      id: '',
      name: '',
      email: '',
      phones: [
        {
          id: `phone-${Date.now()}`,
          type: PhoneType.MAIN,
          number: phoneNumber,
          isPrimary: true,
        }
      ],
      branchId: '',
      ownerId: '',
      status: 'ACTIVE',
      tags: [],
      observations: [],
      customFields: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } : undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setShowDetails(false);
    setSelectedClient(null);
    // Refresh search after creating/editing a client
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  const handleViewDetails = (client: any) => {
    setSelectedClient(client);
    setShowDetails(true);
    setShowForm(true);
  };

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    performSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults({ clients: [], deals: [], phones: [] });
    setSearchInitiated(false);
    navigate('/phone-search');
  };

  const getStatusColor = (statusId: string) => {
    const status = pipelineStatuses.find(s => s.id === statusId);
    return status?.color || '#6B7280';
  };

  const getStatusName = (statusId: string) => {
    const status = pipelineStatuses.find(s => s.id === statusId);
    return status?.name || 'Unknown';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
            <Search size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Busca Inteligente
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Encontre clientes, negócios e contatos de forma rápida e eficiente
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl border border-blue-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Search Type Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { key: 'all', label: 'Tudo', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
                { key: 'phone', label: 'Telefone', icon: Phone, color: 'from-blue-500 to-cyan-500' },
                { key: 'name', label: 'Nome', icon: Users, color: 'from-green-500 to-emerald-500' },
                { key: 'email', label: 'Email', icon: Mail, color: 'from-orange-500 to-red-500' },
                { key: 'company', label: 'Empresa', icon: Building2, color: 'from-indigo-500 to-purple-500' }
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setSearchType(key as any)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    searchType === key
                      ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 select-text"
                placeholder={`Buscar por ${searchType === 'all' ? 'qualquer campo' : 
                  searchType === 'phone' ? 'número de telefone' :
                  searchType === 'name' ? 'nome do cliente' :
                  searchType === 'email' ? 'email' : 'empresa'}...`}
                inputMode={searchType === 'phone' ? 'tel' : 'text'}
                autoComplete={searchType === 'phone' ? 'tel' : searchType === 'email' ? 'email' : 'off'}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleNewClient()}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Novo Cliente
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Users size={18} className="mr-2" />
                Ver Todos os Clientes
              </button>
              <button
                onClick={() => navigate('/pipeline')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <CreditCard size={18} className="mr-2" />
                Pipeline de Vendas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results or Form */}
      {showForm ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <ClientForm 
            onSave={handleFormClose} 
            onCancel={handleFormClose}
            client={selectedClient}
          />
        </div>
      ) : (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-600 font-medium">Buscando...</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchInitiated && !isLoading && (
            <div className="space-y-8">
              {/* Results Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Resultados da Busca</h2>
                    <p className="text-gray-600 mt-1">
                      Encontrados {searchResults.clients.length} clientes, {searchResults.deals.length} negócios
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      "{searchTerm}"
                    </span>
                    <button
                      onClick={clearSearch}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clients Results */}
              {searchResults.clients.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Users className="mr-2" size={20} />
                      Clientes Encontrados ({searchResults.clients.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.clients.map((client: any) => {
                        const owner = users.find(u => u.id === client.ownerId);
                        return (
                          <div key={client.id} className="transform hover:scale-105 transition-all duration-200">
                            <ClientCard 
                              client={client} 
                              owner={owner} 
                              onClick={() => handleViewDetails(client)}
                              onDelete={handleDeleteClient}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Deals Results */}
              {searchResults.deals.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <CreditCard className="mr-2" size={20} />
                      Negócios Encontrados ({searchResults.deals.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.deals.map((deal: any) => {
                        const client = clients.find(c => c.id === deal.clientId);
                        const owner = users.find(u => u.id === deal.ownerId);
                        return (
                          <div 
                            key={deal.id} 
                            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
                            onClick={() => navigate('/pipeline')}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-gray-900 text-lg">{deal.title}</h4>
                              <div 
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getStatusColor(deal.statusId) }}
                              >
                                {getStatusName(deal.statusId)}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-gray-600">
                                <Users size={16} className="mr-2" />
                                <span className="text-sm">{client?.name}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <Target size={16} className="mr-2" />
                                <span className="text-sm font-medium">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(deal.value)}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <TrendingUp size={16} className="mr-2" />
                                <span className="text-sm">{(deal.probability * 100).toFixed(0)}% probabilidade</span>
                              </div>
                              
                              {owner && (
                                <div className="flex items-center text-gray-600">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                                    {owner.avatar ? (
                                      <img src={owner.avatar} alt={owner.name} className="w-full h-full rounded-full" />
                                    ) : (
                                      <span className="text-xs font-medium text-white">
                                        {owner.name.substring(0, 2).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm">{owner.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.clients.length === 0 && searchResults.deals.length === 0 && (
                <div className="text-center py-16">
                  <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Não encontramos nenhum cliente ou negócio que corresponda à sua busca por "{searchTerm}".
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => handleNewClient(searchTerm.replace(/\D/g, '') || undefined)}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Criar Novo Cliente
                    </button>
                    <button
                      onClick={clearSearch}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Search size={18} className="mr-2" />
                      Nova Busca
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome State */}
          {!searchInitiated && !isLoading && (
            <div className="text-center py-16">
              <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-8">
                <Sparkles size={40} className="text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Busca Inteligente</h3>
              <p className="text-gray-500 mb-8 max-w-2xl mx-auto text-lg">
                Use nossa busca avançada para encontrar rapidamente clientes por telefone, nome, email, empresa ou negócios. 
                Digite qualquer termo no campo acima para começar.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4">
                    <Users size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{clients.length}</h4>
                  <p className="text-gray-600">Clientes Cadastrados</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto mb-4">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{deals.length}</h4>
                  <p className="text-gray-600">Negócios Ativos</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mx-auto mb-4">
                    <Phone size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {clients.reduce((total, client) => total + client.phones.length, 0)}
                  </h4>
                  <p className="text-gray-600">Telefones Cadastrados</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneSearchPage;