import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddRetourModal from '../../components/AddRetourModal';
import EditRetourModal from '../../components/EditRetourModal';
import RetourCard from '../../components/RetourCard';

const Retour: React.FC = () => {
  const [retours, setRetours] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRetourId, setSelectedRetourId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const allRetours = await getCollection('retour');
    const allMedicaments = await getCollection('liste_medicaments');

    const enrichedRetours = allRetours.map((retour: any) => {
      const medicament = allMedicaments.find((med: any) => med.id === retour.article_id);
      return { ...retour, nom: medicament ? medicament.nom : 'Inconnu' };
    });

    const filteredRetours = enrichedRetours.filter((r: any) => 
      r.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setRetours(filteredRetours.sort((a: any, b: any) => new Date(b.date_enregistrement).getTime() - new Date(a.date_enregistrement).getTime()));
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce retour ?")) {
      await deleteDocument('retour', id);
      fetchData();
    }
  };

  const handleEdit = (id: string) => {
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
        {retours.map((retour: any) => (
          <RetourCard key={retour.id} retour={retour} onEdit={handleEdit} onDelete={handleDelete} />
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