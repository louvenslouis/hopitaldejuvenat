import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup, Table, ButtonGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddRetourModal from '../../components/AddRetourModal';
import EditRetourModal from '../../components/EditRetourModal';
import RetourCard from '../../components/RetourCard';
import type { Medicament } from '../../types';

const Retour: React.FC = () => {
  const [retours, setRetours] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRetourId, setSelectedRetourId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'history' | 'cards'>('history');

  const fetchData = async () => {
    const allRetours = await getCollection('retour');
    const allMedicaments = await getCollection('medicaments') as Medicament[];

    const enrichedRetours = allRetours.map((retour: any) => {
      const medicament = allMedicaments.find((med: Medicament) => med.id === retour.article_id);
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Historique</h4>
        <ButtonGroup size="sm">
          <Button
            variant={viewMode === 'history' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('history')}
          >
            Historique
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('cards')}
          >
            Cartes
          </Button>
        </ButtonGroup>
      </div>

      {viewMode === 'history' ? (
        <div className="airtable-scroll">
          <Table className="airtable-table" bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Médicament</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {retours.map((retour: any) => (
                <tr key={retour.id}>
                  <td>{new Date(retour.date_enregistrement).toLocaleString('fr-HT')}</td>
                  <td>{retour.nom}</td>
                  <td className="text-center">{retour.quantite}</td>
                </tr>
              ))}
              {retours.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    Aucun retour trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="card-grid">
          {retours.map((retour: any) => (
            <RetourCard key={retour.id} retour={retour} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
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
