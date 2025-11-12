const express = require('express');
const app = express();
const port = 5000;
app.get('/', (req, res) => {
  res.send('Hello World! This is the tubechat backend server.');
});

app.listen(port, () => {
  console.log(`Server is running successfully on http://localhost:${port}`);
});