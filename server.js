const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log(err));

app.use('/api/menu', require('./routes/menu'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT || 10000, () => {
  console.log(`Server running on port ${process.env.PORT || 10000}`);
});