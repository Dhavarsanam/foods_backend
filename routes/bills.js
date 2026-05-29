const router = require('express').Router();
const Bill = require('../models/Bill');

router.post('/', async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const bills = await Bill.find({ createdAt: { $gte: start } });
    res.json(bills);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const bills = await Bill.find({ createdAt: { $gte: start } });
    const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    res.json({ totalBills: bills.length, totalRevenue: total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;