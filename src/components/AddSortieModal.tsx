import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, ListGroup, InputGroup } from 'react-bootstrap';
import { addDocument, getCollection, getDocument, updateDocument } from '../firebase/firestoreService';
import type { Medicament, Patient } from '../types';
import AddPatientModal from './AddPatientModal';
import AddMedicamentModal from './AddMedicamentModal';
import { useUser } from '../contexts/UserContext';

interface AddSortieModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddSortieModal: React.FC<AddSortieModalProps> = ({ show, onHide, onSuccess }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [service, setService] = useState(''); // Initial state empty
  const [employe, setEmploye] = useState('');
  const [chambre, setChambre] = useState<number | undefined>();
  const [memo, setMemo] = useState('');
  const [articles, setArticles] = useState<any[]>([{ article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
  const [stockError, setStockError] = useState<string | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddMedicamentModal, setShowAddMedicamentModal] = useState(false);

  const { activeUser } = useUser();
  const defaultEmployes = ['Azor', 'Naika', 'Tamara', 'Voltaire'];
  const employeOptions = Array.from(
    new Set([
      ...(activeUser?.nom ? [activeUser.nom] : []),
      ...defaultEmployes,
    ])
  );

  const resetState = () => {
    setSelectedPatient(undefined);
    setPatientSearchTerm('');
    setShowPatientResults(false);
    setService(''); // Reset to empty
    setEmploye(activeUser ? activeUser.nom : ''); // Set default employee from active user
    setChambre(undefined);
    setMemo('');
    setArticles([{ article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
    setStockError(null);
  };

  const fetchData = async () => {
    const patientCollection = 'patients';
    const patientsData = await getCollection(patientCollection) as Patient[];
    setPatients(patientsData);
    const medicamentsData = await getCollection('medicaments') as Medicament[];
    setMedicaments(medicamentsData);
  };

  useEffect(() => {
    if (show) {
      fetchData();
      setEmploye(activeUser ? activeUser.nom : ''); // Set employee when modal opens
    }
  }, [show, activeUser]);

  useEffect(() => {
    if (service !== 'Medecine Interne' && service !== 'Maternité') {
      setChambre(undefined);
    }
  }, [service]);

  const handleArticleChange = (index: number, field: string, value: any) => {
    const newArticles = [...articles];
    newArticles[index][field] = value;
    if (field === 'searchTerm') {
      newArticles[index]['showResults'] = true;
    }
    setArticles(newArticles);
    setStockError(null); // Clear error on change
  };

  const handleMedicamentSelect = (index: number, medicament: Medicament) => {
    const newArticles = [...articles];
    newArticles[index]['article_id'] = medicament.id;
    newArticles[index]['searchTerm'] = medicament.nom;
    newArticles[index]['showResults'] = false;
    setArticles(newArticles);
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient.id);
    setPatientSearchTerm(`${patient.prenom} ${patient.nom}`);
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
    setStockError(null); // Clear previous errors

    // Validate service selection
    if (!service) {
      setStockError("Veuillez sélectionner un service.");
      return;
    }

    // Validate at least one article
    const validArticles = articles.filter(article => article.article_id && article.quantite > 0);
    if (validArticles.length === 0) {
      setStockError("Veuillez ajouter au moins un article avec une quantité valide.");
      return;
    }

    // Perform stock check and update
    for (const article of validArticles) {
      const medicament = await getDocument('medicaments', article.article_id) as Medicament;
      if (!medicament) {
        setStockError(`Médicament ${article.searchTerm} introuvable.`);
        return;
      }
      const currentStock = medicament.quantite_en_stock || 0;

      if (currentStock < article.quantite) {
        setStockError(`Stock insuffisant pour ${medicament.nom}. Stock actuel: ${currentStock}, Quantité demandée: ${article.quantite}`);
        return;
      }
      // Update stock in Firestore
      await updateDocument('medicaments', medicament.id, { quantite_en_stock: currentStock - article.quantite });
    }

    const newSortie = {
      date_sortie: new Date().toISOString(),
      service,
      employe,
      patient_id: selectedPatient || null,
      chambre: chambre || null,
      memo,
      articles: validArticles.map(art => ({ article_id: art.article_id, quantite: art.quantite })),
      created_at: new Date().toISOString(),
    };
    await addDocument('sorties', newSortie);

    onSuccess();
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" onExited={resetState} backdrop="static" keyboard={false}> {/* Added backdrop and keyboard props */}
        <Modal.Header closeButton>
          <Modal.Title>Créer une sortie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 typeahead">
                  <Form.Label>Patient</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={patientSearchTerm}
                      onChange={e => { setPatientSearchTerm(e.target.value); setShowPatientResults(true); }}
                    />
                    <Button variant="outline-secondary" onClick={() => setShowAddPatientModal(true)}>Nouveau</Button>
                  </InputGroup>
                  {showPatientResults && patientSearchTerm && (
                    <ListGroup className="typeahead-results">
                      {patients
                        .filter((p: Patient) => `${p.prenom} ${p.nom}`.toLowerCase().includes(patientSearchTerm.toLowerCase()))
                        .map((p: Patient) => (
                          <ListGroup.Item key={p.id} onClick={() => handlePatientSelect(p)}>
                            {p.prenom} {p.nom}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service</Form.Label>
                  <Form.Select value={service} onChange={e => setService(e.target.value)} required> {/* Added required */}
                    <option value="">Sélectionner un service</option> {/* Added empty option */}
                    <option>Clinique externe</option>
                    <option>Urgence</option>
                    <option>Medecine Interne</option>
                    <option>Maternité</option>
                    <option>SOP</option>
                    <option>Pediatrie</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employé</Form.Label>
                  <Form.Select value={employe} onChange={e => setEmploye(e.target.value)}>
                    {employeOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Conditional rendering for Chambre field */}
              {(service === 'Medecine Interne' || service === 'Maternité') && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chambre</Form.Label>
                    <Form.Control type="number" value={chambre} onChange={e => setChambre(Number(e.target.value))} />
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Memo</Form.Label>
              <Form.Control as="textarea" rows={1} value={memo} onChange={e => setMemo(e.target.value)} /> {/* Changed rows to 1 */}
            </Form.Group>

            {stockError && <Alert variant="danger">{stockError}</Alert>}

            <h5>Articles</h5>
            {articles.map((article, index) => (
              <Row key={index} className="mb-2">
                <Col md={7} className="typeahead">
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un médicament..."
                    value={article.searchTerm}
                    onChange={e => handleArticleChange(index, 'searchTerm', e.target.value)}
                  />
                  {article.showResults && article.searchTerm && (
                    <ListGroup className="typeahead-results">
                      {medicaments
                        .filter((m: Medicament) => m.nom.toLowerCase().includes(article.searchTerm.toLowerCase()))
                        .map((m: Medicament) => (
                          <ListGroup.Item key={m.id} onClick={() => handleMedicamentSelect(index, m)}>
                            {m.nom}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  )}
                </Col>
                <Col md={3}>
                  <Form.Control type="number" value={article.quantite} onChange={e => handleArticleChange(index, 'quantite', Number(e.target.value))} />
                </Col>
                <Col md={2}>
                  <Button variant="danger" onClick={() => removeArticle(index)}>X</Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={addArticle} className="mt-2">Ajouter un article</Button>
            <Button variant="info" onClick={() => setShowAddMedicamentModal(true)} className="mt-2 ms-2">Nouveau Médicament</Button>


          <Button variant="primary" type="submit" className="mt-4">Enregistrer la sortie</Button>
        </Form>
      </Modal.Body>
    </Modal>

    <AddPatientModal 
      show={showAddPatientModal} 
      onHide={() => setShowAddPatientModal(false)} 
      onSuccess={() => {
        setShowAddPatientModal(false);
        fetchData();
      }} 
    />

    <AddMedicamentModal 
      show={showAddMedicamentModal} 
      onHide={() => setShowAddMedicamentModal(false)} 
      onSuccess={() => {
        setShowAddMedicamentModal(false);
        fetchData();
      }} 
    />
  </>
  );
};

export default AddSortieModal;
