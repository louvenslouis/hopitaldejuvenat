import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';

interface RetourCardProps {
  retour: any;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RetourCard: React.FC<RetourCardProps> = ({ retour, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{retour[1]}</span>
          <span className="material-icons">assignment_return</span>
          <span>Quantité: {retour[2]}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link" id={`dropdown-retour-${retour[0]}`}>
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(retour[0])}>Modifier</Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(retour[0])}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">event</span> Date: {new Date(retour[3]).toLocaleString('fr-HT')}</p>
          <p>
              Statut Sync: {retour[4] === 'synced' && <span title="Synchronisé">✅</span>}
              {retour[4] === 'pending_create' && <span title="En attente de création">⬆️</span>}
              {retour[4] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
              {retour[4] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default RetourCard;