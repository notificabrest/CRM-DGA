import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Plus, Edit2, Trash2, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PipelineStatus, UserRole, UserStatus } from '../types';

const SettingsPage: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { pipelineStatuses, addPipelineStatus, updatePipelineStatus, deletePipelineStatus, addUser, updateUser, deleteUser, users, branches } = useData();
  const { hasPermission } = useAuth();
  
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.name);
  const [customTheme, setCustomTheme] = useState({...currentTheme});
  const [activeTab, setActiveTab] = useState('general');
  const [headerTitle, setHeaderTitle] = useState(currentTheme.headerName || 'SISTEMA');
  const [sidebarTitle, setSidebarTitle] = useState(currentTheme.sidebarName || 'SISTEMA');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logo, setLocalLogo] = useState(currentTheme.logo || '');

  const [ldapSettings, setLdapSettings] = useState({
    enabled: false,
    host: '',
    port: '389',
    baseDN: '',
    bindDN: '',
    bindPassword: '',
    searchFilter: '(objectClass=user)',
    usernameAttribute: 'sAMAccountName',
    emailAttribute: 'mail',
    useSSL: true,
    timeout: 5000,
    groupSearchBase: '',
    groupSearchFilter: '(objectClass=group)',
    groupMemberAttribute: 'member',
  });

  const [editingStatus, setEditingStatus] = useState<PipelineStatus | null>(null);
  const [statusForm, setStatusForm] = useState({
    name: '',
    color: '#3B82F6',
    orderIndex: 0,
    isDefault: false
  });

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.SALESPERSON,
    status: UserStatus.ACTIVE,
    branchIds: [] as string[],
    branchId: '',
    password: ''
  });

  useEffect(() => {
    setHeaderTitle(currentTheme.headerName || 'SISTEMA');
    setSidebarTitle(currentTheme.sidebarName || 'SISTEMA');
  }, [currentTheme]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLdapChange = (field: string, value: string | boolean) => {
    setLdapSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testLdapConnection = async () => {
    alert('Testing LDAP connection...');
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeName = e.target.value;
    setSelectedTheme(themeName);
    
    if (themeName !== 'Custom') {
      const theme = availableThemes.find(t => t.name === themeName);
      if (theme) {
        setTheme(theme);
        setCustomTheme({...theme});
      }
    }
  };

  const handleColorChange = (property: string, value: string) => {
    const updatedTheme = {
      ...customTheme,
      [property]: value,
      name: 'Custom'
    };
    
    setCustomTheme(updatedTheme);
    customizeTheme({
      [property]: value
    });
    
    setSelectedTheme('Custom');
  };

  const handleSave = () => {
    setHeaderName(headerTitle);
    setSidebarName(sidebarTitle);
    setLogo(logo);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRemoveLogo = () => {
    setLocalLogo('');
    setLogo('');
  };

  const handleAddStatus = () => {
    if (statusForm.name.trim()) {
      addPipelineStatus({
        ...statusForm,
        orderIndex: pipelineStatuses.length
      });
      setStatusForm({
        name: '',
        color: '#3B82F6',
        orderIndex: 0,
        isDefault: false
      });
    }
  };

  const handleUpdateStatus = () => {
    if (editingStatus && statusForm.name.trim()) {
      updatePipelineStatus(editingStatus.id, statusForm);
      setEditingStatus(null);
      setStatusForm({
        name: '',
        color: '#3B82F6',
        orderIndex: 0,
        isDefault: false
      });
    }
  };

  const handleDeleteStatus = (statusId: string) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      deletePipelineStatus(statusId);
    }
  };

  const handleAddUser = () => {
    if (userForm.email.trim() && userForm.name.trim()) {
      addUser(userForm);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role: UserRole.SALESPERSON,
        status: UserStatus.ACTIVE,
        branchIds: [],
        branchId: '',
        password: ''
      });
    }
  };

  const handleUpdateUser = () => {
    if (editingUser && userForm.email.trim() && userForm.name.trim()) {
      updateUser(editingUser.id, userForm);
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role: UserRole.SALESPERSON,
        status: UserStatus.ACTIVE,
        branchIds: [],
        branchId: '',
        password: ''
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-sm text-green-600">Settings saved successfully!</span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <Save size={18} className="mr-1" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appearance'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pipeline'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users & Permissions
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integrations'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Integrations
          </button>
        </nav>
      </div>

      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {logo ? (
                    <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">No logo</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer inline-block"
                  >
                    Upload Logo
                  </label>
                  {logo && (
                    <button
                      onClick={handleRemoveLogo}
                      className="ml-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Recommended size: 200x200px. Max file size: 2MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header Title
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sidebar Title
              </label>
              <input
                type="text"
                value={sidebarTitle}
                onChange={(e) => setSidebarTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                defaultValue="America/Sao_Paulo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                defaultValue="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2023)</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY (12/31/2023)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (2023-12-31)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                defaultValue="BRL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="BRL">Brazilian Real (R$)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Theme</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Theme
              </label>
              <select
                value={selectedTheme}
                onChange={handleThemeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {availableThemes.map(theme => (
                  <option key={theme.name} value={theme.name}>
                    {theme.name}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={customTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-l-md"
                  />
                  <input
                    type="text"
                    value={customTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={customTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded-l-md"
                  />
                  <input
                    type="text"
                    value={customTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Pipeline Status Management</h2>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Name
                </label>
                <input
                  type="text"
                  value={statusForm.name}
                  onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter status name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={statusForm.color}
                    onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                    className="w-10 h-10 rounded-l-md"
                  />
                  <input
                    type="text"
                    value={statusForm.color}
                    onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={editingStatus ? handleUpdateStatus : handleAddStatus}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {editingStatus ? 'Update Status' : 'Add Status'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pipelineStatuses.map((status) => (
                  <tr key={status.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="text-sm text-gray-900">{status.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {status.color}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setEditingStatus(status);
                          setStatusForm({
                            name: status.name,
                            color: status.color,
                            orderIndex: status.orderIndex,
                            isDefault: status.isDefault
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
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
      )}

      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Users & Permissions</h2>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Branch
              </label>
              <select
                value={userForm.branchId}
                onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Branches
              </label>
              <select
                multiple
                value={userForm.branchIds}
                onChange={(e) => {
                  const selectedBranches = Array.from(e.target.selectedOptions, option => option.value);
                  setUserForm({ ...userForm, branchIds: selectedBranches });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple branches
              </p>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter initial password"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Set an initial password for the user
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <button
              onClick={editingUser ? handleUpdateUser : handleAddUser}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
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
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === UserRole.ADMIN
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === UserRole.DIRECTOR
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === UserRole.MANAGER
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === UserStatus.ACTIVE
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setUserForm({
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            status: user.status,
                            branchIds: user.branchIds,
                            branchId: user.branchId,
                            password: ''
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600  hover:text-red-900"
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
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">LDAP Integration</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ldapSettings.enabled}
                    onChange={(e) => handleLdapChange('enabled', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-orange-500"
                  />
                  <span className="ml-2">Enable LDAP Authentication</span>
                </label>
              </div>

              {ldapSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LDAP Server Host
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.host}
                        onChange={(e) => handleLdapChange('host', e.target.value)}
                        placeholder="ldap.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.port}
                        onChange={(e) => handleLdapChange('port', e.target.value)}
                        placeholder="389 or 636 for SSL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base DN
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.baseDN}
                        onChange={(e) => handleLdapChange('baseDN', e.target.value)}
                        placeholder="dc=example,dc=com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bind DN
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.bindDN}
                        onChange={(e) => handleLdapChange('bindDN', e.target.value)}
                        placeholder="cn=admin,dc=example,dc=com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bind Password
                      </label>
                      <input
                        type="password"
                        value={ldapSettings.bindPassword}
                        onChange={(e) => handleLdapChange('bindPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Filter
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.searchFilter}
                        onChange={(e) => handleLdapChange('searchFilter', e.target.value)}
                        placeholder="(objectClass=user)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username Attribute
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.usernameAttribute}
                        onChange={(e) => handleLdapChange('usernameAttribute', e.target.value)}
                        placeholder="sAMAccountName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Attribute
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.emailAttribute}
                        onChange={(e) => handleLdapChange('emailAttribute', e.target.value)}
                        placeholder="mail"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Search Base
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.groupSearchBase}
                        onChange={(e) => handleLdapChange('groupSearchBase', e.target.value)}
                        placeholder="ou=groups,dc=example,dc=com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Search Filter
                      </label>
                      <input
                        type="text"
                        value={ldapSettings.groupSearchFilter}
                        onChange={(e) => handleLdapChange('groupSearchFilter', e.target.value)}
                        placeholder="(objectClass=group)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ldapSettings.useSSL}
                        onChange={(e) => handleLdapChange('useSSL', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-orange-500"
                      />
                      <span className="ml-2">Use SSL/TLS</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Connection Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={ldapSettings.timeout}
                        onChange={(e) => handleLdapChange('timeout', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={testLdapConnection}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Test LDAP Connection
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;