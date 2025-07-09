import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Building2, Phone, PieChart, BarChart3, Settings, ChevronRight, ChevronLeft,
  List, LogOut, Home, CreditCard, Calendar, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import ChangePasswordForm from '../auth/ChangePasswordForm';

interface SidebarProps {
  isMobile: boolean;
  toggleMobileSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, toggleMobileSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const { currentTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
      title: 'Search Intelligent',
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
    <>
      <aside 
        className={`h-screen ${isCollapsed && !isMobile ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 fixed z-10
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : ''}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center min-w-0 flex-1">
              {currentTheme.logo && (
                <img 
                  src={currentTheme.logo} 
                  alt="Logo" 
                  className="h-8 w-auto mr-2 flex-shrink-0"
                />
              )}
              <h1 
                className="text-lg sm:text-xl font-bold truncate"
                style={{ color: currentTheme.primaryColor }}
              >
                {currentTheme.sidebarName}
              </h1>
            </div>
          )}
          {isMobile ? (
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
              style={{ color: currentTheme.primaryColor }}
            >
              <List size={20} />
            </button>
          ) : (
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
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
                    `flex items-center p-3 rounded-md transition-colors ${
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
                  <span className="flex items-center justify-center w-6 flex-shrink-0">{item.icon}</span>
                  {(!isCollapsed || isMobile) && <span className="ml-3 truncate">{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
          {(!isCollapsed || isMobile) && user && (
            <div className="flex flex-col space-y-2 sm:space-y-4">
              <div className="flex items-center min-w-0 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold"
                      style={{ backgroundColor: currentTheme.primaryColor }}
                    >
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 text-xs sm:text-sm transition-colors"
              >
                <Key size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                <span className="ml-2 sm:ml-3 truncate">Alterar Senha</span>
              </button>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-lg transition-colors ${
              isCollapsed && !isMobile ? 'justify-center' : ''
            } hover:bg-red-50 hover:text-red-600 mt-2 sm:mt-4 text-xs sm:text-sm font-medium border border-transparent hover:border-red-200`}
            style={{ color: currentTheme.textColor }}
          >
            <LogOut size={12} className="flex-shrink-0 sm:w-5 sm:h-5" />
            {(!isCollapsed || isMobile) && <span className="ml-2 sm:ml-3 truncate">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">Alterar Senha</h2>
            <ChangePasswordForm
              onSuccess={() => setShowChangePassword(false)}
              onCancel={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;