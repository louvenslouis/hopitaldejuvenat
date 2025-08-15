import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { getDB } from '../../db';
import AddStockAdjustmentModal from '../../components/AddStockAdjustmentModal';
import StockAdjustmentCard from '../../components/StockAdjustmentCard';

const StockAdjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    const db = await getDB();
    const result = db.exec("SELECT sa.id, lm.nom, sa.quantite_ajustee, sa.raison, sa.date_ajustement, sa.sync_status FROM stock_adjustments sa JOIN liste_medicaments lm ON sa.article_id = lm.id ORDER BY sa.date_ajustement DESC");
    if (result.length > 0) {
      setAdjustments(result[0].values);
    } else {
      setAdjustments([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Ajustements de Stock</h1>
      <Button variant="primary" className="mb-3" onClick={() => setShowAddModal(true)}>Nouvel Ajustement</Button>
      <div className="card-grid">
        {adjustments.map((adj, index) => (
          <StockAdjustmentCard key={index} adjustment={adj} />
        ))}
      </div>
      <AddStockAdjustmentModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
    </div>
  );
};

export default StockAdjustments;
