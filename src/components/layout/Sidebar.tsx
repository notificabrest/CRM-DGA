import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Building2, Phone, PieChart, BarChart3, Settings, ChevronRight, ChevronLeft,
  List, LogOut, Home, CreditCard, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isMobile: boolean;
  toggleMobileSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, toggleMobileSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const { currentTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    if (toggleMobileSidebar) {
      toggleMobileSidebar();
    }
  };

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      path: '/',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON, UserRole.ASSISTANT],
    },
    {
      title: 'Clients',
      icon: <Users size={20} />,
      path: '/clients',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON, UserRole.ASSISTANT],
    },
    {
      title: 'Pipeline',
      icon: <CreditCard size={20} />,
      path: '/pipeline',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON],
    },
    {
      title: 'Calendar',
      icon: <Calendar size={20} />,
      path: '/calendar',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON, UserRole.ASSISTANT],
    },
    {
      title: 'Search by Phone',
      icon: <Phone size={20} />,
      path: '/phone-search',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON, UserRole.ASSISTANT],
    },
    {
      title: 'Branches',
      icon: <Building2 size={20} />,
      path: '/branches',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER],
    },
    {
      title: 'Reports',
      icon: <BarChart3 size={20} />,
      path: '/reports',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.SALESPERSON],
    },
    {
      title: 'Analytics',
      icon: <PieChart size={20} />,
      path: '/analytics',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER],
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      roles: [UserRole.ADMIN, UserRole.DIRECTOR],
    },
  ];

  const filteredItems = sidebarItems.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <aside 
      className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 fixed z-10
        transition-all duration-300 ease-in-out flex flex-col
        ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : ''}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            {currentTheme.logo && (
              <img 
                src={currentTheme.logo} 
                alt="Logo" 
                className="h-8 w-auto mr-2"
              />
            )}
            <h1 
              className="text-xl font-bold truncate"
              style={{ color: currentTheme.primaryColor }}
            >
              {currentTheme.sidebarName}
            </h1>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
            style={{ color: currentTheme.primaryColor }}
          >
            <List size={20} />
          </button>
        ) : (
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md hover:bg-gray-100"
            style={{ color: currentTheme.primaryColor }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? currentTheme.primaryColor : 'transparent',
                  color: isActive ? '#fff' : currentTheme.textColor,
                })}
                onClick={isMobile ? toggleMobileSidebar : undefined}
              >
                <span className="flex items-center justify-center w-6">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-2 rounded-md transition-colors ${
            isCollapsed ? 'justify-center' : ''
          } hover:bg-gray-100`}
          style={{ color: currentTheme.textColor }}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;