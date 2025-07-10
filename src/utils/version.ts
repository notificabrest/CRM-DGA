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
export const CURRENT_VERSION = '1.3.6';
export const CURRENT_RELEASE = 'Stable';
export const BUILD_DATE = '2025-02-05';
export const BUILD_NUMBER = 21;

// Release history and notes
export const RELEASE_NOTES: ReleaseNotes = {
  '1.3.6': {
    version: '1.3.6',
    release: 'Stable',
    buildDate: '2025-02-05',
    buildNumber: 21,
    features: [
      'Correção do sistema de email de boas-vindas para novos usuários',
      'Logs detalhados implementados no processo de criação de usuários',
      'Validação robusta de configuração de email antes do envio',
      'Alertas visuais melhorados para feedback do usuário',
      'Campo de senha visível nas configurações de email SMTP'
    ],
    bugFixes: [
      'Correção do campo password no UserForm (era pass, agora é password)',
      'Melhoria no tratamento de erros durante criação de usuários',
      'Logs de debug adicionados para troubleshooting de email',
      'Correção na validação de configuração de email habilitado',
      'Otimização do fluxo de envio de email de boas-vindas'
    ]
  },
  '1.3.5': {
    version: '1.3.5',
    release: 'Stable',
    buildDate: '2025-02-04',
    buildNumber: 20,
    features: [
      'Correção definitiva da configuração SSL/TLS para Gmail',
      'Detecção automática de porta SMTP (587=STARTTLS, 465=SSL)',
      'Configuração robusta para diferentes provedores SMTP',
      'Compatibilidade total com Gmail e outros serviços',
      'Logs detalhados de configuração SSL/TLS'
    ],
    bugFixes: [
      'Correção do erro "SSL routines:ssl3_get_record:wrong version number"',
      'Configuração correta secure=false para porta 587 (STARTTLS)',
      'Configuração correta secure=true para porta 465 (SSL direto)',
      'Melhoria na configuração TLS com rejectUnauthorized=false',
      'Otimização da compatibilidade com servidores SMTP diversos'
    ]
  },
  '1.3.4': {
    version: '1.3.4',
    release: 'Stable',
    buildDate: '2025-02-03',
    buildNumber: 19,
    features: [
      'Correção definitiva do método nodemailer nas Netlify Functions',
      'Método createTransport corrigido (era createTransporter)',
      'Sistema de email SMTP totalmente funcional',
      'Validação completa de métodos do nodemailer',
      'Logs detalhados para debug de conexão SMTP'
    ],
    bugFixes: [
      'Correção do erro "nodemailer.createTransporter is not a function"',
      'Método correto nodemailer.createTransport implementado',
      'Resolução de problemas de API do nodemailer',
      'Melhoria na importação e uso do nodemailer',
      'Otimização do tratamento de erros de conexão SMTP'
    ]
  },
  '1.3.3': {
    version: '1.3.3',
    release: 'Stable',
    buildDate: '2025-02-02',
    buildNumber: 18,
    features: [
      'Correção definitiva do erro HTTP 502 nas Netlify Functions',
      'Variável smtpConfig corrigida na function test-smtp',
      'Tratamento robusto de parsing JSON nas functions',
      'Validação completa de dados de entrada',
      'Logs de debug otimizados para produção'
    ],
    bugFixes: [
      'Correção do erro "smtpConfig is not defined"',
      'Resolução de problemas de escopo de variáveis',
      'Melhoria na estrutura de try-catch das functions',
      'Correção na validação de corpo da requisição',
      'Otimização do tratamento de erros HTTP'
    ]
  },
  '1.3.2': {
    version: '1.3.2',
    release: 'Stable',
    buildDate: '2025-02-01',
    buildNumber: 17,
    features: [
      'Sistema de email completamente revisado e corrigido',
      'Logs detalhados implementados em todo o fluxo de email',
      'Validação robusta de URLs das Netlify Functions',
      'Tratamento aprimorado de erros HTTP 404',
      'Debug completo do sistema de SMTP',
      'Verificação de existência das functions antes do envio',
      'Fallback para modo simulado quando functions não estão disponíveis'
    ],
    bugFixes: [
      'Correção definitiva do erro HTTP 404 nas Netlify Functions',
      'Resolução de problemas de roteamento das functions',
      'Melhoria na detecção de ambiente de desenvolvimento vs produção',
      'Correção na validação de respostas das functions',
      'Otimização do sistema de logs de debug'
    ]
  },
  '1.3.1': {
    version: '1.3.1',
    release: 'Stable',
    buildDate: '2025-01-31',
    buildNumber: 16,
    features: [
      'Correção do erro HTTP 404 nas Netlify Functions',
      'Melhoria no tratamento de respostas JSON vazias',
      'Logs de debug aprimorados para troubleshooting',
      'Validação robusta de respostas HTTP',
      'Headers Content-Type corrigidos nas functions'
    ],
    bugFixes: [
      'Correção do erro "Unexpected end of JSON input"',
      'Resolução do erro HTTP 404 no teste SMTP',
      'Melhoria no tratamento de erros de parsing JSON',
      'Correção na validação de respostas das Netlify Functions',
      'Otimização do sistema de logs de erro'
    ]
  },
  '1.3.0': {
    version: '1.3.0',
    release: 'Stable',
    buildDate: '2025-01-30',
    buildNumber: 15,
    features: [
      'Sistema completo de envio de emails REAL implementado',
      'Netlify Functions com Nodemailer para SMTP real',
      'Teste de conexão SMTP com envio real de email',
      'Backend serverless para produção no Netlify',
      'Integração completa frontend-backend para emails',
      'Emails de boas-vindas reais para novos usuários',
      'Notificações de pipeline com envio real',
      'Logs detalhados de envio e erros',
      'Configuração SMTP validada em produção'
    ],
    bugFixes: [
      'Substituição do sistema simulado por envio real',
      'Correção na validação de configurações SMTP',
      'Melhoria no tratamento de erros de envio',
      'Otimização da performance de envio',
      'Correção na exibição de logs de teste'
    ]
  },
  '1.2.2': {
    version: '1.2.2',
    release: 'Stable',
    buildDate: '2025-01-29',
    buildNumber: 14,
    features: [
      'Melhorias no sistema de teste de conexão SMTP',
      'Logs detalhados e copiáveis para debug de email',
      'Avisos claros sobre limitações do teste simulado',
      'Interface aprimorada para visualização de logs',
      'Documentação inline sobre configuração real de SMTP'
    ],
    bugFixes: [
      'Esclarecimento sobre teste simulado vs envio real',
      'Melhoria na apresentação de resultados de teste',
      'Correção na exibição de informações técnicas',
      'Otimização da interface de logs'
    ]
  },
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
    formatVersion: (includeRelease?: boolean) => VersionManager.formatVersion(includeRelease),
    formatBuildInfo: () => VersionManager.formatBuildInfo(),
    getVersionBadgeColor: (release: string) => VersionManager.getVersionBadgeColor(release)
  };
};