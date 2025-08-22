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
          <span>{entree.nom}</span>
          <span className="material-icons">add_shopping_cart</span>
          <span>Quantité: {entree.quantite}</span>
        </div>
        <div className="card-info">
            <span className="material-icons">event</span>
            <span>{new Date(entree.date_enregistrement).toLocaleString('fr-HT')}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="expanded-info">
          <hr />
          <p><span className="material-icons">date_range</span> Date d'expiration: {entree.date_expiration ? new Date(entree.date_expiration).toLocaleDateString('fr-HT') : 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default EntreeCard;