require('dotenv').config();
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const statesRouter = require('./routes/states'); // Corrected path
const path = require('path');

// Connect to MongoDB
connectDB();


const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use('/states', statesRouter);

// 404 Catch-all
app.all('*', (req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('application/json')) {
    res.status(404).json({ error: "404 Not Found" });
  } else {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
