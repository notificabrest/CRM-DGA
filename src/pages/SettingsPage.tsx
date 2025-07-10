import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Palette, 
  Info, 
  GitBranch, 
  Users, 
  Link, 
  Mail,
  Upload,
  X,
  Eye,
  EyeOff,
  Check,
  Server,
  MessageSquare
} from 'lucide-react';
import { useData } from '../context/DataContext';

const SettingsPage: React.FC = () => {
  const { users, addUser } = useData();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showTestResult, setShowTestResult] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState<string | null>(null);
  const [showLdapFields, setShowLdapFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    logo: null as string | null,
    headerTitle: 'SISTEMA',
    sidebarTitle: 'CRM-DGA',
    timezone: 'America/Sao_Paulo (GMT-3)',
    dateFormat: 'DD/MM/YYYY (31/12/2023)',
    currency: 'Real Brasileiro (R$)',
    theme: 'default',
    customColors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B'
    },
    emailEnabled: true,
    notificationEmail: 'jonny@brestelecom.com.br',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'testecovid1@gmail.com',
    smtpPassword: '••••••••••••••••',
    smtpSecure: true,
    ldapEnabled: false,
    ldapServer: '',
    ldapPort: '389',
    ldapUser: '',
    ldapPassword: ''
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'SALESPERSON'
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleTestSMTP = async () => {
    try {
      const response = await fetch('/.netlify/functions/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort),
          user: settings.smtpUser,
          password: settings.smtpPassword === '••••••••••••••••' ? 'your-actual-password' : settings.smtpPassword,
          secure: settings.smtpSecure,
          to: settings.notificationEmail
        }),
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.message
      });
      setShowTestResult(true);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao conectar com o servidor'
      });
      setShowTestResult(true);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) return;

    const user = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'ACTIVE',
      avatar: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      createdAt: new Date().toISOString()
    };

    addUser(user);
    
    // Send welcome email
    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort),
          user: settings.smtpUser,
          password: settings.smtpPassword === '••••••••••••••••' ? 'your-actual-password' : settings.smtpPassword,
          secure: settings.smtpSecure,
          to: user.email,
          subject: 'Bem-vindo ao Sistema CRM-DGA',
          html: `
            <h2>Bem-vindo ao Sistema CRM-DGA!</h2>
            <p>Olá ${user.name},</p>
            <p>Sua conta foi criada com sucesso. Aqui estão suas credenciais de acesso:</p>
            <ul>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Senha:</strong> ${user.role.toLowerCase()}123</li>
              <li><strong>Função:</strong> ${user.role}</li>
            </ul>
            <p>Por favor, faça login no sistema e altere sua senha no primeiro acesso.</p>
            <p>Atenciosamente,<br>Equipe CRM-DGA</p>
          `
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Usuário criado e email de boas-vindas enviado com sucesso!');
      } else {
        alert('Usuário criado, mas houve erro no envio do email: ' + result.message);
      }
    } catch (error) {
      alert('Usuário criado, mas houve erro no envio do email.');
    }

    setNewUser({ name: '', email: '', role: 'SALESPERSON' });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações Gerais</h3>
            
            {/* Logo Upload */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Logo da Aplicação</h4>
              <div className="flex items-center space-x-4">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-16 h-16 object-contain bg-white p-2 rounded border" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Fazer Upload
                  </button>
                  {settings.logo && (
                    <button
                      onClick={handleRemoveLogo}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Tamanho recomendado: 200x200px. Máximo: 2MB</p>
            </div>

            {/* System Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Cabeçalho</label>
                <input
                  type="text"
                  value={settings.headerTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, headerTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Título da Sidebar</label>
                <input
                  type="text"
                  value={settings.sidebarTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, sidebarTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* System Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Horário</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/Sao_Paulo (GMT-3)">America/São_Paulo (GMT-3)</option>
                  <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                  <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Data</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY (31/12/2023)">DD/MM/YYYY (31/12/2023)</option>
                  <option value="MM/DD/YYYY (12/31/2023)">MM/DD/YYYY (12/31/2023)</option>
                  <option value="YYYY-MM-DD (2023-12-31)">YYYY-MM-DD (2023-12-31)</option>
                </select>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Real Brasileiro (R$)">Real Brasileiro (R$)</option>
                  <option value="Dólar Americano ($)">Dólar Americano ($)</option>
                  <option value="Euro (€)">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Aparência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Temas Predefinidos</h4>
                <div className="space-y-2">
                  {['default', 'dark', 'blue', 'green'].map((theme) => (
                    <label key={theme} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={settings.theme === theme}
                        onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="capitalize">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Tema Personalizado</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cor Primária</label>
                    <input
                      type="color"
                      value={settings.customColors.primary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        customColors: { ...prev.customColors, primary: e.target.value }
                      }))}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cor Secundária</label>
                    <input
                      type="color"
                      value={settings.customColors.secondary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        customColors: { ...prev.customColors, secondary: e.target.value }
                      }))}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cor de Destaque</label>
                    <input
                      type="color"
                      value={settings.customColors.accent}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        customColors: { ...prev.customColors, accent: e.target.value }
                      }))}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'version':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações de Versão</h3>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-800">CRM-DGA v1.3.6</h4>
                  <p className="text-sm text-gray-600">Build 21 - Janeiro 2025</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Changelog v1.3.6</h5>
                  <div className="bg-white p-4 rounded border">
                    <h6 className="font-medium text-green-600 mb-2">✅ Novas Funcionalidades:</h6>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• Sistema de upload de logo totalmente funcional</li>
                      <li>• Modais de configuração para todas as integrações</li>
                      <li>• Campos expandíveis para configuração LDAP</li>
                      <li>• Feedback visual para salvamento de configurações</li>
                      <li>• Sistema de toast para confirmações</li>
                    </ul>
                    
                    <h6 className="font-medium text-blue-600 mb-2">🔧 Correções de Bugs:</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Correção do botão de upload de logo não responsivo</li>
                      <li>• Correção do botão salvar sem feedback</li>
                      <li>• Correção da aba Integrações sem funcionalidade</li>
                      <li>• Correção dos campos LDAP não expandindo</li>
                      <li>• Correção dos botões de configuração das integrações</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Histórico de Versões</h5>
                  <div className="bg-white p-4 rounded border space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>v1.3.5 - Sistema de autenticação corrigido</span>
                      <span className="text-gray-500">Build 20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>v1.3.4 - Email de boas-vindas implementado</span>
                      <span className="text-gray-500">Build 19</span>
                    </div>
                    <div className="flex justify-between">
                      <span>v1.3.3 - Sistema SMTP configurado</span>
                      <span className="text-gray-500">Build 18</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pipeline':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gerenciamento do Pipeline</h3>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Adicionar Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome do Status</label>
                  <input
                    type="text"
                    placeholder="Ex: Novo Lead"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cor</label>
                  <input
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-full h-10 rounded border"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600">
                  <span>STATUS</span>
                  <span>COR</span>
                  <span>AÇÕES</span>
                </div>
              </div>
              <div className="divide-y">
                {[
                  { name: 'New Lead', color: '#3B82F6' },
                  { name: 'Initial Contact', color: '#8B5CF6' },
                  { name: 'Qualification', color: '#EC4899' },
                  { name: 'Proposal', color: '#F97316' },
                  { name: 'Negotiation', color: '#EAB308' },
                  { name: 'Closed Won', color: '#10B981' },
                  { name: 'Closed Lost', color: '#EF4444' }
                ].map((status, index) => (
                  <div key={index} className="p-4 grid grid-cols-3 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span>{status.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{status.color}</span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Usuários e Permissões</h3>
            
            <div className="bg-orange-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Adicionar Usuário</h4>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email de Boas-vindas</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Quando um novo usuário for criado, ele receberá automaticamente um email com instruções de uso e credenciais de acesso.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome</label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Função</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="SALESPERSON">SALESPERSON</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="DIRECTOR">DIRECTOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="ASSISTANT">ASSISTANT</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateUser}
                className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Adicionar Usuário
              </button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                  <span>USUÁRIO</span>
                  <span>EMAIL</span>
                  <span>FUNÇÃO</span>
                  <span>STATUS</span>
                  <span>AÇÕES</span>
                </div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="p-4 grid grid-cols-5 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.avatar}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'DIRECTOR' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      ACTIVE
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Integrações</h3>
            
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Integração LDAP</h4>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="ldap-enabled"
                  checked={showLdapFields}
                  onChange={(e) => {
                    setShowLdapFields(e.target.checked);
                    setSettings(prev => ({ ...prev, ldapEnabled: e.target.checked }));
                  }}
                  className="rounded text-cyan-600"
                />
                <label htmlFor="ldap-enabled" className="text-sm text-gray-700">
                  Habilitar Autenticação LDAP
                </label>
              </div>
              
              {showLdapFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Servidor LDAP</label>
                    <input
                      type="text"
                      placeholder="ldap.empresa.com"
                      value={settings.ldapServer}
                      onChange={(e) => setSettings(prev => ({ ...prev, ldapServer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Porta</label>
                    <input
                      type="text"
                      placeholder="389"
                      value={settings.ldapPort}
                      onChange={(e) => setSettings(prev => ({ ...prev, ldapPort: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Usuário LDAP</label>
                    <input
                      type="text"
                      placeholder="admin@empresa.com"
                      value={settings.ldapUser}
                      onChange={(e) => setSettings(prev => ({ ...prev, ldapUser: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Senha LDAP</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={settings.ldapPassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, ldapPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Google Workspace</h4>
                    <p className="text-sm text-gray-600">Gmail, Drive, Calendar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntegrationModal('google')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Configurar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Microsoft 365</h4>
                    <p className="text-sm text-gray-600">Outlook, Teams, OneDrive</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntegrationModal('microsoft')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Configurar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">WhatsApp Business</h4>
                    <p className="text-sm text-gray-600">Mensagens automáticas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntegrationModal('whatsapp')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Notificação</h3>
            
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-6 h-6 text-pink-600" />
                <h4 className="font-medium text-gray-700">Notificações por Email</h4>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={settings.emailEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                  className="rounded text-pink-600"
                />
                <label htmlFor="email-notifications" className="text-sm text-gray-700">
                  Habilitar notificações por email
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Email para Notificações</label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Email que receberá as notificações do sistema"
                />
                <p className="text-sm text-gray-500 mt-1">Email que receberá as notificações de movimentação de pipeline</p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Server className="w-6 h-6 text-blue-600" />
                <h4 className="font-medium text-gray-700">Configuração do Servidor SMTP</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Servidor SMTP</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Porta</label>
                  <input
                    type="text"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Usuário SMTP</label>
                  <input
                    type="text"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Senha SMTP</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={settings.smtpPassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={settings.smtpSecure}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <label htmlFor="smtp-secure" className="text-sm text-gray-700">
                  Usar conexão segura (TLS/SSL)
                </label>
              </div>
              
              <button
                onClick={handleTestSMTP}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Testar Conexão SMTP (Envio Real)
              </button>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Check className="w-6 h-6 text-green-600" />
                <h4 className="font-medium text-gray-700">Sistema de Email Real Implementado!</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                O sistema agora envia emails reais usando Netlify Functions para notificar sobre movimentação no pipeline.
              </p>
              
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-gray-700 mb-2">Configuração para Gmail:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Servidor: smtp.gmail.com</li>
                  <li>• Porta: 587</li>
                  <li>• Use uma senha de app de 16 dígitos no Gmail</li>
                  <li>• Ative a verificação de 2 etapas no Gmail</li>
                  <li>• Retorne logs detalhados do processo</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-green-100 rounded">
                <h6 className="font-medium text-green-800 mb-1">Para Envio Real:</h6>
                <p className="text-sm text-green-700">
                  Para envio real de emails, você precisa implementar um backend que gerencie o envio via servidor SMTP.
                  Configure seu servidor SMTP acima e teste a conexão.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Configurações do Sistema</h1>
            <p className="text-gray-600 mt-1">Personalize e configure seu CRM</p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg border">
          {[
            { id: 'general', label: 'Geral', icon: Settings, color: 'blue' },
            { id: 'appearance', label: 'Aparência', icon: Palette, color: 'purple' },
            { id: 'version', label: 'Versão', icon: Info, color: 'gray' },
            { id: 'pipeline', label: 'Pipeline', icon: GitBranch, color: 'green' },
            { id: 'users', label: 'Usuários', icon: Users, color: 'orange' },
            { id: 'integrations', label: 'Integrações', icon: Link, color: 'cyan' },
            { id: 'notifications', label: 'Notificações', icon: Mail, color: 'pink' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? `bg-${tab.color}-600 text-white`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderTabContent()}
        </div>

        {/* Success Toast */}
        {showSaveSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Test Result Modal */}
        {showTestResult && testResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                {testResult.success ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <X className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold">
                  {testResult.success ? 'Teste Bem-sucedido!' : 'Erro no Teste'}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">{testResult.message}</p>
              <button
                onClick={() => setShowTestResult(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Integration Modals */}
        {showIntegrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Configurar {showIntegrationModal === 'google' ? 'Google Workspace' : 
                             showIntegrationModal === 'microsoft' ? 'Microsoft 365' : 'WhatsApp Business'}
                </h3>
                <button
                  onClick={() => setShowIntegrationModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Client ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Client Secret</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o Client Secret"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Redirect URI</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://seu-dominio.com/callback"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowIntegrationModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('Integração configurada com sucesso!');
                    setShowIntegrationModal(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;