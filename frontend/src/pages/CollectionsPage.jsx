// src/pages/CollectionsPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { Row, Col, Card, CardBody, CardTitle, Button, Alert } from 'reactstrap';

const CollectionsPage = () => {
  const { collections } = useCollections();

  const handlePurchaseCollection = (collection) => {
    const clipCount = collection.videos.length;
    const collectionPrice = clipCount * 10 * 0.5;
    alert(`Purchasing collection "${collection.name}" with ${clipCount} clips for $${collectionPrice.toFixed(2)}! (Functionality to be added)`);
  };

  return (
    <div>
      <h1>My Collections</h1>
      <hr />

      {collections.length === 0 ? (
        <Alert color="info">
          You haven't created any collections yet. Go to a client's video page and click the '+' button on a clip to start a new collection.
        </Alert>
      ) : (
        collections.map(collection => (
          <Card key={collection.name} className="mb-4 shadow-sm">
            <CardBody>
              <Row className="align-items-center">
                <Col md="8">
                  <CardTitle tag="h3">{collection.name}</CardTitle>
                  <p>{collection.videos.length} clip(s) in this collection.</p>
                </Col>
                <Col md="4" className="text-md-end">
                  <Button color="success" onClick={() => handlePurchaseCollection(collection)}>
                    Purchase Collection (${(collection.videos.length * 10 * 0.5).toFixed(2)})
                  </Button>
                </Col>
              </Row>
              <hr />
              <Row xs="2" md="3" lg="4" xl="5" className="g-3">
                {collection.videos.map(video => (
                  <Col key={video.id}>
                    <div className="text-center">
                      {video.video_url ? (
                        <video width="100%" muted preload="metadata" title={video.title}>
                          <source src={video.video_url} type="video/mp4" />
                        </video>
                      ) : (
                        <div style={{height: '100px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No Preview</div>
                      )}
                      <small className="text-muted d-block text-truncate px-1">{video.title}</small>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
};

export default CollectionsPage;