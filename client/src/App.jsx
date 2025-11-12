import React, { useState } from 'react';

function App() {
  // --- STATE VARIABLES ---
  
  // For the video URL input
  const [videoUrl, setVideoUrl] = useState('');
  
  // For the user's chat question input
  const [question, setQuestion] = useState('');
  
  // To store the entire chat history [ { user: 'me', text: '...' }, { user: 'ai', text: '...' } ]
  const [messages, setMessages] = useState([]);
  
  // To know if we should show the chat interface
  const [isChatReady, setIsChatReady] = useState(false);
  
  // To show a loading spinner
  const [isLoading, setIsLoading] = useState(false);
  
  // To show any errors
  const [error, setError] = useState('');

  // --- FUNCTIONS ---

  /**
   * Handles submitting the YouTube URL.
   * It calls the backend to fetch and store the transcript.
   */
  const handleUrlSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setMessages([]); // Clear old chat
    setIsChatReady(false);

    try {
      const response = await fetch('http://localhost:5000/api/get-video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error fetching transcript.');
      }

      const data = await response.json();
      console.log('Backend response:', data.message);
      setIsChatReady(true); // Success! Show the chat box.

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles submitting a question to the chat.
   * It calls the /api/chat endpoint with the user's question.
   */
  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return; // Don't send empty questions

    const newUserMessage = { user: 'me', text: question };
    setMessages(prev => [...prev, newUserMessage]); // Add user's question to chat
    setIsLoading(true);
    setError('');
    setQuestion(''); // Clear the chat input

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error from AI.');
      }

      const data = await response.json();
      const newAiMessage = { user: 'ai', text: data.answer };
      setMessages(prev => [...prev, newAiMessage]); // Add AI's answer to chat

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX (WHAT IS RENDERED) ---
  return (
    <div className="main-container">
      
      <h1 className="title">TubeChat</h1>
      <p className="subtitle">Chat with any YouTube video.</p>

      {/* --- URL Input Form --- */}
      <form className="input-form" onSubmit={handleUrlSubmit}>
        <input
          type="text"
          className="url-input"
          placeholder="Paste a YouTube link here..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Go'}
        </button>
      </form>

      {/* --- Error Display --- */}
      {error && <p className="error-message">{error}</p>}

      {/* --- Chat Interface (only shows if chat is ready) --- */}
      {isChatReady && (
        <div className="chat-container">
          
          {/* --- Chat Messages --- */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.user === 'ai' ? 'ai-message' : 'user-message'}`}>
                {msg.text}
              </div>
            ))}
            {/* Show a 'typing' indicator when AI is thinking */}
            {isLoading && messages.length > 0 && (
              <div className="message ai-message">...</div>
            )}
          </div>

          {/* --- Chat Input Form --- */}
          <form className="chat-form" onSubmit={handleChatSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask a question about the video..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button type="submit" className="submit-button" disabled={isLoading}>
              Send
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

export default App;