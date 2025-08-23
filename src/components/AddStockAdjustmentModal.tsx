import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { addDocument, getCollection, updateDocument } from '../firebase/firestoreService';
import type { Medicament } from '../types';

interface AddStockAdjustmentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddStockAdjustmentModal: React.FC<AddStockAdjustmentModalProps> = ({ show, onHide, onSuccess }) => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<string | undefined>();
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
      const medicamentsData = await getCollection('liste_medicaments');
      setMedicaments(medicamentsData);
    };
    if (show) {
      fetchData();
    }
  }, [show]);

  const handleMedicamentSelect = (medicament: any) => {
    setSelectedMedicament(medicament.id);
    setMedicamentSearchTerm(medicament.nom);
    setShowMedicamentResults(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantiteAjustee !== 0) {
      // Add new stock adjustment entry
      await addDocument('stock_adjustments', {
        article_id: selectedMedicament,
        quantite_ajustee: quantiteAjustee,
        raison: raison,
        date_ajustement: new Date().toISOString(),
      });

      // Update medicament stock
      const medicament = medicaments.find(m => m.id === selectedMedicament);
      if (medicament) {
        await updateDocument('liste_medicaments', selectedMedicament, { quantite_en_stock: medicament.quantite_en_stock + quantiteAjustee });
      }

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
                  .filter(m => m.nom.toLowerCase().includes(medicamentSearchTerm.toLowerCase()))
                  .map((m) => (
                    <ListGroup.Item key={m.id} onClick={() => handleMedicamentSelect(m)}>
                      {m.nom}
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