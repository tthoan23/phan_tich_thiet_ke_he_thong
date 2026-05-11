const express = require('express');
const cors = require('cors');
const path = require('path');

const thanhVienRoutes = require('./routes/thanhVienRoutes');

const app = express();
const PORT = 3099;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', thanhVienRoutes);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Q3.html'));
});

app.get('/health', (_, res) => {
  res.json({ success: true, message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
