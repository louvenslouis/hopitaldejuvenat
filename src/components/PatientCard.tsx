import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';

interface PatientCardProps {
  patient: any;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete }) => {
  return (
    <div className="custom-card">
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">person</span>
          <span>{patient[1]} {patient[2]}</span>
          <span className="material-icons">cake</span>
          <span>{patient[4]}</span>
          <span className="material-icons">fingerprint</span>
          <span>NIF/CIN: {patient[3]}</span>
          <span className="material-icons">wc</span>
          <span>Sexe: {patient[5]}</span>
          <span className="material-icons">phone</span>
          <span>Téléphone: {patient[6] ? patient[6].toString().replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') : 'N/A'}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link" id={`dropdown-patient-${patient[0]}`}>
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(patient[0])}>Modifier</Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(patient[0])}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default PatientCard;
