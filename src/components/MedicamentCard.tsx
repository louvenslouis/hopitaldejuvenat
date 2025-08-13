import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';

interface MedicamentCardProps {
  medicament: any;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const MedicamentCard: React.FC<MedicamentCardProps> = ({ medicament, onEdit, onDelete }) => {
  return (
    <div className="custom-card">
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{medicament[1]}</span>
          <span className="material-icons">inventory</span>
          <span>Stock: {medicament[5]}</span>
          <span className="material-icons">euro_symbol</span>
          <span>Prix: {medicament[2].toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</span>
          <span className="material-icons">category</span>
          <span>Type: {medicament[3]}</span>
          <span className="material-icons">local_offer</span>
          <span>Présentation: {medicament[4]}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link" id={`dropdown-medicament-${medicament[0]}`}>
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(medicament[0])}>Modifier</Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(medicament[0])}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default MedicamentCard;
