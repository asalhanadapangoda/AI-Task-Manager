const { Resend } = require('resend');
const axios = require('axios');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Mock email dispatch in local development to avoid API errors and review output in terminal
  if (process.env.DEVELOPMENT_MODE === 'true') {
    console.log('\n==================================================');
    console.log(`[DEVELOPMENT MODE] Mock email dispatched:`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML Body Preview:\n${options.html.replace(/<[^>]*>/g, ' ').trim().slice(0, 150)}...`);
    console.log('==================================================\n');
    return;
  }

  // 1. Try Custom SMTP first (e.g. Gmail SMTP with App Passwords)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log(`Attempting to send email to ${options.email} via SMTP (${process.env.SMTP_HOST})...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully via SMTP. Message ID: ${info.messageId}`);
      return; // Success!
    } catch (error) {
      console.error('SMTP email failed (falling back to Brevo):', error.message || error);
    }
  }

  // 2. Try Brevo next (allows sending to any address, works on user's authorized local IP)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`Attempting to send email to ${options.email} via Brevo...`);
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'Smart Task Manager', email: 'asalhimsanda@gmail.com' }, // Default sender
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      });
      console.log(`Email sent successfully to ${options.email} via Brevo. Message ID: ${response.data.messageId}`);
      return; // Success!
    } catch (error) {
      console.error('Brevo API email failed (falling back to Resend):', error.response?.data?.message || error.message);
    }
  }

  // 2. Fall back to Resend (allows sending to owner's email onboarding@resend.dev)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`Attempting to send email to ${options.email} via Resend...`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const data = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: options.email,
        subject: options.subject,
        html: options.html,
      });

      console.log(`Email sent to ${options.email} with Resend. ID: ${data.id}`);
    } catch (error) {
      console.error('Resend API email failed:', error.message || error);
    }
  }
};

module.exports = sendEmail;
