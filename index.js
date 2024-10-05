require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`server started on port ${PORT}`))
  } catch (e) {
    console.error(e);
  }
}

start();