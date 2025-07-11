import React from 'react';
import { 
  Users, Building2, Phone, CreditCard, BarChart3, TrendingUp, UserCheck, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, EventStatus, EventType } from '../types';

const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { clients, deals, pipelineStatuses, events, users, branches } = useData();

  // Filter deals based on user role and branch
  const filteredDeals = deals.filter(deal => {
    if (!user) return false;

    const dealOwner = users.find(u => u.id === deal.ownerId);
    if (!dealOwner) return false;

    if (user.role === UserRole.DIRECTOR || user.role === UserRole.ADMIN) {
      return true; // Can see all deals
    }

    if (user.role === UserRole.MANAGER) {
      // Can see deals from users in the same branch
      return user.branchIds.some(branchId => dealOwner.branchIds.includes(branchId));
    }

    // Salespeople can only see their own deals
    return deal.ownerId === user.id;
  });

  // Calculate metrics based on filtered deals
  const totalDeals = filteredDeals.length;
  const activeClients = clients.filter(client => client.status === 'ACTIVE').length;
  const totalRevenue = filteredDeals
    .filter(deal => deal.statusId === '6') // Closed Won
    .reduce((sum, deal) => sum + deal.value, 0);
  
  const averageDealSize = totalRevenue / totalDeals || 0;
  const conversionRate = (filteredDeals.filter(deal => deal.statusId === '6').length / totalDeals) * 100 || 0;

  // Calculate deal distribution
  const dealsByStatus = pipelineStatuses.map(status => {
    const statusDeals = filteredDeals.filter(deal => deal.statusId === status.id);
    return {
      ...status,
      count: statusDeals.length,
      value: statusDeals.reduce((sum, deal) => sum + deal.value, 0),
    };
  });

  // Get top 5 salespeople
  const getTopSalespeople = () => {
    const salesData = users
      .filter(u => 
        u.role === UserRole.SALESPERSON || 
        u.role === UserRole.MANAGER ||
        u.role === UserRole.DIRECTOR
      )
      .map(salesperson => {
        const salesDeals = filteredDeals.filter(deal => {
          if (deal.ownerId !== salesperson.id) return false;
          
          return true;
        });

        const totalValue = salesDeals
          .filter(deal => deal.statusId === '6') // Closed Won
          .reduce((sum, deal) => sum + deal.value, 0);

        return {
          id: salesperson.id,
          name: salesperson.name,
          avatar: salesperson.avatar,
          totalValue,
          dealsCount: salesDeals.filter(deal => deal.statusId === '6').length,
          branch: branches.find(b => salesperson.branchIds.includes(b.id))?.name
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    return salesData;
  };

  // Get upcoming tasks
  const upcomingTasks = events
    .filter(event => {
      const isUserTask = event.ownerId === user?.id || event.attendees?.includes(user?.id || '');
      const isPending = event.status === EventStatus.PENDING || event.status === EventStatus.IN_PROGRESS;
      const isUpcoming = new Date(event.startDate) >= new Date();
      return isUserTask && isPending && isUpcoming;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  // Role-based metrics
  const isDirectorOrAbove = hasPermission([UserRole.ADMIN, UserRole.DIRECTOR]);
  const isManager = hasPermission([UserRole.MANAGER]);

  // Helper function to get event type style
  const getEventTypeStyle = (type: EventType) => {
    switch (type) {
      case EventType.MEETING:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case EventType.TASK:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case EventType.REMINDER:
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case EventType.DEAL:
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Helper function to format date
  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(date);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Greeting */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 text-white">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Welcome back, {user?.name}!</h2>
        <p className="mt-1 opacity-90 text-xs sm:text-sm lg:text-base">Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-1.5 sm:p-2 lg:p-3 bg-blue-100 text-blue-600">
              <Users size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">Active Clients</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-1.5 sm:p-2 lg:p-3 bg-orange-100 text-orange-600">
              <CreditCard size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">Total Deals</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-1.5 sm:p-2 lg:p-3 bg-green-100 text-green-600">
              <TrendingUp size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">Total Revenue</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact'
                }).format(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-1.5 sm:p-2 lg:p-3 bg-purple-100 text-purple-600">
              <UserCheck size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">Conversion Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Chart */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
        <h3 className="text-sm sm:text-base lg:text-lg font-medium mb-3 sm:mb-4">Deal Distribution</h3>
        <div className="h-4 sm:h-6 lg:h-8 w-full bg-gray-200 rounded-md overflow-hidden flex">
          {dealsByStatus.map(status => (
            <div 
              key={status.id}
              style={{ 
                width: `${totalDeals ? (status.count / totalDeals) * 100 : 0}%`,
                backgroundColor: status.color,
              }}
              className="h-full transition-all duration-500 ease-in-out"
              title={`${status.name}: ${status.count} deals`}
            ></div>
          ))}
        </div>
        <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {dealsByStatus.map(status => (
            <div key={status.id} className="flex items-center p-1.5 sm:p-2 bg-gray-50 rounded">
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="text-xs text-gray-600 truncate">
                {status.name}: {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers Section - Only visible to managers and above */}
      {(isDirectorOrAbove || isManager) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h2 className="text-sm sm:text-base lg:text-lg font-medium mb-3 sm:mb-4">Top Performers</h2>
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {getTopSalespeople().map(salesperson => (
              <div key={salesperson.id} className="flex items-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {salesperson.avatar ? (
                    <img
                      src={salesperson.avatar}
                      alt={salesperson.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {salesperson.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0 sm:gap-1">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">
                        {salesperson.name}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {salesperson.branch}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        notation: 'compact'
                      }).format(salesperson.totalValue)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-gray-200 rounded-full hidden sm:block">
                    <div
                      className="h-1 bg-orange-500 rounded-full"
                      style={{
                        width: `${(salesperson.totalValue / getTopSalespeople()[0].totalValue) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {filteredDeals
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map(deal => {
                const client = clients.find(c => c.id === deal.clientId);
                const status = pipelineStatuses.find(s => s.id === deal.statusId);
                return (
                  <div key={deal.id} className="flex items-start">
                    <div 
                      className="w-2 h-2 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"
                      style={{ backgroundColor: status?.color }}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{deal.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {client?.name} • {status?.name} • 
                        {new Date(deal.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium mb-3 sm:mb-4">Upcoming Tasks</h3>
          <div className="space-y-2 sm:space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(event => (
                <div 
                  key={event.id} 
                  className={`p-2 sm:p-3 border rounded-md ${getEventTypeStyle(event.type)} text-xs sm:text-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-medium truncate">{event.title}</span>
                    <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white bg-opacity-50 self-start">
                      {formatEventDate(event.startDate)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs mt-1 opacity-75 truncate sm:line-clamp-2">{event.description}</p>
                  )}
                  <p className="text-xs mt-1 truncate">
                    {new Date(event.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {event.location && ` - ${event.location}`}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-3 sm:py-4 text-gray-500">
                <p className="text-xs sm:text-sm">No upcoming tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;