import React, { useState } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const { login, resetPassword, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
    } finally {
      setResetLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-orange-500">CRM-DGA</h1>
          <p className="mt-2 text-gray-600">Recuperar Senha</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
          <div>
            <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 pl-10"
                placeholder="Digite seu email"
              />
              <span className="font-mono">admin@example.com / admin123</span>
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <p className="text-blue-800 font-medium">💡 Sincronização Automática</p>
              <p className="text-blue-700 mt-1">
                {supabase ? 
                  'Dados sincronizados entre todos os dispositivos via Supabase' : 
                  'Modo local - Configure Supabase para sincronizar entre dispositivos'
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={resetLoading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Enviando...' : 'Resetar Senha'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Voltar ao Login
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Informação</h3>
          <p className="text-xs text-blue-700">
            A senha será resetada para o padrão baseado no seu perfil:
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>• <strong>Admin:</strong> admin123</li>
            <li>• <strong>Director:</strong> director123</li>
            <li>• <strong>Manager:</strong> manager123</li>
            <li>• <strong>Salesperson:</strong> salesperson123</li>
            <li>• <strong>Assistant:</strong> assistant123</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-orange-500">CRM-DGA</h1>
        <p className="mt-2 text-gray-600">Customer Relationship Management</p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      {/* Credentials Helper */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-800 mb-2">🔑 Credenciais de Teste</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Admin:</span>
            <span className="font-mono">admin@example.com / admin123</span>
          </div>
          <div className="flex justify-between">
            <span>Vendedor:</span>
            <span className="font-mono">jonny@brestelecom.com.br / salesperson123</span>
          </div>
          <div className="flex justify-between">
            <span>Suporte:</span>
            <span className="font-mono">suporte@brestelecom.com.br / assistant123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;