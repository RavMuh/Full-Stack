const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dotenv = require('dotenv').config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

const db_url = process.env.DB_URL;
const port = process.env.PORT;

app.use('/api/tasks', require('./routes/task.route'));

const connectDB = () => {
  mongoose.connect(db_url).then(() => console.log('Connected to MongoDB'));

  app.listen(port, () =>
    console.log(`Server is running on port http://localhost:${port}`)
  );
};

connectDB();