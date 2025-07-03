import React from 'react'
import { Alert, ListGroup, ListGroupItem, Spinner } from 'reactstrap';

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

export default ConventionListPage