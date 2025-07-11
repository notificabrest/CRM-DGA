import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LDAPConfig,
  GoogleWorkspaceConfig,
  Microsoft365Config,
  WhatsAppConfig,
  IntegrationManager,
  defaultLDAPConfig,
  defaultGoogleConfig,
  defaultMicrosoftConfig,
  defaultWhatsAppConfig,
  IntegrationTestResult
} from '../utils/integrationServices';

interface IntegrationContextType {
  ldapConfig: LDAPConfig;
  googleConfig: GoogleWorkspaceConfig;
  microsoftConfig: Microsoft365Config;
  whatsappConfig: WhatsAppConfig;
  updateLDAPConfig: (config: Partial<LDAPConfig>) => void;
  updateGoogleConfig: (config: Partial<GoogleWorkspaceConfig>) => void;
  updateMicrosoftConfig: (config: Partial<Microsoft365Config>) => void;
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
  testLDAPConnection: () => Promise<IntegrationTestResult>;
  testGoogleConnection: () => Promise<IntegrationTestResult>;
  testMicrosoftConnection: () => Promise<IntegrationTestResult>;
  testWhatsAppConnection: () => Promise<IntegrationTestResult>;
  saveAllConfigurations: () => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

interface IntegrationProviderProps {
  children: ReactNode;
}

export const IntegrationProvider: React.FC<IntegrationProviderProps> = ({ children }) => {
  const [ldapConfig, setLDAPConfig] = useState<LDAPConfig>(() => {
    try {
      const saved = localStorage.getItem('crm-ldap-config');
      return saved ? { ...defaultLDAPConfig, ...JSON.parse(saved) } : defaultLDAPConfig;
    } catch {
      return defaultLDAPConfig;
    }
  });

  const [googleConfig, setGoogleConfig] = useState<GoogleWorkspaceConfig>(() => {
    try {
      const saved = localStorage.getItem('crm-google-config');
      return saved ? { ...defaultGoogleConfig, ...JSON.parse(saved) } : defaultGoogleConfig;
    } catch {
      return defaultGoogleConfig;
    }
  });

  const [microsoftConfig, setMicrosoftConfig] = useState<Microsoft365Config>(() => {
    try {
      const saved = localStorage.getItem('crm-microsoft-config');
      return saved ? { ...defaultMicrosoftConfig, ...JSON.parse(saved) } : defaultMicrosoftConfig;
    } catch {
      return defaultMicrosoftConfig;
    }
  });

  const [whatsappConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    try {
      const saved = localStorage.getItem('crm-whatsapp-config');
      return saved ? { ...defaultWhatsAppConfig, ...JSON.parse(saved) } : defaultWhatsAppConfig;
    } catch {
      return defaultWhatsAppConfig;
    }
  });

  // Initialize integration services when configs change
  useEffect(() => {
    const manager = IntegrationManager.getInstance();
    
    if (ldapConfig.enabled) {
      manager.initializeLDAP(ldapConfig);
    }
    
    if (googleConfig.enabled) {
      manager.initializeGoogle(googleConfig);
    }
    
    if (microsoftConfig.enabled) {
      manager.initializeMicrosoft(microsoftConfig);
    }
    
    if (whatsappConfig.enabled) {
      manager.initializeWhatsApp(whatsappConfig);
    }
  }, [ldapConfig, googleConfig, microsoftConfig, whatsappConfig]);

  const updateLDAPConfig = (updates: Partial<LDAPConfig>) => {
    const newConfig = { ...ldapConfig, ...updates };
    setLDAPConfig(newConfig);
    localStorage.setItem('crm-ldap-config', JSON.stringify(newConfig));
  };

  const updateGoogleConfig = (updates: Partial<GoogleWorkspaceConfig>) => {
    const newConfig = { ...googleConfig, ...updates };
    setGoogleConfig(newConfig);
    localStorage.setItem('crm-google-config', JSON.stringify(newConfig));
  };

  const updateMicrosoftConfig = (updates: Partial<Microsoft365Config>) => {
    const newConfig = { ...microsoftConfig, ...updates };
    setMicrosoftConfig(newConfig);
    localStorage.setItem('crm-microsoft-config', JSON.stringify(newConfig));
  };

  const updateWhatsAppConfig = (updates: Partial<WhatsAppConfig>) => {
    const newConfig = { ...whatsappConfig, ...updates };
    setWhatsAppConfig(newConfig);
    localStorage.setItem('crm-whatsapp-config', JSON.stringify(newConfig));
  };

  const testLDAPConnection = async (): Promise<IntegrationTestResult> => {
    const manager = IntegrationManager.getInstance();
    manager.initializeLDAP(ldapConfig);
    const service = manager.getLDAPService();
    
    if (!service) {
      return {
        success: false,
        message: 'Serviço LDAP não inicializado',
        timestamp: new Date().toISOString()
      };
    }
    
    return await service.testConnection();
  };

  const testGoogleConnection = async (): Promise<IntegrationTestResult> => {
    const manager = IntegrationManager.getInstance();
    manager.initializeGoogle(googleConfig);
    const service = manager.getGoogleService();
    
    if (!service) {
      return {
        success: false,
        message: 'Serviço Google não inicializado',
        timestamp: new Date().toISOString()
      };
    }
    
    return await service.testConnection();
  };

  const testMicrosoftConnection = async (): Promise<IntegrationTestResult> => {
    const manager = IntegrationManager.getInstance();
    manager.initializeMicrosoft(microsoftConfig);
    const service = manager.getMicrosoftService();
    
    if (!service) {
      return {
        success: false,
        message: 'Serviço Microsoft não inicializado',
        timestamp: new Date().toISOString()
      };
    }
    
    return await service.testConnection();
  };

  const testWhatsAppConnection = async (): Promise<IntegrationTestResult> => {
    const manager = IntegrationManager.getInstance();
    manager.initializeWhatsApp(whatsappConfig);
    const service = manager.getWhatsAppService();
    
    if (!service) {
      return {
        success: false,
        message: 'Serviço WhatsApp não inicializado',
        timestamp: new Date().toISOString()
      };
    }
    
    return await service.testConnection();
  };

  const saveAllConfigurations = () => {
    localStorage.setItem('crm-ldap-config', JSON.stringify(ldapConfig));
    localStorage.setItem('crm-google-config', JSON.stringify(googleConfig));
    localStorage.setItem('crm-microsoft-config', JSON.stringify(microsoftConfig));
    localStorage.setItem('crm-whatsapp-config', JSON.stringify(whatsappConfig));
  };

  const value = {
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
    testWhatsAppConnection,
    saveAllConfigurations
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegrations = (): IntegrationContextType => {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationProvider');
  }
  return context;
};