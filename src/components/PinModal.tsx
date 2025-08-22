import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface PinModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (pin: string) => void;
}

const PinModal: React.FC<PinModalProps> = ({ show, onHide, onConfirm }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const godModePin = localStorage.getItem('godModePin');
    if (pin === godModePin) {
      onConfirm(pin);
      onHide();
    } else {
      setError('PIN incorrect');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Entrer le PIN du GOD Mode</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group>
          <Form.Label>PIN</Form.Label>
          <Form.Control type="password" value={pin} onChange={e => setPin(e.target.value)} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Annuler</Button>
        <Button variant="primary" onClick={handleConfirm}>Confirmer</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PinModal;