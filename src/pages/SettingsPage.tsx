import React, { useState } from 'react';
import { Button, Form, Card, ListGroup, Row, Col } from 'react-bootstrap';
import { useTheme } from '../hooks/useTheme';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [godModePin, setGodModePin] = useState(localStorage.getItem('godModePin') || '');

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGodModePin(e.target.value);
  };

  const handleSavePin = () => {
    localStorage.setItem('godModePin', godModePin);
    alert('PIN du GOD Mode enregistré !');
  };

  return (
    <div>
      <h1>Paramètres</h1>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Général</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  Mode Sombre
                  <Form.Check 
                    type="switch"
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  <Form.Group>
                    <Form.Label>PIN du GOD Mode</Form.Label>
                    <Form.Control type="password" value={godModePin} onChange={handlePinChange} />
                    <Button variant="primary" size="sm" className="mt-2" onClick={handleSavePin}>Enregistrer</Button>
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>À Propos</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>Version: 1.0.0</ListGroup.Item>
                <ListGroup.Item>Développeur: Louis Louvens</ListGroup.Item>
                <ListGroup.Item>Contact: <a href="mailto:louvenslouisl@gmail.com">louvenslouisl@gmail.com</a></ListGroup.Item>
                <ListGroup.Item>
                  <a href="mailto:louvenslouisl@gmail.com?subject=Bug Report" className="btn btn-danger">Signaler un bug</a>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Gestion des Employés</Card.Title>
              {/* Employee management UI will go here */}
              <p>Bientôt disponible...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;