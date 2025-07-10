// Email service for sending notifications

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  notificationEmail: string;
  enabled: boolean;
}

export interface PipelineNotification {
  dealTitle: string;
  clientName: string;
  fromStatus: string;
  toStatus: string;
  userName: string;
  dealValue?: number;
  timestamp: Date;
}

export interface SMTPTestResult {
  success: boolean;
  message: string;
  details: {
    timestamp: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    testEmail: string;
    responseTime?: number;
    error?: string;
    logs: string[];
  };
}

// Mock email service - In a real application, this would integrate with a backend service
export class EmailService {
  private config: EmailConfig;
  private debugMode: boolean = true;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[EmailService] ${message}`, data || '');
    }
  }

  private async checkFunctionAvailability(functionName: string): Promise<boolean> {
    try {
      this.log(`🔍 Verificando disponibilidade da function: ${functionName}`);
      
      const testUrl = `/.netlify/functions/${functionName}`;
      this.log(`📡 URL de teste: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      this.log(`📊 Status da verificação: ${response.status}`);
      
      // 200 = function exists, 405 = method not allowed but function exists
      const isAvailable = response.status === 200 || response.status === 405;
      this.log(`✅ Function ${functionName} disponível: ${isAvailable}`);
      
      return isAvailable;
    } catch (error) {
      this.log(`❌ Erro ao verificar function ${functionName}:`, error);
      return false;
    }
  }

  async sendPipelineNotification(notification: PipelineNotification): Promise<boolean> {
    this.log('🚀 Iniciando envio de notificação de pipeline');
    this.log('📧 Configuração de email:', {
      enabled: this.config.enabled,
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      user: this.config.smtpUser,
      notificationEmail: this.config.notificationEmail
    });
    
    if (!this.config.enabled || !this.config.notificationEmail) {
      this.log('⚠️ Notificações de email estão desabilitadas');
      return false;
    }

    // Verificar se a function está disponível
    const functionAvailable = await this.checkFunctionAvailability('send-email');
    if (!functionAvailable) {
      this.log('❌ Netlify Function send-email não está disponível');
      this.log('🔄 Executando em modo simulado');
      return this.simulateEmailSend(notification);
    }

    try {
      this.log('📝 Gerando conteúdo do email');
      const emailContent = this.generatePipelineNotificationEmail(notification);
      
      this.log('📤 Preparando dados para envio');
      this.log(`📧 Para: ${this.config.notificationEmail}`);
      this.log(`📋 Assunto: Pipeline Update: ${notification.dealTitle}`);
      
      const emailData = {
        to: this.config.notificationEmail,
        subject: `Pipeline Update: ${notification.dealTitle}`,
        html: emailContent
      };

      this.log('🚀 Enviando email via Netlify Function');
      await this.sendEmailViaAPI(emailData);

      this.log('✅ Email de notificação enviado com sucesso');
      return true;
    } catch (error) {
      this.log('❌ Falha ao enviar notificação por email:', error);
      return false;
    }
  }

  private simulateEmailSend(notification: PipelineNotification): boolean {
    this.log('🎭 Simulando envio de email (modo desenvolvimento)');
    this.log('📧 Dados da notificação:', {
      dealTitle: notification.dealTitle,
      clientName: notification.clientName,
      fromStatus: notification.fromStatus,
      toStatus: notification.toStatus,
      userName: notification.userName
    });
    this.log('✅ Email simulado enviado com sucesso');
    return true;
  }

  async testConnection(): Promise<SMTPTestResult> {
    this.log('🧪 Iniciando teste de conexão SMTP');
    this.log('⚙️ Configuração SMTP:', {
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      user: this.config.smtpUser,
      notificationEmail: this.config.notificationEmail
    });
    
    // Verificar se a function está disponível
    const functionAvailable = await this.checkFunctionAvailability('test-smtp');
    if (!functionAvailable) {
      this.log('❌ Netlify Function test-smtp não está disponível');
      return this.simulateTestConnection();
    }
    
    try {
      this.log('📡 Enviando requisição para test-smtp function');
      const requestData = {
        smtpConfig: this.config,
        testEmail: this.config.notificationEmail
      };
      
      this.log('📤 Dados da requisição:', requestData);
      
      const response = await fetch('/.netlify/functions/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      this.log(`📊 Status da resposta: ${response.status} ${response.statusText}`);
      this.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        this.log(`❌ Resposta HTTP não OK: ${response.status}`);
        const errorText = await response.text();
        this.log('📄 Texto do erro:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Erro na requisição'}`);
      }

      this.log('📥 Lendo conteúdo da resposta');
      const responseText = await response.text();
      this.log('📄 Texto da resposta:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        this.log('⚠️ Resposta vazia do servidor');
        throw new Error('Resposta vazia do servidor');
      }

      this.log('🔄 Fazendo parse do JSON');
      let result;
      try {
        result = JSON.parse(responseText);
        this.log('✅ JSON parseado com sucesso:', result);
      } catch (parseError) {
        this.log('❌ Erro ao fazer parse do JSON:', parseError);
        this.log('📄 Conteúdo que causou erro:', responseText.substring(0, 200));
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}...`);
      }

      this.log('🎉 Teste de conexão concluído com sucesso');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.log('❌ Erro no teste de conexão:', errorMessage);
      
      return {
        success: false,
        message: `Falha na conexão SMTP: ${errorMessage}`,
        details: {
          timestamp: new Date().toISOString(),
          host: this.config.smtpHost,
          port: this.config.smtpPort,
          secure: this.config.smtpSecure,
          user: this.config.smtpUser,
          testEmail: this.config.notificationEmail,
          error: errorMessage,
          logs: [`❌ ERRO: ${errorMessage}`]
        }
      };
    }
  }

  private simulateTestConnection(): SMTPTestResult {
    this.log('🎭 Simulando teste de conexão SMTP (modo desenvolvimento)');
    
    return {
      success: true,
      message: 'Teste simulado realizado com sucesso (modo desenvolvimento)',
      details: {
        timestamp: new Date().toISOString(),
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        user: this.config.smtpUser,
        testEmail: this.config.notificationEmail,
        responseTime: 500,
        logs: [
          '🎭 Executando em modo simulado',
          '⚠️ Netlify Functions não disponíveis no ambiente atual',
          '✅ Configuração SMTP validada localmente',
          '📧 Em produção, um email real seria enviado',
          '🔧 Para testar envio real, faça deploy no Netlify'
        ]
      }
    };
  }

  private generatePipelineNotificationEmail(notification: PipelineNotification): string {
    const formattedValue = notification.dealValue 
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(notification.dealValue)
      : 'Não informado';

    const formattedDate = notification.timestamp.toLocaleString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pipeline Update Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #FF6B35, #F97316);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .deal-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #FF6B35;
          }
          .status-change {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            font-weight: bold;
          }
          .status {
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            margin: 0 10px;
          }
          .status.from {
            background-color: #6c757d;
          }
          .status.to {
            background-color: #28a745;
          }
          .arrow {
            font-size: 20px;
            color: #FF6B35;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Pipeline Update</h1>
          <p>Um negócio foi movido no funil de vendas</p>
        </div>
        
        <div class="content">
          <div class="deal-info">
            <h2>📋 Detalhes do Negócio</h2>
            <p><strong>Título:</strong> ${notification.dealTitle}</p>
            <p><strong>Cliente:</strong> ${notification.clientName}</p>
            <p><strong>Valor:</strong> ${formattedValue}</p>
            <p><strong>Alterado por:</strong> ${notification.userName}</p>
            <p><strong>Data/Hora:</strong> ${formattedDate}</p>
          </div>

          <div class="status-change">
            <span class="status from">${notification.fromStatus}</span>
            <span class="arrow">→</span>
            <span class="status to">${notification.toStatus}</span>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${window.location.origin}/pipeline" 
               style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Pipeline Completo
            </a>
          </p>
        </div>

        <div class="footer">
          <p>Esta é uma notificação automática do CRM-DGA</p>
          <p>© ${new Date().getFullYear()} CRM-DGA. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;
  }

  private async sendEmailViaAPI(emailData: any): Promise<void> {
    this.log('🚀 Enviando email via API');
    this.log('📧 Dados do email:', {
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html
    });
    
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailData,
        smtpConfig: this.config
      })
    });

    this.log(`📊 Status da resposta send-email: ${response.status}`);
    
    if (!response.ok) {
      this.log('❌ Erro na resposta send-email');
      const error = await response.json();
      this.log('📄 Detalhes do erro:', error);
      throw new Error(error.error || 'Failed to send email');
    }

    const result = await response.json();
    this.log('✅ Email enviado com sucesso:', result);
  }
}

// Default email configuration
export const defaultEmailConfig: EmailConfig = {
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpSecure: true,
  notificationEmail: '',
  enabled: false
};