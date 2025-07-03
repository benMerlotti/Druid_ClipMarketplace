// src/pages/VideoListPage.jsx

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import {
  Spinner, Alert, Card, CardBody, CardTitle, CardText, Button, Row, Col, Breadcrumb, BreadcrumbItem,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, ListGroup, ListGroupItem
} from 'reactstrap';

const VideoListPage = () => {
  const { companyName, conventionName } = useParams();
  const { collections, addVideoToCollection } = useCollections();

  const [videos, setVideos] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoToAdd, setVideoToAdd] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (!companyName || !conventionName) return;
    setIsLoading(true);
    const apiUrl = `http://127.0.0.1:5000/api/videos?company=${companyName}&convention=${conventionName}&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`;
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error || "Failed to fetch videos") });
        return res.json();
      })
      .then(data => {
        setVideos(data.videos);
        setPaginationInfo(data.pagination);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [companyName, conventionName, currentPage]);

  const handleNextPage = () => {
    if (paginationInfo && currentPage < paginationInfo.total_pages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const openAddToCollectionModal = (video) => {
    setVideoToAdd(video);
    if (collections.length > 0) setSelectedCollection(collections[0].name);
    setNewCollectionName('');
    setIsModalOpen(true);
  };
  const closeAddToCollectionModal = () => {
    setIsModalOpen(false);
    setVideoToAdd(null);
  };

  const handleAddToCollectionSubmit = (e) => {
    e.preventDefault();
    const collectionName = newCollectionName.trim() || selectedCollection;
    if (collectionName && videoToAdd) addVideoToCollection(collectionName, videoToAdd);
    closeAddToCollectionModal();
  };

  const totalClips = paginationInfo ? paginationInfo.total_items : 0;
  const bulkPrice = 10 * totalClips * 0.5;

  if (isLoading) return <div className="text-center p-5"><Spinner color="primary">Loading Videos...</Spinner></div>;
  if (error) return <Alert color="danger">Error: {error}</Alert>;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem><Link to="/">Clients</Link></BreadcrumbItem>
        <BreadcrumbItem><Link to={`/client/${companyName}`}>{companyName}</Link></BreadcrumbItem>
        <BreadcrumbItem active>{conventionName}</BreadcrumbItem>
      </Breadcrumb>
      
      <Row>
        <Col md="9">
          <h2>Video Clips</h2>
          {totalClips > 0 && (
            <Card className="my-4 p-3 bg-light">
              <Row className="align-items-center">
                <Col md="6">
                  <h3>Total Clips Available: {totalClips}</h3>
                  <p className="mb-0">Purchase all clips from this convention in one bundle.</p>
                </Col>
                <Col md="6" className="text-md-end mt-2 mt-md-0">
                  <Button color="success" size="lg">Buy Full Drive - ${bulkPrice.toFixed(2)}</Button>
                </Col>
              </Row>
            </Card>
          )}

          {paginationInfo && paginationInfo.total_pages > 1 && (
            <div className="d-flex justify-content-between align-items-center my-3">
              <Button onClick={handlePrevPage} disabled={currentPage === 1}>← Previous Page</Button>
              <span>Page <strong>{currentPage}</strong> of <strong>{paginationInfo.total_pages}</strong></span>
              <Button onClick={handleNextPage} disabled={currentPage === paginationInfo.total_pages}>Next Page →</Button>
            </div>
          )}

          <Row xs="1" md="2" lg="3" className="g-4">
            {videos.map(video => (
              <Col key={video.id}>
                <Card className="h-100 shadow-sm">
                  {video.video_url && (
                    <video controls muted preload="metadata" className="card-img-top">
                      <source src={video.video_url} type="video/mp4" />
                    </video>
                  )}
                  <CardBody className="d-flex flex-column">
                    <CardTitle tag="h5">{video.title}</CardTitle>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                        <Button color="primary" size="sm">Purchase (${video.price ? video.price.toFixed(2) : "N/A"})</Button>
                        <Button color="secondary" outline size="sm" onClick={() => openAddToCollectionModal(video)} title="Add to Collection">
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                        </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col md="3">
          <div style={{ position: 'sticky', top: '80px' }}>
            <h4>My Collections</h4>
            <hr />
            {collections.length === 0 ? (
              <p className="text-muted small">Click the '+' on a video to start a new collection.</p>
            ) : (
              <ListGroup flush>
                {collections.map(collection => (
                  <ListGroupItem key={collection.name} className="px-0 d-flex justify-content-between align-items-center">
                    <span>{collection.name}</span>
                    <span className="badge bg-primary rounded-pill">{collection.videos.length}</span>
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
            {collections.length > 0 &&
              <Button tag={Link} to="/collections" color="success" block className="mt-3">
                View & Purchase Collections
              </Button>
            }
          </div>
        </Col>
      </Row>

      <Modal isOpen={isModalOpen} toggle={closeAddToCollectionModal}>
        <ModalHeader toggle={closeAddToCollectionModal}>Add "{videoToAdd?.title}" to a Collection</ModalHeader>
        <Form onSubmit={handleAddToCollectionSubmit}>
          <ModalBody>
            {collections.length > 0 && (
              <FormGroup>
                <Label for="collectionSelect">Add to Existing Collection</Label>
                <Input id="collectionSelect" name="select" type="select" value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)} disabled={!!newCollectionName}>
                  {collections.map(c => <option key={c.name}>{c.name}</option>)}
                </Input>
              </FormGroup>
            )}
            <FormGroup>
              <Label for="newCollectionInput">{collections.length > 0 ? 'Or Create a New Collection' : 'Create a New Collection'}</Label>
              <Input id="newCollectionInput" name="newCollection" placeholder="e.g., Keynote Highlights" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">Add to Collection</Button>{' '}
            <Button color="secondary" onClick={closeAddToCollectionModal}>Cancel</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoListPage;