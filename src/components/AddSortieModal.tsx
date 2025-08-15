import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, ListGroup } from 'react-bootstrap';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AddSortieModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddSortieModal: React.FC<AddSortieModalProps> = ({ show, onHide, onSuccess }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | undefined>();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [service, setService] = useState('Clinique externe');
  const [employe, setEmploye] = useState('Azor');
  const [chambre, setChambre] = useState<number | undefined>();
  const [memo, setMemo] = useState('');
  const [articles, setArticles] = useState<any[]>([{ article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
  const [stockError, setStockError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedPatient(undefined);
    setPatientSearchTerm('');
    setShowPatientResults(false);
    setService('Clinique externe');
    setEmploye('Azor');
    setChambre(undefined);
    setMemo('');
    setArticles([{ article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
    setStockError(null);
  };

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
    };
    if (show) {
      fetchData();
    }
  }, [show]);

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
    setStockError(null); // Clear previous errors

    const db = await getDB();

    // Perform stock check
    for (const article of articles) {
      if (!article.article_id || article.quantite <= 0) continue; // Skip invalid entries

      const stockResult = db.exec(`SELECT quantite_en_stock FROM liste_medicaments WHERE id = ?`, [article.article_id]);
      const currentStock = stockResult[0]?.values[0][0] || 0;
      const medicamentNameResult = db.exec(`SELECT nom FROM liste_medicaments WHERE id = ?`, [article.article_id]);
      const medicamentName = medicamentNameResult[0]?.values[0][0] || 'Unknown';

      if (currentStock < article.quantite) {
        setStockError(`Stock insuffisant pour ${medicamentName}. Stock actuel: ${currentStock}, Quantité demandée: ${article.quantite}`);
        return;
      }
    }

    await db.transaction(dbInstance => {
      const sortieFirestoreDocId = uuidv4();
      const sortieResult = dbInstance.prepare("INSERT INTO sorties (date_sortie, service, employe, patient_id, chambre, memo, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)");
      sortieResult.run([new Date().toISOString().slice(0, 10), service, employe, selectedPatient ?? null, chambre ?? null, memo, 'pending_create', sortieFirestoreDocId]);
      const sortieId = dbInstance.exec("SELECT last_insert_rowid()")[0].values[0][0];
      
      const detailStmt = dbInstance.prepare("INSERT INTO sorties_details (sortie_id, article_id, quantite, position_article, sync_status, last_modified_local, firestore_doc_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)");
      articles.forEach((article, index) => {
        const detailFirestoreDocId = uuidv4();
        detailStmt.run([sortieId, article.article_id, article.quantite, index + 1, 'pending_create', detailFirestoreDocId]);
      });
    });
    onSuccess();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" onExited={resetState}>
      <Modal.Header closeButton>
        <Modal.Title>Créer une sortie</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Patient</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={patientSearchTerm}
                  onChange={e => { setPatientSearchTerm(e.target.value); setShowPatientResults(true); }}
                />
                {showPatientResults && patientSearchTerm && (
                  <ListGroup>
                    {patients
                      .filter(p => `${p[1]} ${p[2]}`.toLowerCase().includes(patientSearchTerm.toLowerCase()))
                      .map((p, i) => (
                        <ListGroup.Item key={i} onClick={() => handlePatientSelect(p)}>
                          {p[1]} {p[2]}
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service</Form.Label>
                <Form.Select value={service} onChange={e => setService(e.target.value)}>
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
                  <option>Azor</option>
                  <option>Naika</option>
                  <option>Tamara</option>
                  <option>Voltaire</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Chambre</Form.Label>
                <Form.Control type="number" value={chambre} onChange={e => setChambre(Number(e.target.value))} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Memo</Form.Label>
            <Form.Control as="textarea" rows={3} value={memo} onChange={e => setMemo(e.target.value)} />
          </Form.Group>

          {stockError && <Alert variant="danger">{stockError}</Alert>}

          <h5>Articles</h5>
          {articles.map((article, index) => (
            <Row key={index} className="mb-2">
              <Col md={7}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un médicament..."
                  value={article.searchTerm}
                  onChange={e => handleArticleChange(index, 'searchTerm', e.target.value)}
                />
                {article.showResults && article.searchTerm && (
                  <ListGroup>
                    {medicaments
                      .filter(m => m[1].toLowerCase().includes(article.searchTerm.toLowerCase()))
                      .map((m, i) => (
                        <ListGroup.Item key={i} onClick={() => handleMedicamentSelect(index, m)}>
                          {m[1]}
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

          <Button variant="primary" type="submit" className="mt-4">Enregistrer la sortie</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddSortieModal;