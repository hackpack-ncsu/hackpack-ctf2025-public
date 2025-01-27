import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [joke, setJoke] = useState('');
  const [jokeId, setJokeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('jokes'); // 'jokes', 'favorites', 'admin', or 'login'
  const [flags, setFlags] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState(''); // State for feedback form
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackSection, setShowFeedbackSection] = useState(false); // State to toggle feedback section visibility
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch a new joke from the API
  const fetchJoke = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/joke`);
      setJokeId(response.data.id);
      if (response.data.type === 'twopart') {
        setJoke(`${response.data.setup} ${response.data.delivery}`);
      } else {
        setJoke(response.data.joke);
      }
    } catch (error) {
      setJoke('Oops! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!joke || !feedback.trim()) {
      setFeedbackMessage('Please provide feedback.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/feedback`, {
        joke_id: jokeId,
        feedback: feedback,
      });
      setFeedbackMessage(response.data.message || 'Feedback submitted successfully!');
      setFeedback('');
    } catch (error) {
      setFeedbackMessage('Failed to submit feedback. Please try again.');
    }
  };

  // Add the joke to favorites
  const addToFavorites = () => {
    if (joke && !favorites.includes(joke)) {
      setFavorites([...favorites, joke]);
    }
  };

  // Remove a joke from favorites
  const removeFromFavorites = (jokeToRemove) => {
    setFavorites(favorites.filter((fav) => fav !== jokeToRemove));
  };

  // Fetch flags for the admin
  const fetchFlags = async () => {
    try {
      const response = await axios.get(`${apiUrl}/admin/flags`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setFlags(response.data.flags);
    } catch (error) {
      alert('Failed to fetch flags. Ensure you are authorized.');
    }
  };

  // Login method to authenticate the admin
  const login = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    // Encode username:password to Base64
    const base64Credentials = btoa(`${username}:${password}`);

    try {
      await axios.get(`${apiUrl}/admin/flags`, {
        headers: {
          Authorization: `Bearer ${base64Credentials}`,
        },
      });

      // If successful, store token and show admin page
      localStorage.setItem('adminToken', base64Credentials); // Saving the credentials in localStorage
      setView('admin');
      setErrorMessage(''); // Clear any previous error message
    } catch (error) {
      // If login fails (403), show error
      if (error.response && error.response.status === 403) {
        setErrorMessage('Login failed. Invalid credentials.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  // Render Jokes Page
  const renderJokesPage = () => (
    <div>
      <h1>Bad Programming Joke App</h1>
      <button
        onClick={fetchJoke}
        disabled={isLoading}
        style={{
          backgroundColor: process.env.REACT_APP_THEME_COLOR,
          color: 'white',
          padding: '10px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        {isLoading ? 'Fetching...' : 'Get a Bad Programming Joke'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <p>{joke}</p>
        <button
          onClick={addToFavorites}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            margin: '5px',
          }}
        >
          Add to Favorites
        </button>
        <button
          onClick={() => setShowFeedbackSection(true)} // Show feedback section when clicked
          style={{
            backgroundColor: '#FF9900',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            marginTop: '10px',
          }}
        >
          Send Feedback
        </button>

      {/* Feedback Section - Visible only if showFeedbackSection is true */}
      {showFeedbackSection && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Leave your feedback about this joke"
            style={{
              width: '100%',
              height: '100px',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '10px',
            }}
          />
          <div>
            <button
              onClick={submitFeedback}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setShowFeedbackSection(false)} // Hide feedback section
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '10px 20px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
                marginLeft: '10px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );

  // Render Favorites Page
  const renderFavoritesPage = () => (
    <div>
      <h1>Your Favorite Jokes</h1>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {favorites.map((favorite, index) => (
          <li
            key={index}
            style={{ marginBottom: '10px', fontSize: '18px', color: '#555' }}
          >
            {favorite}
            <button
              onClick={() => removeFromFavorites(favorite)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '5px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '5px',
                marginLeft: '10px',
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Render Admin Page
  const renderAdminPage = () => (
    <div onload={fetch}>
      <h1>Admin</h1>
      <button onClick={fetchFlags} onload={fetchFlags} style={buttonStyle}>
        Fetch Flags
      </button>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {flags.map((flag, index) => (
          <li key={index} style={{ marginBottom: '10px', fontSize: '18px' }}>
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );

  // Render Login Page
  const renderLoginPage = () => (
    <div>
      <h1>Admin Login</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: '5px', padding: '8px', fontSize: '16px' }}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: '5px', padding: '8px', fontSize: '16px' }}
          />
        </label>
        <br />
        <button
          onClick={login}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            margin: '5px',
          }}
        >
          Login
        </button>
      </div>
    </div>
  );

  // Navigation buttons and page rendering
  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    margin: '5px',
  };

  return (
    <div className="App" style={{ fontFamily: 'Comic Sans MS', textAlign: 'center', padding: '20px' }}>
      <nav>
        <button
          onClick={() => setView('jokes')}
          style={{
            backgroundColor: view === 'jokes' ? '#4CAF50' : '#ccc',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            margin: '5px',
          }}
        >
          Jokes
        </button>
        <button
          onClick={() => setView('favorites')}
          style={{
            backgroundColor: view === 'favorites' ? '#4CAF50' : '#ccc',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            margin: '5px',
          }}
        >
          Favorites
        </button>
        {!localStorage.getItem('adminToken') && (
          <button
            onClick={() => setView('login')}
            style={{
              backgroundColor: view === 'login' ? '#4CAF50' : '#ccc',
              color: 'white',
              padding: '10px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              margin: '5px',
            }}
          >
            Login
          </button>
        )}
        {localStorage.getItem('adminToken') && (
          <button
            onClick={() => setView('admin')}
            style={{
              backgroundColor: view === 'admin' ? '#4CAF50' : '#ccc',
              color: 'white',
              padding: '10px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              margin: '5px',
            }}
          >
            Admin
          </button>
        )}
      </nav>

      {view === 'jokes' && renderJokesPage()}
      {view === 'favorites' && renderFavoritesPage()}
      {view === 'admin' && renderAdminPage()}
      {view === 'login' && renderLoginPage()}
    </div>
  );
}

export default App;
