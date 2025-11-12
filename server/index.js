const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World! This is the tubechat backend server.');
});
app.post('/api/get-video-info', (req, res) => {
  const videoUrl  = req.body.url;
  console.log('Recieved URL on backend:', videoUrl);
  res.json({
    message: 'URL recieves succesfully',
    url: videoUrl
  })
});


app.listen(port, () => {
  console.log(`Server is running successfully on http://localhost:${port}`);
});