
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';

const HomePage = () => {
  return (
    <Container>
      <h1 className="my-4">Services de l'Hôpital Juvénat</h1>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Pharmacie</Card.Title>
              <Card.Text>
                Gérez les médicaments, les stocks, les patients et les ventes.
              </Card.Text>
              <Link to="/pharmacie/dashboard" className="btn btn-primary">
                Aller à la Pharmacie
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Laboratoire</Card.Title>
              <Card.Text>
                (Service bientôt disponible)
              </Card.Text>
              <button className="btn btn-secondary" disabled>
                Bientôt disponible
              </button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Décompte</Card.Title>
              <Card.Text>
                (Service bientôt disponible)
              </Card.Text>
              <button className="btn btn-secondary" disabled>
                Bientôt disponible
              </button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
