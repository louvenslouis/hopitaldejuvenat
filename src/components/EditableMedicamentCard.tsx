
import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { getDB, calculateCurrentStock } from '../db';
import './Card.css';

interface EditableMedicamentCardProps {
  medicament: any;
}

const EditableMedicamentCard: React.FC<EditableMedicamentCardProps> = ({ medicament }) => {
  const [stock, setStock] = useState<number | string>('');
  const [initialStock, setInitialStock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const medicamentId = medicament[0];
  const medicamentName = medicament[1];

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const currentStock = await calculateCurrentStock(medicamentId);
      setInitialStock(currentStock);
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

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStock(e.target.value);
    if(isSuccess) setIsSuccess(false);
  };

  const handleUpdateStock = async () => {
    const newStock = Number(stock);
    if (isNaN(newStock) || newStock === initialStock) {
      setStock(initialStock); // Reset to initial if invalid or unchanged
      return;
    }

    setIsSaving(true);
    const db = await getDB();
    const adjustment = newStock - initialStock;
    const reason = `Ajustement manuel depuis la page de stock.`;
    
    try {
      await db.run(
        "INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)",
        [medicamentId, adjustment, reason]
      );
      setInitialStock(newStock);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000); // Reset success state after 2s
    } catch (error) {
      console.error("Failed to update stock:", error);
      setStock(initialStock); // Reset on error
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
        <div className="custom-card">
            <div className="card-body-line">
                <div className="card-info">
                    <span className="material-icons">medication</span>
                    <span>{medicamentName}</span>
                </div>
                <div>Chargement du stock...</div>
            </div>
        </div>
    )
  }

  return (
    <div className={`custom-card ${isSaving ? 'saving' : ''} ${isSuccess ? 'success' : ''}`}>
      <div className="card-body-line">
        <div className="card-info">
          <span className="material-icons">medication</span>
          <span>{medicamentName}</span>
        </div>
      </div>
      <div className="expanded-info">
        <hr />
        <Form.Group>
          <Form.Label>Quantité en Stock</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={stock}
              onChange={handleStockChange}
              onBlur={handleUpdateStock}
              onFocus={(e) => e.target.select()}
              disabled={isSaving}
            />
          </InputGroup>
        </Form.Group>
      </div>
    </div>
  );
};

export default EditableMedicamentCard;
