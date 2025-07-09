import React, { useState } from 'react';
import { BarChart, PieChart, Download, TrendingUp, Users, DollarSign, Target, Award, Star, ChevronDown, ChevronUp, FileText, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportToCSV, exportToPDF, formatReportData, formatSalesPerformanceData } from '../utils/exportUtils';

const ReportsPage: React.FC = () => {
  const { deals, clients, users, pipelineStatuses } = useData();
  const [reportType, setReportType] = useState<'deals' | 'clients'>('deals');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Calculate metrics
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealValue = totalValue / totalDeals || 0;
  const wonDeals = deals.filter(deal => deal.statusId === '6').length;
  const conversionRate = (wonDeals / totalDeals) * 100 || 0;

  // Deal distribution by status
  const dealsByStatus = pipelineStatuses.map(status => ({
    name: status.name,
    color: status.color,
    count: deals.filter(deal => deal.statusId === status.id).length,
    value: deals
      .filter(deal => deal.statusId === status.id)
      .reduce((sum, deal) => sum + deal.value, 0),
    percentage: totalDeals > 0 ? ((deals.filter(deal => deal.statusId === status.id).length / totalDeals) * 100) : 0
  }));

  // Sales performance data
  const salesPerformance = users
    .filter(user => 
      user.role === 'SALESPERSON' || 
      user.role === 'MANAGER' ||
      user.role === 'DIRECTOR'
    )
    .map(user => {
      const userDeals = deals.filter(deal => deal.ownerId === user.id);
      const wonDeals = userDeals.filter(deal => deal.statusId === '6');
      const userRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
      const userConversionRate = userDeals.length > 0 ? (wonDeals.length / userDeals.length) * 100 : 0;
      
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        totalDeals: userDeals.length,
        wonDeals: wonDeals.length,
        revenue: userRevenue,
        conversionRate: userConversionRate
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DIRECTOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SALESPERSON':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceLevel = (conversionRate: number) => {
    if (conversionRate >= 80) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (conversionRate >= 60) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (conversionRate >= 40) return { label: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Baixo', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleExportCSV = () => {
    if (reportType === 'deals') {
      const formattedData = formatReportData(deals, clients, users, pipelineStatuses);
      exportToCSV(formattedData, `relatorio-negocios-${dateRange}-${new Date().toISOString().split('T')[0]}`);
    } else {
      const formattedData = formatSalesPerformanceData(salesPerformance);
      exportToCSV(formattedData, `relatorio-performance-${dateRange}-${new Date().toISOString().split('T')[0]}`);
    }
  };

  const handleExportPDF = () => {
    if (reportType === 'deals') {
      const formattedData = formatReportData(deals, clients, users, pipelineStatuses);
      exportToPDF(formattedData, `relatorio-negocios-${dateRange}-${new Date().toISOString().split('T')[0]}`, 'Relatório de Negócios');
    } else {
      const formattedData = formatSalesPerformanceData(salesPerformance);
      exportToPDF(formattedData, `relatorio-performance-${dateRange}-${new Date().toISOString().split('T')[0]}`, 'Relatório de Performance de Vendas');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios de Vendas</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Análise completa de performance e resultados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Exportar CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <FileText size={18} className="mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'deals' | 'clients')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm sm:text-base"
              >
                <option value="deals">Relatório de Negócios</option>
                <option value="clients">Relatório de Clientes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm sm:text-base"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="year">Último Ano</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Total de Negócios</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{totalDeals}</p>
              <p className="text-blue-100 text-xs mt-1">+12% vs período anterior</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
              <BarChart size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Valor Total</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact'
                }).format(totalValue)}
              </p>
              <p className="text-green-100 text-xs mt-1">+18% vs período anterior</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
              <DollarSign size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Ticket Médio</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact'
                }).format(avgDealValue)}
              </p>
              <p className="text-purple-100 text-xs mt-1">+5% vs período anterior</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Taxa de Conversão</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{conversionRate.toFixed(1)}%</p>
              <p className="text-orange-100 text-xs mt-1">+3% vs período anterior</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 p-2 sm:p-3 rounded-lg">
              <Target size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Mobile Collapsible */}
      <div className="space-y-4">
        {/* Deal Distribution by Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('distribution')}
            className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between lg:cursor-default"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="mr-2 text-blue-600" size={18} />
              Distribuição por Status
            </h3>
            <div className="lg:hidden">
              {expandedSection === 'distribution' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          <div className={`${expandedSection === 'distribution' || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block p-4 sm:p-6`}>
            <div className="space-y-3 sm:space-y-4">
              {dealsByStatus.map(status => (
                <div key={status.name} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{status.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{status.count} negócios</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                        notation: 'compact'
                      }).format(status.value)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{status.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('performers')}
            className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between lg:cursor-default"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Award className="mr-2 text-yellow-600" size={18} />
              Top Performers
            </h3>
            <div className="lg:hidden">
              {expandedSection === 'performers' || window.innerWidth >= 1024 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          <div className={`${expandedSection === 'performers' || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block p-4 sm:p-6`}>
            <div className="space-y-3 sm:space-y-4">
              {salesPerformance.slice(0, 5).map((performer, index) => {
                const performance = getPerformanceLevel(performer.conversionRate);
                return (
                  <div key={performer.id} className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center mr-3 sm:mr-4 flex-shrink-0">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index < 3 ? <Star size={12} className="sm:w-4 sm:h-4" /> : index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{performer.name}</p>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(performer.role)}`}>
                              {performer.role}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${performance.bg} ${performance.color}`}>
                              {performance.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            }).format(performer.revenue)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {performer.wonDeals}/{performer.totalDeals} deals ({performer.conversionRate.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Performance Table - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('detailed')}
          className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between lg:cursor-default"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Users className="mr-2 text-green-600" size={18} />
            Performance Detalhada
          </h3>
          <div className="lg:hidden">
            {expandedSection === 'detailed' || window.innerWidth >= 1024 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        <div className={`${expandedSection === 'detailed' || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block`}>
          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {salesPerformance.map((performer) => {
              const performance = getPerformanceLevel(performer.conversionRate);
              return (
                <div key={performer.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {performer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(performer.role)}`}>
                          {performer.role}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${performance.bg} ${performance.color}`}>
                      {performance.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Deals</p>
                      <p className="font-semibold">{performer.totalDeals}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fechados</p>
                      <p className="font-semibold text-green-600">{performer.wonDeals}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversão</p>
                      <p className="font-semibold">{performer.conversionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Receita</p>
                      <p className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                          notation: 'compact'
                        }).format(performer.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Deals
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deals Fechados
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Taxa Conversão
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Receita Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesPerformance.map((performer) => {
                  const performance = getPerformanceLevel(performer.conversionRate);
                  return (
                    <tr key={performer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {performer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(performer.role)}`}>
                          {performer.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {performer.totalDeals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {performer.wonDeals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {performer.conversionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0
                        }).format(performer.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${performance.bg} ${performance.color}`}>
                          {performance.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;