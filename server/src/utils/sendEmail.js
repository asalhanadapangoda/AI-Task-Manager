const { Resend } = require('resend');

const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev', // Resend requires a verified domain, or onboarding@resend.dev for testing to yourself
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent to ${options.email} with Resend. ID: ${data.id}`);
  } catch (error) {
    console.error('Error sending email with Resend:', error.message || error);
  }
};

module.exports = sendEmail;
