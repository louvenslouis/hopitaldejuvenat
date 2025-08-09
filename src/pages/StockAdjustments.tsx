import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { getDB } from '../db';
import AddStockAdjustmentModal from '../components/AddStockAdjustmentModal';

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
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Médicament</th>
            <th>Quantité Ajustée</th>
            <th>Raison</th>
            <th>Date Ajustement</th>
            <th>Statut Sync</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.map((adj, index) => (
            <tr key={index}>
              <td>{adj[0]}</td>
              <td>{adj[1]}</td>
              <td>{adj[2]}</td>
              <td>{adj[3]}</td>
              <td>{new Date(adj[4]).toLocaleString('fr-HT')}</td>
              <td>
                {adj[5] === 'synced' && <span title="Synchronisé">✅</span>}
                {adj[5] === 'pending_create' && <span title="En attente de création">⬆️</span>}
                {adj[5] === 'pending_update' && <span title="En attente de mise à jour">🔄</span>}
                {adj[5] === 'pending_delete' && <span title="En attente de suppression">🗑️</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddStockAdjustmentModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchData} />
    </div>
  );
};

export default StockAdjustments;
