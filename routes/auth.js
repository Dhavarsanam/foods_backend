const router = require('express').Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const otpStore = {};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
       pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Namma Hotel" <${process.env.GMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `Login OTP - ${phone}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;
                    border:1px solid #eee;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#E87722,#FF4500);
                      padding:20px;text-align:center;">
            <h2 style="color:white;margin:0;">NAMMA HOTEL</h2>
            <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:13px;">
              Login OTP Request
            </p>
          </div>
          <div style="padding:28px;">
            <p style="color:#555;font-size:14px;">
              Mobile: <strong>+91 ${phone}</strong>
            </p>
            <div style="background:#FFF3E8;border:2px dashed #E87722;
                        border-radius:10px;padding:18px;text-align:center;margin:20px 0;">
              <div style="font-size:13px;color:#999;margin-bottom:8px;">Your OTP</div>
              <span style="font-size:36px;font-weight:900;letter-spacing:10px;
                           color:#E87722;">${otp}</span>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;">
              ⏱ Valid for 5 minutes only
            </p>
          </div>
        </div>
      `,
    });

    console.log(`OTP sent for ${phone}: ${otp}`);
    res.json({ success: true, message: 'OTP sent' });

  } catch (e) {
      console.error('================================');
      console.error('SEND OTP ERROR');
      console.error(e);
      console.error('================================');

      res.status(500).json({
        success: false,
        message: e.message,
      });
    }

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP required' });
    }

    const stored = otpStore[phone];

    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found. Request again.' });
    }
    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ success: false, message: 'OTP expired. Request again.' });
    }
    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    delete otpStore[phone];

    const token = jwt.sign(
      { phone },
      process.env.JWT_SECRET || 'namma_hotel_secret',
      { expiresIn: '7d' }
    );

    res.json({ success: true, token });

  } catch (e) {
    console.error('verify-otp error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;