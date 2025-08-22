import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { getDB } from '../db';
import PinModal from './PinModal';

interface AdjustStockModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  medicamentId: number | null;
  currentStock: number;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ show, onHide, onSuccess, medicamentId, currentStock }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const futureStock = currentStock + adjustment;

  const handleValidation = () => {
    if (!reason) {
      setError('La raison est obligatoire.');
      return;
    }
    setError('');
    setShowPinModal(true);
  };

  const handleConfirm = async () => {
    if (medicamentId) {
      const db = await getDB();
      await db.run(
        "INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)",
        [medicamentId, adjustment, reason]
      );
      onSuccess();
      onHide();
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajuster le Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Stock Actuel: {currentStock}</p>
          <Form.Group>
            <Form.Label>Ajustement (+/-)</Form.Label>
            <Form.Control type="number" value={adjustment} onChange={e => setAdjustment(Number(e.target.value))} />
          </Form.Group>
          <p>Stock Futur: {futureStock}</p>
          <Form.Group>
            <Form.Label>Raison</Form.Label>
            <Form.Control as="textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" onClick={handleValidation}>Valider</Button>
        </Modal.Footer>
      </Modal>

      <PinModal 
        show={showPinModal} 
        onHide={() => setShowPinModal(false)} 
        onConfirm={handleConfirm} 
      />
    </>
  );
};

export default AdjustStockModal;