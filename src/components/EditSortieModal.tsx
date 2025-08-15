
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, ListGroup, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface EditSortieModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  sortie: any;
}

const EditSortieModal: React.FC<EditSortieModalProps> = ({ show, onHide, onSuccess, sortie }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | undefined>();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [service, setService] = useState('');
  const [employe, setEmploye] = useState('');
  const [chambre, setChambre] = useState<number | undefined>();
  const [memo, setMemo] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();
      const patientsResult = db.exec("SELECT id, prenom, nom FROM patient");
      if (patientsResult.length > 0) {
        setPatients(patientsResult[0].values);
      }
      const medicamentsResult = db.exec("SELECT id, nom FROM liste_medicaments");
      if (medicamentsResult.length > 0) {
        setMedicaments(medicamentsResult[0].values);
      }

      if (sortie) {
        const sortieDetailsResult = db.exec("SELECT article_id, quantite, (SELECT nom FROM liste_medicaments WHERE id = article_id) as nom FROM sorties_details WHERE sortie_id = ?", [sortie.id]);
        if (sortieDetailsResult.length > 0) {
          setArticles(sortieDetailsResult[0].values.map(d => ({ article_id: d[0], quantite: d[1], searchTerm: d[2], showResults: false })));
        }
        setSelectedPatient(sortie.patient_id);
        setPatientSearchTerm(sortie.patient_nom ? `${sortie.patient_prenom} ${sortie.patient_nom}`: '');
        setService(sortie.service);
        setEmploye(sortie.employe);
        setChambre(sortie.chambre);
        setMemo(sortie.memo);
      }
    };
    if (show) {
      fetchData();
    }
  }, [show, sortie]);

  const handleArticleChange = (index: number, field: string, value: any) => {
    const newArticles = [...articles];
    newArticles[index][field] = value;
    if (field === 'searchTerm') {
      newArticles[index]['showResults'] = true;
    }
    setArticles(newArticles);
    setStockError(null); // Clear error on change
  };

  const handleMedicamentSelect = (index: number, medicament: any) => {
    const newArticles = [...articles];
    newArticles[index]['article_id'] = medicament[0];
    newArticles[index]['searchTerm'] = medicament[1];
    newArticles[index]['showResults'] = false;
    setArticles(newArticles);
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient[0]);
    setPatientSearchTerm(`${patient[1]} ${patient[2]}`);
    setShowPatientResults(false);
  }

  const addArticle = () => {
    setArticles([...articles, { article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
    setStockError(null); // Clear error on add
  };

  const removeArticle = (index: number) => {
    const newArticles = [...articles];
    newArticles.splice(index, 1);
    setArticles(newArticles);
    setStockError(null); // Clear error on remove
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (UPDATE logic will be complex, for now just close the modal)
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modifier la sortie</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Form fields are the same as AddSortieModal, pre-filled with data */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Annuler</Button>
        <Button variant="primary" onClick={handleSubmit}>Enregistrer</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSortieModal;
