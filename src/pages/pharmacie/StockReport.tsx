import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { getDB } from '../../db';

const StockReport: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();
      const result = db.exec("SELECT * FROM v_stock_actuel");
      if (result.length > 0) {
        setStockData(result[0].values);
      } else {
        setStockData([]);
      }
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
          {stockData.map((item, index) => (
            <tr key={index}>
              <td>{item[0]}</td>
              <td>{item[1]}</td>
              <td>{item[2].toLocaleString('fr-HT', { style: 'currency', currency: 'HTG' })}</td>
              <td>{item[3]}</td>
              <td>{item[4]}</td>
              <td>{item[5]}</td>
              <td>{item[6]}</td>
              <td>{item[7]}</td>
              <td>{item[8]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StockReport;
