import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AddStockAdjustmentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddStockAdjustmentModal: React.FC<AddStockAdjustmentModalProps> = ({ show, onHide, onSuccess }) => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<number | undefined>();
  const [medicamentSearchTerm, setMedicamentSearchTerm] = useState('');
  const [showMedicamentResults, setShowMedicamentResults] = useState(false);
  const [quantiteAjustee, setQuantiteAjustee] = useState<number>(0);
  const [raison, setRaison] = useState('');

  const resetState = () => {
    setSelectedMedicament(undefined);
    setMedicamentSearchTerm('');
    setShowMedicamentResults(false);
    setQuantiteAjustee(0);
    setRaison('');
  };

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

  const handleMedicamentSelect = (medicament: any) => {
    setSelectedMedicament(medicament[0]);
    setMedicamentSearchTerm(medicament[1]);
    setShowMedicamentResults(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantiteAjustee !== 0) {
      const db = await getDB();
      const firestoreDocId = uuidv4();
      await db.run("INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [selectedMedicament, quantiteAjustee, raison, 'pending_create', firestoreDocId]);
      onSuccess();
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} onExited={resetState}>
      <Modal.Header closeButton>
        <Modal.Title>Nouvel Ajustement de Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Médicament</Form.Label>
            <Form.Control
              type="text"
              placeholder="Rechercher un médicament..."
              value={medicamentSearchTerm}
              onChange={e => { setMedicamentSearchTerm(e.target.value); setShowMedicamentResults(true); }}
            />
            {showMedicamentResults && medicamentSearchTerm && (
              <ListGroup>
                {medicaments
                  .filter(m => m[1].toLowerCase().includes(medicamentSearchTerm.toLowerCase()))
                  .map((m, i) => (
                    <ListGroup.Item key={i} onClick={() => handleMedicamentSelect(m)}>
                      {m[1]}
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantité Ajustée (Positive pour ajout, Négative pour retrait)</Form.Label>
            <Form.Control type="number" value={quantiteAjustee} onChange={e => setQuantiteAjustee(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Raison de l'ajustement</Form.Label>
            <Form.Control as="textarea" rows={3} value={raison} onChange={e => setRaison(e.target.value)} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Enregistrer l'ajustement
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddStockAdjustmentModal;