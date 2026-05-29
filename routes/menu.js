const router = require('express').Router();
const MenuItem = require('../models/MenuItem');

router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;