import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { addDocument } from '../firebase/firestoreService';
import type { Medicament } from '../types'; // Used for type checking

interface AddMedicamentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddMedicamentModal: React.FC<AddMedicamentModalProps> = ({ show, onHide, onSuccess }) => {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState(0);
  const [type, setType] = useState('');
  const [presentation, setPresentation] = useState('');
  const [initialStock, setInitialStock] = useState(0);
  const [lot, setLot] = useState('');
  const [expirationDate, setExpirationDate] = useState('');


  const resetState = () => {
    setNom('');
    setPrix(0);
    setType('');
    setPresentation('');
    setInitialStock(0);
    setLot('');
    setExpirationDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMedicament: Medicament = {
      id: '', // Firestore will generate this
      nom,
      prix,
      type,
      presentation,
      lot,
      expiration_date: expirationDate,
      quantite_en_stock: initialStock, // Initial stock is directly set here
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const medicamentDocId = await addDocument('liste_medicaments', newMedicament);

    if (initialStock > 0) {
        const reason = "Stock initial";
        await addDocument('stock_adjustments', {
            article_id: medicamentDocId,
            quantite_ajustee: initialStock,
            raison: reason,
            date_ajustement: new Date().toISOString(),
        });
    }
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} onExited={resetState}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un médicament</Modal.Title>
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
                    <Form.Label>Stock Initial</Form.Label>
                    <Form.Control type="number" value={initialStock} onChange={e => setInitialStock(Number(e.target.value))} />
                </Form.Group>
            </Col>
          </Row>
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
          <Button variant="primary" type="submit">Ajouter</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMedicamentModal;