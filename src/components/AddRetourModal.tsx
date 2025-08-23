import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addDocument, getCollection, updateDocument } from '../firebase/firestoreService';
import type { Medicament } from '../types';

interface AddRetourModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddRetourModal: React.FC<AddRetourModalProps> = ({ show, onHide, onSuccess }) => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<string | undefined>();
  const [quantite, setQuantite] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const medicamentsData = await getCollection('liste_medicaments') as Medicament[];
      setMedicaments(medicamentsData);
    };
    if (show) {
      fetchData();
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0) {
      // Add new retour entry
      await addDocument('retour', {
        article_id: selectedMedicament,
        quantite: quantite,
        date_enregistrement: new Date().toISOString(),
        date_modification: new Date().toISOString(),
      });

      // Update medicament stock
      const medicament = medicaments.find((m: Medicament) => m.id === selectedMedicament);
      if (medicament) {
        await updateDocument('liste_medicaments', selectedMedicament, { quantite_en_stock: medicament.quantite_en_stock + quantite });
      }

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
            <Form.Select value={selectedMedicament} onChange={e => setSelectedMedicament(e.target.value)}>
              <option value="">Sélectionner un médicament</option>
              {medicaments.map((med: Medicament) => (
                <option key={med.id} value={med.id}>{med.nom}</option>
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