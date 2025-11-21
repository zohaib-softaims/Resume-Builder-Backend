import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendContactEmail({ name, email, subject, message }) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Resume Builder'}" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL_TO,
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Name:</strong> ${name}
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Email:</strong> ${email}
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Subject:</strong> ${subject}
              </p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #4F46E5;">
                <strong style="color: #555;">Message:</strong>
                <p style="margin: 10px 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
              <p>This email was sent from the Resume Builder contact form.</p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the Resume Builder contact form.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

export default new EmailService();
