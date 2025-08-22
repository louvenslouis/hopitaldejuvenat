import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';

const StockReport: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allMedicaments = await getCollection('liste_medicaments');
      const allStockEntries = await getCollection('stock');
      const allSortieDetails = await getCollection('sorties_details');
      const allRetours = await getCollection('retour');
      const allStockAdjustments = await getCollection('stock_adjustments');

      const calculatedStockData = allMedicaments.map((medicament: any) => {
        const totalEntrees = allStockEntries
          .filter((entry: any) => entry.article_id === medicament.id)
          .reduce((sum: number, entry: any) => sum + (entry.quantite || 0), 0);

        const totalSorties = allSortieDetails
          .filter((detail: any) => detail.article_id === medicament.id)
          .reduce((sum: number, detail: any) => sum + (detail.quantite || 0), 0);

        const totalRetours = allRetours
          .filter((retour: any) => retour.article_id === medicament.id)
          .reduce((sum: number, retour: any) => sum + (retour.quantite || 0), 0);

        const totalAdjustments = allStockAdjustments
          .filter((adjustment: any) => adjustment.article_id === medicament.id)
          .reduce((sum: number, adjustment: any) => sum + (adjustment.quantite_ajustee || 0), 0);

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