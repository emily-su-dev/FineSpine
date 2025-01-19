const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slouchLogDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SlouchLog = mongoose.model('SlouchLog', new mongoose.Schema({
  timestamp: String,
}));

// Empty the collection
SlouchLog.deleteMany({})
  .then(() => {
    console.log('Collection cleared.');
    mongoose.connection.close(); // Close the connection
  })
  .catch((err) => {
    console.error('Error clearing collection:', err);
  });
