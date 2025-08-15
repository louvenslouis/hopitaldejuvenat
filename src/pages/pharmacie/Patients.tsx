import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getDB } from '../../db';
import AddPatientModal from '../../components/AddPatientModal';
import EditPatientModal from '../../components/EditPatientModal';
import PatientCard from '../../components/PatientCard';

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
      query += " WHERE prenom || ' ' || nom LIKE ?";
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
      <div className="card-grid">
        {patients.map((patient, index) => (
          <PatientCard key={index} patient={patient} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
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