import React, { useState } from 'react';
import { Plus, Filter, ArrowDownAZ, RefreshCw, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import DraggablePipeline from '../components/common/DraggablePipeline';
import DealForm from '../components/deals/DealForm';
import { Deal } from '../types';
import '@hello-pangea/dnd';

const PipelinePage: React.FC = () => {
  const { pipelineStatuses, deals, clients, users } = useData();
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);

  // Apply filters
  const filteredDeals = deals.filter(deal => {
    // Apply branch filter
    if (filterBranch !== 'all') {
      const client = clients.find(c => c.id === deal.clientId);
      if (!client || client.branchId !== filterBranch) {
        return false;
      }
    }
    
    // Apply owner filter
    if (filterOwner !== 'all' && deal.ownerId !== filterOwner) {
      return false;
    }
    
    // Apply value filter
    if (filterValue !== 'all') {
      switch (filterValue) {
        case 'low':
          return deal.value < 10000;
        case 'medium':
          return deal.value >= 10000 && deal.value < 50000;
        case 'high':
          return deal.value >= 50000;
        default:
          return true;
      }
    }
    
    return true;
  });

  const handleNewDeal = () => {
    setEditingDeal(undefined);
    setShowForm(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDeal(undefined);
  };

  const handleReset = () => {
    setFilterBranch('all');
    setFilterOwner('all');
    setFilterValue('all');
  };
  
  // Sort pipeline statuses by order index
  const sortedStatuses = [...pipelineStatuses].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pipeline de Vendas
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie seus negócios através do funil de vendas
          </p>
        </div>
        <button
          onClick={handleNewDeal}
          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          <Plus size={16} className="mr-2" />
          Novo Negócio
        </button>
      </div>

      {showForm ? (
        <DealForm 
          deal={editingDeal}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Filial
                </label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                >
                  <option value="all">Todas as Filiais</option>
                  {clients
                    .reduce<string[]>((acc, client) => {
                      if (!acc.includes(client.branchId)) {
                        acc.push(client.branchId);
                      }
                      return acc;
                    }, [])
                    .map(branchId => (
                      <option key={branchId} value={branchId}>
                        {branchId}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Responsável
                </label>
                <select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                >
                  <option value="all">Todos os Responsáveis</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Valor do Negócio
                </label>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                >
                  <option value="all">Todos os Valores</option>
                  <option value="low">Baixo (&lt; R$10k)</option>
                  <option value="medium">Médio (R$10k - R$50k)</option>
                  <option value="high">Alto (&gt; R$50k)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center px-3 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-medium"
                  title="Limpar filtros"
                >
                  <RefreshCw size={14} className="mr-2" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total de Negócios</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{filteredDeals.length}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
                  <Filter size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Valor do Pipeline</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(
                      filteredDeals.reduce((total, deal) => total + deal.value, 0)
                    )}
                  </p>
                </div>
                <div className="bg-green-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
                  <DollarSign size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium">Ticket Médio</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(
                      filteredDeals.length > 0
                        ? filteredDeals.reduce((total, deal) => total + deal.value, 0) / filteredDeals.length
                        : 0
                    )}
                  </p>
                </div>
                <div className="bg-orange-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
                  <ArrowDownAZ size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Taxa de Conversão</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">
                    {filteredDeals.length > 0
                      ? Math.round(
                          (filteredDeals.filter(deal => deal.statusId === '6').length / filteredDeals.length) * 100
                        )
                      : 0}%
                  </p>
                </div>
                <div className="bg-purple-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
                  <RefreshCw size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Funil de Vendas
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Arraste os negócios entre as colunas para atualizar o status
              </p>
            </div>
            <div className="overflow-x-auto">
              <DraggablePipeline 
                statuses={sortedStatuses} 
                deals={filteredDeals}
                clients={clients}
                users={users}
                onEditDeal={handleEditDeal}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PipelinePage;