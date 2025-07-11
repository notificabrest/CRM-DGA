import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';
import dataSyncService from '../utils/dataSync';

interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Theme[];
  appName: string;
  setTheme: (theme: Theme) => void;
  customizeTheme: (themeUpdates: Partial<Theme>) => void;
  setAppName: (name: string) => void;
  setHeaderName: (name: string) => void;
  setSidebarName: (name: string) => void;
  setLogo: (logo: string) => void;
}

const DEFAULT_THEMES: Theme[] = [
  {
    name: 'Default',
    primaryColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    secondaryColor: '#6B7280',
    accentColor: '#3B82F6',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    headerName: 'CRM-DGA',
    sidebarName: 'CRM-DGA',
  },
  {
    name: 'Corporate',
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    secondaryColor: '#6B7280',
    accentColor: '#8B5CF6',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    headerName: 'CRM-DGA',
    sidebarName: 'CRM-DGA',
  },
  {
    name: 'Energetic',
    primaryColor: '#F97316',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    secondaryColor: '#6B7280',
    accentColor: '#FBBF24',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    headerName: 'CRM-DGA',
    sidebarName: 'CRM-DGA',
  },
  {
    name: 'Professional',
    primaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    secondaryColor: '#4B5563',
    accentColor: '#3B82F6',
    successColor: '#059669',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    headerName: 'CRM-DGA',
    sidebarName: 'CRM-DGA',
  },
  {
    name: 'Modern',
    primaryColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    secondaryColor: '#6B7280',
    accentColor: '#EC4899',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    headerName: 'CRM-DGA',
    sidebarName: 'CRM-DGA',
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('crm-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        // Ensure all required properties exist
        return {
          ...DEFAULT_THEMES[0],
          ...parsedTheme
        };
      } catch (err) {
        console.error('Failed to parse saved theme', err);
      }
    }
    return DEFAULT_THEMES[0];
  });

  const [availableThemes] = useState<Theme[]>(DEFAULT_THEMES);
  const [appName, setAppName] = useState('CRM-DGA');

  // Load theme from cloud on mount
  useEffect(() => {
    const loadThemeFromCloud = async () => {
      try {
        const cloudData = await dataSyncService.syncFromCloud();
        if (cloudData?.themes) {
          console.log('🎨 Tema carregado da nuvem:', cloudData.themes);
          setCurrentTheme({
            ...DEFAULT_THEMES[0],
            ...cloudData.themes
          });
        }
      } catch (error) {
        console.error('Erro ao carregar tema da nuvem:', error);
      }
    };

    loadThemeFromCloud();
  }, []);

  useEffect(() => {
    console.log('🎨 Aplicando tema:', currentTheme);
    document.documentElement.style.setProperty('--color-primary', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--color-background', currentTheme.backgroundColor);
    document.documentElement.style.setProperty('--color-text', currentTheme.textColor);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', currentTheme.accentColor || '#3B82F6');
    document.documentElement.style.setProperty('--color-success', currentTheme.successColor || '#10B981');
    document.documentElement.style.setProperty('--color-warning', currentTheme.warningColor || '#F59E0B');
    document.documentElement.style.setProperty('--color-error', currentTheme.errorColor || '#EF4444');
    
    localStorage.setItem('crm-theme', JSON.stringify(currentTheme));
    document.title = `${currentTheme.headerName || appName} | Customer Relationship Management`;
    
    // Sync theme to cloud
    dataSyncService.syncTheme(currentTheme);
    
    // Update favicon if exists
    if (currentTheme.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = currentTheme.favicon;
      }
    }
  }, [currentTheme, appName]);

  const setTheme = (theme: Theme): void => {
    console.log('🔄 Mudando tema para:', theme.name);
    setCurrentTheme(theme);
    // Sync will happen in useEffect
  };

  const customizeTheme = (themeUpdates: Partial<Theme>): void => {
    const newTheme = {
      ...prev,
      ...themeUpdates,
      name: 'Custom',
    };
    setCurrentTheme(newTheme);
    // Sync will happen in useEffect
  };

  const setHeaderName = (name: string): void => {
    const newTheme = {
      ...prev,
      headerName: name,
    };
    setCurrentTheme(newTheme);
  };

  const setSidebarName = (name: string): void => {
    const newTheme = {
      ...prev,
      sidebarName: name,
    };
    setCurrentTheme(newTheme);
  };

  const setLogo = (logo: string): void => {
    const newTheme = {
      ...prev,
      logo,
    };
    setCurrentTheme(newTheme);
  };

  const value = {
    currentTheme,
    availableThemes,
    appName,
    setTheme,
    customizeTheme,
    setAppName,
    setHeaderName,
    setSidebarName,
    setLogo,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};