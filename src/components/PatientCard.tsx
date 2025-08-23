import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import type { Patient } from '../types';

interface PatientCardProps {
  patient: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">person</span>
          <span>{patient.prenom} {patient.nom}</span>
          <span className="material-icons">cake</span>
          <span>{patient.annee_naissance}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link" id={`dropdown-patient-${patient.id}`}>
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(patient.id)}>Modifier</Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(patient.id)}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">fingerprint</span> NIF/CIN: {patient.nif_cin}</p>
          <p><span className="material-icons">wc</span> Sexe: {patient.sexe}</p>
          <p><span className="material-icons">phone</span> Téléphone: {patient.telephone ? patient.telephone.toString().replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') : 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default PatientCard;