const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'tmadem@ajsupplements.com',
      pass: process.env.EMAIL_PASS || 'Tulasi@8309695878'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email template
const createEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Form Inquiry - AJ Supplements</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2563eb; }
            .value { margin-top: 5px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #3B82F6; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🔔 New Contact Form Inquiry</h2>
                <p>AJ Supplements - Customer Inquiry</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">👤 Name:</div>
                    <div class="value">${formData.name || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">📧 Email:</div>
                    <div class="value">${formData.email || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">📞 Phone:</div>
                    <div class="value">${formData.phone || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">🏢 Business Type:</div>
                    <div class="value">${formData.businessType || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">📦 Product Quantity:</div>
                    <div class="value">${formData.productQuantity || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">📍 Address:</div>
                    <div class="value">${formData.address || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">🛍️ Product Type:</div>
                    <div class="value">${formData.productType || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">📋 Packaging:</div>
                    <div class="value">${formData.packaging || 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">💬 Message:</div>
                    <div class="value">${formData.message || 'No message provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">⏰ Submitted At:</div>
                    <div class="value">${new Date().toLocaleString('en-US', { 
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}</div>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from the AJ Supplements contact form.</p>
                <p>Please reply directly to the customer's email: ${formData.email}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// POST /api/contact - Send contact form email
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessType,
      productQuantity,
      address,
      productType,
      packaging,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Prepare form data
    const formData = {
      name,
      email,
      phone,
      businessType,
      productQuantity,
      address,
      productType,
      packaging,
      message
    };

    // Email options
    const mailOptions = {
      from: {
        name: 'AJ Supplements Contact Form',
        address: process.env.EMAIL_USER || 'tmadem@ajsupplements.com'
      },
      to: 'tmadem@ajsupplements.com',
      replyTo: email,
      subject: `New Contact Form Inquiry from ${name} - AJ Supplements`,
      html: createEmailTemplate(formData),
      text: `
        New Contact Form Inquiry from ${name}
        
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Business Type: ${businessType || 'Not provided'}
        Product Quantity: ${productQuantity || 'Not provided'}
        Address: ${address || 'Not provided'}
        Product Type: ${productType || 'Not provided'}
        Packaging: ${packaging || 'Not provided'}
        
        Message:
        ${message || 'No message provided'}
        
        Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Contact form email sent successfully:', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Your inquiry has been sent successfully. We will get back to you soon!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/contact - Health check for contact service
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Contact service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
