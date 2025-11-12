// Import 'useState' from React
import React, { useState } from 'react';

function App() {
  // 1. Create a "state" variable to hold the URL
  // 'url' is the variable that holds the text
  // 'setUrl' is the function we use to update it
  const [url, setUrl] = useState('');

  // 2. Create a function to handle form submission
  const handleSubmit = async (event) => {
    // Prevent the form from reloading the page
    event.preventDefault(); 

    console.log('Form submitted with URL:', url);

    // 3. Send the data to the backend
    try {
      const response = await fetch('http://localhost:5000/api/get-video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Tell the server we're sending JSON
        },
        body: JSON.stringify({ url: url }), // Send the URL in a JSON object
      });

      const data = await response.json(); // Get the response from the server
      console.log('Server responded with:', data);

      // You could show a success message to the user here

    } catch (error) {
      console.error('Error sending URL to backend:', error);
    }
  };

  return (
    <div className="main-container">
      <h1 className="title">TubeChat</h1>
      <p className="subtitle">Chat with any YouTube video.</p>

      {/* 4. Connect the form and input to our React state */}
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="url-input"
          placeholder="Paste a YouTube link here..."
          value={url} // The input's value is controlled by our 'url' state
          onChange={(e) => setUrl(e.target.value)} // Update the state on every keystroke
        />
        <button type="submit" className="submit-button">
          Go
        </button>
      </form>
    </div>
  );
}

export default App;