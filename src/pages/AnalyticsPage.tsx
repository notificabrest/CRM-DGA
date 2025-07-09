import React, { useState } from 'react';
import { TrendingUp, Users, CreditCard, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

const AnalyticsPage: React.FC = () => {
  const { deals, clients, users, pipelineStatuses } = useData();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Calculate key metrics
  const totalDeals = deals.length;
  const totalClients = clients.length;
  const totalRevenue = deals
    .filter(deal => deal.statusId === '6') // Closed Won
    .reduce((sum, deal) => sum + deal.value, 0);
  
  const averageDealSize = totalRevenue / totalDeals || 0;
  const conversionRate = (deals.filter(deal => deal.statusId === '6').length / totalDeals) * 100 || 0;

  // Calculate deal distribution
  const dealsByStatus = pipelineStatuses.map(status => {
    const statusDeals = deals.filter(deal => deal.statusId === status.id);
    return {
      name: status.name,
      count: statusDeals.length,
      value: statusDeals.reduce((sum, deal) => sum + deal.value, 0),
      color: status.color
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">+12% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-orange-100 text-orange-600">
              <CreditCard size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDeals}</p>
              <p className="text-xs text-gray-500 mt-1">+8% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">+15% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">+3% from last period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pipeline Analysis</h2>
          <div className="h-8 w-full bg-gray-200 rounded-md overflow-hidden flex">
            {dealsByStatus.map(status => (
              <div
                key={status.name}
                style={{
                  width: `${(status.count / totalDeals) * 100}%`,
                  backgroundColor: status.color
                }}
                className="h-full transition-all duration-500 ease-in-out"
                title={`${status.name}: ${status.count} deals`}
              ></div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {dealsByStatus.map(status => (
              <div key={status.name} className="flex flex-col">
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
                  {status.count} deals ({((status.count / totalDeals) * 100).toFixed(1)}%)
                </div>
                <div className="text-sm text-gray-500">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(status.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Deal Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Average Deal Size</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(averageDealSize)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-orange-500 rounded-full"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Win Rate</span>
                <span>{conversionRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {users
              .filter(user => 
                user.role === UserRole.SALESPERSON || 
                user.role === UserRole.MANAGER ||
                user.role === UserRole.DIRECTOR
              )
              .slice(0, 5)
              .map(user => {
                const userDeals = deals.filter(deal => deal.ownerId === user.id);
                const userRevenue = userDeals
                  .filter(deal => deal.statusId === '6')
                  .reduce((sum, deal) => sum + deal.value, 0);
                
                return (
                  <div key={user.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {user.name}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(userRevenue)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {userDeals.filter(deal => deal.statusId === '6').length} deals fechados
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 h-1 bg-gray-200 rounded-full">
                        <div
                          className="h-1 bg-orange-500 rounded-full"
                          style={{
                            width: `${totalRevenue > 0 ? (userRevenue / totalRevenue) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Deal Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Average Deal Size</span>
                        <span className="text-sm text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(averageDealSize)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-orange-500 rounded-full"
                          style={{
                            width: '65%'
                          }}
                        ></div>
                      </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Win Rate</span>
                <span>{conversionRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;