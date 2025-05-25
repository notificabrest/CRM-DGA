import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Plus, Edit2, Trash2, Lock, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PipelineStatus, UserRole, UserStatus, User } from '../types';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userId?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, title, userId }) => {
  const { user: currentUser, changePassword, resetUserPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (userId) {
        // Admin resetting user password
        await resetUserPassword(userId);
      } else {
        // User changing own password
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        await changePassword(currentPassword, newPassword);
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!userId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {!userId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              {userId ? 'Reset Password' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { pipelineStatuses, addPipelineStatus, updatePipelineStatus, deletePipelineStatus, addUser, updateUser, deleteUser, users, branches } = useData();
  const { hasPermission } = useAuth();
  
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.name);
  const [customTheme, setCustomTheme] = useState({...currentTheme});
  const [activeTab, setActiveTab] = useState('general');
  const [headerTitle, setHeaderTitle] = useState(currentTheme.headerName || 'CRM-DGA');
  const [sidebarTitle, setSidebarTitle] = useState(currentTheme.sidebarName || 'CRM-DGA');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logo, setLocalLogo] = useState(currentTheme.logo || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<string>();

  const [integrationSettings, setIntegrationSettings] = useState({
    email: {
      provider: 'smtp',
      host: '',
      port: '',
      username: '',
      password: '',
      secure: true
    },
    sms: {
      provider: 'twilio',
      accountSid: '',
      authToken: '',
      fromNumber: ''
    },
    whatsapp: {
      enabled: false,
      apiKey: '',
      phoneNumber: ''
    },
    payment: {
      provider: 'stripe',
      publicKey: '',
      secretKey: '',
      webhookSecret: ''
    },
    maps: {
      provider: 'google',
      apiKey: ''
    }
  });

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

  useEffect(() => {
    setHeaderTitle(currentTheme.headerName || 'CRM-DGA');
    setSidebarTitle(currentTheme.sidebarName || 'CRM-DGA');
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

  const handleIntegrationChange = (
    integration: string,
    field: string,
    value: string | boolean
  ) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: value
      }
    }));
  };

  const handleLdapChange = (field: string, value: string | boolean) => {
    setLdapSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testIntegration = async (integration: string) => {
    alert(`Testing ${integration} integration...`);
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
    branchIds: [] as string[]
  });

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
        branchIds: []
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
        branchIds: []
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const renderUsersTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Users & Permissions</h2>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Key size={18} className="mr-2" />
          Change My Password
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name*
          </label>
          <input
            type="text"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email*
          </label>
          <input
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role*
          </label>
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Assignments*
          </label>
          <select
            multiple
            value={userForm.branchIds}
            onChange={(e) => setUserForm({
              ...userForm,
              branchIds: Array.from(e.target.selectedOptions, option => option.value)
            })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Hold Ctrl/Cmd to select multiple branches
          </p>
        </div>
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
                Branches
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {branches
                    .filter(branch => user.branchIds.includes(branch.id))
                    .map(branch => branch.name)
                    .join(', ')}
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
                        phone: user.phone || '',
                        role: user.role,
                        status: user.status,
                        branchIds: user.branchIds
                      });
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUserForReset(user.id);
                      setShowPasswordModal(true);
                    }}
                    className="text-orange-600 hover:text-orange-900 mr-3"
                    title="Reset Password"
                  >
                    <Lock size={16} />
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

      {showPasswordModal && (
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUserForReset(undefined);
          }}
          title={selectedUserForReset ? "Reset User Password" : "Change Password"}
          userId={selectedUserForReset}
        />
      )}
    </div>
  );

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

      {activeTab === 'users' && renderUsersTab()}
      
      {/* ... (other tab content remains the same) ... */}
    </div>
  );
};

export default SettingsPage;