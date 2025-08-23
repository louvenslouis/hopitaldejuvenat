import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDocument, updateDocument } from '../firebase/firestoreService';
import type { Patient } from '../types';

interface EditPatientModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  patientId: string | null;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ show, onHide, onSuccess, patientId }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [nifCin, setNifCin] = useState<string | null>('');
  const [anneeNaissance, setAnneeNaissance] = useState<number | null>(null);
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState<number | null>(null);

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        const patient = await getDocument('patient', patientId) as Patient;
        if (patient) {
          setPrenom(patient.prenom);
          setNom(patient.nom);
          setNifCin(patient.nif_cin || null);
          setAnneeNaissance(patient.annee_naissance || null);
          setSexe(patient.sexe || 'M');
          setTelephone(patient.telephone || null);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId) {
      const updatedPatient = {
        prenom,
        nom,
        nif_cin: nifCin,
        annee_naissance: anneeNaissance,
        sexe,
        telephone: telephone,
        updated_at: new Date().toISOString(),
      };
      await updateDocument('patient', patientId, updatedPatient);
      onSuccess();
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier le patient</Modal.Title>
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
            <Form.Control type="text" value={nifCin || ''} onChange={e => setNifCin(e.target.value)} />
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
            Enregistrer les modifications
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPatientModal;