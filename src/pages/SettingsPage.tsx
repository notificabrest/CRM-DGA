import React, { useState, useRef } from 'react';
import { 
  Settings, Palette, Info, Users, Mail, Eye, EyeOff, Upload, X, 
  Check, AlertCircle, Loader, Save, Image, Globe, Monitor, Smartphone,
  Building2, CreditCard, Bell, Shield, Zap, Link, Download, FileText,
  CheckCircle, XCircle, Cloud, MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { useIntegrations } from '../context/IntegrationContext';
import UserForm from '../components/users/UserForm';
import VersionInfo from '../components/common/VersionInfo';
import { UserRole } from '../types';

const SettingsPage: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { users, pipelineStatuses, addUser, updateUser, deleteUser, addPipelineStatus, updatePipelineStatus, deletePipelineStatus } = useData();
  const { user, hasPermission } = useAuth();
  const { emailConfig, updateEmailConfig, testEmailConnection, isTestingConnection } = useEmail();
  const {
    ldapConfig,
    googleConfig,
    microsoftConfig,
    whatsappConfig,
    updateLDAPConfig,
    updateGoogleConfig,
    updateMicrosoftConfig,
    updateWhatsAppConfig,
    testLDAPConnection,
    testGoogleConnection,
    testMicrosoftConnection,
    testWhatsAppConnection
  } = useIntegrations();
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [customColors, setCustomColors] = useState({
    primaryColor: currentTheme.primaryColor,
    backgroundColor: currentTheme.backgroundColor,
    textColor: currentTheme.textColor,
    secondaryColor: currentTheme.secondaryColor,
  });
  const [headerName, setHeaderNameLocal] = useState(currentTheme.headerName || 'SISTEMA');
  const [sidebarName, setSidebarNameLocal] = useState(currentTheme.sidebarName || 'SISTEMA');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3B82F6');
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentTheme.logo || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [integrationTests, setIntegrationTests] = useState<{ [key: string]: any }>({});
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  
  // Integrations state
  const [integrations, setIntegrations] = useState(() => {
    try {
      const saved = localStorage.getItem('crm-integrations');
      return saved ? JSON.parse(saved) : {
        ldap: {
          enabled: false,
          server: '',
          port: 389,
          baseDN: '',
          username: '',
          password: '',
          useSSL: false
        },
        google: {
          enabled: false,
          clientId: '',
          clientSecret: '',
          domain: ''
        },
        microsoft: {
          enabled: false,
          tenantId: '',
          clientId: '',
          clientSecret: ''
        },
        whatsapp: {
          enabled: false,
          phoneNumberId: '',
          accessToken: '',
          webhookUrl: ''
        }
      };
    } catch {
      return {
        ldap: { enabled: false, server: '', port: 389, baseDN: '', username: '', password: '', useSSL: false },
        google: { enabled: false, clientId: '', clientSecret: '', domain: '' },
        microsoft: { enabled: false, tenantId: '', clientId: '', clientSecret: '' },
        whatsapp: { enabled: false, phoneNumberId: '', accessToken: '', webhookUrl: '' }
      };
    }
  });
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Load saved favicon on component mount
  React.useEffect(() => {
    const savedFavicon = localStorage.getItem('crm-favicon');
    if (savedFavicon) {
      setFaviconPreview(savedFavicon);
      // Apply favicon to the page
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = savedFavicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, []);

  const handleTestIntegration = async (type: 'ldap' | 'google' | 'microsoft' | 'whatsapp') => {
    setTestingIntegration(type);
    
    try {
      let result;
      switch (type) {
        case 'ldap':
          result = await testLDAPConnection();
          break;
        case 'google':
          result = await testGoogleConnection();
          break;
        case 'microsoft':
          result = await testMicrosoftConnection();
          break;
        case 'whatsapp':
          result = await testWhatsAppConnection();
          break;
      }
      
      setIntegrationTests(prev => ({
        ...prev,
        [type]: result
      }));
    } catch (error) {
      setIntegrationTests(prev => ({
        ...prev,
        [type]: {
          success: false,
          message: `Erro no teste: ${(error as Error).message}`,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setTestingIntegration(null);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save theme customizations
      customizeTheme(customColors);
      setHeaderName(headerName);
      setSidebarName(sidebarName);
      
      // Save logo if changed
      if (logoPreview && logoPreview !== currentTheme.logo) {
        setLogo(logoPreview);
      }
      
      // Save favicon if changed
      if (faviconPreview) {
        localStorage.setItem('crm-favicon', faviconPreview);
        // Apply favicon to the page
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = faviconPreview;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      
      // Save integrations
      localStorage.setItem('crm-integrations', JSON.stringify(integrations));
      
      setSaveStatus('success');
      setSaveMessage('Configurações salvas com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Erro ao salvar configurações. Tente novamente.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 5000);
    }
  };

  const handleThemeSelect = (theme: any) => {
    console.log('🎨 Selecionando tema:', theme.name);
    setTheme(theme);
    setCustomColors({
      primaryColor: theme.primaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      secondaryColor: theme.secondaryColor,
    });
    setSaveStatus('success');
    setSaveMessage(`Tema "${theme.name}" aplicado com sucesso!`);
    setTimeout(() => {
      setSaveStatus('idle');
      setSaveMessage('');
    }, 3000);
  };

  const testIntegration = async (type: string) => {
    setTestingIntegration(type);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      switch (type) {
        case 'ldap':
          if (!integrations.ldap.server || !integrations.ldap.username) {
            throw new Error('Servidor e usuário são obrigatórios');
          }
          break;
        case 'google':
          if (!integrations.google.clientId || !integrations.google.domain) {
            throw new Error('Client ID e domínio são obrigatórios');
          }
          break;
        case 'microsoft':
          if (!integrations.microsoft.tenantId || !integrations.microsoft.clientId) {
            throw new Error('Tenant ID e Client ID são obrigatórios');
          }
          break;
        case 'whatsapp':
          if (!integrations.whatsapp.phoneNumberId || !integrations.whatsapp.accessToken) {
            throw new Error('Phone Number ID e Access Token são obrigatórios');
          }
          break;
      }
      
      setSaveStatus('success');
      setSaveMessage(`Integração ${type.toUpperCase()} testada com sucesso!`);
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(`Erro no teste ${type.toUpperCase()}: ${(error as Error).message}`);
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    } finally {
      setTestingIntegration(null);
    }
  };

  const updateIntegration = (type: string, field: string, value: any) => {
    setIntegrations(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione um arquivo PNG, JPG, JPEG ou SVG.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione um arquivo PNG, JPG, JPEG ou ICO.');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFaviconPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogo('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview(null);
    localStorage.removeItem('crm-favicon');
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
    // Reset to default favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = '/vite.svg';
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testEmailConnection();
      setTestResult(result);
      setShowTestModal(true);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão',
        details: { error: (error as Error).message, logs: [] }
      });
      setShowTestModal(true);
    }
  };

  const handleAddStatus = () => {
    if (newStatusName.trim()) {
      addPipelineStatus({
        name: newStatusName.trim(),
        color: newStatusColor,
        orderIndex: pipelineStatuses.length,
        isDefault: false
      });
      setNewStatusName('');
      setNewStatusColor('#3B82F6');
    }
  };

  const handleEditStatus = (status: any) => {
    setEditingStatus(status);
    setNewStatusName(status.name);
    setNewStatusColor(status.color);
    setShowStatusForm(true);
  };

  const handleUpdateStatus = () => {
    if (editingStatus && newStatusName.trim()) {
      updatePipelineStatus(editingStatus.id, {
        name: newStatusName.trim(),
        color: newStatusColor
      });
      setEditingStatus(null);
      setShowStatusForm(false);
      setNewStatusName('');
      setNewStatusColor('#3B82F6');
    }
  };

  const handleDeleteStatus = (statusId: string) => {
    // Check if status is being used by any deals
    const statusInUse = deals.some(deal => deal.statusId === statusId);
    
    if (statusInUse) {
      alert('Este status não pode ser excluído pois está sendo usado por negócios ativos.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      deletePipelineStatus(statusId);
    }
  };

  const handleCancelStatusEdit = () => {
    setEditingStatus(null);
    setShowStatusForm(false);
    setNewStatusName('');
    setNewStatusColor('#3B82F6');
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(id);
    }
  };

  const handleUserFormClose = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings, color: 'bg-blue-500' },
    { id: 'aparencia', label: 'Aparência', icon: Palette, color: 'bg-purple-500' },
    { id: 'versao', label: 'Versão', icon: Info, color: 'bg-gray-500' },
    { id: 'pipeline', label: 'Pipeline', icon: CreditCard, color: 'bg-green-500' },
    ...(hasPermission([UserRole.ADMIN, UserRole.DIRECTOR]) ? [
      { id: 'usuarios', label: 'Usuários', icon: Users, color: 'bg-orange-500' }
    ] : []),
    { id: 'integracoes', label: 'Integrações', icon: Zap, color: 'bg-cyan-500' },
    { id: 'integrations', label: 'Integrações', icon: Zap, color: 'bg-cyan-500' },
    { id: 'notifications', label: 'Notificações', icon: Mail, color: 'bg-pink-500' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configurações Gerais</h3>
            
            {/* Logo Upload */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Image className="mr-2 text-blue-600" size={20} />
                Logo da Aplicação
              </h4>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto max-w-32 object-contain border border-gray-200 rounded-lg bg-white p-2" />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <Image size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                  >
                    <Upload size={16} className="mr-2" />
                    Fazer Upload
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Tamanho recomendado: 200x50px. Máximo: 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="mr-2 text-purple-600" size={20} />
                Favicon do Sistema
              </h4>
              <div className="flex items-center space-x-4">
                {faviconPreview ? (
                  <div className="relative">
                    <img src={faviconPreview} alt="Favicon Preview" className="h-8 w-8 object-contain border border-gray-200 rounded bg-white p-1" />
                    <button
                      onClick={handleRemoveFavicon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="h-8 w-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
                    <Globe size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/x-icon,image/vnd.microsoft.icon"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => faviconInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                  >
                    <Upload size={16} className="mr-2" />
                    Fazer Upload
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Tamanho recomendado: 32x32px. Máximo: 1MB
                  </p>
                </div>
              </div>
            </div>

            {/* System Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título do Cabeçalho
                </label>
                <input
                  type="text"
                  value={headerName}
                  onChange={(e) => setHeaderNameLocal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: SISTEMA"
                />
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título da Sidebar
                </label>
                <input
                  type="text"
                  value={sidebarName}
                  onChange={(e) => setSidebarNameLocal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: CRM-DGA"
                />
              </div>
            </div>

            {/* System Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                  <option value="America/New_York">América/Nova York (GMT-5)</option>
                  <option value="Europe/London">Europa/Londres (GMT+0)</option>
                </select>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formato de Data
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                </select>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moeda
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configurações de Aparência</h3>
            
            {/* Theme Selection */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Temas Predefinidos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentTheme.name === theme.name
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.primaryColor }}
                      ></div>
                      <span className="font-medium">{theme.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Theme */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Tema Personalizado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.primaryColor}
                      onChange={(e) => setCustomColors({ ...customColors, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.primaryColor}
                      onChange={(e) => setCustomColors({ ...customColors, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.secondaryColor}
                      onChange={(e) => setCustomColors({ ...customColors, secondaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.secondaryColor}
                      onChange={(e) => setCustomColors({ ...customColors, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'versao':
        return (
          <div className="space-y-6">
            <VersionInfo showDetailed={true} />
          </div>
        );

      case 'pipeline':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Gerenciamento do Pipeline</h3>
            
            {/* Add New Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                {editingStatus ? 'Editar Status' : 'Adicionar Status'}
              </h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Status
                  </label>
                  <input
                    type="text"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Novo Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="mt-6 flex space-x-2">
                  {editingStatus ? (
                    <>
                      <button
                        onClick={handleUpdateStatus}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                      >
                        Atualizar
                      </button>
                      <button
                        onClick={handleCancelStatusEdit}
                        className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddStatus}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-base font-semibold text-gray-900">Status Existentes</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {pipelineStatuses.map((status) => (
                  <div key={status.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{status.name}</span>
                      <span className="text-sm text-gray-500">{status.color}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditStatus(status)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar status"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStatus(status.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir status"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'usuarios':
        return (
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
                  <h3 className="text-lg font-semibold text-gray-900">Usuários e Permissões</h3>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    Adicionar Usuário
                  </button>
                </div>

                {/* Welcome Email Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Mail className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-2">Email de Boas-vindas</h4>
                      <p className="text-sm text-gray-600">
                        Quando um novo usuário for criado, ele receberá automaticamente um email com instruções de uso e credenciais de acesso.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-1">Usuário</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-2">Função</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Ações</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <div key={user.id} className="px-6 py-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'DIRECTOR' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                              user.role === 'SALESPERSON' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                              >
                                <Settings size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'integracoes':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Integrações</h3>
            
            {/* LDAP Integration */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    🏢 LDAP / Active Directory
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">Autenticação corporativa</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testIntegration('ldap')}
                    disabled={testingIntegration === 'ldap' || !integrations.ldap.enabled}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {testingIntegration === 'ldap' ? 'Testando...' : 'Testar'}
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.ldap.enabled}
                      onChange={(e) => updateIntegration('ldap', 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                      integrations.ldap.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integrations.ldap.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              {integrations.ldap.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Servidor LDAP</label>
                    <input
                      type="text"
                      value={integrations.ldap.server}
                      onChange={(e) => updateIntegration('ldap', 'server', e.target.value)}
                      placeholder="ldap.empresa.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Porta</label>
                    <input
                      type="number"
                      value={integrations.ldap.port}
                      onChange={(e) => updateIntegration('ldap', 'port', parseInt(e.target.value))}
                      placeholder="389"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base DN</label>
                    <input
                      type="text"
                      value={integrations.ldap.baseDN}
                      onChange={(e) => updateIntegration('ldap', 'baseDN', e.target.value)}
                      placeholder="dc=empresa,dc=com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
                    <input
                      type="text"
                      value={integrations.ldap.username}
                      onChange={(e) => updateIntegration('ldap', 'username', e.target.value)}
                      placeholder="admin@empresa.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input
                      type="password"
                      value={integrations.ldap.password}
                      onChange={(e) => updateIntegration('ldap', 'password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrations.ldap.useSSL}
                        onChange={(e) => updateIntegration('ldap', 'useSSL', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Usar SSL/TLS</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Google Workspace Integration */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    📧 Google Workspace
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">Integração com Gmail e Google Calendar</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testIntegration('google')}
                    disabled={testingIntegration === 'google' || !integrations.google.enabled}
                    className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {testingIntegration === 'google' ? 'Testando...' : 'Testar'}
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.google.enabled}
                      onChange={(e) => updateIntegration('google', 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                      integrations.google.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integrations.google.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              {integrations.google.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                    <input
                      type="text"
                      value={integrations.google.clientId}
                      onChange={(e) => updateIntegration('google', 'clientId', e.target.value)}
                      placeholder="123456789-abc.apps.googleusercontent.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                    <input
                      type="password"
                      value={integrations.google.clientSecret}
                      onChange={(e) => updateIntegration('google', 'clientSecret', e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domínio</label>
                    <input
                      type="text"
                      value={integrations.google.domain}
                      onChange={(e) => updateIntegration('google', 'domain', e.target.value)}
                      placeholder="empresa.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Microsoft 365 Integration */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    🏢 Microsoft 365
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">Integração com Outlook e Teams</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testIntegration('microsoft')}
                    disabled={testingIntegration === 'microsoft' || !integrations.microsoft.enabled}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {testingIntegration === 'microsoft' ? 'Testando...' : 'Testar'}
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.microsoft.enabled}
                      onChange={(e) => updateIntegration('microsoft', 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                      integrations.microsoft.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integrations.microsoft.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              {integrations.microsoft.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                    <input
                      type="text"
                      value={integrations.microsoft.tenantId}
                      onChange={(e) => updateIntegration('microsoft', 'tenantId', e.target.value)}
                      placeholder="12345678-1234-1234-1234-123456789012"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                    <input
                      type="text"
                      value={integrations.microsoft.clientId}
                      onChange={(e) => updateIntegration('microsoft', 'clientId', e.target.value)}
                      placeholder="87654321-4321-4321-4321-210987654321"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                    <input
                      type="password"
                      value={integrations.microsoft.clientSecret}
                      onChange={(e) => updateIntegration('microsoft', 'clientSecret', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Business Integration */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    💬 WhatsApp Business
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">API do WhatsApp Business</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testIntegration('whatsapp')}
                    disabled={testingIntegration === 'whatsapp' || !integrations.whatsapp.enabled}
                    className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {testingIntegration === 'whatsapp' ? 'Testando...' : 'Testar'}
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.whatsapp.enabled}
                      onChange={(e) => updateIntegration('whatsapp', 'enabled', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                      integrations.whatsapp.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integrations.whatsapp.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              {integrations.whatsapp.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number ID</label>
                    <input
                      type="text"
                      value={integrations.whatsapp.phoneNumberId}
                      onChange={(e) => updateIntegration('whatsapp', 'phoneNumberId', e.target.value)}
                      placeholder="123456789012345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                    <input
                      type="password"
                      value={integrations.whatsapp.accessToken}
                      onChange={(e) => updateIntegration('whatsapp', 'accessToken', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <input
                      type="url"
                      value={integrations.whatsapp.webhookUrl}
                      onChange={(e) => updateIntegration('whatsapp', 'webhookUrl', e.target.value)}
                      placeholder="https://seu-dominio.com/webhook/whatsapp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Integrações Disponíveis
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                Configure integrações com sistemas externos para expandir as funcionalidades do CRM.
              </p>
            </div>

            {/* LDAP/Active Directory */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Building2 size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">LDAP/Active Directory</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Integração com diretório corporativo</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ldapConfig.enabled}
                    onChange={(e) => updateLDAPConfig({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {ldapConfig.enabled && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Servidor LDAP*
                      </label>
                      <input
                        type="text"
                        value={ldapConfig.server}
                        onChange={(e) => updateLDAPConfig({ server: e.target.value })}
                        placeholder="ldap.empresa.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Porta
                      </label>
                      <input
                        type="number"
                        value={ldapConfig.port}
                        onChange={(e) => updateLDAPConfig({ port: parseInt(e.target.value) })}
                        placeholder="389"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Base DN*
                      </label>
                      <input
                        type="text"
                        value={ldapConfig.baseDN}
                        onChange={(e) => updateLDAPConfig({ baseDN: e.target.value })}
                        placeholder="dc=empresa,dc=com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Bind DN
                      </label>
                      <input
                        type="text"
                        value={ldapConfig.bindDN}
                        onChange={(e) => updateLDAPConfig({ bindDN: e.target.value })}
                        placeholder="cn=admin,dc=empresa,dc=com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ldap-ssl"
                      checked={ldapConfig.useSSL}
                      onChange={(e) => updateLDAPConfig({ useSSL: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="ldap-ssl" className="ml-2 text-xs sm:text-sm text-gray-700">
                      Usar SSL/TLS
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleTestIntegration('ldap')}
                      disabled={testingIntegration === 'ldap'}
                      className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {testingIntegration === 'ldap' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testando...
                        </>
                      ) : (
                        <>
                          <Shield size={14} className="mr-2" />
                          Testar Conexão
                        </>
                      )}
                    </button>
                  </div>
                  {integrationTests.ldap && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm ${
                      integrationTests.ldap.success 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {integrationTests.ldap.success ? (
                          <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle size={14} className="mr-2 flex-shrink-0" />
                        )}
                        <span className="font-medium">{integrationTests.ldap.message}</span>
                      </div>
                      {integrationTests.ldap.details && (
                        <div className="mt-2 text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(integrationTests.ldap.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Google Workspace */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <Mail size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Google Workspace</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Gmail, Calendar e Drive</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleConfig.enabled}
                    onChange={(e) => updateGoogleConfig({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {googleConfig.enabled && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client ID*
                      </label>
                      <input
                        type="text"
                        value={googleConfig.clientId}
                        onChange={(e) => updateGoogleConfig({ clientId: e.target.value })}
                        placeholder="123456789-abc.apps.googleusercontent.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client Secret*
                      </label>
                      <input
                        type="password"
                        value={googleConfig.clientSecret}
                        onChange={(e) => updateGoogleConfig({ clientSecret: e.target.value })}
                        placeholder="GOCSPX-..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Domínio da Empresa
                      </label>
                      <input
                        type="text"
                        value={googleConfig.domain}
                        onChange={(e) => updateGoogleConfig({ domain: e.target.value })}
                        placeholder="empresa.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleTestIntegration('google')}
                      disabled={testingIntegration === 'google'}
                      className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {testingIntegration === 'google' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testando...
                        </>
                      ) : (
                        <>
                          <Globe size={14} className="mr-2" />
                          Testar API
                        </>
                      )}
                    </button>
                  </div>
                  {integrationTests.google && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm ${
                      integrationTests.google.success 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {integrationTests.google.success ? (
                          <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle size={14} className="mr-2 flex-shrink-0" />
                        )}
                        <span className="font-medium">{integrationTests.google.message}</span>
                      </div>
                      {integrationTests.google.details && (
                        <div className="mt-2 text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(integrationTests.google.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Microsoft 365 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Building2 size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Microsoft 365</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Outlook, Teams e SharePoint</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={microsoftConfig.enabled}
                    onChange={(e) => updateMicrosoftConfig({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {microsoftConfig.enabled && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Tenant ID*
                      </label>
                      <input
                        type="text"
                        value={microsoftConfig.tenantId}
                        onChange={(e) => updateMicrosoftConfig({ tenantId: e.target.value })}
                        placeholder="12345678-1234-1234-1234-123456789012"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client ID*
                      </label>
                      <input
                        type="text"
                        value={microsoftConfig.clientId}
                        onChange={(e) => updateMicrosoftConfig({ clientId: e.target.value })}
                        placeholder="12345678-1234-1234-1234-123456789012"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client Secret*
                      </label>
                      <input
                        type="password"
                        value={microsoftConfig.clientSecret}
                        onChange={(e) => updateMicrosoftConfig({ clientSecret: e.target.value })}
                        placeholder="Client Secret Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleTestIntegration('microsoft')}
                      disabled={testingIntegration === 'microsoft'}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {testingIntegration === 'microsoft' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testando...
                        </>
                      ) : (
                        <>
                          <Cloud size={14} className="mr-2" />
                          Testar Azure AD
                        </>
                      )}
                    </button>
                  </div>
                  {integrationTests.microsoft && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm ${
                      integrationTests.microsoft.success 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {integrationTests.microsoft.success ? (
                          <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle size={14} className="mr-2 flex-shrink-0" />
                        )}
                        <span className="font-medium">{integrationTests.microsoft.message}</span>
                      </div>
                      {integrationTests.microsoft.details && (
                        <div className="mt-2 text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(integrationTests.microsoft.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WhatsApp Business */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">WhatsApp Business</h4>
                    <p className="text-xs sm:text-sm text-gray-600">API do WhatsApp Business</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappConfig.enabled}
                    onChange={(e) => updateWhatsAppConfig({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {whatsappConfig.enabled && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Phone Number ID*
                      </label>
                      <input
                        type="text"
                        value={whatsappConfig.phoneNumberId}
                        onChange={(e) => updateWhatsAppConfig({ phoneNumberId: e.target.value })}
                        placeholder="123456789012345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Access Token*
                      </label>
                      <input
                        type="password"
                        value={whatsappConfig.accessToken}
                        onChange={(e) => updateWhatsAppConfig({ accessToken: e.target.value })}
                        placeholder="EAAxxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={whatsappConfig.webhookUrl}
                        onChange={(e) => updateWhatsAppConfig({ webhookUrl: e.target.value })}
                        placeholder="https://seusite.com/webhook/whatsapp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleTestIntegration('whatsapp')}
                      disabled={testingIntegration === 'whatsapp'}
                      className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {testingIntegration === 'whatsapp' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testando...
                        </>
                      ) : (
                        <>
                          <MessageSquare size={14} className="mr-2" />
                          Testar API
                        </>
                      )}
                    </button>
                  </div>
                  {integrationTests.whatsapp && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm ${
                      integrationTests.whatsapp.success 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {integrationTests.whatsapp.success ? (
                          <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle size={14} className="mr-2 flex-shrink-0" />
                        )}
                        <span className="font-medium">{integrationTests.whatsapp.message}</span>
                      </div>
                      {integrationTests.whatsapp.details && (
                        <div className="mt-2 text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(integrationTests.whatsapp.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configurações de Notificação</h3>
            
            {/* Email Notifications */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="mr-2 text-pink-600" size={20} />
                Notificações por Email
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={emailConfig.enabled}
                  onChange={(e) => updateEmailConfig({ enabled: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
                  Habilitar notificações por email
                </label>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Quando ativado, o sistema enviará notificações automáticas por email de eventos importantes.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email para Notificações
                </label>
                <input
                  type="email"
                  value={emailConfig.notificationEmail}
                  onChange={(e) => updateEmailConfig({ notificationEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="jonny@brestelecom.com.br"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email que receberá as notificações de movimentação do pipeline
                </p>
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="mr-2 text-blue-600" size={20} />
                Configuração do Servidor SMTP
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => updateEmailConfig({ smtpHost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => updateEmailConfig({ smtpPort: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="587"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário SMTP
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUser}
                    onChange={(e) => updateEmailConfig({ smtpUser: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="testecovid1@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => updateEmailConfig({ smtpPassword: e.target.value })}
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
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={emailConfig.smtpSecure}
                  onChange={(e) => updateEmailConfig({ smtpSecure: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="smtp-secure" className="text-sm font-medium text-gray-700">
                  Usar conexão segura (TLS/SSL)
                </label>
              </div>
              
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <Loader className="animate-spin mr-2" size={16} />
                ) : (
                  <Zap className="mr-2" size={16} />
                )}
                {isTestingConnection ? 'Testando...' : 'Testar Conexão SMTP (Envio Real)'}
              </button>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="mr-2 text-green-600" size={20} />
                Sistema de Email Real Implementado!
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                O sistema agora envia emails reais usando Netlify Functions com Nodemailer. Configure seu SMTP e teste a conexão para começar a receber notificações.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">Configuração para Gmail:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Servidor: smtp.gmail.com</li>
                  <li>• Porta: 587</li>
                  <li>• Use uma senha de app (não sua senha normal)</li>
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
                  <li>• Faça a configuração SMTP no API</li>
                  <li>• Faça a conexão real com o servidor SMTP</li>
                  <li>• Retorne logs detalhados do processo</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Personalize e configure seu CRM</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveStatus !== 'idle' && (
            <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
              saveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
              saveStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {saveStatus === 'saving' && <Loader className="animate-spin mr-2" size={16} />}
              {saveStatus === 'success' && <Check className="mr-2" size={16} />}
              {saveStatus === 'error' && <AlertCircle className="mr-2" size={16} />}
              {saveMessage || (saveStatus === 'saving' ? 'Salvando...' : '')}
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className="flex items-center px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base ml-2 sm:ml-0"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">Salvando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Save size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Salvar Alterações</span>
                <span className="sm:hidden">Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max px-2 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? `border-blue-500 text-blue-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{
                borderBottomColor: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? tab.color : undefined
              }}
            >
              <tab.icon size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6">
        {renderTabContent()}
      </div>

      {/* Test Result Modal */}
      {showTestModal && testResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Resultado do Teste SMTP
              </h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className={`p-4 rounded-lg mb-4 ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {testResult.success ? (
                    <Check className="text-green-600 mr-2" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600 mr-2" size={20} />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </span>
                </div>
              </div>
              
              {testResult.details && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Host:</span>
                      <span className="ml-2 text-gray-600">{testResult.details.host}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Porta:</span>
                      <span className="ml-2 text-gray-600">{testResult.details.port}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Usuário:</span>
                      <span className="ml-2 text-gray-600">{testResult.details.user}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email de Teste:</span>
                      <span className="ml-2 text-gray-600">{testResult.details.testEmail}</span>
                    </div>
                  </div>
                  
                  {testResult.details.logs && testResult.details.logs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Logs do Teste:</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-60 overflow-y-auto">
                        {testResult.details.logs.map((log: string, index: number) => (
                          <div key={index} className="mb-1">
                            {log}
                          </div>
                        ))}
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
  );
};

export default SettingsPage;