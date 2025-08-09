import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';
import AddMedicamentModal from '../components/AddMedicamentModal';
import EditMedicamentModal from '../components/EditMedicamentModal';
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
      query += " WHERE nom LIKE ?";
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
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Type</th>
            <th>Présentation</th>
            <th>Stock Actuel</th>
            <th>Statut Sync</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicaments.map((medicament, index) => (
            <tr key={index}>
              <td>{medicament[0]}</td>
              <td>{medicament[1]}</td>
              <td>{medicament[2].toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</td>
              <td>{medicament[3]}</td>
              <td>{medicament[4]}</td>
              <td>{medicament[5]}</td>
              <td>
                {medicament[9] === 'synced' && <span title="Synchronisé">✅</span>}
                {medicament[9] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {medicament[9] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {medicament[9] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(medicament[0] as number)}>Modifier</Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(medicament[0] as number)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
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