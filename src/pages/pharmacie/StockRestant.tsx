import React, { useEffect, useState } from 'react';
import { Button, Form, Table, Spinner } from 'react-bootstrap';
import { addDocument, getCollection, updateDocument } from '../../firebase/firestoreService';
import type { Medicament } from '../../types';

type StockRow = Medicament & {
  currentStock: number;
  draftStock: number;
  reason: string;
};

const StockRestant: React.FC = () => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    const data = await getCollection('medicaments') as Medicament[];
    const mapped = data.map((med) => ({
      ...med,
      currentStock: med.quantite_en_stock ?? 0,
      draftStock: med.quantite_en_stock ?? 0,
      reason: '',
    }));
    setRows(mapped);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFieldChange = (id: string, field: keyof StockRow, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSavingId(id);
    const adjustment = row.draftStock - row.currentStock;
    await updateDocument('medicaments', id, {
      quantite_en_stock: row.draftStock,
      updated_at: new Date().toISOString(),
    });
    if (adjustment !== 0) {
      await addDocument('stock_adjustments', {
        article_id: id,
        quantite_ajustee: adjustment,
        raison: row.reason || 'Ajustement manuel (table)',
        date_ajustement: new Date().toISOString(),
      });
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, currentStock: r.draftStock, reason: '' }
          : r
      )
    );
    setSavingId(null);
  };

  const handleReset = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, draftStock: r.currentStock, reason: '' } : r
      )
    );
  };

  return (
    <div>
      <h1>Stock restant</h1>
      <div className="airtable-scroll">
        <Table className="airtable-table" bordered hover responsive>
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Stock actuel</th>
              <th>Nouveau stock</th>
              <th>Raison</th>
              <th className="airtable-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.nom}</td>
                <td className="text-center">{row.currentStock}</td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    type="number"
                    value={row.draftStock}
                    onChange={(e) => handleFieldChange(row.id, 'draftStock', e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    value={row.reason}
                    placeholder="Ex: inventaire"
                    onChange={(e) => handleFieldChange(row.id, 'reason', e.target.value)}
                  />
                </td>
                <td className="airtable-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleSave(row.id)}
                    disabled={savingId === row.id}
                  >
                    {savingId === row.id ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Sauvegarde
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleReset(row.id)}
                    disabled={savingId === row.id}
                  >
                    Réinitialiser
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Aucun médicament trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default StockRestant;
