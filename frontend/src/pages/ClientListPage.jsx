import React from 'react'
import { Alert, ListGroup, ListGroupItem, Spinner } from 'reactstrap';

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

export default ClientListPage