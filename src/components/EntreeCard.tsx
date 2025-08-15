import React, { useState } from 'react';
import './Card.css';

interface EntreeCardProps {
  entree: any;
  // No actions for entrees
}

const EntreeCard: React.FC<EntreeCardProps> = ({ entree }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{entree[3]}</span>
          <span className="material-icons">add_shopping_cart</span>
          <span>Quantité: {entree[1]}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(entree[2]).toLocaleString('fr-HT')}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">date_range</span> Date d'expiration: {entree[5] ? new Date(entree[5]).toLocaleDateString('fr-HT') : 'N/A'}</p>
          <p>
              Statut Sync: {entree[4] === 'synced' && <span title="Synchronisé">✅</span>}
              {entree[4] === 'pending_create' && <span title="En attente de création">⬆️</span>}
              {entree[4] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
              {entree[4] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default EntreeCard;