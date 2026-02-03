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
              Statut Sync:
              {adjustment[5] === 'synced' && (
                <span className="material-icons text-success ms-2" title="Synchronisé">check_circle</span>
              )}
              {adjustment[5] === 'pending_create' && (
                <span className="material-icons text-warning ms-2" title="En attente de création">cloud_upload</span>
              )}
              {adjustment[5] === 'pending_update' && (
                <span className="material-icons text-primary ms-2" title="En attente de mise à jour">sync</span>
              )}
              {adjustment[5] === 'pending_delete' && (
                <span className="material-icons text-danger ms-2" title="En attente de suppression">delete</span>
              )}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentCard;
