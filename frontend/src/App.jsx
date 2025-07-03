// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import your new Layout component
import Layout from './components/layout/Layout';

// Import your page components
import ClientListPage from './pages/ClientListPage';
import ConventionListPage from './pages/ConventionListPage';
import VideoListPage from './pages/VideoListPage';
import { useState } from 'react';
import CollectionsPage from './pages/CollectionsPage';

function App() {
  // --- NEW: STATE FOR MANAGING COLLECTIONS ---
  // The structure will be an array of collection objects.
  // Each collection will have a name and an array of video objects.
  // Example: [{ name: "My Awesome Collection", videos: [video1, video2] }]
  const [collections, setCollections] = useState([]);

  // --- We'll need functions to modify this state ---
  const addVideoToCollection = (collectionName, videoToAdd) => {
    setCollections(prevCollections => {
      const collectionExists = prevCollections.some(c => c.name === collectionName);
      
      if (collectionExists) {
        // Find the existing collection and add the video if it's not already there
        return prevCollections.map(c => {
          if (c.name === collectionName) {
            const videoExistsInCollection = c.videos.some(v => v.id === videoToAdd.id);
            if (!videoExistsInCollection) {
              return { ...c, videos: [...c.videos, videoToAdd] };
            }
          }
          return c;
        });
      } else {
        // Create a new collection with this video
        const newCollection = { name: collectionName, videos: [videoToAdd] };
        return [...prevCollections, newCollection];
      }
    });
  };

  const removeVideoFromCollection = (collectionName, videoId) => {
    // ... logic for this later ...
  };
  return (
    <Routes>
      {/* --- New Routing Structure --- */}
      {/* The Layout component is now the parent route */}
      <Route path="/" element={<Layout />}>
        {/* These are the "child" routes. They will be rendered inside the <Outlet> */}
        <Route index element={<ClientListPage />} />
        <Route path="client/:companyName" element={<ConventionListPage />} />
        <Route path="client/:companyName/convention/:conventionName" element={<VideoListPage />} />
        <Route path="collections" element={<CollectionsPage />} />

        {/* Optional: You can add a "Not Found" page for bad URLs */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;