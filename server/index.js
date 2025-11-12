const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { YoutubeTranscript } = require('@danielxceron/youtube-transcript');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- NEW HELPER FUNCTION ---
// This function will extract the video ID from any YouTube URL
function getVideoId(url) {
  let videoId = '';
  try {
    const urlObj = new URL(url);
    // Standard URL: youtube.com/watch?v=...
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    }
    // Short URL: youtu.be/...
    else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1); // Remove the leading '/'
    }
    return videoId;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null; // Return null if the URL is invalid
  }
}
// --------------------------

app.get('/', (req, res) => {
  res.send('Hello! This is the TubeChat backend server.');
});

app.post('/api/get-video-info', async (req, res) => {
  const videoURL = req.body.url;
  console.log('Received URL on backend:', videoURL);

  // 1. Get the Video ID using our new function
  const videoId = getVideoId(videoURL);
  
  if (!videoId) {
    // If we couldn't find an ID, send an error
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  console.log('Extracted Video ID:', videoId);

  try {
    // 2. Fetch transcript using the ID, not the full URL
    
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    const transcriptText = transcriptData.map(segment => segment.text).join(' ');

    res.json({
      message: 'Transcript fetched successfully!',
      transcript: transcriptText
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(400).json({
      message: 'Error fetching transcript. Does the video have captions?',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running successfully on http://localhost:${port}`);
});