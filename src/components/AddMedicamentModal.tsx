import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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
  const [type, setType] = useState('Comprimé');
  const [presentation, setPresentation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    const firestoreDocId = uuidv4();
    await db.run("INSERT INTO liste_medicaments (nom, prix, type, presentation, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [nom, prix, type, presentation, 'pending_create', firestoreDocId]);
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un médicament</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" value={nom} onChange={e => setNom(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prix</Form.Label>
            <Form.Control type="number" value={prix} onChange={e => setPrix(Number(e.target.value))} required />
          </Form.Group>
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
          <Button variant="primary" type="submit">
            Ajouter
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMedicamentModal;
