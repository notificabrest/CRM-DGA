import React, { useState } from 'react';
import { 
  Settings, Mail, Palette, Users, Shield, Bell, Globe, 
  Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader,
  User, Plus, Edit2, Trash2, Save, X, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useEmail } from '../context/EmailContext';
import { User as UserType, UserRole, UserStatus } from '../types';
import UserForm from '../components/users/UserForm';
import VersionInfo from '../components/common/VersionInfo';

const SettingsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { users, addUser, updateUser, deleteUser } = useData();
  const { emailConfig, updateEmailConfig, testEmailConnection, isTestingConnection } = useEmail();
  
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'theme' | 'users' | 'version'>('general');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>(undefined);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResult, setShowTestResult] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Theme customization state
  const [customTheme, setCustomTheme] = useState({
    primaryColor: currentTheme.primaryColor,
    backgroundColor: currentTheme.backgroundColor,
    textColor: currentTheme.textColor,
    secondaryColor: currentTheme.secondaryColor,
    headerName: currentTheme.headerName || 'CRM-DGA',
    sidebarName: currentTheme.sidebarName || 'CRM-DGA',
    logo: currentTheme.logo || '',
  });

  const handleThemeChange = (theme: any) => {
    setTheme(theme);
  };

  const handleCustomThemeUpdate = () => {
    customizeTheme(customTheme);
    setHeaderName(customTheme.headerName);
    setSidebarName(customTheme.sidebarName);
    setLogo(customTheme.logo);
  };

  const handleEmailConfigUpdate = (field: string, value: any) => {
    updateEmailConfig({ [field]: value });
  };

  const handleTestConnection = async () => {
    try {
      const result = await testEmailConnection();
      setTestResult(result);
      setShowTestResult(true);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão',
        details: { error: (error as Error).message }
      });
      setShowTestResult(true);
    }
  };

  const handleNewUser = () => {
    setEditingUser(undefined);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  const handleUserFormClose = () => {
    setShowUserForm(false);
    setEditingUser(undefined);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case UserRole.DIRECTOR:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case UserRole.MANAGER:
        return 'bg-green-100 text-green-800 border-green-200';
      case UserRole.SALESPERSON:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case UserRole.ASSISTANT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'theme', label: 'Theme', icon: Palette },
    ...(hasPermission([UserRole.ADMIN, UserRole.DIRECTOR]) ? [{ id: 'users', label: 'Users', icon: Users }] : []),
    { id: 'version', label: 'Version', icon: Globe },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={customTheme.headerName}
                    onChange={(e) => setCustomTheme({ ...customTheme, headerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={customTheme.logo}
                    onChange={(e) => setCustomTheme({ ...customTheme, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <button
                  onClick={handleCustomThemeUpdate}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Email Configuration</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={emailConfig.enabled}
                    onChange={(e) => handleEmailConfigUpdate('enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="emailEnabled" className="text-sm text-gray-700">
                    Enable Email Notifications
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => handleEmailConfigUpdate('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => handleEmailConfigUpdate('smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="587"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP User
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUser}
                    onChange={(e) => handleEmailConfigUpdate('smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => handleEmailConfigUpdate('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="App Password (16 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-gray-500" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={emailConfig.notificationEmail}
                    onChange={(e) => handleEmailConfigUpdate('notificationEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="notifications@example.com"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={emailConfig.smtpSecure}
                    onChange={(e) => handleEmailConfigUpdate('smtpSecure', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="smtpSecure" className="text-sm text-gray-700">
                    Use SSL/TLS
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <Loader size={16} className="mr-2 animate-spin" />
                  ) : (
                    <TestTube size={16} className="mr-2" />
                  )}
                  Test Connection
                </button>
              </div>
            </div>

            {/* Test Result Modal */}
            {showTestResult && testResult && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      {testResult.success ? (
                        <CheckCircle className="mr-2 text-green-600" size={24} />
                      ) : (
                        <XCircle className="mr-2 text-red-600" size={24} />
                      )}
                      SMTP Test Result
                    </h2>
                    <button
                      onClick={() => setShowTestResult(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className={`p-4 rounded-lg mb-4 ${
                      testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </p>
                    </div>
                    
                    {testResult.details && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Host:</span>
                            <span className="ml-2">{testResult.details.host}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Port:</span>
                            <span className="ml-2">{testResult.details.port}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">User:</span>
                            <span className="ml-2">{testResult.details.user}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Test Email:</span>
                            <span className="ml-2">{testResult.details.testEmail}</span>
                          </div>
                          {testResult.details.responseTime && (
                            <div>
                              <span className="font-medium text-gray-700">Response Time:</span>
                              <span className="ml-2">{testResult.details.responseTime}ms</span>
                            </div>
                          )}
                        </div>
                        
                        {testResult.details.logs && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Detailed Logs:</h4>
                            <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                {testResult.details.logs.join('\n')}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Theme Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentTheme.name === theme.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleThemeChange(theme)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{theme.name}</h4>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.primaryColor }}
                      ></div>
                    </div>
                    <div className="flex space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: theme.primaryColor }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: theme.secondaryColor }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: theme.accentColor }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Custom Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={customTheme.primaryColor}
                    onChange={(e) => setCustomTheme({ ...customTheme, primaryColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={customTheme.secondaryColor}
                    onChange={(e) => setCustomTheme({ ...customTheme, secondaryColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={customTheme.backgroundColor}
                    onChange={(e) => setCustomTheme({ ...customTheme, backgroundColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={customTheme.textColor}
                    onChange={(e) => setCustomTheme({ ...customTheme, textColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomThemeUpdate}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Apply Custom Theme
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && hasPermission([UserRole.ADMIN, UserRole.DIRECTOR]) && (
          <div className="space-y-6">
            {showUserForm ? (
              <UserForm 
                user={editingUser}
                onSave={handleUserFormClose}
                onCancel={handleUserFormClose}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">User Management</h3>
                  <button
                    onClick={handleNewUser}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    <Plus size={16} className="mr-2" />
                    New User
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-semibold bg-orange-500">
                                      {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === UserStatus.ACTIVE
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'version' && (
          <div className="space-y-6">
            <VersionInfo showDetailed={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;