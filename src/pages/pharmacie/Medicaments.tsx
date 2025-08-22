import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../../db';
import AddMedicamentModal from '../../components/AddMedicamentModal';
import EditMedicamentModal from '../../components/EditMedicamentModal';
import MedicamentCardWithStock from '../../components/MedicamentCardWithStock';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Medicaments: React.FC = () => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicamentId, setSelectedMedicamentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    let query = "SELECT id, nom, prix, type, presentation, quantite_en_stock, created_at, updated_at, firestore_doc_id, sync_status, last_modified_local FROM liste_medicaments";
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += " WHERE LOWER(nom) LIKE LOWER(?)";
      params.push(`%${searchTerm}%`);
    }

    const result = db.exec(query, params);
    if (result.length > 0) {
      setMedicaments(result[0].values);
    } else {
      setMedicaments([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      const db = await getDB();
      await db.run("UPDATE liste_medicaments SET sync_status = 'pending_delete', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      fetchData();
    }
  };

  const handleEdit = (id: number) => {
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
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['Nom', 'Quantité en Stock']],
      body: medicaments.map(m => [m[1], m[5]]),
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
        <InputGroup style={{ width: '300px' }}>
          <Form.Control
            placeholder="Rechercher par nom..."
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
        {medicaments.map((medicament, index) => (
          <MedicamentCardWithStock key={index} medicament={medicament} onEdit={handleEdit} onDelete={handleDelete} onSuccess={fetchData} />
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