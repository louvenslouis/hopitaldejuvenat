import React from 'react';
import './Card.css';

interface SortieCardProps {
  sortie: any;
}

const SortieCard: React.FC<SortieCardProps> = ({ sortie }) => {
  return (
    <div className="custom-card">
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">person</span>
          <span>{sortie[4]}</span>
          <span className="material-icons">local_hospital</span>
          <span>Service: {sortie[2]}</span>
          <span className="material-icons">event</span>
          <span>{new Date(sortie[1]).toLocaleString('fr-HT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          <span className="material-icons">person_pin</span>
          <span>Employé: {sortie[3]}</span>
          <span className="material-icons">king_bed</span>
          <span>Chambre: {sortie[5]}</span>
          <span className="material-icons">medication</span>
          <span>Médicaments: {sortie[7]}</span>
          <span>
            Statut Sync: {sortie[6] === 'synced' && <span title="Synchronisé">✅</span>}
            {sortie[6] === 'pending_create' && <span title="En attente de création">⬆️</span>}
            {sortie[6] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
            {sortie[6] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SortieCard;
