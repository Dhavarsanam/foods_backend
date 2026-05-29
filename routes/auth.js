const router = require('express').Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: '🔐 Namma Hotel - New Login Request',
      html: `
        <h2>New Login Request</h2>
        <p><b>Phone:</b> ${phone}</p>
        <h1 style="color:green;">${otp}</h1>
        <p>Valid for 5 minutes only</p>
      `,
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const stored = otpStore[phone];

    if (!stored) {
      return res.status(400).json({ error: 'OTP not found. Request again.' });
    }
    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ error: 'OTP expired. Request again.' });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    delete otpStore[phone];
    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;