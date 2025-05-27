import React from 'react';
import { 
  Users, Building2, Phone, CreditCard, BarChart3, TrendingUp, UserCheck, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { clients, deals, pipelineStatuses } = useData();

  // Calculate metrics
  const totalDeals = deals.length;
  const activeClients = clients.filter(client => client.status === 'ACTIVE').length;
  const totalRevenue = deals
    .filter(deal => deal.statusId === '6') // Closed Won
    .reduce((sum, deal) => sum + deal.value, 0);
  
  const averageDealSize = totalRevenue / totalDeals || 0;
  const conversionRate = (deals.filter(deal => deal.statusId === '6').length / totalDeals) * 100 || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg shadow-md p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user?.name}!</h1>
        <p className="text-lg opacity-90">
          Aqui está um resumo das suas atividades e métricas principais.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-orange-100 text-orange-600">
              <CreditCard size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Negócios</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 text-purple-600">
              <UserCheck size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
              <p className="text-2xl font-semibold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Visão Geral do Pipeline</h2>
        <div className="h-8 w-full bg-gray-200 rounded-md overflow-hidden flex">
          {pipelineStatuses.map(status => {
            const statusDeals = deals.filter(deal => deal.statusId === status.id);
            const percentage = (statusDeals.length / totalDeals) * 100 || 0;
            
            return (
              <div
                key={status.id}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: status.color,
                }}
                className="h-full transition-all duration-500 ease-in-out"
                title={`${status.name}: ${statusDeals.length} negócios`}
              ></div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {pipelineStatuses.map(status => {
            const statusDeals = deals.filter(deal => deal.statusId === status.id);
            const statusValue = statusDeals.reduce((sum, deal) => sum + deal.value, 0);
            
            return (
              <div key={status.id} className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {status.name}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {statusDeals.length} negócios
                </div>
                <div className="text-sm text-gray-500">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(statusValue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;