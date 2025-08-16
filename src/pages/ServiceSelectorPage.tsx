
import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ServiceSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceSelect = (service: string) => {
    // For now, we only have Pharmacie dashboard
    if (service === 'pharmacie') {
      navigate('/pharmacie/dashboard');
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <h1>Bienvenue à l'Hôpital de Juvénat</h1>
      <p className="mb-4">Veuillez sélectionner votre service :</p>
      <Row>
        <Col>
          <Button variant="primary" size="lg" onClick={() => handleServiceSelect('pharmacie')}>
            Pharmacie
          </Button>
        </Col>
        {/* Add more service buttons here */}
      </Row>
    </Container>
  );
};

export default ServiceSelectorPage;
