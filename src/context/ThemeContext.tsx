import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

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

// Default themes
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
  const [currentTheme, setCurrentTheme] = useState<Theme>(DEFAULT_THEMES[0]);
  const [availableThemes] = useState<Theme[]>(DEFAULT_THEMES);
  const [appName, setAppName] = useState('CRM-DGA');

  useEffect(() => {
    // Load saved theme and app name from localStorage
    const savedTheme = localStorage.getItem('crm-theme');
    const savedAppName = localStorage.getItem('crm-app-name');
    
    if (savedTheme) {
      try {
        setCurrentTheme(JSON.parse(savedTheme));
      } catch (err) {
        console.error('Failed to parse saved theme', err);
        localStorage.removeItem('crm-theme');
      }
    }

    if (savedAppName) {
      setAppName(savedAppName);
    }
  }, []);

  // Apply theme to CSS variables and update document title
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--color-background', currentTheme.backgroundColor);
    document.documentElement.style.setProperty('--color-text', currentTheme.textColor);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', currentTheme.accentColor || '#3B82F6');
    document.documentElement.style.setProperty('--color-success', currentTheme.successColor || '#10B981');
    document.documentElement.style.setProperty('--color-warning', currentTheme.warningColor || '#F59E0B');
    document.documentElement.style.setProperty('--color-error', currentTheme.errorColor || '#EF4444');
    
    // Save theme to localStorage
    localStorage.setItem('crm-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  // Update document title when app name changes
  useEffect(() => {
    document.title = `${currentTheme.headerName || appName} | Customer Relationship Management`;
    localStorage.setItem('crm-app-name', appName);
  }, [appName, currentTheme.headerName]);

  const setTheme = (theme: Theme): void => {
    setCurrentTheme(theme);
  };

  const customizeTheme = (themeUpdates: Partial<Theme>): void => {
    setCurrentTheme(prev => ({
      ...prev,
      ...themeUpdates,
      name: 'Custom',
    }));
  };

  const setHeaderName = (name: string): void => {
    setCurrentTheme(prev => ({
      ...prev,
      headerName: name,
    }));
  };

  const setSidebarName = (name: string): void => {
    setCurrentTheme(prev => ({
      ...prev,
      sidebarName: name,
    }));
  };

  const setLogo = (logo: string): void => {
    setCurrentTheme(prev => ({
      ...prev,
      logo,
    }));
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