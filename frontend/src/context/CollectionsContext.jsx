// src/context/CollectionsContext.jsx

import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const CollectionsContext = createContext();

// 2. Create a custom hook to easily use this context in other components
export const useCollections = () => {
  return useContext(CollectionsContext);
};

// 3. Create the Provider component that will wrap your app
export const CollectionsProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);

  const addVideoToCollection = (collectionName, videoToAdd) => {
    // A little logging to see what's happening
    console.log(`Adding video "${videoToAdd.title}" to collection "${collectionName}"`);

    setCollections(prevCollections => {
      const collectionExists = prevCollections.some(c => c.name === collectionName);
      
      if (collectionExists) {
        // If the collection already exists, update it
        return prevCollections.map(c => {
          if (c.name === collectionName) {
            // Check if video is already in this collection to avoid duplicates
            const videoExistsInCollection = c.videos.some(v => v.id === videoToAdd.id);
            if (!videoExistsInCollection) {
              // Add the new video to the existing array of videos
              return { ...c, videos: [...c.videos, videoToAdd] };
            }
          }
          // Otherwise, return the collection unchanged
          return c;
        });
      } else {
        // If the collection does not exist, create a new one
        const newCollection = { name: collectionName, videos: [videoToAdd] };
        // Return the old collections plus the new one
        return [...prevCollections, newCollection];
      }
    });
    alert(`Video "${videoToAdd.title}" added to collection "${collectionName}"!`);
  };

  // The 'value' object contains everything we want to share with child components
  const value = {
    collections,
    addVideoToCollection,
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};