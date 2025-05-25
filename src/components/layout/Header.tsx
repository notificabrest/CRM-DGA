import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.DIRECTOR:
        return 'bg-blue-100 text-blue-800';
      case UserRole.MANAGER:
        return 'bg-green-100 text-green-800';
      case UserRole.SALESPERSON:
        return 'bg-orange-100 text-orange-800';
      case UserRole.ASSISTANT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none md:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold mr-4" style={{ color: currentTheme.primaryColor }}>
            {currentTheme.headerName}
          </h1>
          <div className="relative w-64 md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ 
                '--tw-ring-color': currentTheme.primaryColor,
                '--tw-ring-opacity': '0.5'
              } as React.CSSProperties}
              placeholder="Search clients, deals, or phone numbers..."
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.primaryColor }}></span>
          </button>
          
          {user && (
            <div className="flex items-center">
              <div className="hidden md:block mr-4 text-right">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <div className="flex items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: currentTheme.primaryColor }}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;