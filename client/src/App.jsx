import React from 'react';

function App() {
  return (
    <div>
      <div className="main-container">
        <hi className="title">TubeChat</hi>
        <p className="subtitle">Chat with any youtube video.</p>
        <form className="input-form">
          <input
            type="text"
            className="url-input"
            placeholder="Enter YouTube video URL"
            />
          <button type="submit" className="submit-button">Start Chatting</button>
        </form>
      </div>
    </div>
  );
}

export default App;