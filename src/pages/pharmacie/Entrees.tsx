import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { getDB } from '../../db';
import EntreeCard from '../../components/EntreeCard';

const Entrees: React.FC = () => {
  const [entrees, setEntrees] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<number | undefined>();
  const [medicamentSearchTerm, setMedicamentSearchTerm] = useState('');
  const [showMedicamentResults, setShowMedicamentResults] = useState(false);
  const [quantite, setQuantite] = useState<number>(0);
  const [dateExpiration, setDateExpiration] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    const query = "SELECT stock.id, stock.quantite, stock.date_enregistrement, liste_medicaments.nom, stock.sync_status, stock.date_expiration FROM stock JOIN liste_medicaments ON stock.article_id = liste_medicaments.id ORDER BY stock.date_enregistrement DESC";
    
    const entreesResult = db.exec(query);
    if (entreesResult.length > 0) {
      setEntrees(entreesResult[0].values);
    } else {
      setEntrees([]);
    }

    const medicamentsResult = db.exec("SELECT id, nom FROM liste_medicaments");
    if (medicamentsResult.length > 0) {
      setMedicaments(medicamentsResult[0].values);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMedicamentSelect = (medicament: any) => {
    setSelectedMedicament(medicament[0]);
    setMedicamentSearchTerm(medicament[1]);
    setShowMedicamentResults(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0) { // Date d'expiration optionnelle
      const db = await getDB();
      await db.run("INSERT INTO stock (article_id, quantite, date_expiration, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)", [selectedMedicament, quantite, dateExpiration || null]);
      fetchData();
      setSelectedMedicament(undefined);
      setMedicamentSearchTerm('');
      setQuantite(0);
      setDateExpiration('');
    }
  };

  return (
    <div>
      <h1>Entrées de stock</h1>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={5}>
            <Form.Group>
              <Form.Label>Médicament</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rechercher un médicament..."
                value={medicamentSearchTerm}
                onChange={e => { setMedicamentSearchTerm(e.target.value); setShowMedicamentResults(true); }}
                required
              />
              {showMedicamentResults && medicamentSearchTerm && (
                <ListGroup>
                  {medicaments
                    .filter(m => m[1].toLowerCase().includes(medicamentSearchTerm.toLowerCase()))
                    .map((m, i) => (
                      <ListGroup.Item key={i} onClick={() => handleMedicamentSelect(m)}>
                        {m[1]}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              )}
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Quantité</Form.Label>
              <Form.Control type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Date d'expiration</Form.Label>
              <Form.Control type="date" value={dateExpiration} onChange={e => setDateExpiration(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button type="submit">Ajouter l'entrée</Button>
          </Col>
        </Row>
      </Form>

      <div className="card-grid">
        {entrees.map((entree, index) => (
          <EntreeCard key={index} entree={entree} />
        ))}
      </div>
    </div>
  );
};

export default Entrees;
