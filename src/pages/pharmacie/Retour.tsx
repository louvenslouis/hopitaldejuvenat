import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../../db';
import AddRetourModal from '../../components/AddRetourModal';
import EditRetourModal from '../../components/EditRetourModal';
import RetourCard from '../../components/RetourCard';

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
      query += " WHERE LOWER(lm.nom) LIKE LOWER(?)";
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
      <div className="card-grid">
        {retours.map((retour, index) => (
          <RetourCard key={index} retour={retour} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
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