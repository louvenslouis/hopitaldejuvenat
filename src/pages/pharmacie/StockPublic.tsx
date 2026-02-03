import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';
import type { Medicament } from '../../types';

const StockPublic: React.FC = () => {
  const [items, setItems] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCollection<Medicament>('medicaments');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [items]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Stock actuel</h1>
          <p className="text-muted mb-0">Vue publique du stock disponible.</p>
        </div>
        <Badge bg="secondary">Actualisé: {new Date().toLocaleString('fr-HT')}</Badge>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Chargement du stock…</span>
        </div>
      ) : (
        <div className="airtable-scroll">
          <Table className="airtable-table" bordered hover responsive>
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Stock</th>
                <th>Lot</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id}>
                  <td>{item.nom}</td>
                  <td className="text-center">{item.quantite_en_stock ?? 0}</td>
                  <td>{item.lot || '—'}</td>
                  <td>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('fr-HT') : '—'}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Aucun médicament trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StockPublic;
