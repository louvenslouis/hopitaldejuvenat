import React from 'react';
import './Card.css';

interface StockAdjustmentCardProps {
  adjustment: any;
}

const StockAdjustmentCard: React.FC<StockAdjustmentCardProps> = ({ adjustment }) => {
  return (
    <div className="custom-card">
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{adjustment[1]}</span>
          <span className="material-icons">sync_alt</span>
          <span>Quantité ajustée: {adjustment[2]}</span>
          <span className="material-icons">event</span>
          <span>{new Date(adjustment[4]).toLocaleString('fr-HT')}</span>
          <span className="material-icons">help_outline</span>
          <span>Raison: {adjustment[3]}</span>
          <span>
            Statut Sync: {adjustment[5] === 'synced' && <span title="Synchronisé">✅</span>}
            {adjustment[5] === 'pending_create' && <span title="En attente de création">⬆️</span>}
            {adjustment[5] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
            {adjustment[5] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentCard;
