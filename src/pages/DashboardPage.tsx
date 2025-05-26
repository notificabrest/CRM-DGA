import React from 'react';
import { 
  Users, Building2, Phone, CreditCard, BarChart3, TrendingUp, UserCheck, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, EventStatus, EventType } from '../types';

const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { clients, deals, pipelineStatuses, events } = useData();

  // Calculate metrics
  const activeClients = clients.filter(client => client.status === 'ACTIVE').length;
  const totalDeals = deals.length;
  const openDeals = deals.filter(deal => 
    !['6', '7'].includes(deal.statusId) // Not in Closed Won or Closed Lost
  ).length;
  const wonDeals = deals.filter(deal => deal.statusId === '6').length;
  const dealsValue = deals.reduce((total, deal) => total + deal.value, 0);
  const openDealsValue = deals
    .filter(deal => !['6', '7'].includes(deal.statusId))
    .reduce((total, deal) => total + deal.value, 0);

  // Calculate deal distribution
  const dealsByStatus = pipelineStatuses.map(status => {
    const statusDeals = deals.filter(deal => deal.statusId === status.id);
    return {
      ...status,
      count: statusDeals.length,
      value: statusDeals.reduce((total, deal) => total + deal.value, 0),
    };
  });

  // Get upcoming tasks from calendar events
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
  const isSalesperson = hasPermission([UserRole.SALESPERSON]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Greeting */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-semibold">Welcome back, {user?.name}!</h2>
        <p className="mt-1 opacity-90">Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <Users size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-orange-100 text-orange-600">
              <CreditCard size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{openDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <TrendingUp size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pipeline Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                }).format(openDealsValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 text-purple-600">
              <UserCheck size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Won Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{wonDeals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Deal Distribution</h3>
        <div className="h-8 w-full bg-gray-200 rounded-md overflow-hidden flex">
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
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {dealsByStatus.map(status => (
            <div key={status.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="text-sm text-gray-600">
                {status.name}: {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {deals
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map(deal => {
                const client = clients.find(c => c.id === deal.clientId);
                const status = pipelineStatuses.find(s => s.id === deal.statusId);
                return (
                  <div key={deal.id} className="flex items-start">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 mr-3"
                      style={{ backgroundColor: status?.color }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">{deal.title}</p>
                      <p className="text-xs text-gray-500">
                        {client?.name} • {status?.name} • 
                        {new Date(deal.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Upcoming Tasks</h3>
          <div className="space-y-2">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(event => (
                <div 
                  key={event.id} 
                  className={`p-3 border rounded-md ${getEventTypeStyle(event.type)}`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{event.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                      {formatEventDate(event.startDate)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs mt-1 opacity-75">{event.description}</p>
                  )}
                  <p className="text-xs mt-1">
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
              <div className="text-center py-4 text-gray-500">
                No upcoming tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;