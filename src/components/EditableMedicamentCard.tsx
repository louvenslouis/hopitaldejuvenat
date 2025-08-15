
import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { getDB, calculateCurrentStock } from '../db';
import './Card.css';

interface EditableMedicamentCardProps {
  medicament: any;
}

const EditableMedicamentCard: React.FC<EditableMedicamentCardProps> = ({ medicament }) => {
  const [stock, setStock] = useState<number | string>('');
  const [initialStock, setInitialStock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const medicamentId = medicament[0];
  const medicamentName = medicament[1];

  useEffect(() => {
    const fetchStock = async () => {
      setIsLoading(true);
      const currentStock = await calculateCurrentStock(medicamentId);
      setInitialStock(currentStock);
      setStock(currentStock);
      setIsLoading(false);
    };
    fetchStock();
  }, [medicamentId]);

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStock(e.target.value);
  };

  const handleSave = async () => {
    const newStock = Number(stock);
    if (!isNaN(newStock) && newStock !== initialStock) {
      const db = await getDB();
      const adjustment = newStock - initialStock;
      const reason = `Ajustement manuel depuis la page de stock.`;
      await db.run(
        "INSERT INTO stock_adjustments (article_id, quantite_ajustee, raison, sync_status, last_modified_local) VALUES (?, ?, ?, 'pending_create', CURRENT_TIMESTAMP)",
        [medicamentId, adjustment, reason]
      );
      setInitialStock(newStock);
      alert('Stock mis à jour avec succès !');
    }
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
    <div className="custom-card">
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
              onFocus={(e) => e.target.select()}
            />
            <Button variant="success" onClick={handleSave} disabled={Number(stock) === initialStock}>
              Enregistrer
            </Button>
          </InputGroup>
        </Form.Group>
      </div>
    </div>
  );
};

export default EditableMedicamentCard;
