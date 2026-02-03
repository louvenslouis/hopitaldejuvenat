import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getCollection, deleteDocument } from '../../firebase/firestoreService';
import AddPatientModal from '../../components/AddPatientModal';
import EditPatientModal from '../../components/EditPatientModal';
import PatientCard from '../../components/PatientCard';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const allPatients = await getCollection('patient');
    const filteredPatients = allPatients.filter((p: any) => 
      `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPatients(filteredPatients);
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      await deleteDocument('patient', id);
      fetchData();
    }
  };

  const handleEdit = (id: string) => {
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
        <InputGroup className="search-group">
          <Form.Control
            placeholder="Rechercher par prénom ou nom..."
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
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} onEdit={handleEdit} onDelete={handleDelete} />
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
