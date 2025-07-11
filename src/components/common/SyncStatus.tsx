import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import dataSyncService, { SyncStatus } from '../../utils/dataSync';

const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(dataSyncService.getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = dataSyncService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  const handleForceSync = async () => {
    await dataSyncService.forceSyncAll();
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) {
      return <RefreshCw size={16} className="animate-spin text-blue-500" />;
    }
    
    if (!syncStatus.hasSupabase) {
      return <CloudOff size={16} className="text-gray-400" />;
    }
    
    if (!syncStatus.isOnline) {
      return <WifiOff size={16} className="text-red-500" />;
    }
    
    if (syncStatus.lastSync) {
      return <Check size={16} className="text-green-500" />;
    }
    
    return <AlertCircle size={16} className="text-yellow-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress) {
      return 'Sincronizando...';
    }
    
    if (!syncStatus.hasSupabase) {
      return 'Modo Local';
    }
    
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    
    if (syncStatus.lastSync) {
      return 'Sincronizado';
    }
    
    return 'Não sincronizado';
  };

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return 'text-blue-600';
    if (!syncStatus.hasSupabase) return 'text-gray-600';
    if (!syncStatus.isOnline) return 'text-red-600';
    if (syncStatus.lastSync) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Status de Sincronização</h3>
              <div className="flex items-center space-x-2">
                {supabase && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Supabase
                  </span>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Autenticação:</span>
                <div className="flex items-center space-x-1">
                  {syncStatus.hasSupabase ? (
                    <Cloud size={14} className="text-green-500" />
                  ) : (
                    <CloudOff size={14} className="text-yellow-500" />
                  )}
                  <span className={syncStatus.hasSupabase ? 'text-green-600' : 'text-yellow-600'}>
                    {syncStatus.hasSupabase ? 'Nuvem' : 'Local'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conexão:</span>
                <div className="flex items-center space-x-1">
                  {syncStatus.isOnline ? (
                    <Wifi size={14} className="text-green-500" />
                  ) : (
                    <WifiOff size={14} className="text-red-500" />
                  )}
                  <span className={syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase:</span>
                <div className="flex items-center space-x-1">
                  {syncStatus.hasSupabase ? (
                    <Cloud size={14} className="text-blue-500" />
                  ) : (
                    <CloudOff size={14} className="text-gray-400" />
                  )}
                  <span className={syncStatus.hasSupabase ? 'text-blue-600' : 'text-gray-600'}>
                    {syncStatus.hasSupabase ? 'Configurado' : 'Não configurado'}
                  </span>
                </div>
              </div>
              
              {syncStatus.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Última sincronização:</span>
                  <span className="text-gray-900">
                    {syncStatus.lastSync.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
            
            {!syncStatus.hasSupabase && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Modo Local Ativo</p>
                    <p className="text-yellow-700 mt-1">
                      Configure o Supabase para sincronizar dados entre dispositivos.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {syncStatus.hasSupabase && (
              <button
                onClick={handleForceSync}
                disabled={syncStatus.syncInProgress}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={14} className={syncStatus.syncInProgress ? 'animate-spin' : ''} />
                <span>Sincronizar Agora</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;