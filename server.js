const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slouchLogDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Schema and Model
const logSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
});

const SlouchLog = mongoose.model('SlouchLog', logSchema);

// Route to Save Log
app.post('/log', async (req, res) => {
  const { timestamp } = req.body;

  try {
    const newLog = new SlouchLog({ timestamp });
    await newLog.save();
    res.status(201).send('Log saved successfully');
  } catch (err) {
    res.status(500).send('Error saving log:', err);
  }
});

// Route to Get Logs
app.get('/logs', async (req, res) => {
  try {
    const logs = await SlouchLog.find();
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).send('Error retrieving logs:', err);
  }
});

app.get('/logs/hourly', async (req, res) => {
  try {
    const logs = await SlouchLog.find();

    // Initialize an array for 24 hours, all set to 0
    const hourlyData = Array(24).fill(0);

    // Get the current time in EST
    const now = new Date();
    const currentHour = now.getHours();

    logs.forEach((log) => {
      const logTime = new Date(log.timestamp);

      // Calculate the difference in hours
      const hourDifference = (currentHour - logTime.getHours() + 24) % 24;

      // Only include logs within the past 24 hours
      if (hourDifference < 24) {
        hourlyData[23 - hourDifference]++; // Fill the corresponding hour
      }
    });

    res.status(200).json(hourlyData);
  } catch (err) {
    res.status(500).send('Error retrieving logs:', err);
  }
});


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
