import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AddPatientModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ show, onHide, onSuccess }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [nifCin, setNifCin] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState<number | undefined>();
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState<number | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    const firestoreDocId = uuidv4();
    await db.run("INSERT INTO patient (prenom, nom, nif_cin, annee_naissance, sexe, telephone, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [prenom, nom, nifCin, anneeNaissance ?? null, sexe, telephone ?? null, 'pending_create', firestoreDocId]);
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un patient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" value={nom} onChange={e => setNom(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>NIF/CIN</Form.Label>
            <Form.Control type="text" value={nifCin} onChange={e => setNifCin(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Année de naissance</Form.Label>
            <Form.Control type="number" value={anneeNaissance} onChange={e => setAnneeNaissance(Number(e.target.value))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sexe</Form.Label>
            <Form.Select value={sexe} onChange={e => setSexe(e.target.value)}>
              <option>M</option>
              <option>F</option>
              <option>Autre</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control type="number" value={telephone} onChange={e => setTelephone(Number(e.target.value))} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Ajouter
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPatientModal;
