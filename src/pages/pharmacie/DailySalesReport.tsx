import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';
import type { Medicament, Sortie } from '../../types';

const DailySalesReport: React.FC = () => {
  const [dailySales, setDailySales] = useState<Array<{ date: string; total_vente: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allSorties = await getCollection<Sortie>('sorties');
      const allMedicaments = await getCollection<Medicament>('medicaments');

      const salesByDate: { [key: string]: number } = {};

      allSorties.forEach((sortie) => {
        const date = new Date(sortie.date_sortie).toISOString().split('T')[0];
        sortie.articles.forEach((article) => {
          const medicament = allMedicaments.find((med: Medicament) => med.id === article.article_id);
          if (medicament && medicament.prix !== undefined) {
            salesByDate[date] = (salesByDate[date] || 0) + (article.quantite * medicament.prix);
          }
        });
      });

      const sortedSales = Object.entries(salesByDate)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, total_vente]) => ({ date, total_vente }));

      setDailySales(sortedSales);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Rapport de Vente Journalier</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date de Sortie</th>
            <th>Total Vente</th>
          </tr>
        </thead>
        <tbody>
          {dailySales.map((sale, index) => (
            <tr key={index}>
              <td>{sale.date}</td>
              <td>{sale.total_vente.toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DailySalesReport;
