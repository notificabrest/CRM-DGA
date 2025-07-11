import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, UserPlus, Search, ArrowRight, Users, CreditCard, Building2, Mail, Tag, Filter, X, Sparkles, Target,
  TrendingUp, Clock, Star, History, BarChart3, Calendar, DollarSign, Eye, Trash2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import PhoneSearchInput from '../components/common/PhoneSearchInput';
import ClientCard from '../components/clients/ClientCard';
import ClientForm from '../components/clients/ClientForm';
import { PhoneType, Deal } from '../types';
import searchHistoryManager, { SearchHistoryEntry } from '../utils/searchHistory';

const PhoneSearchPage: React.FC = () => {
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const navigate = useNavigate();
  const { clients, users, deals, pipelineStatuses, getClientByPhone, deleteClient } = useData();
  
  const [searchTerm, setSearchTerm] = useState(phoneNumber || '');
  const [searchResults, setSearchResults] = useState<any>({
    clients: [],
    deals: [],
    phones: [],
    clientDeals: []
  });
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchType, setSearchType] = useState<'all' | 'phone' | 'name' | 'email' | 'company'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

  // Load search history on component mount
  useEffect(() => {
    setSearchHistory(searchHistoryManager.getHistory());
  }, []);

  // Perform comprehensive search
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults({ clients: [], deals: [], phones: [], clientDeals: [] });
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

    // Get deals for found clients
    const clientDeals = matchingClients.length > 0 
      ? deals.filter(deal => matchingClients.some(client => client.id === deal.clientId))
      : [];

    // Add to search history
    if (searchType === 'phone' || searchType === 'all') {
      const foundClient = matchingClients[0];
      searchHistoryManager.addSearch({
        phoneNumber: phoneDigits,
        clientFound: !!foundClient,
        clientName: foundClient?.name,
        dealsCount: clientDeals.length,
        url: window.location.href
      });
      setSearchHistory(searchHistoryManager.getHistory());
    }

    setSearchResults({
      clients: matchingClients,
      deals: matchingDeals,
      phones: phoneMatches,
      clientDeals
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
    // Don't set selectedClient for new clients, just pass the phone number
    setSelectedClient(undefined);
    
    // If we have a phone number, we'll handle it in the form component
    if (phoneNumber) {
      // Store the phone number to be used by the form
      sessionStorage.setItem('newClientPhone', phoneNumber);
    }
    
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
    setSearchResults({ clients: [], deals: [], phones: [], clientDeals: [] });
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

  const handleViewDeal = (deal: Deal) => {
    navigate('/pipeline');
  };

  const handleDeleteHistory = (id: string) => {
    searchHistoryManager.removeSearch(id);
    setSearchHistory(searchHistoryManager.getHistory());
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de buscas?')) {
      searchHistoryManager.clearHistory();
      setSearchHistory([]);
    }
  };

  const getSearchStats = () => {
    return searchHistoryManager.getSearchStats();
  };

  return (
    <div className="space-y-4 sm:space-y-8 p-2 sm:p-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-3 sm:p-4 rounded-full shadow-lg">
            <Search size={24} className="text-white sm:w-8 sm:h-8" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Busca Inteligente
        </h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">
          Encontre clientes, negócios e contatos de forma rápida e eficiente
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 p-4 sm:p-8 rounded-2xl shadow-xl border border-blue-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 sm:gap-6">
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
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    searchType === key
                      ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
                  }`}
                >
                  <Icon size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="text-gray-400 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 select-text shadow-sm"
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
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => handleNewClient()}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <UserPlus size={16} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                Novo Cliente
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <Users size={16} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                Ver Todos os Clientes
              </button>
              <button
                onClick={() => navigate('/pipeline')}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <CreditCard size={16} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                Pipeline de Vendas
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <History size={16} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                Histórico ({searchHistory.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results or Form */}
      {showForm ? (
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <ClientForm 
            onSave={handleFormClose} 
            onCancel={handleFormClose}
            client={selectedClient}
          />
        </div>
      ) : showHistory ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <History className="mr-2" size={18} />
                Histórico de Buscas ({searchHistory.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAllHistory}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Limpar Tudo
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-white hover:bg-gray-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Search Stats */}
          {searchHistory.length > 0 && (
            <div className="p-4 sm:p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(() => {
                  const stats = getSearchStats();
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.totalSearches}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Total de Buscas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-green-600">{stats.successfulSearches}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Encontrados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
                        <div className="text-xs sm:text-sm text-gray-500">Taxa de Sucesso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.totalDealsFound}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Negócios</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          
          <div className="p-3 sm:p-6">
            {searchHistory.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {searchHistory.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{entry.phoneNumber}</span>
                          {entry.clientFound ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Encontrado
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              Não encontrado
                            </span>
                          )}
                        </div>
                        
                        {entry.clientName && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Users size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{entry.clientName}</span>
                          </div>
                        )}
                        
                        {entry.dealsCount > 0 && (
                          <div className="flex items-center space-x-2 mb-1">
                            <CreditCard size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{entry.dealsCount} negócio(s)</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {entry.searchDate.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSearchTerm(entry.phoneNumber);
                            performSearch(entry.phoneNumber);
                            setShowHistory(false);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Buscar novamente"
                        >
                          <Search size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(entry.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover do histórico"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma busca realizada</h3>
                <p className="text-gray-500">Suas buscas por telefone aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-600 font-medium text-sm sm:text-base">Buscando...</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchInitiated && !isLoading && (
            <div className="space-y-4 sm:space-y-8">
              {/* Results Summary */}
              <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Resultados da Busca</h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Encontrados {searchResults.clients.length} clientes, {searchResults.deals.length} negócios
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
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
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-4 sm:px-6 py-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <Users className="mr-2" size={18} />
                      Clientes Encontrados ({searchResults.clients.length})
                    </h3>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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

              {/* Client Deals Results */}
              {searchResults.clientDeals.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-4 sm:px-6 py-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <CreditCard className="mr-2" size={18} />
                      Negócios do Cliente ({searchResults.clientDeals.length})
                    </h3>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {searchResults.clientDeals.map((deal: Deal) => {
                        const client = clients.find(c => c.id === deal.clientId);
                        const owner = users.find(u => u.id === deal.ownerId);
                        const status = pipelineStatuses.find(s => s.id === deal.statusId);
                        return (
                          <div 
                            key={deal.id} 
                            className="bg-gradient-to-br from-white to-orange-50 p-4 sm:p-6 rounded-xl border border-orange-200 hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
                            onClick={() => handleViewDeal(deal)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate flex-1">{deal.title}</h4>
                              <div 
                                className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ml-2 flex-shrink-0"
                                style={{ backgroundColor: status?.color || '#6B7280' }}
                              >
                                {status?.name || 'Status'}
                              </div>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center text-gray-600">
                                <Users size={14} className="mr-2 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-sm truncate">{client?.name}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <DollarSign size={14} className="mr-2 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-sm font-medium">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(deal.value)}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <TrendingUp size={14} className="mr-2 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-sm">{(deal.probability * 100).toFixed(0)}% probabilidade</span>
                              </div>
                              
                              {owner && (
                                <div className="flex items-center text-gray-600">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center flex-shrink-0">
                                    {owner.avatar ? (
                                      <img src={owner.avatar} alt={owner.name} className="w-full h-full rounded-full" />
                                    ) : (
                                      <span className="text-xs font-medium text-white">
                                        {owner.name.substring(0, 2).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm truncate">{owner.name}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center text-gray-600">
                                <Calendar size={14} className="mr-2 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-xs">
                                  Criado em {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-orange-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDeal(deal);
                                }}
                                className="flex items-center justify-center w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm font-medium"
                              >
                                <Eye size={14} className="mr-2" />
                                Ver no Pipeline
                              </button>
                            </div>
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
                  <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 px-4 sm:px-6 py-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <CreditCard className="mr-2" size={18} />
                      Negócios Encontrados ({searchResults.deals.length})
                    </h3>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {searchResults.deals.map((deal: any) => {
                        const client = clients.find(c => c.id === deal.clientId);
                        const owner = users.find(u => u.id === deal.ownerId);
                        return (
                          <div 
                            key={deal.id} 
                            className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
                            onClick={() => navigate('/pipeline')}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{deal.title}</h4>
                              <div 
                                className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getStatusColor(deal.statusId) }}
                              >
                                {getStatusName(deal.statusId)}
                              </div>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center text-gray-600">
                                <Users size={14} className="mr-2 sm:w-4 sm:h-4" />
                                <span className="text-sm">{client?.name}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <Target size={14} className="mr-2 sm:w-4 sm:h-4" />
                                <span className="text-sm font-medium">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(deal.value)}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <TrendingUp size={14} className="mr-2 sm:w-4 sm:h-4" />
                                <span className="text-sm">{(deal.probability * 100).toFixed(0)}% probabilidade</span>
                              </div>
                              
                              {owner && (
                                <div className="flex items-center text-gray-600">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
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
              {searchResults.clients.length === 0 && searchResults.deals.length === 0 && searchResults.clientDeals.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                    <Search size={24} className="text-gray-400 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Não encontramos nenhum cliente ou negócio que corresponda à sua busca por "{searchTerm}".
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                      onClick={() => handleNewClient(searchTerm.replace(/\D/g, '') || undefined)}
                      className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    >
                      <UserPlus size={16} className="mr-2 sm:w-5 sm:h-5" />
                      Criar Novo Cliente
                    </button>
                    <button
                      onClick={clearSearch}
                      className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    >
                      <Search size={16} className="mr-2 sm:w-5 sm:h-5" />
                      Nova Busca
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome State */}
          {!searchInitiated && !isLoading && (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 mb-6 sm:mb-8">
                <Sparkles size={32} className="text-blue-600 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Busca Inteligente</h3>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg">
                Use nossa busca avançada para encontrar rapidamente clientes por telefone, nome, email, empresa ou negócios. 
                Digite qualquer termo no campo acima para começar.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full mx-auto mb-4">
                    <Users size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{clients.length}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Clientes Cadastrados</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-100 shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full mx-auto mb-4">
                    <CreditCard size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{deals.length}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Negócios Ativos</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100 shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full mx-auto mb-4">
                    <History size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {searchHistory.length}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">Buscas Realizadas</p>
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