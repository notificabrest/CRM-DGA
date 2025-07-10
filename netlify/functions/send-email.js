// Import nodemailer - dependency managed by main package.json
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('📧 Send Email Function called - Version 1.3.4');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Path:', event.path);
  console.log('Query:', event.queryStringParameters);
  console.log('Context:', JSON.stringify(context, null, 2));
  
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

  // Initialize variables
  let emailData = null;
  let smtpConfig = null;

  try {
    console.log('📥 Request body:', event.body);
    
    if (!event.body) {
      console.log('❌ Empty request body');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Request body is required' 
        })
      };
    }

    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(event.body);
      emailData = requestData.emailData;
      smtpConfig = requestData.smtpConfig;
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON data' 
        })
      };
    }

    // Validate required fields
    if (!emailData || !smtpConfig) {
      console.log('❌ Missing email data or SMTP config');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing email data or SMTP configuration' 
        })
      };
    }

    // Validate SMTP configuration
    const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure } = smtpConfig;
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.log('❌ Incomplete SMTP configuration');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Incomplete SMTP configuration' 
        })
      };
    }

    console.log('📧 Creating SMTP transporter...');
    console.log(`Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser}`);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    console.log('🔐 Verifying SMTP connection...');
    // Verify connection
    await transporter.verify();

    console.log('📤 Sending email...');
    console.log(`To: ${emailData.to}, Subject: ${emailData.subject}`);

    // Send email
    const info = await transporter.sendMail({
      from: `"CRM-DGA System" <${smtpUser}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || ''
    });

    console.log('✅ Email sent successfully');
    console.log(`Message ID: ${info.messageId}`);

    const successResponse = {
      success: true,
      messageId: info.messageId,
      response: info.response
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
    console.error('Email sending error:', error);
    console.error('Error stack:', error.stack);

    const errorResponse = {
      success: false,
      error: error.message || 'Failed to send email'
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