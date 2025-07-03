// frontend/src/App.jsx

import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// --- Import Reactstrap Components ---
import {
  Container
} from 'reactstrap';

import './App.css'; // You can still use this for custom styles'
import ClientListPage from './pages/ClientListPage';
import ConventionListPage from './pages/ConventionListPage';
import VideoListPage from './pages/VideoListPage';

function App() {
  return (
    <div className="App">
      <header className="bg-dark text-white p-3 mb-4">
        {/* Use Link component for home navigation */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Druid Video Portal</h1>
        </Link>
      </header>
      <Container> {/* Container component centers and pads content */}
        <main>
          {/* We'll build a custom breadcrumb component next */}
          <Routes>
            <Route path="/" element={<ClientListPage />} />
            <Route path="/client/:companyName" element={<ConventionListPage />} />
            <Route path="/client/:companyName/convention/:conventionName" element={<VideoListPage />} />
          </Routes>
        </main>
      </Container>
    </div>
  );
}

export default App;