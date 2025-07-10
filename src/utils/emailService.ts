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

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendPipelineNotification(notification: PipelineNotification): Promise<boolean> {
    if (!this.config.enabled || !this.config.notificationEmail) {
      console.log('Email notifications are disabled');
      return false;
    }

    try {
      const emailContent = this.generatePipelineNotificationEmail(notification);
      
      console.log('Sending pipeline notification email');
      console.log(`To: ${this.config.notificationEmail}`);
      console.log(`Subject: Pipeline Update: ${notification.dealTitle}`);
      
      const emailData = {
        to: this.config.notificationEmail,
        subject: `Pipeline Update: ${notification.dealTitle}`,
        html: emailContent
      };

      // Send real email via Netlify Function
      await this.sendEmailViaAPI(emailData);

      return true;
    } catch (error) {
      console.error(`Failed to send email notification: ${error}`);
      return false;
    }
  }

  async testConnection(): Promise<SMTPTestResult> {
    try {
      // Test SMTP connection via Netlify Function
      const response = await fetch('/.netlify/functions/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpConfig: this.config,
          testEmail: this.config.notificationEmail
        })
      });

      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Erro na requisição'}`);
      }

      // Check if response has content
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Resposta vazia do servidor');
      }

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', responseText);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}...`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
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