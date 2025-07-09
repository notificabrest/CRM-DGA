import React from 'react';
import { Phone, Mail, Building2, Tag, User, Trash2 } from 'lucide-react';
import { Client, User as UserType } from '../../types';

interface ClientCardProps {
  client: Client;
  owner?: UserType;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, owner, onClick, onDelete }) => {
  const primaryPhone = client.phones.find(phone => phone.isPrimary) || client.phones[0];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this client?')) {
      onDelete(client.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base sm:text-lg text-gray-900 truncate flex-1 mr-2">{client.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {client.status}
            </span>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
              title="Delete client"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        {client.company && (
          <div className="flex items-center text-gray-600 mt-2">
            <Building2 size={14} className="mr-2 flex-shrink-0 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm truncate">{client.company}</span>
          </div>
        )}
        
        {primaryPhone && (
          <div className="flex items-center text-gray-600 mt-2">
            <Phone size={14} className="mr-2 flex-shrink-0 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm truncate">{primaryPhone.number}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-600 mt-2">
          <Mail size={14} className="mr-2 flex-shrink-0 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm truncate">{client.email}</span>
        </div>
        
        {client.tags && client.tags.length > 0 && (
          <div className="flex items-start text-gray-600 mt-2">
            <Tag size={14} className="mr-2 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
            <div className="flex flex-wrap gap-1">
              {client.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-100 rounded-full px-2 py-0.5 truncate">
                  {tag}
                </span>
              ))}
              {client.tags.length > 3 && (
                <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                  +{client.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {owner && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 overflow-hidden mr-2 flex-shrink-0">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-xs">
                {owner.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-600 text-xs sm:text-sm min-w-0 flex-1">
            <User size={12} className="mr-1 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">{owner.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;