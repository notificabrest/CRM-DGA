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
  dealValue: number;
  timestamp: Date;
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
      // In a real application, this would make an API call to your backend
      // which would then send the email using the configured SMTP settings
      
      const emailContent = this.generatePipelineNotificationEmail(notification);
      
      console.log('Sending email notification:', {
        to: this.config.notificationEmail,
        subject: `Pipeline Update: ${notification.dealTitle}`,
        content: emailContent
      });

      // Simulate API call
      await this.mockSendEmail({
        to: this.config.notificationEmail,
        subject: `Pipeline Update: ${notification.dealTitle}`,
        html: emailContent
      });

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  private generatePipelineNotificationEmail(notification: PipelineNotification): string {
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(notification.dealValue);

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
            <p><strong>Valor:</strong> ${notification.dealValue ? formattedValue : 'Não informado'}</p>
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    console.log('📧 Email would be sent:', emailData);
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing SMTP connection with config:', {
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        user: this.config.smtpUser,
        secure: this.config.smtpSecure
      });

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would test the SMTP connection
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
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