import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { getDB } from '../db';

const DailySalesReport: React.FC = () => {
  const [dailySales, setDailySales] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();
      const result = db.exec(`
        SELECT
          s.date_sortie,
          SUM(sd.quantite * lm.prix) AS total_vente
        FROM sorties s
        JOIN sorties_details sd ON s.id = sd.sortie_id
        JOIN liste_medicaments lm ON sd.article_id = lm.id
        GROUP BY s.date_sortie
        ORDER BY s.date_sortie DESC
      `);
      if (result.length > 0) {
        setDailySales(result[0].values);
      } else {
        setDailySales([]);
      }
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
              <td>{sale[0]}</td>
              <td>{sale[1].toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DailySalesReport;
