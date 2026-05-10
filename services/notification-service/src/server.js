const express = require('express');
const nodemailer = require('nodemailer');
const winston = require('winston');

const app = express();
app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Email transporter (logs to console in dev mode)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

app.get('/api/notifications/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

// Send notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { type, to, subject, data } = req.body;
    
    logger.info('Sending notification:', { type, to, subject });
    
    // In development, just log instead of sending
    if (process.env.NODE_ENV === 'development') {
      logger.info('Dev mode: Email would be sent', { to, subject, data });
      return res.json({ message: 'Notification logged (dev mode)', type, status: 'sent' });
    }
    
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Store'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: `<h1>${type}</h1><pre>${JSON.stringify(data, null, 2)}</pre>`
    });
    
    res.json({ message: 'Notification sent', type, status: 'sent' });
  } catch (error) {
    logger.error('Failed to send notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
