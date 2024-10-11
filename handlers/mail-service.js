const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    })
  }

  // Method to send activation email
  async sendActivationMail(to, link) {
    try {
      // Sending the email using the transporter
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Confirm your ChoreChart account',
        text: '',
        html: `
           <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1>Welcome to ChoreChart!</h1>
            <p>Thank you for registering. To activate your account, please click the link below:</p>
            <a href="${link}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">Activate your account</a>
            <p>If the link doesn't work, please copy and paste the following URL into your browser:</p>
            <p>${link}</p>
            <p>Best regards,<br>The ChoreChart Team</p>
          </div>
        `
      });
      console.log('Activation email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Could not send activation email');
    }
  }

}

module.exports = new MailService();