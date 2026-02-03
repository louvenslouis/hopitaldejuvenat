import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';
import type { Medicament, Retour, Sortie } from '../../types';

const StockReport: React.FC = () => {
  const [stockData, setStockData] = useState<Array<{
    id: string;
    nom: string;
    prix: number;
    type: string;
    presentation: string;
    totalEntrees: number;
    totalSorties: number;
    totalRetours: number;
    currentStock: number;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allMedicaments = await getCollection<Medicament>('medicaments');
      const allStockEntries = await getCollection<{ id: string; article_id: string; quantite?: number }>('stock');
      const allSorties = await getCollection<Sortie>('sorties');
      const allRetours = await getCollection<Retour>('retour');
      const allStockAdjustments = await getCollection<{ id: string; article_id: string; quantite_ajustee?: number }>('stock_adjustments');

      const calculatedStockData = allMedicaments.map((medicament) => {
        const totalEntrees = allStockEntries
          .filter((entry) => entry.article_id === medicament.id)
          .reduce((sum, entry) => sum + (entry.quantite || 0), 0);

        const totalSorties = allSorties
          .flatMap((sortie) => sortie.articles || [])
          .filter((detail) => detail.article_id === medicament.id)
          .reduce((sum, detail) => sum + (detail.quantite || 0), 0);

        const totalRetours = allRetours
          .filter((retour) => retour.article_id === medicament.id)
          .reduce((sum, retour) => sum + (retour.quantite || 0), 0);

        const totalAdjustments = allStockAdjustments
          .filter((adjustment) => adjustment.article_id === medicament.id)
          .reduce((sum, adjustment) => sum + (adjustment.quantite_ajustee || 0), 0);

        const currentStock = totalEntrees - totalSorties + totalRetours + totalAdjustments;

        return {
          id: medicament.id,
          nom: medicament.nom,
          prix: medicament.prix,
          type: medicament.type,
          presentation: medicament.presentation,
          totalEntrees: totalEntrees,
          totalSorties: totalSorties,
          totalRetours: totalRetours,
          currentStock: currentStock,
        };
      });
      setStockData(calculatedStockData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Rapport de Stock Actuel</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom Médicament</th>
            <th>Prix</th>
            <th>Type</th>
            <th>Présentation</th>
            <th>Total Entrées</th>
            <th>Total Sorties</th>
            <th>Total Retours</th>
            <th>Stock Actuel</th>
          </tr>
        </thead>
        <tbody>
          {stockData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nom}</td>
              <td>{item.prix.toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</td>
              <td>{item.type}</td>
              <td>{item.presentation}</td>
              <td>{item.totalEntrees}</td>
              <td>{item.totalSorties}</td>
              <td>{item.totalRetours}</td>
              <td>{item.currentStock}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StockReport;
