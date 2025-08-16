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
  const [initialStock, setInitialStock] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    
    await db.transaction(async (tx) => {
      const medicamentFirestoreDocId = uuidv4();
      tx.run("INSERT INTO liste_medicaments (nom, prix, type, presentation, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [nom, prix, type, presentation, 'pending_create', medicamentFirestoreDocId]);
      
      const result = tx.exec("SELECT last_insert_rowid()");
      const newMedicamentId = result[0].values[0][0] as number;

      if (initialStock > 0) {
        const adjustmentFirestoreDocId = uuidv4();
        tx.run("INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [newMedicamentId, initialStock, 'Stock initial', 'pending_create', adjustmentFirestoreDocId]);
      }
    });

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
            <Form.Label>Stock Initial</Form.Label>
            <Form.Control type="number" value={initialStock} onChange={e => setInitialStock(Number(e.target.value))} />
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
