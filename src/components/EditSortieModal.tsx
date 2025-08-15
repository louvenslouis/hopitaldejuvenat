
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { getDB } from '../db';

interface EditSortieModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  sortie: any;
}

const EditSortieModal: React.FC<EditSortieModalProps> = ({ show, onHide, onSuccess, sortie }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [service, setService] = useState('');
  const [employe, setEmploye] = useState('');
  const [chambre, setChambre] = useState<number | undefined>();
  const [memo, setMemo] = useState('');
  const [articles, setArticles] = useState<any[]>([]);

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
        const sortieDetailsResult = db.exec("SELECT article_id, quantite, (SELECT nom FROM liste_medicaments WHERE id = article_id) as nom FROM sorties_details WHERE sortie_id = ?", [sortie[0]]);
        if (sortieDetailsResult.length > 0) {
          setArticles(sortieDetailsResult[0].values.map(d => ({ article_id: d[0], quantite: d[1], searchTerm: d[2], showResults: false })));
        }
        setPatientSearchTerm(sortie[4] ? `${sortie[4]}`: '');
        setService(sortie[2]);
        setEmploye(sortie[3]);
        setChambre(sortie[5]);
        setMemo(sortie[7]);
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
  };

  const handleMedicamentSelect = (index: number, medicament: any) => {
    const newArticles = [...articles];
    newArticles[index]['article_id'] = medicament[0];
    newArticles[index]['searchTerm'] = medicament[1];
    newArticles[index]['showResults'] = false;
    setArticles(newArticles);
  }

  const handlePatientSelect = (patient: any) => {
    // setSelectedPatient(patient[0]);
    setPatientSearchTerm(`${patient[1]} ${patient[2]}`);
    setShowPatientResults(false);
  }

  const addArticle = () => {
    setArticles([...articles, { article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
  };

  const removeArticle = (index: number) => {
    const newArticles = [...articles];
    newArticles.splice(index, 1);
    setArticles(newArticles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update logic
    console.log('Update logic not implemented');
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

          <Button variant="primary" type="submit" className="mt-4">Enregistrer les modifications</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditSortieModal;
