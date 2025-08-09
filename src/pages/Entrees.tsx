import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';

const Entrees: React.FC = () => {
  const [entrees, setEntrees] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<number | undefined>();
  const [quantite, setQuantite] = useState<number>(0);
  const [dateExpiration, setDateExpiration] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    let query = "SELECT stock.id, stock.quantite, stock.date_enregistrement, liste_medicaments.nom, stock.sync_status, stock.date_expiration FROM stock JOIN liste_medicaments ON stock.article_id = liste_medicaments.id";
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += " WHERE liste_medicaments.nom LIKE ?";
      params.push(`%${searchTerm}%`);
    }

    query += " ORDER BY stock.date_enregistrement DESC";

    const entreesResult = db.exec(query, params);
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
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0 && dateExpiration) {
      const db = await getDB();
      await db.run("INSERT INTO stock (article_id, quantite, date_expiration, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)", [selectedMedicament, quantite, dateExpiration]);
      fetchData();
      setSelectedMedicament(undefined);
      setQuantite(0);
      setDateExpiration('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <h1>Entrées de stock</h1>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={5}>
            <Form.Group>
              <Form.Label>Médicament</Form.Label>
              <Form.Select value={selectedMedicament} onChange={e => setSelectedMedicament(Number(e.target.value))}>
                <option>Sélectionner un médicament</option>
                {medicaments.map((med, index) => (
                  <option key={index} value={med[0]}>{med[1]}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Quantité</Form.Label>
              <Form.Control type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} />
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

      <div className="d-flex justify-content-end mb-3">
        <InputGroup style={{ width: '300px' }}>
          <Form.Control
            placeholder="Rechercher par médicament..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </InputGroup>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Médicament</th>
            <th>Quantité</th>
            <th>Date d'expiration</th>
            <th>Date d'enregistrement</th>
            <th>Statut Sync</th>
          </tr>
        </thead>
        <tbody>
          {entrees.map((entree, index) => (
            <tr key={index}>
              <td>{entree[0]}</td>
              <td>{entree[3]}</td>
              <td>{entree[1]}</td>
              <td>{entree[5] ? new Date(entree[5]).toLocaleDateString('fr-HT') : 'N/A'}</td>
              <td>{new Date(entree[2]).toLocaleString('fr-HT')}</td>
              <td>
                {entree[4] === 'synced' && <span title="Synchronisé">✅</span>}
                {entree[4] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {entree[4] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {entree[4] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Entrees;