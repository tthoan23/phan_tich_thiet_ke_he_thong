const express = require('express');
const cors = require('cors');
const path = require('path');

const doiSoatHoanCocRoutes = require('./routes/doiSoatHoanCocRoutes');

const app = express();
const PORT = 3099;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/q4', doiSoatHoanCocRoutes);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Q4.html'));
});

app.get('/health', (_, res) => {
  res.json({ success: true, message: 'Q4 OK' });
});

app.listen(PORT, () => {
  console.log(`[Q4] Server on ${PORT}`);
});
