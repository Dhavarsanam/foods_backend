const router = require('express').Router();
const jwt = require('jsonwebtoken');

const otpStore = {};

// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    // OTP Render Logs-la mattum varum
    console.log('================================');
    console.log(`PHONE : ${phone}`);
    console.log(`OTP   : ${otp}`);
    console.log('================================');

    return res.json({
      success: true,
      message: 'OTP generated successfully',
    });

  } catch (e) {
    console.error('SEND OTP ERROR:', e);

    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

// ================= VERIFY OTP =================
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP required',
      });
    }

    const stored = otpStore[phone];

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Request again.',
      });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Request again.',
      });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
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
      token,
    });

  } catch (e) {
    console.error('VERIFY OTP ERROR:', e);

    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

module.exports = router;