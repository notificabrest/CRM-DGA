import React, { useState } from 'react';
import { 
  Settings, Mail, Palette, Users, Shield, Bell, Globe, 
  Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader,
  User, Plus, Edit2, Trash2, Save, X, AlertTriangle, Upload, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useEmail } from '../context/EmailContext';
import { User as UserType, UserRole, UserStatus, PipelineStatus } from '../types';
import UserForm from '../components/users/UserForm';
import VersionInfo from '../components/common/VersionInfo';

const SettingsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { users, addUser, updateUser, deleteUser, pipelineStatuses, addPipelineStatus, updatePipelineStatus, deletePipelineStatus } = useData();
  const { emailConfig, updateEmailConfig, testEmailConnection, isTestingConnection } = useEmail();
  
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'version' | 'pipeline' | 'users' | 'integrations' | 'notifications'>('general');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>(undefined);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResult, setShowTestResult] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // File upload handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo PNG, JPG, JPEG ou SVG');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomTheme({ ...customTheme, logo: result });
        setLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/x-icon', 'image/vnd.microsoft.icon'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo PNG, JPG, JPEG ou ICO');
        return;
      }
      
      // Validate file size (max 1MB for favicon)
      if (file.size > 1024 * 1024) {
        alert('O favicon deve ter no máximo 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Store favicon in localStorage and update document
        localStorage.setItem('crm-favicon', result);
        updateFavicon(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFavicon = (faviconData: string) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = faviconData;
    document.head.appendChild(link);
  };

  const removeLogo = () => {
    setCustomTheme({ ...customTheme, logo: '' });
    setLogo('');
  };

  const removeFavicon = () => {
    localStorage.removeItem('crm-favicon');
    // Reset to default favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/vite.svg';
    document.head.appendChild(link);
  };

  // Load saved favicon on component mount
  React.useEffect(() => {
    const savedFavicon = localStorage.getItem('crm-favicon');
    if (savedFavicon) {
      updateFavicon(savedFavicon);
    }
  }, []);

  // Pipeline status management
  const [newStatus, setNewStatus] = useState({ name: '', color: '#3B82F6' });
  const [editingStatus, setEditingStatus] = useState<PipelineStatus | null>(null);

  // Theme customization state
  const [customTheme, setCustomTheme] = useState({
    primaryColor: currentTheme.primaryColor,
    backgroundColor: currentTheme.backgroundColor,
    textColor: currentTheme.textColor,
    secondaryColor: currentTheme.secondaryColor,
    headerName: currentTheme.headerName || 'SISTEMA',
    sidebarName: currentTheme.sidebarName || 'CRM-DGA',
    logo: currentTheme.logo || '',
  });

  // Function to save all settings
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Save theme customizations
      customizeTheme(customTheme);
      setHeaderName(customTheme.headerName);
      setSidebarName(customTheme.sidebarName);
      setLogo(customTheme.logo);
      
      // Save email configuration
      // Email config is automatically saved via updateEmailConfig
      
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage('Configurações salvas com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveMessage('Erro ao salvar configurações. Tente novamente.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };
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

  const handleAddPipelineStatus = () => {
    if (newStatus.name.trim()) {
      addPipelineStatus({
        ...newStatus,
        orderIndex: pipelineStatuses.length,
        isDefault: false
      });
      setNewStatus({ name: '', color: '#3B82F6' });
    }
  };

  const handleEditPipelineStatus = (status: PipelineStatus) => {
    setEditingStatus(status);
  };

  const handleUpdatePipelineStatus = () => {
    if (editingStatus) {
      updatePipelineStatus(editingStatus.id, editingStatus);
      setEditingStatus(null);
    }
  };

  const handleDeletePipelineStatus = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      deletePipelineStatus(id);
    }
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
    { id: 'general', label: 'Geral', icon: Settings, color: 'bg-blue-500' },
    { id: 'appearance', label: 'Aparência', icon: Palette, color: 'bg-purple-500' },
    { id: 'version', label: 'Versão', icon: Globe, color: 'bg-gray-500' },
    { id: 'pipeline', label: 'Pipeline', icon: RefreshCw, color: 'bg-green-500' },
    ...(hasPermission([UserRole.ADMIN, UserRole.DIRECTOR]) ? [{ id: 'users', label: 'Usuários', icon: Users, color: 'bg-orange-500' }] : []),
    { id: 'integrations', label: 'Integrações', icon: Shield, color: 'bg-cyan-500' },
    { id: 'notifications', label: 'Notificações', icon: Bell, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1">Personalize e configure seu CRM</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveMessage && (
            <div className={`px-3 py-2 rounded-md text-sm font-medium ${
              saveMessage.includes('sucesso') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {saveMessage.includes('sucesso') ? (
                <CheckCircle size={16} className="inline mr-2" />
              ) : (
                <XCircle size={16} className="inline mr-2" />
              )}
              {saveMessage}
            </div>
          )}
          <button 
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center rounded-t-lg ${
                  activeTab === tab.id
                    ? `${tab.color} text-white border-transparent`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-gray-100'
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
            <h3 className="text-lg font-medium mb-4">Configurações Gerais</h3>
            
            {/* Logo da Aplicação */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-4">Logo da Aplicação</h4>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {currentTheme.logo ? (
                    <img src={currentTheme.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-gray-400 text-xs text-center">Sem Logo</div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex items-center cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Upload size={14} className="mr-1" />
                    Upload Logo
                  </label>
                  {currentTheme.logo && (
                    <button 
                      onClick={removeLogo}
                      className="px-4 py-2 text-red-500 border border-red-300 rounded text-sm hover:bg-red-50 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Formatos: PNG, JPG, JPEG, SVG. Tamanho máximo: 2MB</p>
            </div>

            {/* Favicon */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h4 className="font-medium mb-4">Favicon do Sistema</h4>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white border-2 border-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {localStorage.getItem('crm-favicon') ? (
                    <img src={localStorage.getItem('crm-favicon')!} alt="Favicon" className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="text-purple-400 text-xs text-center">Favicon</div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    id="favicon-upload"
                    accept="image/png,image/jpg,image/jpeg,image/x-icon,image/vnd.microsoft.icon"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="px-4 py-2 bg-purple-500 text-white rounded text-sm flex items-center cursor-pointer hover:bg-purple-600 transition-colors"
                  >
                    <Upload size={14} className="mr-1" />
                    Upload Favicon
                  </label>
                  {localStorage.getItem('crm-favicon') && (
                    <button 
                      onClick={removeFavicon}
                      className="px-4 py-2 text-red-500 border border-red-300 rounded text-sm hover:bg-red-50 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Formatos: PNG, JPG, JPEG, ICO. Tamanho máximo: 1MB. Recomendado: 32x32px</p>
            </div>

            {/* Títulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Cabeçalho
                </label>
                <input
                  type="text"
                  value={customTheme.headerName}
                  onChange={(e) => setCustomTheme({ ...customTheme, headerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SISTEMA"
                />
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Sidebar
                </label>
                <input
                  type="text"
                  value={customTheme.sidebarName}
                  onChange={(e) => setCustomTheme({ ...customTheme, sidebarName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CRM-DGA"
                />
              </div>
            </div>

            {/* Configurações de Data/Hora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>America/São_Paulo (GMT-3)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Europe/London (GMT+0)</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Data
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>DD/MM/YYYY (31/12/2023)</option>
                  <option>MM/DD/YYYY (12/31/2023)</option>
                  <option>YYYY-MM-DD (2023-12-31)</option>
                </select>
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Real Brasileiro (R$)</option>
                  <option>Dólar Americano ($)</option>
                  <option>Euro (€)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCustomThemeUpdate}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Salvar Configurações Gerais
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Aparência</h3>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-medium mb-4">Seleção de Tema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentTheme.name === theme.name
                        ? 'border-blue-500 bg-blue-50'
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
              <h4 className="text-lg font-medium mb-4">Tema Personalizado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Primária
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
                    Cor Secundária
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
                    Cor de Fundo
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
                    Cor do Texto
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
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Aplicar Tema Personalizado
              </button>
            </div>
          </div>
        )}

        {activeTab === 'version' && (
          <div className="space-y-6">
            <VersionInfo showDetailed={true} />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Gerenciamento do Pipeline</h3>
            
            {/* Adicionar Status */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-medium mb-4">Adicionar Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Status
                  </label>
                  <input
                    type="text"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Novo Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleAddPipelineStatus}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 h-10"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium">Status Existentes</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {pipelineStatuses.map((status) => (
                  <div key={status.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      {editingStatus?.id === status.id ? (
                        <input
                          type="text"
                          value={editingStatus.name}
                          onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium">{status.name}</span>
                      )}
                      <span className="text-sm text-gray-500">#{status.color}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingStatus?.id === status.id ? (
                        <>
                          <button
                            onClick={handleUpdatePipelineStatus}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setEditingStatus(null)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPipelineStatus(status)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePipelineStatus(status.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  <h3 className="text-lg font-medium">Usuários e Permissões</h3>
                  <button
                    onClick={handleNewUser}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Usuário
                  </button>
                </div>

                {/* Email de Boas-vindas */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Mail size={16} className="mr-2 text-blue-600" />
                    <span className="font-medium text-blue-800">Email de Boas-vindas</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Quando um novo usuário for criado, ele receberá automaticamente um email com instruções de uso e credenciais de acesso.
                  </p>
                </div>

                {/* Lista de Usuários */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 uppercase">
                      <div>USUÁRIO</div>
                      <div>EMAIL</div>
                      <div>FUNÇÃO</div>
                      <div>STATUS</div>
                      <div>AÇÕES</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <div key={user.id} className="px-6 py-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === UserStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Integrações</h3>
            
            <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
              <h4 className="font-medium mb-4">Integração LDAP</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ldapEnabled"
                  className="mr-3 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="ldapEnabled" className="text-sm font-medium text-gray-700">
                  Habilitar Autenticação LDAP
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Permite autenticação através de servidor LDAP/Active Directory
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium mb-4">Outras Integrações</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">Google Workspace</h5>
                    <p className="text-sm text-gray-600">Sincronização com Gmail e Google Calendar</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">Microsoft 365</h5>
                    <p className="text-sm text-gray-600">Integração com Outlook e Teams</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">WhatsApp Business</h5>
                    <p className="text-sm text-gray-600">Envio de mensagens via WhatsApp</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Configurações de Notificação</h3>
            
            {/* Configurações de Notificação */}
            <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Mail className="mr-2 text-pink-500" size={20} />
                Notificações por Email
              </h4>
              
              <div className="mb-6 p-4 bg-white rounded-lg border border-pink-200">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={emailConfig.enabled}
                    onChange={(e) => handleEmailConfigUpdate('enabled', e.target.checked)}
                    className="mr-2 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-700">
                    Habilitar notificações por email
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  Quando ativado, o sistema enviará notificações automáticas por email de eventos importantes.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email para Notificações
                </label>
                <input
                  type="email"
                  value={emailConfig.notificationEmail}
                  onChange={(e) => handleEmailConfigUpdate('notificationEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="jonny@brestelecom.com.br"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email que receberá as notificações de movimentação do pipeline
                </p>
              </div>
            </div>

            {/* Configuração do Servidor SMTP */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="mr-2 text-blue-500" size={20} />
                Configuração do Servidor SMTP
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => handleEmailConfigUpdate('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => handleEmailConfigUpdate('smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="587"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário SMTP
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUser}
                    onChange={(e) => handleEmailConfigUpdate('smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="testecovid1@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => handleEmailConfigUpdate('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••••••••••"
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
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={emailConfig.smtpSecure}
                    onChange={(e) => handleEmailConfigUpdate('smtpSecure', e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smtpSecure" className="text-sm text-gray-700">
                    Usar conexão segura (TLS/SSL)
                  </label>
                </div>
              </div>
              
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
                Testar Conexão SMTP (Envio Real)
              </button>
            </div>

            {/* Sistema de Email Real Implementado */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-lg font-medium text-green-800 mb-2 flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Sistema de Email Real Implementado!
              </h4>
              <p className="text-green-700 mb-4">
                O sistema agora envia emails reais usando Netlify Functions com Nodemailer. Configure seu SMTP e teste a conexão para começar a receber notificações.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-green-300">
                <h5 className="font-medium text-green-800 mb-2">Configuração para Gmail:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Servidor: smtp.gmail.com</li>
                  <li>• Porta: 587</li>
                  <li>• Use uma senha de app (16 caracteres)</li>
                  <li>• Ative a verificação em 2 etapas no Gmail</li>
                  <li>• O teste enviará um email real para verificação</li>
                </ul>
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
                      Resultado do Teste SMTP
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
                            <span className="font-medium text-gray-700">Porta:</span>
                            <span className="ml-2">{testResult.details.port}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Usuário:</span>
                            <span className="ml-2">{testResult.details.user}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email de Teste:</span>
                            <span className="ml-2">{testResult.details.testEmail}</span>
                          </div>
                          {testResult.details.responseTime && (
                            <div>
                              <span className="font-medium text-gray-700">Tempo de Resposta:</span>
                              <span className="ml-2">{testResult.details.responseTime}ms</span>
                            </div>
                          )}
                        </div>
                        
                        {testResult.details.logs && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Logs Detalhados:</h4>
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
      </div>
    </div>
  );
};

export default SettingsPage;
                    Remover
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tamanho recomendado: 200x200px. Máximo: 2MB</p>
            </div>

            {/* Títulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Cabeçalho
                </label>
                <input
                  type="text"
                  value={customTheme.headerName}
                  onChange={(e) => setCustomTheme({ ...customTheme, headerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SISTEMA"
                />
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Sidebar
                </label>
                <input
                  type="text"
                  value={customTheme.sidebarName}
                  onChange={(e) => setCustomTheme({ ...customTheme, sidebarName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CRM-DGA"
                />
              </div>
            </div>

            {/* Configurações de Data/Hora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>America/São_Paulo (GMT-3)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Europe/London (GMT+0)</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Data
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>DD/MM/YYYY (31/12/2023)</option>
                  <option>MM/DD/YYYY (12/31/2023)</option>
                  <option>YYYY-MM-DD (2023-12-31)</option>
                </select>
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Real Brasileiro (R$)</option>
                  <option>Dólar Americano ($)</option>
                  <option>Euro (€)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCustomThemeUpdate}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Salvar Configurações Gerais
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Aparência</h3>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-medium mb-4">Seleção de Tema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentTheme.name === theme.name
                        ? 'border-blue-500 bg-blue-50'
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
              <h4 className="text-lg font-medium mb-4">Tema Personalizado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Primária
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
                    Cor Secundária
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
                    Cor de Fundo
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
                    Cor do Texto
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
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Aplicar Tema Personalizado
              </button>
            </div>
          </div>
        )}

        {activeTab === 'version' && (
          <div className="space-y-6">
            <VersionInfo showDetailed={true} />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Gerenciamento do Pipeline</h3>
            
            {/* Adicionar Status */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium mb-4">Adicionar Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Status
                  </label>
                  <input
                    type="text"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Novo Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleAddPipelineStatus}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 h-10"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium">Status Existentes</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {pipelineStatuses.map((status) => (
                  <div key={status.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      {editingStatus?.id === status.id ? (
                        <input
                          type="text"
                          value={editingStatus.name}
                          onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium">{status.name}</span>
                      )}
                      <span className="text-sm text-gray-500">#{status.color}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingStatus?.id === status.id ? (
                        <>
                          <button
                            onClick={handleUpdatePipelineStatus}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setEditingStatus(null)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPipelineStatus(status)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePipelineStatus(status.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  <h3 className="text-lg font-medium">Usuários e Permissões</h3>
                  <button
                    onClick={handleNewUser}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Usuário
                  </button>
                </div>

                {/* Email de Boas-vindas */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Mail size={16} className="mr-2 text-blue-600" />
                    <span className="font-medium text-blue-800">Email de Boas-vindas</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Quando um novo usuário for criado, ele receberá automaticamente um email com instruções de uso e credenciais de acesso.
                  </p>
                </div>

                {/* Formulário de Usuário */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>SALESPERSON</option>
                      <option>MANAGER</option>
                      <option>DIRECTOR</option>
                      <option>ADMIN</option>
                    </select>
                  </div>
                </div>

                <button className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 mb-6">
                  Adicionar Usuário
                </button>

                {/* Lista de Usuários */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 uppercase">
                      <div>USUÁRIO</div>
                      <div>EMAIL</div>
                      <div>FUNÇÃO</div>
                      <div>STATUS</div>
                      <div>AÇÕES</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <div key={user.id} className="px-6 py-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === UserStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Integrações</h3>
            
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h4 className="font-medium mb-4">Integração LDAP</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ldapEnabled"
                  className="mr-3 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="ldapEnabled" className="text-sm font-medium text-gray-700">
                  Habilitar Autenticação LDAP
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Permite autenticação através de servidor LDAP/Active Directory
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium mb-4">Outras Integrações</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">Google Workspace</h5>
                    <p className="text-sm text-gray-600">Sincronização com Gmail e Google Calendar</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">Microsoft 365</h5>
                    <p className="text-sm text-gray-600">Integração com Outlook e Teams</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">WhatsApp Business</h5>
                    <p className="text-sm text-gray-600">Envio de mensagens via WhatsApp</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Configurações de Notificação</h3>
            
            {/* Configurações de Notificação */}
            <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Mail className="mr-2 text-pink-500" size={20} />
                Notificações por Email
              </h4>
              
              <div className="mb-6 p-4 bg-white rounded-lg border border-pink-200">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={emailConfig.enabled}
                    onChange={(e) => handleEmailConfigUpdate('enabled', e.target.checked)}
                    className="mr-2 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-700">
                    Habilitar notificações por email
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  Quando ativado, o sistema enviará notificações automáticas por email de eventos importantes.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email para Notificações
                </label>
                <input
                  type="email"
                  value={emailConfig.notificationEmail}
                  onChange={(e) => handleEmailConfigUpdate('notificationEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="jonny@brestelecom.com.br"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email que receberá as notificações de movimentação do pipeline
                </p>
              </div>
            </div>

            {/* Configuração do Servidor SMTP */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="mr-2 text-blue-500" size={20} />
                Configuração do Servidor SMTP
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => handleEmailConfigUpdate('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => handleEmailConfigUpdate('smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="587"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário SMTP
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUser}
                    onChange={(e) => handleEmailConfigUpdate('smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="testecovid1@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => handleEmailConfigUpdate('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••••••••••"
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
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={emailConfig.smtpSecure}
                    onChange={(e) => handleEmailConfigUpdate('smtpSecure', e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smtpSecure" className="text-sm text-gray-700">
                    Usar conexão segura (TLS/SSL)
                  </label>
                </div>
              </div>
              
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
                Testar Conexão SMTP (Envio Real)
              </button>
            </div>

            {/* Sistema de Email Real Implementado */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-lg font-medium text-green-800 mb-2 flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Sistema de Email Real Implementado!
              </h4>
              <p className="text-green-700 mb-4">
                O sistema agora envia emails reais usando Netlify Functions com Nodemailer. Configure seu SMTP e teste a conexão para começar a receber notificações.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-green-300">
                <h5 className="font-medium text-green-800 mb-2">Configuração para Gmail:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Servidor: smtp.gmail.com</li>
                  <li>• Porta: 587</li>
                  <li>• Use uma senha de app (16 caracteres)</li>
                  <li>• Ative a verificação em 2 etapas no Gmail</li>
                  <li>• O teste enviará um email real para verificação</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Para Envio Real:</h5>
                <p className="text-sm text-blue-700">
                  Para envio real de emails, você precisa implementar um backend que:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Tenha as configurações SMTP no servidor</li>
                  <li>• Faça a conexão real com o servidor SMTP</li>
                  <li>• Retorne logs detalhados do processo</li>
                </ul>
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
                      Resultado do Teste SMTP
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
                            <span className="font-medium text-gray-700">Porta:</span>
                            <span className="ml-2">{testResult.details.port}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Usuário:</span>
                            <span className="ml-2">{testResult.details.user}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email de Teste:</span>
                            <span className="ml-2">{testResult.details.testEmail}</span>
                          </div>
                          {testResult.details.responseTime && (
                            <div>
                              <span className="font-medium text-gray-700">Tempo de Resposta:</span>
                              <span className="ml-2">{testResult.details.responseTime}ms</span>
                            </div>
                          )}
                        </div>
                        
                        {testResult.details.logs && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Logs Detalhados:</h4>
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
      </div>
    </div>
  );
};

export default SettingsPage;