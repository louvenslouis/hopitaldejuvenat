import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddMedicamentModal from '../../components/AddMedicamentModal';
import EditMedicamentModal from '../../components/EditMedicamentModal';
import MedicamentCardWithStock from '../../components/MedicamentCardWithStock';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Medicament } from '../../types';

const Medicaments: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicamentId, setSelectedMedicamentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    const allMedicaments = await getCollection<Medicament>('medicaments');
    const filteredMedicaments = allMedicaments.filter((m) =>
      m.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMedicaments(filteredMedicaments);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      await deleteDocument('medicaments', id);
      fetchData();
    }
  };

  const handleEdit = (id: string) => {
    setSelectedMedicamentId(id);
    setShowEditModal(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleDownloadPDF = () => {
    type JsPdfWithAutoTable = jsPDF & {
      autoTable: (options: { head: string[][]; body: Array<Array<string | number>> }) => void;
    };
    const doc = new jsPDF() as JsPdfWithAutoTable;
    doc.autoTable({
      head: [['Nom', 'Quantité en Stock']],
      body: medicaments.map((m) => [m.nom, m.quantite_en_stock]),
    });
    doc.save('medicaments.pdf');
  };

  return (
    <div>
      <h1>Médicaments</h1>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajouter un médicament</Button>
          <Button variant="info" className="ms-2" onClick={handleDownloadPDF}>Télécharger PDF</Button>
        </div>
        <InputGroup className="search-group">
          <Form.Control
            placeholder="Rechercher par nom..."
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
      <div className="card-grid">
        {medicaments.map((medicament) => (
          <MedicamentCardWithStock key={medicament.id} medicament={medicament} onEdit={handleEdit} onDelete={handleDelete} onSuccess={fetchData} />
        ))}
      </div>
      <AddMedicamentModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
      <EditMedicamentModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSuccess={fetchData}
        medicamentId={selectedMedicamentId}
      />
    </div>
  );
};

export default Medicaments;
