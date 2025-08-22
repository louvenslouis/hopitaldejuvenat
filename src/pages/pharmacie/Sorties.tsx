import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddSortieModal from '../../components/AddSortieModal';
import SortieCard from '../../components/SortieCard';

const Sorties: React.FC = () => {
  const [sorties, setSorties] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const allSorties = await getCollection('sorties');
    const allPatients = await getCollection('patient');
    const allMedicaments = await getCollection('liste_medicaments');

    const enrichedSorties = allSorties.map((sortie: any) => {
      const patient = allPatients.find((p: any) => p.id === sortie.patient_id);
      const patient_nom = patient ? `${patient.prenom} ${patient.nom}` : 'N/A';

      const articlesDetails = sortie.articles.map((article: any) => {
        const medicament = allMedicaments.find((med: any) => med.id === article.article_id);
        return `${article.quantite} ${medicament ? medicament.nom : 'Inconnu'}`;
      }).join(', ');

      return {
        id: sortie.id,
        date_sortie: sortie.date_sortie,
        service: sortie.service,
        employe: sortie.employe,
        patient_nom: patient_nom,
        chambre: sortie.chambre,
        memo: sortie.memo,
        articles_summary: articlesDetails,
      };
    });

    const filteredSorties = enrichedSorties.filter((s: any) => 
      s.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employe.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSorties(filteredSorties.sort((a: any, b: any) => new Date(b.date_sortie).getTime() - new Date(a.date_sortie).getTime()));
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

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
        {sorties.map((sortie: any) => (
          <SortieCard key={sortie.id} sortie={sortie} onDelete={handleDelete} />
        ))}
      </div>
      <AddSortieModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />
    </div>
  );
};

export default Sorties;