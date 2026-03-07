
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/merchants', require('./routes/merchantRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
  console.log(`MongoDB Memory Server connected at ${uri}`);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
