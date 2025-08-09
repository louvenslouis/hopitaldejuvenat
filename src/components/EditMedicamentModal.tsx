import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDB } from '../db';

interface EditMedicamentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  medicamentId: number | null;
}

const EditMedicamentModal: React.FC<EditMedicamentModalProps> = ({ show, onHide, onSuccess, medicamentId }) => {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState(0);
  const [type, setType] = useState('Comprimé');
  const [presentation, setPresentation] = useState('');

  useEffect(() => {
    if (medicamentId) {
      const fetchMedicament = async () => {
        const db = await getDB();
        const result = db.exec("SELECT * FROM liste_medicaments WHERE id = ?", [medicamentId]);
        if (result.length > 0 && result[0].values.length > 0) {
          const medicament = result[0].values[0];
          setNom(medicament[1] as string);
          setPrix(medicament[2] as number);
          setType(medicament[3] as string);
          setPresentation(medicament[4] as string);
        }
      };
      fetchMedicament();
    }
  }, [medicamentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    await db.run("UPDATE liste_medicaments SET nom = ?, prix = ?, type = ?, presentation = ?, sync_status = 'pending_update', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [nom, prix, type, presentation, medicamentId]);
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier le médicament</Modal.Title>
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
            Enregistrer les modifications
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditMedicamentModal;
