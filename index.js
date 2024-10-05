require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const models = require('./models/');
const router = require('./routes');
const handleError = require('./middleware/handle-error');

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(handleError);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (err) {
    console.error(err);
  }
}

start();