import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addDocument } from '../firebase/firestoreService';
import type { Patient } from '../types';

interface AddPatientModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ show, onHide, onSuccess }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [nifCin, setNifCin] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState<number | null>(null);
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState<number | null>(null);

  const resetForm = () => {
    setPrenom('');
    setNom('');
    setNifCin('');
    setAnneeNaissance(null);
    setSexe('M');
    setTelephone(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: '', // Firestore will generate this
      prenom,
      nom,
      nif_cin: nifCin || null,
      annee_naissance: anneeNaissance,
      sexe,
      telephone: telephone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await addDocument('patient', newPatient);
    onSuccess();
    onHide();
    resetForm();
  };

  return (
    <Modal show={show} onHide={onHide} onExited={resetForm}>
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
            <Form.Control type="number" value={anneeNaissance === null ? '' : anneeNaissance} onChange={e => setAnneeNaissance(Number(e.target.value))} />
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
            <Form.Control type="number" value={telephone === null ? '' : telephone} onChange={e => setTelephone(Number(e.target.value))} />
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