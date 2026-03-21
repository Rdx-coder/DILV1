const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      console.log('Email transporter initialized');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      if (!this.transporter) {
        console.log('Email service not configured. Email would have been sent to:', to);
        return {
          success: false,
          message: 'Email service not configured. Please add email credentials to .env file.'
        };
      }

      const mailOptions = {
        from: `Dangi Innovation Lab <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html: html || text
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendReply({ to, subject, message, originalSubmission }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f4816; color: #d9fb06; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .original-message { border-left: 3px solid #d9fb06; padding-left: 15px; margin-top: 20px; background-color: #fff; padding: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Dangi Innovation Lab</h2>
          </div>
          <div class="content">
            <p>Dear ${originalSubmission.name},</p>
            <div>${message.replace(/\n/g, '<br>')}</div>
            
            ${originalSubmission.message ? `
            <div class="original-message">
              <strong>Your Original Message:</strong><br>
              ${originalSubmission.message}
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dangi Innovation Lab. All rights reserved.</p>
            <p>A 100% Community-Driven Non-Profit Organization</p>
            <p>Email: contact@dangiinnovationlab.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject,
      text: message,
      html
    });
  }

  async sendWelcomeEmail(to, name) {
    const subject = 'Thank you for contacting Dangi Innovation Lab';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f4816; color: #d9fb06; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Dangi Innovation Lab</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Dangi Innovation Lab. We have received your message and will get back to you within 2-3 business days.</p>
            <p>In the meantime, feel free to explore our programs and learn more about our mission at our website.</p>
            <p>Best regards,<br>The DIL Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dangi Innovation Lab. All rights reserved.</p>
            <p>A 100% Community-Driven Non-Profit Organization</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }
}

module.exports = new EmailService();
