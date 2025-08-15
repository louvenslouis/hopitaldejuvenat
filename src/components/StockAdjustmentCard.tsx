import React, { useState } from 'react';
import './Card.css';

interface StockAdjustmentCardProps {
  adjustment: any;
}

const StockAdjustmentCard: React.FC<StockAdjustmentCardProps> = ({ adjustment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="custom-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{adjustment[1]}</span>
          <span className="material-icons">sync_alt</span>
          <span>Quantité ajustée: {adjustment[2]}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(adjustment[4]).toLocaleString('fr-HT')}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">help_outline</span> Raison: {adjustment[3]}</p>
          <p>
              Statut Sync: {adjustment[5] === 'synced' && <span title="Synchronisé">✅</span>}
              {adjustment[5] === 'pending_create' && <span title="En attente de création">⬆️</span>}
              {adjustment[5] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
              {adjustment[5] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentCard;