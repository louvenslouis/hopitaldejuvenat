import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';
import AddRetourModal from '../components/AddRetourModal';
import EditRetourModal from '../components/EditRetourModal';

const Retour: React.FC = () => {
  const [retours, setRetours] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRetourId, setSelectedRetourId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    let query = "SELECT r.id, lm.nom, r.quantite, r.date_enregistrement, r.sync_status FROM retour r JOIN liste_medicaments lm ON r.article_id = lm.id";
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += " WHERE lm.nom LIKE ?";
      params.push(`%${searchTerm}%`);
    }

    const result = db.exec(query, params);
    if (result.length > 0) {
      setRetours(result[0].values);
    } else {
      setRetours([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce retour ?")) {
      const db = await getDB();
      await db.run("UPDATE retour SET sync_status = 'pending_delete', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      fetchData();
    }
  };

  const handleEdit = (id: number) => {
    setSelectedRetourId(id);
    setShowEditModal(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <h1>Retours de stock</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajouter un retour</Button>
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
            <th>Date d'enregistrement</th>
            <th>Statut Sync</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {retours.map((retour, index) => (
            <tr key={index}>
              <td>{retour[0]}</td>
              <td>{retour[1]}</td>
              <td>{retour[2]}</td>
              <td>{new Date(retour[3]).toLocaleString('fr-HT')}</td>
              <td>
                {retour[4] === 'synced' && <span title="Synchronisé">✅</span>}
                {retour[4] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {retour[4] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {retour[4] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(retour[0] as number)}>Modifier</Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(retour[0] as number)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddRetourModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
      <EditRetourModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSuccess={fetchData}
        retourId={selectedRetourId}
      />
    </div>
  );
};

export default Retour;
