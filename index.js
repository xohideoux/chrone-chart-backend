require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const models = require('./models/');
const router = require('./routes');
const handleError = require('./middleware/handle-error');

const PORT = process.env.PORT;
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests
app.use('/api', router); // Mount the router on /api path
app.use(handleError); // Use custom error handling middleware

const start = async () => {
  try {
    await sequelize.authenticate();
    // Sync all models with the database (create tables if they don't exist)
    await sequelize.sync();

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (err) {
    console.error(err);
  }
}

start();