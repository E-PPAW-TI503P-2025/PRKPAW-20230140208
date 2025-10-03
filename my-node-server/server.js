const express = require('express');

const cors = require('cors');   // <--- tambahkan ini

const app = express();
const port = 3005;

// aktifkan cors untuk semua request
app.use(cors());

// route utama
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js Server!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
