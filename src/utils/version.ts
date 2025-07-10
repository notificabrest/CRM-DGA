// Version management system for CRM-DGA

export interface VersionInfo {
  version: string;
  release: string;
  buildDate: string;
  buildNumber: number;
  features: string[];
  bugFixes: string[];
  breaking?: string[];
}

export interface ReleaseNotes {
  [version: string]: VersionInfo;
}

// Current version configuration
export const CURRENT_VERSION = '1.2.1';
export const CURRENT_RELEASE = 'Stable';
export const BUILD_DATE = '2025-01-28';
export const BUILD_NUMBER = 13;

// Release history and notes
export const RELEASE_NOTES: ReleaseNotes = {
  '1.2.1': {
    version: '1.2.1',
    release: 'Stable',
    buildDate: '2025-01-28',
    buildNumber: 13,
    features: [
      'Sistema de versionamento e controle de releases implementado',
      'Histórico completo de versões com changelog detalhado',
      'Informações de versão visíveis no footer e configurações',
      'Badge de versão na tela de login',
      'Documentação automática de features e correções'
    ],
    bugFixes: [
      'Melhoria na organização das configurações',
      'Otimização da interface de versioning',
      'Correção na exibição de informações de build'
    ]
  },
  '1.2.0': {
    version: '1.2.0',
    release: 'Stable',
    buildDate: '2025-01-27',
    buildNumber: 12,
    features: [
      'Sistema de email de boas-vindas para novos usuários',
      'Configuração SMTP para notificações automáticas',
      'Notificações por email em movimentações do pipeline',
      'Exportação de relatórios em CSV e PDF',
      'Sistema de versionamento e controle de releases',
      'Interface responsiva otimizada para mobile'
    ],
    bugFixes: [
      'Correção no salvamento de clientes via busca telefônica',
      'Melhoria na validação de formulários',
      'Otimização de performance em listas grandes',
      'Correção de bugs na sincronização de dados'
    ]
  },
  '1.1.0': {
    version: '1.1.0',
    release: 'Beta',
    buildDate: '2025-01-20',
    buildNumber: 8,
    features: [
      'Pipeline de vendas com drag & drop',
      'Calendário de eventos e tarefas',
      'Busca inteligente por telefone',
      'Sistema de relatórios e analytics',
      'Gestão de usuários e permissões'
    ],
    bugFixes: [
      'Correções na autenticação',
      'Melhorias na interface mobile',
      'Otimização de queries'
    ]
  },
  '1.0.0': {
    version: '1.0.0',
    release: 'Initial',
    buildDate: '2025-01-15',
    buildNumber: 1,
    features: [
      'Sistema básico de CRM',
      'Gestão de clientes',
      'Dashboard inicial',
      'Sistema de autenticação',
      'Configurações básicas'
    ],
    bugFixes: []
  }
};

// Version utilities
export class VersionManager {
  static getCurrentVersion(): VersionInfo {
    return RELEASE_NOTES[CURRENT_VERSION];
  }

  static getAllVersions(): VersionInfo[] {
    return Object.values(RELEASE_NOTES).sort((a, b) => b.buildNumber - a.buildNumber);
  }

  static getVersionByNumber(version: string): VersionInfo | undefined {
    return RELEASE_NOTES[version];
  }

  static isNewerVersion(version1: string, version2: string): boolean {
    const v1 = RELEASE_NOTES[version1];
    const v2 = RELEASE_NOTES[version2];
    
    if (!v1 || !v2) return false;
    
    return v1.buildNumber > v2.buildNumber;
  }

  static formatVersion(includeRelease: boolean = true): string {
    const current = this.getCurrentVersion();
    return includeRelease 
      ? `v${current.version} (${current.release})`
      : `v${current.version}`;
  }

  static formatBuildInfo(): string {
    const current = this.getCurrentVersion();
    return `Build ${current.buildNumber} - ${current.buildDate}`;
  }

  static getVersionBadgeColor(release: string): string {
    switch (release.toLowerCase()) {
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'beta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alpha':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rc':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Method to increment version (for development use)
  static getNextVersion(type: 'major' | 'minor' | 'patch' = 'patch'): string {
    const [major, minor, patch] = CURRENT_VERSION.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return CURRENT_VERSION;
    }
  }
}

// Hook for React components
export const useVersion = () => {
  return {
    currentVersion: VersionManager.getCurrentVersion(),
    allVersions: VersionManager.getAllVersions(),
    formatVersion: VersionManager.formatVersion,
    formatBuildInfo: VersionManager.formatBuildInfo,
    getVersionBadgeColor: VersionManager.getVersionBadgeColor
  };
};