import React from 'react';
import './Card.css';

interface EntreeCardProps {
  entree: any;
  // No actions for entrees
}

const EntreeCard: React.FC<EntreeCardProps> = ({ entree }) => {
  return (
    <div className="custom-card">
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{entree[3]}</span>
          <span className="material-icons">add_shopping_cart</span>
          <span>Quantité: {entree[1]}</span>
          <span className="material-icons">event</span>
          <span>{new Date(entree[2]).toLocaleString('fr-HT')}</span>
          <span className="material-icons">date_range</span>
          <span>Expiration: {entree[5] ? new Date(entree[5]).toLocaleDateString('fr-HT') : 'N/A'}</span>
          <span>
            Statut Sync: {entree[4] === 'synced' && <span title="Synchronisé">✅</span>}
            {entree[4] === 'pending_create' && <span title="En attente de création">⬆️</span>}
            {entree[4] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
            {entree[4] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EntreeCard;
