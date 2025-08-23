import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';
import type { Retour } from '../types';

interface RetourCardProps {
  retour: Retour;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const RetourCard: React.FC<RetourCardProps> = ({ retour, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{retour.nom}</span>
          <span className="material-icons">assignment_return</span>
          <span>Quantité: {retour.quantite}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(retour.date_enregistrement).toLocaleString('fr-HT')}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link" id={`dropdown-retour-${retour.id}`}>
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(retour.id)}>Modifier</Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(retour.id)}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">event</span> Date: {new Date(retour.date_enregistrement).toLocaleString('fr-HT')}</p>
        </div>
      )}
    </div>
  );
};

export default RetourCard;