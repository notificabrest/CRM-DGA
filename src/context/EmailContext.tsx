import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmailService, EmailConfig, PipelineNotification, SMTPTestResult, defaultEmailConfig } from '../utils/emailService';
import dataSyncService from '../utils/dataSync';

interface EmailContextType {
  emailConfig: EmailConfig;
  emailService: EmailService;
  updateEmailConfig: (config: Partial<EmailConfig>) => void;
  sendPipelineNotification: (notification: PipelineNotification) => Promise<boolean>;
  testEmailConnection: () => Promise<SMTPTestResult>;
  isTestingConnection: boolean;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('crm-email-config');
      if (savedConfig) {
        return { ...defaultEmailConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    }
    return defaultEmailConfig;
  });

  const [emailService, setEmailService] = useState<EmailService>(new EmailService(emailConfig));
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Load email config from cloud on mount
  useEffect(() => {
    const loadEmailConfigFromCloud = async () => {
      try {
        const cloudData = await dataSyncService.syncFromCloud();
        if (cloudData?.emailConfig) {
          console.log('📧 Configuração de email carregada da nuvem');
          setEmailConfig({ ...defaultEmailConfig, ...cloudData.emailConfig });
        }
      } catch (error) {
        console.error('Erro ao carregar config de email da nuvem:', error);
      }
    };

    loadEmailConfigFromCloud();
  }, []);

  // Make email context available globally for DataContext
  useEffect(() => {
    (window as any).__emailContext = {
      sendPipelineNotification: async (notification: PipelineNotification) => {
        return await emailService.sendPipelineNotification(notification);
      }
    };
    
    return () => {
      delete (window as any).__emailContext;
    };
  }, [emailService]);

  useEffect(() => {
    try {
      localStorage.setItem('crm-email-config', JSON.stringify(emailConfig));
      setEmailService(new EmailService(emailConfig));
      
      // Sync email config to cloud
      dataSyncService.syncEmailConfig(emailConfig);
    } catch (error) {
      console.error('Error saving email config:', error);
    }
  }, [emailConfig]);

  const updateEmailConfig = (config: Partial<EmailConfig>) => {
    setEmailConfig(prev => ({ ...prev, ...config }));
  };

  const sendPipelineNotification = async (notification: PipelineNotification): Promise<boolean> => {
    return await emailService.sendPipelineNotification(notification);
  };

  const testEmailConnection = async (): Promise<SMTPTestResult> => {
    setIsTestingConnection(true);
    try {
      const result = await emailService.testConnection();
      return result;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const value = {
    emailConfig,
    emailService,
    updateEmailConfig,
    sendPipelineNotification,
    testEmailConnection,
    isTestingConnection
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};

export const useEmail = (): EmailContextType => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};