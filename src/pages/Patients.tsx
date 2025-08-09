import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../db';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    let query = "SELECT id, prenom, nom, nif_cin, annee_naissance, sexe, telephone, sync_status FROM patient";
    const params: (string | number)[] = [];

    if (searchTerm) {
      query += " WHERE prenom LIKE ? OR nom LIKE ?";
      params.push(`%${searchTerm}%`);
      params.push(`%${searchTerm}%`);
    }

    const result = db.exec(query, params);
    if (result.length > 0) {
      setPatients(result[0].values);
    } else {
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      const db = await getDB();
      await db.run("UPDATE patient SET sync_status = 'pending_delete', last_modified_local = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      fetchData();
    }
  };

  const handleEdit = (id: number) => {
    setSelectedPatientId(id);
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
      <h1>Patients</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajouter un patient</Button>
        <InputGroup style={{ width: '300px' }}>
          <Form.Control
            placeholder="Rechercher par prénom ou nom..."
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
            <th>Nom Complet</th>
            <th>NIF/CIN</th>
            <th>Année de naissance</th>
            <th>Sexe</th>
            <th>Téléphone</th>
            <th>Statut Sync</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={index}>
              <td>{patient[0]}</td>
              <td>{patient[1]} {patient[2]}</td>
              <td>{patient[3]}</td>
              <td>{patient[4]}</td>
              <td>{patient[5]}</td>
              <td>{patient[6] ? patient[6].toString().replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') : 'N/A'}</td>
              <td>
                {patient[7] === 'synced' && <span title="Synchronisé">✅</span>}
                {patient[7] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {patient[7] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {patient[7] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(patient[0] as number)}>Modifier</Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(patient[0] as number)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddPatientModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
      <EditPatientModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSuccess={fetchData}
        patientId={selectedPatientId}
      />
    </div>
  );
};

export default Patients;
