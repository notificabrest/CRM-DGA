// Data synchronization service for cross-device data sharing

import { supabase } from '../lib/supabase';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  hasSupabase: boolean;
}

export interface SyncableData {
  themes: any;
  emailConfig: any;
  integrationConfigs: any;
  userPreferences: any;
}

class DataSyncService {
  private static instance: DataSyncService;
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    syncInProgress: false,
    hasSupabase: !!supabase
  };
  private listeners: ((status: SyncStatus) => void)[] = [];

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
      this.syncFromCloud();
    });

    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });

    // Initial sync if online and Supabase available
    if (this.syncStatus.isOnline && this.syncStatus.hasSupabase) {
      this.syncFromCloud();
    }
  }

  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  public onSyncStatusChange(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Sync data to cloud (Supabase)
  public async syncToCloud(data: Partial<SyncableData>): Promise<boolean> {
    if (!supabase || !this.syncStatus.isOnline) {
      console.log('📱 Salvando localmente - Supabase não disponível ou offline');
      this.saveToLocalStorage(data);
      return false;
    }

    try {
      this.updateSyncStatus({ syncInProgress: true });
      console.log('☁️ Sincronizando dados para a nuvem...');

      // Get current user (you'll need to implement auth)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('👤 Usuário não autenticado - salvando localmente');
        this.saveToLocalStorage(data);
        return false;
      }

      // Save to Supabase user_preferences table
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao sincronizar:', error);
        this.saveToLocalStorage(data);
        return false;
      }

      console.log('✅ Dados sincronizados com sucesso!');
      this.updateSyncStatus({ 
        lastSync: new Date(),
        syncInProgress: false 
      });
      
      // Also save locally as backup
      this.saveToLocalStorage(data);
      return true;

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.saveToLocalStorage(data);
      this.updateSyncStatus({ syncInProgress: false });
      return false;
    }
  }

  // Sync data from cloud (Supabase)
  public async syncFromCloud(): Promise<SyncableData | null> {
    if (!supabase || !this.syncStatus.isOnline) {
      console.log('📱 Carregando dados locais - Supabase não disponível ou offline');
      return this.loadFromLocalStorage();
    }

    try {
      this.updateSyncStatus({ syncInProgress: true });
      console.log('☁️ Sincronizando dados da nuvem...');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('👤 Usuário não autenticado - carregando dados locais');
        return this.loadFromLocalStorage();
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erro ao carregar da nuvem:', error);
        return this.loadFromLocalStorage();
      }

      if (data?.preferences) {
        console.log('✅ Dados carregados da nuvem!');
        
        // Merge with local data and save locally as backup
        const localData = this.loadFromLocalStorage();
        const mergedData = { ...localData, ...data.preferences };
        this.saveToLocalStorage(mergedData);
        
        this.updateSyncStatus({ 
          lastSync: new Date(data.updated_at),
          syncInProgress: false 
        });
        
        return mergedData;
      } else {
        console.log('📱 Nenhum dado na nuvem - usando dados locais');
        return this.loadFromLocalStorage();
      }

    } catch (error) {
      console.error('❌ Erro ao carregar da nuvem:', error);
      this.updateSyncStatus({ syncInProgress: false });
      return this.loadFromLocalStorage();
    }
  }

  // Save to localStorage as fallback
  private saveToLocalStorage(data: Partial<SyncableData>) {
    try {
      if (data.themes) {
        localStorage.setItem('crm-theme', JSON.stringify(data.themes));
      }
      if (data.emailConfig) {
        localStorage.setItem('crm-email-config', JSON.stringify(data.emailConfig));
      }
      if (data.integrationConfigs) {
        localStorage.setItem('crm-ldap-config', JSON.stringify(data.integrationConfigs.ldap || {}));
        localStorage.setItem('crm-google-config', JSON.stringify(data.integrationConfigs.google || {}));
        localStorage.setItem('crm-microsoft-config', JSON.stringify(data.integrationConfigs.microsoft || {}));
        localStorage.setItem('crm-whatsapp-config', JSON.stringify(data.integrationConfigs.whatsapp || {}));
      }
      if (data.userPreferences) {
        localStorage.setItem('crm-user-preferences', JSON.stringify(data.userPreferences));
      }
      console.log('💾 Dados salvos localmente');
    } catch (error) {
      console.error('❌ Erro ao salvar localmente:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): SyncableData {
    try {
      const themes = localStorage.getItem('crm-theme');
      const emailConfig = localStorage.getItem('crm-email-config');
      const ldapConfig = localStorage.getItem('crm-ldap-config');
      const googleConfig = localStorage.getItem('crm-google-config');
      const microsoftConfig = localStorage.getItem('crm-microsoft-config');
      const whatsappConfig = localStorage.getItem('crm-whatsapp-config');
      const userPreferences = localStorage.getItem('crm-user-preferences');

      return {
        themes: themes ? JSON.parse(themes) : null,
        emailConfig: emailConfig ? JSON.parse(emailConfig) : null,
        integrationConfigs: {
          ldap: ldapConfig ? JSON.parse(ldapConfig) : null,
          google: googleConfig ? JSON.parse(googleConfig) : null,
          microsoft: microsoftConfig ? JSON.parse(microsoftConfig) : null,
          whatsapp: whatsappConfig ? JSON.parse(whatsappConfig) : null,
        },
        userPreferences: userPreferences ? JSON.parse(userPreferences) : null,
      };
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error);
      return {
        themes: null,
        emailConfig: null,
        integrationConfigs: {},
        userPreferences: null,
      };
    }
  }

  // Sync specific data types
  public async syncTheme(theme: any): Promise<boolean> {
    return await this.syncToCloud({ themes: theme });
  }

  public async syncEmailConfig(config: any): Promise<boolean> {
    return await this.syncToCloud({ emailConfig: config });
  }

  public async syncIntegrationConfigs(configs: any): Promise<boolean> {
    return await this.syncToCloud({ integrationConfigs: configs });
  }

  public async syncUserPreferences(preferences: any): Promise<boolean> {
    return await this.syncToCloud({ userPreferences: preferences });
  }

  // Force sync all data
  public async forceSyncAll(): Promise<boolean> {
    const localData = this.loadFromLocalStorage();
    return await this.syncToCloud(localData);
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default dataSyncService;