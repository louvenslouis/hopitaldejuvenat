import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';
import AddSortieModal from '../components/AddSortieModal';

const Sorties: React.FC = () => {
  const [sorties, setSorties] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    let query = `
      SELECT 
        s.id,
        s.date_sortie,
        s.service,
        s.employe,
        p.prenom || ' ' || p.nom as patient_nom,
        s.chambre,
        s.sync_status,
        GROUP_CONCAT(sd.quantite || ' ' || lm.nom, ', ')
      FROM sorties s
      LEFT JOIN patient p ON s.patient_id = p.id
      LEFT JOIN sorties_details sd ON s.id = sd.sortie_id
      LEFT JOIN liste_medicaments lm ON sd.article_id = lm.id
    `;
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += `
        WHERE p.prenom LIKE ? OR p.nom LIKE ? OR s.service LIKE ? OR s.employe LIKE ?
      `;
      params.push(`%${searchTerm}%`);
      params.push(`%${searchTerm}%`);
      params.push(`%${searchTerm}%`);
      params.push(`%${searchTerm}%`);
    }

    query += `
      GROUP BY s.id
      ORDER BY s.date_sortie DESC
    `;

    const result = db.exec(query, params);
    if (result.length > 0) {
      setSorties(result[0].values);
    } else {
      setSorties([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <h1>Sorties de stock</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>Créer une sortie</Button>
        <InputGroup style={{ width: '300px' }}>
          <Form.Control
            placeholder="Rechercher par patient, service, employé..."
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
            <th>Date de sortie</th>
            <th>Service</th>
            <th>Employé</th>
            <th>Patient</th>
            <th>Chambre</th>
            <th>Statut Sync</th>
            <th>Médicaments</th>
          </tr>
        </thead>
        <tbody>
          {sorties.map((sortie, index) => (
            <tr key={index}>
              <td>{sortie[0]}</td>
              <td>{new Date(sortie[1]).toLocaleString('fr-HT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
              <td>{sortie[2]}</td>
              <td>{sortie[3]}</td>
              <td>{sortie[4]}</td>
              <td>{sortie[5]}</td>
              <td>
                {sortie[6] === 'synced' && <span title="Synchronisé">✅</span>}
                {sortie[6] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {sortie[6] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {sortie[6] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
              <td>{sortie[7]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddSortieModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
    </div>
  );
};

export default Sorties;
