import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AddMedicamentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddMedicamentModal: React.FC<AddMedicamentModalProps> = ({ show, onHide, onSuccess }) => {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState(0);
  const [type, setType] = useState('');
  const [presentation, setPresentation] = useState('');
  const [initialStock, setInitialStock] = useState(0);
  const [lot, setLot] = useState('');
  const [expirationDate, setExpirationDate] = useState('');


  const resetState = () => {
    setNom('');
    setPrix(0);
    setType('');
    setPresentation('');
    setInitialStock(0);
    setLot('');
    setExpirationDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    const firestoreDocId = uuidv4();
    await db.run(
      "INSERT INTO liste_medicaments (nom, prix, type, presentation, lot, expiration_date, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)",
      [nom, prix, type, presentation, lot, expirationDate, 'pending_create', firestoreDocId]
    );
    if (initialStock > 0) {
        const medicamentResult = await db.exec("SELECT last_insert_rowid()");
        const medicamentId = medicamentResult[0].values[0][0] as number;
        const reason = "Stock initial";
        await db.run(
            "INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)",
            [medicamentId, initialStock, reason]
        );
    }
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} onExited={resetState}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un médicament</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du médicament</Form.Label>
            <Form.Control type="text" value={nom} onChange={e => setNom(e.target.value)} required />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Prix</Form.Label>
                <Form.Control type="number" value={prix} onChange={e => setPrix(Number(e.target.value))} required />
              </Form.Group>
            </Col>
            <Col>
                <Form.Group className="mb-3">
                    <Form.Label>Stock Initial</Form.Label>
                    <Form.Control type="number" value={initialStock} onChange={e => setInitialStock(Number(e.target.value))} />
                </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={e => setType(e.target.value)}>
              <option>Comprimé</option>
              <option>Goutte</option>
              <option>Matériel médical</option>
              <option>Sirop</option>
              <option>Soluté</option>
              <option>Solution injectable</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Présentation</Form.Label>
            <Form.Control type="text" value={presentation} onChange={e => setPresentation(e.target.value)} />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Lot</Form.Label>
                <Form.Control type="text" value={lot} onChange={e => setLot(e.target.value)} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Date d'expiration</Form.Label>
                <Form.Control type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit">Ajouter</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMedicamentModal;