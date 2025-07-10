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
  private logs: string[] = [];

  constructor(config: EmailConfig) {
    this.config = config;
    this.logs = [];
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  private clearLogs(): void {
    this.logs = [];
  }

  async sendPipelineNotification(notification: PipelineNotification): Promise<boolean> {
    if (!this.config.enabled || !this.config.notificationEmail) {
      this.log('Email notifications are disabled');
      return false;
    }

    try {
      // In a real application, this would make an API call to your backend
      // which would then send the email using the configured SMTP settings
      
      const emailContent = this.generatePipelineNotificationEmail(notification);
      
      this.log('Sending pipeline notification email');
      this.log(`To: ${this.config.notificationEmail}`);
      this.log(`Subject: Pipeline Update: ${notification.dealTitle}`);
      
      const emailData = {
        to: this.config.notificationEmail,
        subject: `Pipeline Update: ${notification.dealTitle}`,
        html: emailContent
      };

      // Simulate API call
      await this.mockSendEmail(emailData);

      return true;
    } catch (error) {
      this.log(`Failed to send email notification: ${error}`);
      return false;
    }
  }

  async testConnection(): Promise<SMTPTestResult> {
    this.clearLogs();
    const startTime = Date.now();
    
    this.log('🚀 Iniciando teste de conexão SMTP...');
    this.log(`Host: ${this.config.smtpHost}`);
    this.log(`Port: ${this.config.smtpPort}`);
    this.log(`Secure: ${this.config.smtpSecure ? 'TLS/SSL' : 'No'}`);
    this.log(`User: ${this.config.smtpUser}`);
    this.log('');
    this.log('⚠️  IMPORTANTE: Este é um teste SIMULADO');
    this.log('⚠️  Para envio real, configure um backend com SMTP');
    this.log('');

    try {
      // Validate configuration
      if (!this.config.smtpHost || !this.config.smtpUser || !this.config.smtpPassword) {
        this.log('❌ Erro: Configuração SMTP incompleta');
        throw new Error('Configuração SMTP incompleta. Verifique host, usuário e senha.');
      }

      if (!this.config.notificationEmail) {
        this.log('❌ Erro: Email de notificação não configurado');
        throw new Error('Email de notificação não configurado.');
      }

      this.log('✅ Validação de configuração: OK');
      this.log('🔌 Simulando conexão com servidor SMTP...');
      
      // Simulate connection test with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.log('✅ Conexão estabelecida com sucesso');
      this.log('🔐 Simulando autenticação de usuário...');
      
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.log('✅ Autenticação simulada com sucesso');
      this.log('📧 Preparando email de teste...');
      
      // Generate test email
      const testEmailContent = this.generateTestEmail();
      
      this.log('📤 Simulando envio de email de teste...');
      this.log(`📧 Para: ${this.config.notificationEmail}`);
      this.log(`📧 Assunto: ✅ Teste de Conexão SMTP - CRM-DGA`);
      
      // Send test email
      const emailData = {
        to: this.config.notificationEmail,
        subject: '✅ Teste de Conexão SMTP - CRM-DGA',
        html: testEmailContent
      };
      
      await this.mockSendEmail(emailData);
      
      const responseTime = Date.now() - startTime;
      this.log(`✅ Simulação de envio concluída em ${responseTime}ms`);
      this.log('');
      this.log('🎉 Teste de conexão SMTP simulado com êxito!');
      this.log('');
      this.log('📝 NOTA: Para envio real, implemente:');
      this.log('   • Backend com Nodemailer ou similar');
      this.log('   • API endpoint para envio de emails');
      this.log('   • Configuração SMTP no servidor');
      
      return {
        success: true,
        message: 'Teste de conexão SMTP simulado com sucesso! Verifique os logs para detalhes.',
        details: {
          timestamp: new Date().toISOString(),
          host: this.config.smtpHost,
          port: this.config.smtpPort,
          secure: this.config.smtpSecure,
          user: this.config.smtpUser,
          testEmail: this.config.notificationEmail,
          responseTime,
          logs: [...this.logs]
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.log(`❌ ERRO: ${errorMessage}`);
      this.log(`❌ Teste falhou após ${responseTime}ms`);
      
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
          responseTime,
          error: errorMessage,
          logs: [...this.logs]
        }
      };
    }
  }

  private generateTestEmail(): string {
    const timestamp = new Date().toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Teste de Conexão SMTP</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 30px;
          }
          .success-box {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10B981;
          }
          .config-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
          }
          .config-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .config-item:last-child {
            border-bottom: none;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Teste de Conexão SMTP</h1>
            <p>Configuração validada com sucesso!</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h2>🎉 Parabéns!</h2>
              <p>Sua configuração SMTP está funcionando corretamente. Este email foi enviado automaticamente pelo sistema CRM-DGA para confirmar que:</p>
              <ul>
                <li>✅ Conexão com o servidor SMTP estabelecida</li>
                <li>✅ Autenticação realizada com sucesso</li>
                <li>✅ Email enviado e entregue</li>
                <li>✅ Sistema pronto para enviar notificações</li>
              </ul>
            </div>

            <div class="config-info">
              <h3>📋 Configuração Testada</h3>
              <div class="config-item">
                <span><strong>Servidor SMTP:</strong></span>
                <span>${this.config.smtpHost}:${this.config.smtpPort}</span>
              </div>
              <div class="config-item">
                <span><strong>Segurança:</strong></span>
                <span>${this.config.smtpSecure ? 'TLS/SSL Habilitado' : 'Sem criptografia'}</span>
              </div>
              <div class="config-item">
                <span><strong>Usuário:</strong></span>
                <span>${this.config.smtpUser}</span>
              </div>
              <div class="config-item">
                <span><strong>Data/Hora do Teste:</strong></span>
                <span>${timestamp}</span>
              </div>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #856404;">📧 Próximos Passos</h3>
              <p style="margin-bottom: 0; color: #856404;">
                Agora que o SMTP está configurado, o sistema enviará automaticamente:
              </p>
              <ul style="color: #856404;">
                <li>Emails de boas-vindas para novos usuários</li>
                <li>Notificações de movimentação no pipeline</li>
                <li>Alertas e lembretes importantes</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>CRM-DGA</strong> - Sistema de Gestão de Relacionamento com Clientes</p>
            <p>© ${new Date().getFullYear()} Brest Telecom. Todos os direitos reservados.</p>
            <p>Este é um email de teste automático do sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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

  private async mockSendEmail(emailData: any): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real application, this would make an HTTP request to your backend
    // Example:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...emailData,
    //     smtpConfig: this.config
    //   })
    // });
    
    // For now, just log the email that would be sent
    this.log(`📧 Simulação: Email seria enviado para: ${emailData.to}`);
    this.log(`📧 Simulação: Assunto: ${emailData.subject}`);
    this.log(`📧 Simulação: Tamanho do conteúdo: ${emailData.html.length} caracteres`);
    this.log(`📧 Simulação: Status: Enviado com sucesso (MOCK)`);
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