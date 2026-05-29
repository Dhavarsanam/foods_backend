const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  tableLabel:  { type: String, required: true },
  items: [{
    name:  String,
    price: Number,
    qty:   Number,
    total: Number,
  }],
  grandTotal:    { type: Number, required: true },
  customerCount: { type: Number, default: 0 },
  isSplitBill:   { type: Boolean, default: false },
  personOrders: [{
    personNo: Number,
    items: [{ name: String, price: Number, qty: Number, total: Number }],
    subtotal: Number,
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);