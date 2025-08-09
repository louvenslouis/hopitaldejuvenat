import React, { useState, useEffect } from 'react';
import { Table, Form } from 'react-bootstrap';
import { getDB } from '../db';

const ExpiringStockReport: React.FC = () => {
  const [expiringStock, setExpiringStock] = useState<any[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() + days);
      const dateLimitString = dateLimit.toISOString().split('T')[0];

      const result = db.exec(`
        SELECT 
          lm.nom,
          s.quantite,
          s.date_expiration
        FROM stock s
        JOIN liste_medicaments lm ON s.article_id = lm.id
        WHERE s.date_expiration IS NOT NULL AND s.date_expiration <= ?
        ORDER BY s.date_expiration ASC
      `, [dateLimitString]);

      if (result.length > 0) {
        setExpiringStock(result[0].values);
      } else {
        setExpiringStock([]);
      }
    };

    fetchData();
  }, [days]);

  return (
    <div>
      <h1>Rapport de Stock Expirant</h1>
      <Form.Group className="mb-3" style={{ width: '200px' }}>
        <Form.Label>Voir les produits expirants dans les</Form.Label>
        <Form.Control 
          type="number" 
          value={days} 
          onChange={e => setDays(Number(e.target.value))} 
        />
        <Form.Text>jours</Form.Text>
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nom Médicament</th>
            <th>Quantité en Stock</th>
            <th>Date d'expiration</th>
          </tr>
        </thead>
        <tbody>
          {expiringStock.map((item, index) => (
            <tr key={index}>
              <td>{item[0]}</td>
              <td>{item[1]}</td>
              <td>{new Date(item[2]).toLocaleDateString('fr-HT')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ExpiringStockReport;
