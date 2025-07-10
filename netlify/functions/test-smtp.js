const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('🚀 SMTP Test Function called - Version 1.3.2');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Path:', event.path);
  console.log('Query:', event.queryStringParameters);
  console.log('Context:', JSON.stringify(context, null, 2));
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: ''
    };
  }

  const startTime = Date.now();
  const logs = [];
  
  const log = (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  try {
    console.log('📥 Request body:', event.body);
    
    if (!event.body) {
      log('❌ Erro: Corpo da requisição vazio');
      throw new Error('Corpo da requisição não fornecido');
    }

    const { smtpConfig, testEmail } = JSON.parse(event.body);

    log('🚀 Iniciando teste de conexão SMTP REAL...');
    log(`Host: ${smtpConfig.smtpHost}`);
    log(`Port: ${smtpConfig.smtpPort}`);
    log(`Secure: ${smtpConfig.smtpSecure ? 'TLS/SSL' : 'No'}`);
    log(`User: ${smtpConfig.smtpUser}`);
    log(`Test Email: ${testEmail}`);

    // Validate configuration
    if (!smtpConfig.smtpHost || !smtpConfig.smtpUser || !smtpConfig.smtpPassword) {
      log('❌ Erro: Configuração SMTP incompleta');
      throw new Error('Configuração SMTP incompleta. Verifique host, usuário e senha.');
    }

    if (!testEmail) {
      log('❌ Erro: Email de teste não fornecido');
      throw new Error('Email de teste não fornecido.');
    }

    log('✅ Validação de configuração: OK');
    log('🔌 Conectando ao servidor SMTP...');

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtpConfig.smtpHost,
      port: parseInt(smtpConfig.smtpPort),
      secure: smtpConfig.smtpSecure,
      auth: {
        user: smtpConfig.smtpUser,
        pass: smtpConfig.smtpPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    log('🔐 Verificando autenticação...');
    
    // Verify connection
    await transporter.verify();
    
    log('✅ Conexão e autenticação verificadas com sucesso');
    log('📧 Preparando email de teste...');

    // Generate test email content
    const testEmailContent = generateTestEmail(smtpConfig, testEmail);
    
    log('📤 Enviando email de teste...');

    // Send test email
    const info = await transporter.sendMail({
      from: `"CRM-DGA Test" <${smtpConfig.smtpUser}>`,
      to: testEmail,
      subject: '✅ Teste de Conexão SMTP - CRM-DGA',
      html: testEmailContent
    });

    const responseTime = Date.now() - startTime;
    log(`✅ Email enviado com sucesso em ${responseTime}ms`);
    log(`📧 Message ID: ${info.messageId}`);
    log(`📧 Response: ${info.response}`);
    log('');
    log('🎉 Teste de conexão SMTP concluído com êxito!');
    log('📧 Verifique sua caixa de entrada para confirmar o recebimento');

    const successResponse = {
      success: true,
      message: 'Teste de conexão SMTP realizado com sucesso! Email enviado.',
      details: {
        timestamp: new Date().toISOString(),
        host: smtpConfig.smtpHost,
        port: smtpConfig.smtpPort,
        secure: smtpConfig.smtpSecure,
        user: smtpConfig.smtpUser,
        testEmail: testEmail,
        responseTime,
        messageId: info.messageId,
        response: info.response,
        logs: logs
      }
    };

    console.log('✅ Sending success response:', JSON.stringify(successResponse, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(successResponse)
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error.message || 'Erro desconhecido';
    
    log(`❌ ERRO: ${errorMessage}`);
    log(`❌ Teste falhou após ${responseTime}ms`);

    console.error('SMTP Test Error:', error);
    console.error('Error stack:', error.stack);

    const errorResponse = {
      success: false,
      message: `Falha na conexão SMTP: ${errorMessage}`,
      details: {
        timestamp: new Date().toISOString(),
        host: smtpConfig?.smtpHost || 'N/A',
        port: smtpConfig?.smtpPort || 'N/A',
        secure: smtpConfig?.smtpSecure || false,
        user: smtpConfig?.smtpUser || 'N/A',
        testEmail: testEmail || 'N/A',
        responseTime,
        error: errorMessage,
        logs: logs
      }
    };

    console.log('❌ Sending error response:', JSON.stringify(errorResponse, null, 2));

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};

function generateTestEmail(smtpConfig, testEmail) {
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
              <span>${smtpConfig.smtpHost}:${smtpConfig.smtpPort}</span>
            </div>
            <div class="config-item">
              <span><strong>Segurança:</strong></span>
              <span>${smtpConfig.smtpSecure ? 'TLS/SSL Habilitado' : 'Sem criptografia'}</span>
            </div>
            <div class="config-item">
              <span><strong>Usuário:</strong></span>
              <span>${smtpConfig.smtpUser}</span>
            </div>
            <div class="config-item">
              <span><strong>Email de Teste:</strong></span>
              <span>${testEmail}</span>
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