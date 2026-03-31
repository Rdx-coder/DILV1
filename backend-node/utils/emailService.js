const nodemailer = require('nodemailer');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatMultilineHtml = (value = '') => escapeHtml(value).replace(/\n/g, '<br>');

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

  renderBaseTemplate({ title, bodyHtml, footerHtml = '' }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f4816; color: #d9fb06; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .original-message { border-left: 3px solid #d9fb06; margin-top: 20px; background-color: #fff; padding: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${escapeHtml(title || 'Dangi Innovation Lab')}</h2>
          </div>
          <div class="content">${bodyHtml}</div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dangi Innovation Lab. All rights reserved.</p>
            <p>A 100% Community-Driven Non-Profit Organization</p>
            <p>Email: contact@dangiinnovationlab.com</p>
            ${footerHtml}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getReplyTemplateIntro(template, name) {
    const safeName = escapeHtml(name || 'there');
    const intros = {
      general: `<p>Dear ${safeName},</p><p>Thank you for writing to Dangi Innovation Lab.</p>`,
      application: `<p>Dear ${safeName},</p><p>Thank you for your program application and interest in DIL.</p>`,
      mentorship: `<p>Dear ${safeName},</p><p>Thank you for your interest in our mentorship pathway.</p>`,
      support: `<p>Dear ${safeName},</p><p>Thank you for supporting our mission and reaching out.</p>`
    };

    return intros[template] || intros.general;
  }

  async sendReply({ to, subject, message, originalSubmission, template = 'general' }) {
    const originalMessageHtml = originalSubmission?.message
      ? `<div class="original-message"><strong>Your Original Message:</strong><br>${formatMultilineHtml(originalSubmission.message)}</div>`
      : '';

    const bodyHtml = `
      ${this.getReplyTemplateIntro(template, originalSubmission?.name)}
      <div>${formatMultilineHtml(message)}</div>
      ${originalMessageHtml}
    `;

    const html = this.renderBaseTemplate({
      title: 'Dangi Innovation Lab',
      bodyHtml
    });

    return await this.sendEmail({
      to,
      subject,
      text: message,
      html
    });
  }

  async sendWelcomeEmail(to, name) {
    const subject = 'Thank you for contacting Dangi Innovation Lab';
    const bodyHtml = `
      <p>Dear ${escapeHtml(name)},</p>
      <p>Thank you for reaching out to Dangi Innovation Lab. We have received your message and will get back to you within 2-3 business days.</p>
      <p>In the meantime, feel free to explore our programs and learn more about our mission through our website.</p>
      <p>Best regards,<br>The DIL Team</p>
    `;

    const html = this.renderBaseTemplate({
      title: 'Dangi Innovation Lab',
      bodyHtml
    });

    return await this.sendEmail({ to, subject, html });
  }
}

module.exports = new EmailService();
