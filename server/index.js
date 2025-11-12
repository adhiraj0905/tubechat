// 1. Load environment variables (our API key)
require('dotenv').config();
console.log("My API Key:", process.env.GEMINI_API_KEY ? "Loaded Successfully" : "!!! NOT LOADED !!!");

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { YoutubeTranscript } = require('@danielxceron/youtube-transcript');

// 2. Import the Google Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// 3. Initialize Gemini
// We get the key from our .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- Helper Function ---
function getVideoId(url) {
  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    }
    return videoId;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

app.get('/', (req, res) => {
  res.send('Hello! This is the TubeChat backend server.');
});

// 4. Create a variable to store the transcript
// This is simple in-memory storage. It will only hold the *last* transcript.
let storedTranscript = '';

// 5. UPDATED Route: /api/get-video-info
// This route now only *gets* the transcript and saves it.
app.post('/api/get-video-info', async (req, res) => {
  const videoURL = req.body.url;
  const videoId = getVideoId(videoURL);
  
  if (!videoId) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcriptData.map(segment => segment.text).join(' ');

    // 6. Save the transcript to our variable
    storedTranscript = transcriptText;

    // 7. Send a simple success message, NOT the transcript
    res.json({
      message: 'Transcript fetched and ready for chat!'
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(400).json({
      message: 'Error fetching transcript. Does the video have captions?',
      error: error.message
    });
  }
});

// 8. NEW Route: /api/chat
// This route handles questions from the user
app.post('/api/chat', async (req, res) => {
  const userQuestion = req.body.question;

  if (!storedTranscript) {
    return res.status(400).json({ message: 'No transcript loaded. Please submit a video first.' });
  }

  if (!userQuestion) {
    return res.status(400).json({ message: 'No question provided.' });
  }

  try {
    // 9. Create the prompt for the AI
    const prompt = `
      You are a helpful assistant named TubeChat.
      Your job is to answer questions about a YouTube video, based on the transcript provided.
      try not to make up information. If the answer is not in the transcript, say so.
      
      Here is the video transcript:
      ---
      ${storedTranscript}
      ---
      
      Here is the user's question:
      ${userQuestion}
      
      Your answer:
    `;

    // 10. Send the prompt to Gemini and get the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiAnswer = await response.text();

    // 11. Send the AI's answer back to the frontend
    res.json({
      answer: aiAnswer
    });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ message: 'Error processing your question with the AI.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running successfully on http://localhost:${port}`);
});