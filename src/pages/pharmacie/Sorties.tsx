import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, InputGroup, Table, ButtonGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddSortieModal from '../../components/AddSortieModal';
import SortieCard from '../../components/SortieCard';
import type { Medicament, Patient, Sortie } from '../../types';

const Sorties: React.FC = () => {
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'history' | 'cards'>('history');

  const fetchData = useCallback(async () => {
    const allSorties = await getCollection<Sortie>('sorties');
    const collectionName = 'patients';
    const allPatients = await getCollection<Patient>(collectionName);
    const allMedicaments = await getCollection<Medicament>('medicaments');

    const enrichedSorties = allSorties.map((sortie) => {
      const patient = allPatients.find((p) => p.id === sortie.patient_id);
      const patient_nom = patient ? `${patient.prenom} ${patient.nom}` : 'N/A';

      const articlesDetails = sortie.articles.map((article) => {
        const medicament = allMedicaments.find((med) => med.id === article.article_id);
        return `${article.quantite} ${medicament ? medicament.nom : 'Inconnu'}`;
      }).join(', ');

      return {
        ...sortie,
        patient_nom,
        articles_summary: articlesDetails,
      };
    });

    const filteredSorties = enrichedSorties.filter((s) => 
      s.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employe.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSorties(filteredSorties.sort((a, b) => new Date(b.date_sortie).getTime() - new Date(a.date_sortie).getTime()));
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sortie ?')) {
      await deleteDocument('sorties', id);
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
        <InputGroup className="search-group">
          <Form.Control
            placeholder="Rechercher par patient, service, employé..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={handleClearSearch}>
              Effacer
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
                <th>Patient</th>
                <th>Service</th>
                <th>Employé</th>
                <th>Chambre</th>
                <th>Médicaments</th>
              </tr>
            </thead>
            <tbody>
              {sorties.map((sortie) => (
                <tr key={sortie.id}>
                  <td>{new Date(sortie.date_sortie).toLocaleString('fr-HT')}</td>
                  <td>{sortie.patient_nom}</td>
                  <td>{sortie.service}</td>
                  <td>{sortie.employe}</td>
                  <td>{sortie.chambre ?? '—'}</td>
                  <td>{sortie.articles_summary}</td>
                </tr>
              ))}
              {sorties.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Aucune sortie trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="card-grid">
          {sorties.map((sortie) => (
            <SortieCard key={sortie.id} sortie={sortie} onDelete={handleDelete} />
          ))}
        </div>
      )}
      <AddSortieModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />
    </div>
  );
};

export default Sorties;
