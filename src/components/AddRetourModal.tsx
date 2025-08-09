import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AddRetourModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddRetourModal: React.FC<AddRetourModalProps> = ({ show, onHide, onSuccess }) => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<number | undefined>();
  const [quantite, setQuantite] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();
      const medicamentsResult = db.exec("SELECT id, nom FROM liste_medicaments");
      if (medicamentsResult.length > 0) {
        setMedicaments(medicamentsResult[0].values);
      }
    };
    if (show) {
      fetchData();
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0) {
      const db = await getDB();
      const firestoreDocId = uuidv4();
      await db.run("INSERT INTO retour (article_id, quantite, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)", [selectedMedicament, quantite, 'pending_create', firestoreDocId]);
      onSuccess();
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un retour</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Médicament</Form.Label>
            <Form.Select value={selectedMedicament} onChange={e => setSelectedMedicament(Number(e.target.value))}>
              <option>Sélectionner un médicament</option>
              {medicaments.map((med, index) => (
                <option key={index} value={med[0]}>{med[1]}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantité</Form.Label>
            <Form.Control type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} required />
          </Form.Group>
          <Button variant="primary" type="submit">
            Ajouter
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddRetourModal;
