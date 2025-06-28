// backend/utils/notificationService.js

const nodemailer = require('nodemailer');

let transporterPromise = null;

// Initialize transporter: use Ethereal in dev, real SMTP in prod
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      // Real SMTP (e.g. Gmail)
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: false, // TLS handled below
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  })();

  return transporterPromise;
}

/**
 * Send an email.
 * @param {{ to: string, subject: string, text?: string, html?: string }} opts 
 */
async function sendEmail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER || '"No Reply" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });

  // In dev / Ethereal, log the preview URL
  const url = nodemailer.getTestMessageUrl(info);
  if (url) console.log('📧 Preview email at:', url);

  return info;
}

module.exports = { sendEmail };
