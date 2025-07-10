import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Plus, Edit2, Trash2, Key, Palette, Globe, Users as UsersIcon, Settings as SettingsIcon, Mail, Server, TestTube } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PipelineStatus, UserRole, UserStatus } from '../types';
import { useEmail } from '../context/EmailContext';

const SettingsPage: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { pipelineStatuses, addPipelineStatus, updatePipelineStatus, deletePipelineStatus, addUser, updateUser, deleteUser, users, branches } = useData();
  const { hasPermission } = useAuth();
  const { emailConfig, updateEmailConfig, testEmailConnection, isTestingConnection } = useEmail();
  
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
    branchId: ''
  });

  const [emailSettings, setEmailSettings] = useState({
    notificationEmail: emailConfig.notificationEmail || '',
    smtpHost: emailConfig.smtpHost || '',
    smtpPort: emailConfig.smtpPort || 587,
    smtpUser: emailConfig.smtpUser || '',
    smtpPassword: emailConfig.smtpPassword || '',
    smtpSecure: emailConfig.smtpSecure || true,
    enabled: emailConfig.enabled || false
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setHeaderTitle(currentTheme.headerName || 'SISTEMA');
    setSidebarTitle(currentTheme.sidebarName || 'SISTEMA');
  }, [currentTheme]);

  useEffect(() => {
    setEmailSettings({
      notificationEmail: emailConfig.notificationEmail || '',
      smtpHost: emailConfig.smtpHost || '',
      smtpPort: emailConfig.smtpPort || 587,
      smtpUser: emailConfig.smtpUser || '',
      smtpPassword: emailConfig.smtpPassword || '',
      smtpSecure: emailConfig.smtpSecure || true,
      enabled: emailConfig.enabled || false
    });
  }, [emailConfig]);

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
    updateEmailConfig(emailSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestEmailConnection = async () => {
    setTestResult(null);
    
    // Update config before testing
    updateEmailConfig(emailSettings);
    
    try {
      const success = await testEmailConnection();
      setTestResult({
        success,
        message: success 
          ? 'Conexão SMTP testada com sucesso!' 
          : 'Falha na conexão SMTP. Verifique as configurações.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão SMTP.'
      });
    }
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
        branchId: ''
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
        branchId: ''
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon, color: 'from-blue-500 to-indigo-600' },
    { id: 'appearance', label: 'Aparência', icon: Palette, color: 'from-purple-500 to-pink-600' },
    { id: 'pipeline', label: 'Pipeline', icon: RefreshCw, color: 'from-green-500 to-emerald-600' },
    { id: 'users', label: 'Usuários', icon: UsersIcon, color: 'from-orange-500 to-red-600' },
    { id: 'integrations', label: 'Integrações', icon: Globe, color: 'from-cyan-500 to-blue-600' },
    { id: 'notifications', label: 'Notificações', icon: Mail, color: 'from-pink-500 to-rose-600' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Personalize e configure seu CRM
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Configurações salvas!
            </div>
          )}
          <button
            onClick={handleSave}
            className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <Save size={16} className="mr-2" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
                
                <div className="space-y-6">
                  {/* Logo Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Logo da Aplicação</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-blue-300 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                        {logo ? (
                          <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="text-center">
                            <Upload size={20} className="text-blue-400 mx-auto mb-1" />
                            <span className="text-xs text-blue-600">Logo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label
                            htmlFor="logo-upload"
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 cursor-pointer inline-block text-center text-sm font-medium"
                          >
                            Fazer Upload
                          </label>
                          {logo && (
                            <button
                              onClick={handleRemoveLogo}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Tamanho recomendado: 200x200px. Máximo: 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Titles Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Título do Cabeçalho
                      </label>
                      <input
                        type="text"
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-sm"
                        placeholder="Nome no cabeçalho"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Título da Sidebar
                      </label>
                      <input
                        type="text"
                        value={sidebarTitle}
                        onChange={(e) => setSidebarTitle(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        placeholder="Nome na sidebar"
                      />
                    </div>
                  </div>
                  
                  {/* System Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 sm:p-6 rounded-xl border border-orange-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Fuso Horário
                      </label>
                      <select
                        defaultValue="America/Sao_Paulo"
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      >
                        <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-cyan-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Formato de Data
                      </label>
                      <select
                        defaultValue="dd/MM/yyyy"
                        className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm"
                      >
                        <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2023)</option>
                        <option value="MM/dd/yyyy">MM/DD/YYYY (12/31/2023)</option>
                        <option value="yyyy-MM-dd">YYYY-MM-DD (2023-12-31)</option>
                      </select>
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-6 rounded-xl border border-pink-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Moeda
                      </label>
                      <select
                        defaultValue="BRL"
                        className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 text-sm"
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Personalização Visual</h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Tema do Sistema</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Selecionar Tema
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={handleThemeChange}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                  >
                    {availableThemes.map(theme => (
                      <option key={theme.name} value={theme.name}>
                        {theme.name}
                      </option>
                    ))}
                    <option value="Custom">Personalizado</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cor Primária
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-l-lg border-2 border-r-0 border-gray-300"
                      />
                      <input
                        type="text"
                        value={customTheme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cor Secundária
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-12 h-12 rounded-l-lg border-2 border-r-0 border-gray-300"
                      />
                      <input
                        type="text"
                        value={customTheme.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Gerenciamento do Pipeline</h2>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Adicionar Status</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Status
                    </label>
                    <input
                      type="text"
                      value={statusForm.name}
                      onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-sm"
                      placeholder="Ex: Novo Lead"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cor
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={statusForm.color}
                        onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                        className="w-12 h-12 rounded-l-lg border-2 border-r-0 border-green-200"
                      />
                      <input
                        type="text"
                        value={statusForm.color}
                        onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-green-200 rounded-r-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={editingStatus ? handleUpdateStatus : handleAddStatus}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium text-sm"
                    >
                      {editingStatus ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pipelineStatuses.map((status) => (
                        <tr key={status.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: status.color }}
                              ></div>
                              <span className="text-sm font-medium text-gray-900">{status.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {status.color}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
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
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteStatus(status.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Usuários e Permissões</h2>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl border border-orange-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Adicionar Usuário</h3>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📧 Email de Boas-vindas</h4>
                  <p className="text-sm text-blue-800">
                    {emailSettings.enabled 
                      ? 'Quando um novo usuário for criado, ele receberá automaticamente um email com instruções de uso e credenciais de acesso.'
                      : 'Para enviar emails de boas-vindas automaticamente, habilite as notificações por email na aba "Notificações".'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Função
                    </label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 font-medium text-sm"
                >
                  {editingUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === UserStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
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
                                    branchId: user.branchIds[0] || ''
                                  });
                                }}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Configurações de Notificação</h2>
              
              {/* Email Notifications */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-6 rounded-xl border border-pink-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail size={20} className="mr-2 text-pink-500" />
                  Notificações por Email
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailSettings.enabled}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-pink-500 rounded focus:ring-pink-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Habilitar notificações por email</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                      Receba emails quando houver movimentação no funil de vendas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email para Notificações
                    </label>
                    <input
                      type="email"
                      value={emailSettings.notificationEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email que receberá as notificações de movimentação do pipeline
                    </p>
                  </div>
                </div>
              </div>

              {/* SMTP Configuration */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Server size={20} className="mr-2 text-blue-500" />
                  Configuração do Servidor SMTP
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Servidor SMTP
                    </label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Porta
                    </label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      placeholder="587"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Usuário SMTP
                    </label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                      placeholder="seu-email@gmail.com"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Senha SMTP
                    </label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="sua-senha-de-app"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailSettings.smtpSecure}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Usar conexão segura (TLS/SSL)</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      onClick={handleTestEmailConnection}
                      disabled={isTestingConnection}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TestTube size={16} className="mr-2" />
                      {isTestingConnection ? 'Testando...' : 'Testar Conexão SMTP'}
                    </button>
                    
                    {testResult && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        testResult.success 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <p className="text-sm font-medium">{testResult.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📧 Configuração para Gmail:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Servidor: smtp.gmail.com</li>
                    <li>• Porta: 587</li>
                    <li>• Use uma senha de app (não sua senha normal)</li>
                    <li>• Ative a verificação em 2 etapas no Gmail</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Integrações</h2>
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-cyan-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Integração LDAP</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ldapSettings.enabled}
                        onChange={(e) => handleLdapChange('enabled', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-cyan-500 rounded focus:ring-cyan-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Habilitar Autenticação LDAP</span>
                    </label>
                  </div>

                  {ldapSettings.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Servidor LDAP
                        </label>
                        <input
                          type="text"
                          value={ldapSettings.host}
                          onChange={(e) => handleLdapChange('host', e.target.value)}
                          placeholder="ldap.exemplo.com"
                          className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Porta
                        </label>
                        <input
                          type="text"
                          value={ldapSettings.port}
                          onChange={(e) => handleLdapChange('port', e.target.value)}
                          placeholder="389 ou 636 para SSL"
                          className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Base DN
                        </label>
                        <input
                          type="text"
                          value={ldapSettings.baseDN}
                          onChange={(e) => handleLdapChange('baseDN', e.target.value)}
                          placeholder="dc=exemplo,dc=com"
                          className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={ldapSettings.useSSL}
                            onChange={(e) => handleLdapChange('useSSL', e.target.checked)}
                            className="form-checkbox h-5 w-5 text-cyan-500 rounded focus:ring-cyan-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Usar SSL/TLS</span>
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          onClick={testLdapConnection}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium text-sm"
                        >
                          Testar Conexão LDAP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;