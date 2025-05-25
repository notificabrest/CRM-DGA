import React, { useState } from 'react';
import { BarChart, PieChart, Download } from 'lucide-react';
import { useData } from '../context/DataContext';

const ReportsPage: React.FC = () => {
  const { deals, clients, users, pipelineStatuses } = useData();
  const [reportType, setReportType] = useState<'deals' | 'clients'>('deals');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Calculate metrics
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealValue = totalValue / totalDeals || 0;
  const wonDeals = deals.filter(deal => deal.statusId === '6').length;
  const conversionRate = (wonDeals / totalDeals) * 100 || 0;

  // Deal distribution by status
  const dealsByStatus = pipelineStatuses.map(status => ({
    name: status.name,
    count: deals.filter(deal => deal.statusId === status.id).length,
    value: deals
      .filter(deal => deal.statusId === status.id)
      .reduce((sum, deal) => sum + deal.value, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          <Download size={18} className="mr-1" />
          Export Report
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'deals' | 'clients')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="deals">Deals Report</option>
              <option value="clients">Clients Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-2 bg-blue-100 text-blue-600">
              <BarChart size={18} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Deals</p>
              <p className="text-xl font-semibold text-gray-900">{totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-2 bg-green-100 text-green-600">
              <PieChart size={18} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-2 bg-orange-100 text-orange-600">
              <BarChart size={18} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Deal Value</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(avgDealValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-2 bg-purple-100 text-purple-600">
              <PieChart size={18} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Deal Distribution by Status</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number of Deals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dealsByStatus.map(status => (
              <tr key={status.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {status.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {status.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(status.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((status.count / totalDeals) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;