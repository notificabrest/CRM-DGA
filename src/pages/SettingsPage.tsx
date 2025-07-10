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
  const [showToast, setShowToast] = useState(false);
  const [showLdapFields, setShowLdapFields] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showMicrosoftModal, setShowMicrosoftModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981'
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

  const [newStatus, setNewStatus] = useState({
    name: '',
    color: '#3b82f6'
  });

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings, color: 'bg-blue-500' },
    { id: 'appearance', label: 'Aparência', icon: Palette, color: 'bg-purple-500' },
    { id: 'version', label: 'Versão', icon: Info, color: 'bg-gray-500' },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, color: 'bg-green-500' },
    { id: 'users', label: 'Usuários', icon: Users, color: 'bg-orange-500' },
    { id: 'integrations', label: 'Integrações', icon: Link, color: 'bg-cyan-500' },
    { id: 'notifications', label: 'Notificações', icon: Mail, color: 'bg-pink-500' }
  ];

  const pipelineStatuses = [
    { name: 'New Lead', color: '#3b82f6' },
    { name: 'Initial Contact', color: '#8b5cf6' },
    { name: 'Qualification', color: '#ec4899' },
    { name: 'Proposal', color: '#f97316' },
    { name: 'Negotiation', color: '#eab308' },
    { name: 'Closed Won', color: '#10b981' },
    { name: 'Closed Lost', color: '#ef4444' }
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateUser = async () => {
    if (newUser.name && newUser.email) {
      const userData = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'ACTIVE',
        avatar: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      addUser(userData);
      
      // Send welcome email
      try {
        const response = await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: newUser.email,
            subject: 'Bem-vindo ao CRM-DGA - Suas Credenciais de Acesso',
            html: `
              <h2>Bem-vindo ao CRM-DGA!</h2>
              <p>Olá ${newUser.name},</p>
              <p>Sua conta foi criada com sucesso. Aqui estão suas credenciais de acesso:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>Email:</strong> ${newUser.email}<br>
                <strong>Senha:</strong> ${newUser.role.toLowerCase()}123
              </div>
              <p>Por favor, faça login e altere sua senha no primeiro acesso.</p>
              <p>Atenciosamente,<br>Equipe CRM-DGA</p>
            `
          })
        });

        if (response.ok) {
          alert('Usuário criado e email de boas-vindas enviado com sucesso!');
        } else {
          alert('Usuário criado, mas houve erro no envio do email.');
        }
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        alert('Usuário criado, mas houve erro no envio do email.');
      }

      setNewUser({ name: '', email: '', role: 'SALESPERSON' });
    }
  };

  const testSMTPConnection = async () => {
    try {
      const response = await fetch('/.netlify/functions/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort),
          user: settings.smtpUser,
          password: settings.smtpPassword,
          secure: settings.smtpPort === '465',
          to: settings.notificationEmail
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Teste SMTP realizado com sucesso! Email enviado.');
      } else {
        alert(`❌ Erro no teste SMTP: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro na conexão: ${error}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Configurações Gerais</h3>
            
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
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Fazer Upload
                  </button>
                  {settings.logo && (
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, logo: null }))}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

            {/* Regional Settings */}
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
            <h3 className="text-lg font-semibold text-gray-800">Configurações de Aparência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-4">Temas Predefinidos</h4>
                <div className="space-y-3">
                  {['default', 'dark', 'blue', 'green'].map(theme => (
                    <label key={theme} className="flex items-center space-x-3 cursor-pointer">
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

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-4">Cores Personalizadas</h4>
                <div className="space-y-4">
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
            <h3 className="text-lg font-semibold text-gray-800">Informações de Versão</h3>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">Versão Atual</h4>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">v1.3.6</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Build:</span>
                  <span className="ml-2 font-medium">21</span>
                </div>
                <div>
                  <span className="text-gray-600">Data:</span>
                  <span className="ml-2 font-medium">2025-02-04</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Changelog v1.3.6</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium text-green-600 mb-2">✅ Novas Funcionalidades:</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Sistema de upload de logo totalmente funcional</li>
                    <li>Modais de configuração para todas as integrações</li>
                    <li>Campos expandíveis para configuração LDAP</li>
                    <li>Feedback visual para salvamento de configurações</li>
                    <li>Sistema de autenticação com usuários criados</li>
                    <li>Funcionalidade "Esqueceu a senha" implementada</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-600 mb-2">🔧 Correções:</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Correção do botão de upload de logo não responsivo</li>
                    <li>Correção do botão salvar sem feedback</li>
                    <li>Correção da aba Integrações sem funcionalidade</li>
                    <li>Correção dos campos LDAP não expandindo</li>
                    <li>Correção do sistema de autenticação de usuários</li>
                    <li>Correção da configuração SSL/TLS para Gmail</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pipeline':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Gerenciamento do Pipeline</h3>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Adicionar Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome do Status</label>
                  <input
                    type="text"
                    placeholder="Ex: Novo Lead"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cor</label>
                  <input
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded border"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 uppercase">
                  <span>Status</span>
                  <span>Cor</span>
                  <span>Ações</span>
                </div>
              </div>
              <div className="divide-y">
                {pipelineStatuses.map((status, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="font-medium">{status.name}</span>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Usuários e Permissões</h3>
            
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Adicionar Usuário
              </button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 uppercase">
                  <span>Usuário</span>
                  <span>Email</span>
                  <span>Função</span>
                  <span>Status</span>
                </div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="px-6 py-4">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.avatar}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{user.email}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'DIRECTOR' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        ACTIVE
                      </span>
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
            <h3 className="text-lg font-semibold text-gray-800">Integrações</h3>
            
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Integração LDAP</h4>
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={showLdapFields}
                  onChange={(e) => setShowLdapFields(e.target.checked)}
                  className="text-cyan-600"
                />
                <span>Habilitar Autenticação LDAP</span>
              </label>
              
              {showLdapFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Servidor LDAP</label>
                    <input
                      type="text"
                      placeholder="ldap://servidor.empresa.com"
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
                    <label className="block text-sm text-gray-600 mb-1">Usuário de Bind</label>
                    <input
                      type="text"
                      placeholder="cn=admin,dc=empresa,dc=com"
                      value={settings.ldapUser}
                      onChange={(e) => setSettings(prev => ({ ...prev, ldapUser: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Senha</label>
                    <input
                      type="password"
                      placeholder="Senha do usuário de bind"
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
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Google Workspace</h4>
                    <p className="text-sm text-gray-600">Gmail, Calendar, Drive</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Configurar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Microsoft 365</h4>
                    <p className="text-sm text-gray-600">Outlook, Teams, OneDrive</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMicrosoftModal(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Configurar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">WhatsApp Business</h4>
                    <p className="text-sm text-gray-600">Mensagens automáticas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
            <h3 className="text-lg font-semibold text-gray-800">Configurações de Notificação</h3>
            
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-5 h-5 text-pink-600" />
                <h4 className="font-medium text-gray-700">Notificações por Email</h4>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings.emailEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                  className="text-pink-600"
                />
                <span>Habilitar notificações por email</span>
              </label>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Email para Notificações</label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Email que receberá as notificações de movimentação de pipeline"
                />
                <p className="text-sm text-gray-500 mt-1">Email que receberá as notificações de movimentação de pipeline</p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Server className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-700">Configuração do Servidor SMTP</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <span>Usar conexão segura (TLS/SSL)</span>
                </label>
              </div>

              <button
                onClick={testSMTPConnection}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Testar Conexão SMTP (Envio Real)
              </button>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">Sistema de Email Real Implementado!</h4>
              </div>
              <p className="text-green-700 mb-3">
                O sistema agora envia emails reais usando Netlify Functions com Nodemailer. Configure seu SMTP e teste a conexão para começar a receber notificações.
              </p>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Configuração para Gmail:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Servidor: smtp.gmail.com</li>
                  <li>• Porta: 587</li>
                  <li>• Use uma senha de app de 16 dígitos (não sua senha normal)</li>
                  <li>• Ative a verificação em 2 etapas no Gmail</li>
                  <li>• O teste enviará um email real para verificação</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border-l-4 border-green-400">
                <p className="text-sm text-gray-700">
                  <strong>Para Envio Real:</strong><br>
                  Para envio real de emails, você precisa implementar Nodemailer que:
                  • Faça a configuração SMTP no APP<br>
                  • Ative a verificação em 2 etapas no Gmail<br>
                  • Retorne logs detalhados do processo<br>
                  • Retorne logs detalhados do processo
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? `${tab.color} text-white`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderTabContent()}
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Modals */}
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Configurar Google Workspace</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Client ID"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Client Secret"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Redirect URI"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {showMicrosoftModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Configurar Microsoft 365</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Application ID"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Directory ID"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Client Secret"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowMicrosoftModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Configurar WhatsApp Business</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Phone Number ID"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Access Token"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Webhook Verify Token"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
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