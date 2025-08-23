import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { getDocument, updateDocument, addDocument } from '../firebase/firestoreService';
import type { Medicament } from '../types';

interface EditMedicamentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  medicamentId: string | null;
}

const EditMedicamentModal: React.FC<EditMedicamentModalProps> = ({ show, onHide, onSuccess, medicamentId }) => {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState(0);
  const [type, setType] = useState('');
  const [presentation, setPresentation] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [newStock, setNewStock] = useState<number | undefined>(undefined);
  const [lot, setLot] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    const fetchMedicament = async () => {
      if (medicamentId) {
        const medicament = await getDocument('liste_medicaments', medicamentId) as Medicament;
        if (medicament) {
          setNom(medicament.nom);
          setPrix(medicament.prix);
          setType(medicament.type);
          setPresentation(medicament.presentation);
          setLot(medicament.lot || '');
          setExpirationDate(medicament.expiration_date || '');
          setCurrentStock(medicament.quantite_en_stock);
        }
      }
    };
    fetchMedicament();
  }, [medicamentId, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medicamentId) {
      const updatedMedicament = {
        nom,
        prix,
        type,
        presentation,
        lot,
        expiration_date: expirationDate,
        updated_at: new Date().toISOString(),
      };
      await updateDocument('liste_medicaments', medicamentId, updatedMedicament);

      if (newStock !== undefined && newStock !== currentStock) {
        const adjustment = newStock - currentStock;
        const reason = "Ajustement depuis la modification du médicament";
        await addDocument('stock_adjustments', {
            article_id: medicamentId,
            quantite_ajustee: adjustment,
            raison: reason,
            date_ajustement: new Date().toISOString(),
        });
      }
      onSuccess();
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier le médicament</Modal.Title>
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
                    <Form.Label>Stock Actuel</Form.Label>
                    <Form.Control type="number" value={currentStock} disabled />
                </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Nouveau Stock</Form.Label>
            <Form.Control type="number" value={newStock} onChange={e => setNewStock(Number(e.target.value))} />
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
          <Button variant="primary" type="submit">Enregistrer</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditMedicamentModal;