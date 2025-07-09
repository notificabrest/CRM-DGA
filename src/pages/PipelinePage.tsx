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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Pipeline</h1>
        <button
          onClick={handleNewDeal}
          className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} className="mr-1 sm:w-5 sm:h-5" />
          New Deal
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
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="all">All Branches</option>
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="all">All Owners</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Deal Value
                </label>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="all">All Values</option>
                  <option value="low">Low (&lt; R$10k)</option>
                  <option value="medium">Medium (R$10k - R$50k)</option>
                  <option value="high">High (&gt; R$50k)</option>
                </select>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                title="Reset filters"
              >
                <RefreshCw size={16} className="mr-1" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600 flex-shrink-0">
                  <Filter size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Deals</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">{filteredDeals.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-green-100 text-green-600 flex-shrink-0">
                  <DollarSign size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pipeline Value</p>
                  <p className="text-sm sm:text-xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(
                      filteredDeals.reduce((total, deal) => total + deal.value, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-orange-100 text-orange-600 flex-shrink-0">
                  <ArrowDownAZ size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Avg. Deal Size</p>
                  <p className="text-sm sm:text-xl font-semibold text-gray-900">
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
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-purple-100 text-purple-600 flex-shrink-0">
                  <RefreshCw size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">
                    {filteredDeals.length > 0
                      ? Math.round(
                          (filteredDeals.filter(deal => deal.statusId === '6').length / filteredDeals.length) * 100
                        )
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <div className="overflow-x-auto">
            <DraggablePipeline 
              statuses={sortedStatuses} 
              deals={filteredDeals}
              clients={clients}
              users={users}
              onEditDeal={handleEditDeal}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PipelinePage;