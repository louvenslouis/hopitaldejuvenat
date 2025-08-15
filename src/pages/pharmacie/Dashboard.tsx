import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { getDB } from '../../db';

const Dashboard: React.FC = () => {
  const [totalMedicaments, setTotalMedicaments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalStockItems, setTotalStockItems] = useState(0);
  const [totalSorties, setTotalSorties] = useState(0);
  const [totalRetours, setTotalRetours] = useState(0);
  const [lowStockMedicaments, setLowStockMedicaments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();

      // Total Medicaments
      const medicamentsResult = db.exec("SELECT COUNT(*) FROM liste_medicaments");
      setTotalMedicaments(Number(medicamentsResult[0]?.values[0][0]) || 0);

      // Total Patients
      const patientsResult = db.exec("SELECT COUNT(*) FROM patient");
      setTotalPatients(Number(patientsResult[0]?.values[0][0]) || 0);

      // Total Stock Items (sum of quantities)
      const stockResult = db.exec("SELECT COALESCE(SUM(quantite), 0) FROM stock");
      setTotalStockItems(Number(stockResult[0]?.values[0][0]) || 0);

      // Total Sorties
      const sortiesResult = db.exec("SELECT COUNT(*) FROM sorties");
      setTotalSorties(Number(sortiesResult[0]?.values[0][0]) || 0);

      // Total Retours
      const retoursResult = db.exec("SELECT COUNT(*) FROM retour");
      setTotalRetours(Number(retoursResult[0]?.values[0][0]) || 0);

      // Low Stock Medicaments (stock_actuel < 10)
      const lowStockResult = db.exec("SELECT nom, quantite_en_stock FROM liste_medicaments WHERE quantite_en_stock < 10 ORDER BY quantite_en_stock ASC");
      if (lowStockResult.length > 0) {
        setLowStockMedicaments(lowStockResult[0].values);
      } else {
        setLowStockMedicaments([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <Row>
        <Col md={4} className="mb-4">
          <Card bg="primary" text="white" className="text-center p-3">
            <Card.Body>
              <Card.Title>Médicaments</Card.Title>
              <Card.Text className="display-4">{totalMedicaments}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="success" text="white" className="text-center p-3">
            <Card.Body>
              <Card.Title>Patients</Card.Title>
              <Card.Text className="display-4">{totalPatients}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="info" text="white" className="text-center p-3">
            <Card.Body>
              <Card.Title>Articles en Stock</Card.Title>
              <Card.Text className="display-4">{totalStockItems}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="warning" text="white" className="text-center p-3">
            <Card.Body>
              <Card.Title>Sorties</Card.Title>
              <Card.Text className="display-4">{totalSorties}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="danger" text="white" className="text-center p-3">
            <Card.Body>
              <Card.Title>Retours</Card.Title>
              <Card.Text className="display-4">{totalRetours}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {lowStockMedicaments.length > 0 && (
        <Alert variant="warning" className="mt-4">
          <h5>⚠️ Médicaments à faible stock:</h5>
          <ul>
            {lowStockMedicaments.map((med, index) => (
              <li key={index}>{med[0]} (Stock: {med[1]})</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;
