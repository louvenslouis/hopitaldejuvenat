import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDB } from '../db';

interface EditRetourModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  retourId: number | null;
}

const EditRetourModal: React.FC<EditRetourModalProps> = ({ show, onHide, onSuccess, retourId }) => {
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

      if (retourId) {
        const retourResult = db.exec("SELECT article_id, quantite FROM retour WHERE id = ?", [retourId]);
        if (retourResult.length > 0 && retourResult[0].values.length > 0) {
          const retour = retourResult[0].values[0];
          setSelectedMedicament(retour[0] as number);
          setQuantite(retour[1] as number);
        }
      }
    };
    if (show) {
      fetchData();
    }
  }, [show, retourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0 && retourId) {
      const db = await getDB();
      await db.run("UPDATE retour SET article_id = ?, quantite = ?, sync_status = 'pending_update', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [selectedMedicament, quantite, retourId]);
      onSuccess();
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier le retour</Modal.Title>
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
            Enregistrer les modifications
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditRetourModal;
