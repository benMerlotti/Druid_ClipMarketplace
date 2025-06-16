// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import './App.css'; // Make sure you have this file or remove the import

// For testing, this determines which set of videos we fetch.
const CURRENT_BOOTH_ID = "test_booth_s3"; // << Ensure this matches a booth_id in your Flask app

function App() {
  const [boothVideos, setBoothVideos] = useState([]); // Stores the array of video objects
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // No need for 'selectedVideo' state yet, we'll just log on click for now

  // Fetch video info FOR THE CURRENT BOOTH when the component mounts
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const apiUrl = `http://127.0.0.1:5000/api/videos_for_booth?booth_id=${CURRENT_BOOTH_ID}`;
    console.log("Fetching video list from:", apiUrl);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || `API Error: ${response.status} ${response.statusText}`);
          }).catch(() => {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Video list received:", data);
        if (Array.isArray(data)) {
          setBoothVideos(data);
        } else {
          throw new Error(data.error || "Invalid data format: Expected an array of videos.");
        }
        setIsLoading(false);
      })
      .catch(fetchError => {
        console.error("Failed to fetch video list:", fetchError);
        setError(fetchError.message);
        setIsLoading(false);
      });
  }, []); // Runs once on mount

  // Function to handle when a video item is clicked
  const handleVideoSelect = (video) => {
    console.log("Selected video:", video);
    // In a real app, you might set this to a 'selectedVideo' state,
    // or navigate to a new route like /videos/{video.id}
    alert(`You selected: ${video.title}\nCheck the console for full details.`);
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div>Loading video list for booth "{CURRENT_BOOTH_ID}"...</div>;
  }

  if (error) {
    return <div>Error fetching video list: {error}</div>;
  }

  if (boothVideos.length === 0) {
    return <div>No videos found for booth "{CURRENT_BOOTH_ID}".</div>;
  }

  return (
    <div className="App">
      <h1>LightFair 2025</h1>
      <p>Click on a video title to see its details (in the console for now).</p>
      <hr />
      {/* You can choose to render as a table or a simple list */}

      {/* Option 1: Simple List of Clickable Titles */}
      {/* <ul>
        {boothVideos.map(video => (
          <li key={video.id} onClick={() => handleVideoSelect(video)} style={{ cursor: 'pointer', margin: '5px 0', padding: '5px', border: '1px solid #eee' }}>
            {video.title || "Untitled Video"} - (${video.price ? video.price.toFixed(2) : "N/A"})
          </li>
        ))}
      </ul> */}

      {/*Option 2: Simple Table (Uncomment to use, comment out Option 1)*/}
      <table border="1" style={{ width: '100%', margin: '20px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {boothVideos.map(video => (
            <tr key={video.id} onClick={() => handleVideoSelect(video)} style={{ cursor: 'pointer' }}>
              <td>{video.title || "N/A"}</td>
              <td>{video.description || "N/A"}</td>
              <td>${video.price ? video.price.toFixed(2) : "N/A"}</td>
              <td>{video.purchased ? "Purchased" : "Available"}</td>
            </tr>
          ))}
        </tbody>
      </table>
     

      <hr />
      {/* <h3>Debug: Raw `boothVideos` State</h3>
      <pre>{JSON.stringify(boothVideos, null, 2)}</pre> */}
    </div>
  );
}

export default App;