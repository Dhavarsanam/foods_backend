const router = require('express').Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const otpStore = {};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    await transporter.sendMail({
      from: `"Namma Hotel" <${process.env.GMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `Login OTP - ${phone}`,
      html: `
        <h2>Namma Hotel Login OTP</h2>
        <p>Mobile Number: ${phone}</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes only.</p>
      `,
    });

    console.log(`OTP sent for ${phone}: ${otp}`);

    return res.json({
      success: true,
      message: 'OTP sent'
    });

  } catch (e) {
    console.error('================================');
    console.error('SEND OTP ERROR');
    console.error(e);
    console.error('================================');

    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP required'
      });
    }

    const stored = otpStore[phone];

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Request again.'
      });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Request again.'
      });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    delete otpStore[phone];

    const token = jwt.sign(
      { phone },
      process.env.JWT_SECRET || 'namma_hotel_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token
    });

  } catch (e) {
    console.error('verify-otp error:', e);

    return res.status(500).json({
      success: false,
      message: e.message
    });
  }
});

module.exports = router;