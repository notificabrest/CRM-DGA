import React, { useState, useRef } from 'react';
import { 
  Settings, Palette, Info, Users, Mail, Eye, EyeOff, Upload, X, 
  Check, AlertCircle, Loader, Save, Image, Globe, Monitor, Smartphone,
  Building2, CreditCard, Bell, Shield, Zap, Link, Download, FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import UserForm from '../components/users/UserForm';
import VersionInfo from '../components/common/VersionInfo';
import { UserRole } from '../types';

const SettingsPage: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, customizeTheme, setHeaderName, setSidebarName, setLogo } = useTheme();
  const { users, pipelineStatuses, addUser, updateUser, deleteUser, addPipelineStatus, updatePipelineStatus, deletePipelineStatus } = useData();
  const { user, hasPermission } = useAuth();
  const { emailConfig, updateEmailConfig, testEmailConnection, isTestingConnection } = useEmail();
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
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
                    onClick={() => setTheme(theme)}
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
              <h4 className="text-base font-semibold text-gray-900 mb-4">Adicionar Status</h4>
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
                <button
                  onClick={handleAddStatus}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Adicionar
                </button>
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
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={() => deletePipelineStatus(status.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="mr-2 text-cyan-600" size={20} />
                Integração LDAP
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="ldap-enabled"
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="ldap-enabled" className="text-sm font-medium text-gray-700">
                  Habilitar Autenticação LDAP
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Conecte com Active Directory ou outros serviços LDAP para autenticação centralizada.
              </p>
            </div>

            {/* Google Workspace */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="mr-2 text-red-600" size={20} />
                Google Workspace
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="google-enabled"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="google-enabled" className="text-sm font-medium text-gray-700">
                  Habilitar integração com Google
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Sincronize calendários, contatos e emails com Google Workspace.
              </p>
            </div>

            {/* Microsoft 365 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="mr-2 text-blue-600" size={20} />
                Microsoft 365
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="microsoft-enabled"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="microsoft-enabled" className="text-sm font-medium text-gray-700">
                  Habilitar integração com Microsoft 365
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Conecte com Outlook, Teams e outros serviços Microsoft.
              </p>
            </div>

            {/* WhatsApp Business */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="mr-2 text-green-600" size={20} />
                WhatsApp Business
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="whatsapp-enabled"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="whatsapp-enabled" className="text-sm font-medium text-gray-700">
                  Habilitar WhatsApp Business API
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Envie mensagens automáticas e gerencie conversas via WhatsApp.
              </p>
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
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1">Personalize e configure seu CRM</p>
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <Loader className="animate-spin mr-2" size={16} />
            ) : (
              <Save className="mr-2" size={16} />
            )}
            {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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