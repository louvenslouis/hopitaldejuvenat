import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getCollection, getDocument, updateDocument } from '../firebase/firestoreService';
import type { Medicament } from '../types';

interface EditRetourModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  retourId: string | null;
}

const EditRetourModal: React.FC<EditRetourModalProps> = ({ show, onHide, onSuccess, retourId }) => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<string | undefined>();
  const [quantite, setQuantite] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const medicamentsData = await getCollection('liste_medicaments');
      setMedicaments(medicamentsData);

      if (retourId) {
        const retour = await getDocument('retour', retourId);
        if (retour) {
          setSelectedMedicament(retour.article_id);
          setQuantite(retour.quantite);
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
      // Update medicament stock (revert old quantity, add new quantity)
      const oldRetour = await getDocument('retour', retourId);
      if (oldRetour) {
        const oldMedicament = medicaments.find(m => m.id === oldRetour.article_id);
        if (oldMedicament) {
          await updateDocument('liste_medicaments', oldMedicament.id, { quantite_en_stock: oldMedicament.quantite_en_stock - oldRetour.quantite });
        }
      }

      // Update retour entry
      await updateDocument('retour', retourId, {
        article_id: selectedMedicament,
        quantite: quantite,
        date_modification: new Date().toISOString(),
      });

      // Update medicament stock (add new quantity)
      const newMedicament = medicaments.find(m => m.id === selectedMedicament);
      if (newMedicament) {
        await updateDocument('liste_medicaments', selectedMedicament, { quantite_en_stock: newMedicament.quantite_en_stock + quantite });
      }

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
            <Form.Select value={selectedMedicament} onChange={e => setSelectedMedicament(e.target.value)}>
              <option value="">Sélectionner un médicament</option>
              {medicaments.map((med) => (
                <option key={med.id} value={med.id}>{med.nom}</option>
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