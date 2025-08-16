
import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import './Card.css';

interface SortieCardProps {
  sortie: any;
  onDelete: (id: number) => void;
}

const SortieCard: React.FC<SortieCardProps> = ({ sortie, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortieId = sortie[0];
  const dateSortie = sortie[1];
  const service = sortie[2];
  const employe = sortie[3];
  const patientNom = sortie[4] ? `${sortie[4]}` : 'N/A'; // Assuming patient name is at index 4
  const syncStatus = sortie[6];

  return (
    <div className="custom-card">
      <div className="card-body-line" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="card-info">
          <span className="material-icons">person</span>
          <span>{patientNom}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(dateSortie).toLocaleString('fr-HT')}</span>
        </div>
        <Dropdown onClick={(e) => e.stopPropagation()}>
          <Dropdown.Toggle as={Button} variant="link">
            <span className="material-icons">more_vert</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onDelete(sortieId)}>Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">local_hospital</span> Service: {service}</p>
          <p><span className="material-icons">badge</span> Employé: {employe}</p>
          <p><span className="material-icons">king_bed</span> Chambre: {sortie[5]}</p>
          <p><span className="material-icons">medication</span> Médicaments: {sortie[7]}</p>
          <p>
              Statut Sync: {syncStatus === 'synced' && <span title="Synchronisé">✅</span>}
              {syncStatus === 'pending_create' && <span title="En attente de création">⬆️</span>}
              {syncStatus === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
              {syncStatus === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default SortieCard;
