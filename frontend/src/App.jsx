// frontend/src/App.jsx

import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// --- Import Reactstrap Components ---
import {
  Container,
  Spinner,
  Alert,
  ListGroup,
  ListGroupItem,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';

import './App.css'; // You can still use this for custom styles

// --- Page Components (Now using Reactstrap) ---

const ClientListPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/clients')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => { setCompanies(data); setIsLoading(false); })
      .catch(() => { setError("Could not load clients."); setIsLoading(false); });
  }, []);

  if (isLoading) return <Spinner color="primary">Loading...</Spinner>;
  if (error) return <Alert color="danger">{error}</Alert>;

  return (
    <div>
      <h2>Select a Client</h2>
      <ListGroup>
        {companies.map(comp => (
          // The `tag={Link}` prop makes the ListGroupItem behave like a React Router Link
          <ListGroupItem key={comp.name} action tag={Link} to={`/client/${comp.name}`}>
            {comp.name}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};

const ConventionListPage = () => {
  const { companyName } = useParams();
  const [conventions, setConventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyName) return;
    setIsLoading(true);
    fetch(`http://127.0.0.1:5000/api/conventions?company=${companyName}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => { setConventions(data); setIsLoading(false); })
      .catch(() => { setError("Could not load conventions."); setIsLoading(false); });
  }, [companyName]);

  if (isLoading) return <Spinner>Loading...</Spinner>;
  if (error) return <Alert color="danger">{error}</Alert>;

  return (
    <div>
      <h2>Select a Convention</h2>
      <ListGroup>
        {conventions.map(conv => (
          <ListGroupItem key={conv.name} action tag={Link} to={`/client/${companyName}/convention/${conv.name}`}>
            {conv.name}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};

// Find this component in your App.jsx file and replace it

// In frontend/src/App.jsx, inside the VideoListPage component

// In your App.jsx, replace the ENTIRE VideoListPage component with this corrected version.

const VideoListPage = () => {
  const { companyName, conventionName } = useParams();
  const [videos, setVideos] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    if (!companyName || !conventionName) return;
    
    setIsLoading(true);
    const apiUrl = `http://127.0.0.1:5000/api/videos?company=${companyName}&convention=${conventionName}&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`;
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error || "Failed to fetch")});
        }
        return res.json();
      })
      .then(data => {
        setVideos(data.videos);
        setPaginationInfo(data.pagination);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load videos.");
        setIsLoading(false);
      });
  }, [companyName, conventionName, currentPage]);

  const handleNextPage = () => {
    if (paginationInfo && currentPage < paginationInfo.total_pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Placeholder for bulk purchase logic
  const handleBulkPurchase = (price) => {
    alert(`Purchasing all clips for $${price.toFixed(2)}! (Not really)`);
  };

  if (isLoading) return <Spinner>Loading Videos...</Spinner>;
  if (error) return <Alert color="danger">{error}</Alert>;

  // Calculate derived values here, after loading and error checks
  const numberOfVideos = paginationInfo ? paginationInfo.total_items : 0;
  const bulkPrice = 10 * numberOfVideos * 0.5;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem><Link to="/">Clients</Link></BreadcrumbItem>
        <BreadcrumbItem><Link to={`/client/${companyName}`}>{companyName}</Link></BreadcrumbItem>
        <BreadcrumbItem active>{conventionName}</BreadcrumbItem>
      </Breadcrumb>
      
      <h2>Video Clips</h2>

      {numberOfVideos > 0 && (
        <Card className="my-4 p-3 bg-light">
          <Row className="align-items-center">
            <Col md="6">
              <h3>Total Clips Available: {numberOfVideos}</h3>
              <p className="mb-0">Purchase all clips from this convention in one bundle.</p>
            </Col>
            <Col md="6" className="text-md-end mt-2 mt-md-0">
              <Button color="success" size="lg" onClick={() => handleBulkPurchase(bulkPrice)}>
                Buy Full Drive - ${bulkPrice.toFixed(2)}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {paginationInfo && paginationInfo.total_pages > 1 && (
        <div className="d-flex justify-content-between align-items-center my-3">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            ← Previous Page
          </Button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{paginationInfo.total_pages}</strong>
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === paginationInfo.total_pages}>
            Next Page →
          </Button>
        </div>
      )}

      {/* --- THIS IS THE CORRECTED VIDEO GRID --- */}
      <Row xs="1" md="2" lg="3" className="g-4">
        {videos.map(video => (
          <Col key={video.id}>
            <Card className="h-100 shadow-sm">
              {video.video_url && 
                <video controls muted preload="metadata" className="card-img-top">
                  <source src={video.video_url} type="video/mp4" />
                </video>
              }
              <CardBody className="d-flex flex-column">
                <CardTitle tag="h5">{video.title}</CardTitle>
                <CardText className="flex-grow-1">{video.description}</CardText>
                <Button color="primary" className="mt-auto">Purchase (${video.price ? video.price.toFixed(2) : "N/A"})</Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

       {/* Bottom Pagination Controls */}
       {paginationInfo && paginationInfo.total_pages > 1 && (
        <div className="d-flex justify-content-center my-3">
          <Button onClick={handlePrevPage} disabled={currentPage === 1} className="me-2">
            ← Previous
          </Button>
          <span>Page {currentPage} of {paginationInfo.total_pages}</span>
          <Button onClick={handleNextPage} disabled={currentPage === paginationInfo.total_pages} className="ms-2">
            Next →
          </Button>
        </div>
      )}

      {!isLoading && videos.length === 0 && <Alert color="info">No videos found for this convention.</Alert>}
    </div>
  );
};

// --- Main App Component ---
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