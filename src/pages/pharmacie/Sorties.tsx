
import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../../db';
import AddSortieModal from '../../components/AddSortieModal';
import EditSortieModal from '../../components/EditSortieModal';
import SortieCard from '../../components/SortieCard';

const Sorties: React.FC = () => {
  const [sorties, setSorties] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSortie, setSelectedSortie] = useState<any | null>(null);
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
        GROUP_CONCAT(sd.quantite || ' ' || lm.nom, ', '),
        s.memo
      FROM sorties s
      LEFT JOIN patient p ON s.patient_id = p.id
      LEFT JOIN sorties_details sd ON s.id = sd.sortie_id
      LEFT JOIN liste_medicaments lm ON sd.article_id = lm.id
    `;
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += `
        WHERE LOWER(p.prenom || ' ' || p.nom) LIKE LOWER(?)
        OR LOWER(s.service) LIKE LOWER(?)
        OR LOWER(s.employe) LIKE LOWER(?)
      `;
      const searchTermLike = `%${searchTerm}%`;
      params.push(searchTermLike, searchTermLike, searchTermLike);
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

  const handleEdit = (sortie: any) => {
    setSelectedSortie(sortie);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sortie ?')) {
      const db = await getDB();
      await db.run("DELETE FROM sorties WHERE id = ?", [id]);
      await db.run("DELETE FROM sorties_details WHERE sortie_id = ?", [id]);
      fetchData();
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
      <div className="card-grid">
        {sorties.map((sortie, index) => (
          <SortieCard key={index} sortie={sortie} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
      <AddSortieModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />
      {selectedSortie && 
        <EditSortieModal 
          show={showEditModal} 
          onHide={() => setShowEditModal(false)} 
          onSuccess={() => { setShowEditModal(false); fetchData(); }} 
          sortie={selectedSortie} 
        />
      }
    </div>
  );
};

export default Sorties;
