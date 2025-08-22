import React, { useState, useEffect } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { calculateCurrentStock } from '../db';
import AdjustStockModal from './AdjustStockModal';
import './Card.css';

interface MedicamentCardWithStockProps {
  medicament: any;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSuccess: () => void;
}

const MedicamentCardWithStock: React.FC<MedicamentCardWithStockProps> = ({ medicament, onEdit, onDelete, onSuccess }) => {
  const [stock, setStock] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);

  const medicamentId = medicament[0];
  const medicamentName = medicament[1];
  const lot = medicament[6];
  const expirationDate = medicament[7];

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const currentStock = await calculateCurrentStock(medicamentId);
      setStock(currentStock);
    } catch (error) {
      console.error("Failed to fetch stock for medicament:", medicamentId, error);
      setStock("Erreur"); // Display an error message
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [medicamentId]);

  if (isLoading) {
    return (
        <div className="custom-card">
            <div className="card-body">
                <div className="card-title">{medicamentName}</div>
                <div>Chargement du stock...</div>
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="custom-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="card-title">{medicamentName}</div>
            <Dropdown onClick={(e) => e.stopPropagation()}>
              <Dropdown.Toggle as={Button} variant="link" id={`dropdown-medicament-${medicamentId}`}>
                <span className="material-icons">more_vert</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onEdit(medicamentId)}>Modifier</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowAdjustStockModal(true)}>Ajuster le stock</Dropdown.Item>
                <Dropdown.Item onClick={() => onDelete(medicamentId)}>Supprimer</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <p>Stock actuel: {stock}</p>
          <p>Lot: {lot}</p>
          <p>Date d'expiration: {expirationDate}</p>
        </div>
      </div>
      <AdjustStockModal 
        show={showAdjustStockModal} 
        onHide={() => setShowAdjustStockModal(false)} 
        onSuccess={() => {
          setShowAdjustStockModal(false);
          fetchStock();
          onSuccess();
        }}
        medicamentId={medicamentId}
        currentStock={Number(stock)}
      />
    </>
  );
};

export default MedicamentCardWithStock;