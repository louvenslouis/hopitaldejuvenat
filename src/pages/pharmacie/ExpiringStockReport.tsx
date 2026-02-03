import React, { useState, useEffect } from 'react';
import { Table, Form } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';
import type { Medicament } from '../../types';

const ExpiringStockReport: React.FC = () => {
  const [expiringStock, setExpiringStock] = useState<Array<Medicament & { expiration_date: string }>>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      const allMedicaments = await getCollection<Medicament>('medicaments');
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() + days);

      const filteredExpiringStock = allMedicaments
        .filter((med): med is Medicament & { expiration_date: string } => {
          if (!med.expiration_date) return false;
          return new Date(med.expiration_date) <= dateLimit;
        })
        .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

      setExpiringStock(filteredExpiringStock);
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
          {expiringStock.map((item) => (
            <tr key={item.id}>
              <td>{item.nom}</td>
              <td>{item.quantite_en_stock}</td>
              <td>{new Date(item.expiration_date).toLocaleDateString('fr-HT')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ExpiringStockReport;
