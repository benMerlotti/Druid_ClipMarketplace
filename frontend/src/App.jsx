import { useState } from 'react'
import './App.css' // You can keep or remove this line
import { useEffect } from 'react'

function App() {
  const [backendMessage, setBackendMessage] = useState("")
  const [videoData, setVideoData] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/message')
    .then(r => r.json())
    .then(data => setBackendMessage(data.message))
  }, [])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/video_info')
    .then(r => r.json())
    .then(data => setVideoData(data))
  }, [])


  return (
    <div>
      <h1>Fontend App</h1>
      <p>Message from backend: <strong>{backendMessage}</strong></p>

      <video src={videoData.video_url}></video>
    </div>
  )
}

export default App
