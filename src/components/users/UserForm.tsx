import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WelcomeEmailService } from '../../utils/welcomeEmailService';
import { useEmail } from '../../context/EmailContext';
import { Eye, EyeOff } from 'lucide-react';

interface UserFormProps {
  user?: User;
  onSave: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const { branches, addUser, updateUser } = useData();
  const { user: currentUser } = useAuth();
  const { emailConfig } = useEmail();
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || UserRole.SALESPERSON,
    status: user?.status || UserStatus.ACTIVE,
    branchIds: user?.branchIds || [],
    branchId: user?.branchIds?.[0] || '',
    pass: '' // Password field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    
    try {
      if (user) {
        // Only update password if it was changed
        const updates = {
          ...formData,
          password: formData.pass ? formData.pass : undefined
        };
        updateUser(user.id, updates);
      } else {
        // For new users, use the provided password or generate a default one
        const pass = formData.pass || `${formData.role.toLowerCase()}123`;
        
        // Create the user
        addUser({
          ...formData,
          password: pass
        });

        // Send welcome email if email notifications are enabled
        if (emailConfig.enabled && currentUser) {
          try {
            console.log('🚀 Enviando email de boas-vindas para:', formData.email);
            await WelcomeEmailService.sendWelcomeEmail({
              userName: formData.name,
              userEmail: formData.email,
              userRole: formData.role,
              temporaryPassword: pass,
              systemUrl: window.location.origin,
              createdBy: currentUser.name
            });
            
            console.log('Welcome email sent successfully to:', formData.email);
            alert('Usuário criado com sucesso! Email de boas-vindas enviado para: ' + formData.email);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            alert('Usuário criado, mas falha no envio do email de boas-vindas: ' + (emailError as Error).message);
            // Don't block user creation if email fails
          }
        } else {
          console.log('Email de boas-vindas não enviado - configuração:', {
            emailEnabled: emailConfig.enabled,
            hasCurrentUser: !!currentUser
          });
          alert('Usuário criado com sucesso! (Email de boas-vindas desabilitado)');
        }
      }
      
      onSave();
    } catch (error) {
      console.error('Error creating/updating user:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">
          {user ? 'Edit User' : 'New User'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role*
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
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
              Status*
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.values(UserStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {user ? '(leave blank to keep current)' : '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.pass}
                onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                placeholder={user ? "Enter new password" : "Enter password"}
                {...(!user && { required: true })}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Branch*
            </label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Branches
            </label>
            <select
              multiple
              value={formData.branchIds}
              onChange={(e) => {
                const selectedBranches = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, branchIds: selectedBranches });
              }}
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

        {!user && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              {formData.pass ? 
                "The user will use the specified password to log in." :
                `A default password will be generated based on the user's role (e.g., admin123, sales123).
                The user should change this password on their first login.`}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreatingUser}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isCreatingUser ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {user ? 'Atualizando...' : 'Criando usuário...'}
            </>
          ) : (
            user ? 'Update User' : 'Create User'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;