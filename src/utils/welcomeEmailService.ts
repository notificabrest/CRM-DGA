// Welcome email service for new users

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  userRole: string;
  temporaryPassword: string;
  systemUrl: string;
  createdBy: string;
}

export class WelcomeEmailService {
  static async sendWelcomeEmail(emailData: WelcomeEmailData): Promise<boolean> {
    try {
      // In a real application, this would make an API call to your backend
      // which would then send the email using the configured SMTP settings
      
      const emailContent = this.generateWelcomeEmail(emailData);
      
      console.log('Sending welcome email:', {
        to: emailData.userEmail,
        subject: `Bem-vindo ao CRM-DGA - Suas credenciais de acesso`,
        content: emailContent
      });

      // Simulate API call
      await this.mockSendEmail({
        to: emailData.userEmail,
        subject: `Bem-vindo ao CRM-DGA - Suas credenciais de acesso`,
        html: emailContent
      });

      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  private static generateWelcomeEmail(data: WelcomeEmailData): string {
    const roleDescriptions = {
      'ADMIN': 'Administrador do Sistema',
      'DIRECTOR': 'Diretor',
      'MANAGER': 'Gerente',
      'SALESPERSON': 'Vendedor',
      'ASSISTANT': 'Assistente'
    };

    const roleDescription = roleDescriptions[data.userRole as keyof typeof roleDescriptions] || data.userRole;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao CRM-DGA</title>
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
            background: linear-gradient(135deg, #FF6B35, #F97316);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 30px;
          }
          .welcome-box {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #FF6B35;
          }
          .credentials {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
          }
          .credentials h3 {
            margin-top: 0;
            color: #FF6B35;
            font-size: 18px;
          }
          .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .credential-item:last-child {
            border-bottom: none;
          }
          .credential-label {
            font-weight: 600;
            color: #495057;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid #ced4da;
            color: #212529;
          }
          .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .instructions h3 {
            margin-top: 0;
            color: #856404;
          }
          .step {
            margin: 15px 0;
            padding-left: 25px;
            position: relative;
          }
          .step::before {
            content: counter(step-counter);
            counter-increment: step-counter;
            position: absolute;
            left: 0;
            top: 0;
            background: #FF6B35;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
          .steps-container {
            counter-reset: step-counter;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .feature {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #FF6B35;
          }
          .feature h4 {
            margin: 0 0 8px 0;
            color: #FF6B35;
            font-size: 14px;
          }
          .feature p {
            margin: 0;
            font-size: 13px;
            color: #6c757d;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #FF6B35, #F97316);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 12px;
          }
          .security-notice {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .security-notice h4 {
            margin: 0 0 10px 0;
            color: #0c5460;
          }
          .security-notice p {
            margin: 0;
            color: #0c5460;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao CRM-DGA!</h1>
            <p>Sua conta foi criada com sucesso</p>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2>Olá, ${data.userName}! 👋</h2>
              <p>Sua conta no <strong>CRM-DGA</strong> foi criada por <strong>${data.createdBy}</strong> e você agora tem acesso ao nosso sistema de gestão de relacionamento com clientes.</p>
              <p>Seu perfil foi configurado como: <strong>${roleDescription}</strong></p>
            </div>

            <div class="credentials">
              <h3>🔐 Suas Credenciais de Acesso</h3>
              <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${data.userEmail}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Senha Temporária:</span>
                <span class="credential-value">${data.temporaryPassword}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">URL do Sistema:</span>
                <span class="credential-value">${data.systemUrl}</span>
              </div>
            </div>

            <div class="security-notice">
              <h4>🔒 Importante - Segurança</h4>
              <p>Por motivos de segurança, recomendamos que você altere sua senha no primeiro acesso. Vá em Configurações → Alterar Senha após fazer login.</p>
            </div>

            <div class="instructions">
              <h3>📋 Primeiros Passos</h3>
              <div class="steps-container">
                <div class="step">Acesse o sistema usando o link e credenciais fornecidas acima</div>
                <div class="step">Altere sua senha temporária por uma senha segura</div>
                <div class="step">Complete seu perfil com informações adicionais</div>
                <div class="step">Explore as funcionalidades disponíveis para seu perfil</div>
                <div class="step">Entre em contato com seu administrador se tiver dúvidas</div>
              </div>
            </div>

            <div class="features">
              <div class="feature">
                <h4>👥 Gestão de Clientes</h4>
                <p>Cadastre e gerencie informações completas dos seus clientes</p>
              </div>
              <div class="feature">
                <h4>💼 Pipeline de Vendas</h4>
                <p>Acompanhe seus negócios através do funil de vendas</p>
              </div>
              <div class="feature">
                <h4>📞 Busca Inteligente</h4>
                <p>Encontre clientes rapidamente por telefone, nome ou empresa</p>
              </div>
              <div class="feature">
                <h4>📊 Relatórios</h4>
                <p>Analise performance e gere relatórios detalhados</p>
              </div>
              <div class="feature">
                <h4>📅 Calendário</h4>
                <p>Organize reuniões, tarefas e lembretes</p>
              </div>
              <div class="feature">
                <h4>⚙️ Configurações</h4>
                <p>Personalize o sistema conforme suas necessidades</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${data.systemUrl}" class="cta-button">
                🚀 Acessar o Sistema Agora
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <h3>📞 Precisa de Ajuda?</h3>
              <p>Se você tiver alguma dúvida ou precisar de suporte, entre em contato com:</p>
              <ul>
                <li><strong>Administrador do Sistema:</strong> ${data.createdBy}</li>
                <li><strong>Suporte Técnico:</strong> suporte@brestelecom.com.br</li>
                <li><strong>Documentação:</strong> Disponível dentro do sistema</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>CRM-DGA</strong> - Sistema de Gestão de Relacionamento com Clientes</p>
            <p>© ${new Date().getFullYear()} Brest Telecom. Todos os direitos reservados.</p>
            <p>Este é um email automático, não responda a esta mensagem.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static async mockSendEmail(emailData: any): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would make an HTTP request to your backend
    // Example:
    // const response = await fetch('/api/send-welcome-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailData)
    // });
    
    // For now, just log the email that would be sent
    console.log('📧 Welcome email would be sent:', emailData);
  }
}