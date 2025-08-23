import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';
import type { Sortie } from '../types';

interface SortieCardProps {
  sortie: Sortie;
  onDelete: (id: string) => void;
}

const SortieCard: React.FC<SortieCardProps> = ({ sortie, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card">
      <div className="card-body-line" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="card-info">
          <span className="material-icons">person</span>
          <span>{sortie.patient_nom}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(sortie.date_sortie).toLocaleString('fr-HT')}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link">
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onDelete(sortie.id)}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">local_hospital</span> Service: {sortie.service}</p>
          <p><span className="material-icons">badge</span> Employé: {sortie.employe}</p>
          <p><span className="material-icons">king_bed</span> Chambre: {sortie.chambre}</p>
          <p><span className="material-icons">note</span> Memo: {sortie.memo}</p>
          <p><span className="material-icons">medication</span> Médicaments: {sortie.articles_summary}</p>
        </div>
      )}
    </div>
  );
};

export default SortieCard;