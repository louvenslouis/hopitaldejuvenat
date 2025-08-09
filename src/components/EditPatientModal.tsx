import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDB } from '../db';

interface EditPatientModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  patientId: number | null;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ show, onHide, onSuccess, patientId }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [nifCin, setNifCin] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState<number | undefined>();
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState<number | undefined>();

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        const db = await getDB();
        const result = db.exec("SELECT * FROM patient WHERE id = ?", [patientId]);
        if (result.length > 0 && result[0].values.length > 0) {
          const patient = result[0].values[0];
          setPrenom(patient[1] as string);
          setNom(patient[2] as string);
          setNifCin(patient[3] as string);
          setAnneeNaissance(patient[4] as number);
          setSexe(patient[5] as string);
          setTelephone(patient[6] as number);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = await getDB();
    await db.run("UPDATE patient SET prenom = ?, nom = ?, nif_cin = ?, annee_naissance = ?, sexe = ?, telephone = ?, sync_status = 'pending_update', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [prenom, nom, nifCin, anneeNaissance ?? null, sexe, telephone ?? null, patientId]);
    onSuccess();
    onHide();
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
            Enregistrer les modifications
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPatientModal;
