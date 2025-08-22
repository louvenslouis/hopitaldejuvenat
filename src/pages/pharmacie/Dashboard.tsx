import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { getDB } from '../../db';
import KpiCard from '../../components/dashboard/KpiCard';
import TopSoldMedicamentsChart from '../../components/dashboard/TopSoldMedicamentsChart';
import SortiesPerDayChart from '../../components/dashboard/SortiesPerDayChart';
import RecentSortiesTable from '../../components/dashboard/RecentSortiesTable';

const Dashboard: React.FC = () => {
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [outOfStock, setOutOfStock] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [topSold, setTopSold] = useState<any[]>([]);
  const [sortiesPerDay, setSortiesPerDay] = useState<any[]>([]);
  const [recentSorties, setRecentSorties] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDB();

      // Expiring soon (in the next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoonResult = db.exec("SELECT nom, expiration_date FROM liste_medicaments WHERE expiration_date <= ? ORDER BY expiration_date ASC", [thirtyDaysFromNow.toISOString()]);
      if (expiringSoonResult.length > 0) {
        setExpiringSoon(expiringSoonResult[0].values);
      }

      // Out of stock
      const outOfStockResult = db.exec("SELECT nom FROM liste_medicaments WHERE quantite_en_stock <= 0");
      if (outOfStockResult.length > 0) {
        setOutOfStock(outOfStockResult[0].values);
      }

      // Low stock (< 10)
      const lowStockResult = db.exec("SELECT nom, quantite_en_stock FROM liste_medicaments WHERE quantite_en_stock > 0 AND quantite_en_stock < 10 ORDER BY quantite_en_stock ASC");
      if (lowStockResult.length > 0) {
        setLowStock(lowStockResult[0].values);
      }

      // Top 5 sold medicaments in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const topSoldResult = db.exec(`
        SELECT lm.nom, SUM(sd.quantite) as total_quantity
        FROM sorties_details sd
        JOIN liste_medicaments lm ON sd.article_id = lm.id
        JOIN sorties s ON sd.sortie_id = s.id
        WHERE s.date_sortie >= ?
        GROUP BY lm.nom
        ORDER BY total_quantity DESC
        LIMIT 5
      `, [thirtyDaysAgo.toISOString()]);
      if (topSoldResult.length > 0) {
        setTopSold(topSoldResult[0].values.map((row: any) => ({ name: row[0], quantity: row[1] })));
      }

      // Sorties per day for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sortiesPerDayResult = db.exec(`
        SELECT date(date_sortie) as date, COUNT(*) as count
        FROM sorties
        WHERE date(date_sortie) >= date(?)
        GROUP BY date(date_sortie)
        ORDER BY date(date_sortie) ASC
      `, [sevenDaysAgo.toISOString()]);
      if (sortiesPerDayResult.length > 0) {
        setSortiesPerDay(sortiesPerDayResult[0].values.map((row: any) => ({ date: row[0], count: row[1] })));
      }

      // Recent 5 sorties
      const recentSortiesResult = db.exec(`
        SELECT s.date_sortie, s.service, s.employe, p.nom as patient_nom
        FROM sorties s
        LEFT JOIN patient p ON s.patient_id = p.id
        ORDER BY s.date_sortie DESC
        LIMIT 5
      `);
      if (recentSortiesResult.length > 0) {
        setRecentSorties(recentSortiesResult[0].values.map((row: any) => ({ date_sortie: row[0], service: row[1], employe: row[2], patient_nom: row[3] })));
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <Row>
        <Col md={4}><KpiCard title="Expirant Bientôt" value={expiringSoon.length} icon="warning" /></Col>
        <Col md={4}><KpiCard title="En Rupture" value={outOfStock.length} icon="error" /></Col>
        <Col md={4}><KpiCard title="Stock Faible" value={lowStock.length} icon="inventory_2" /></Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <h4>Top 5 des médicaments les plus vendus (30 derniers jours)</h4>
          <TopSoldMedicamentsChart data={topSold} />
        </Col>
        <Col md={6}>
          <h4>Sorties par jour (7 derniers jours)</h4>
          <SortiesPerDayChart data={sortiesPerDay} />
        </Col>
      </Row>

      <h4 className="mt-4">Sorties Récentes</h4>
      <RecentSortiesTable data={recentSorties} />

      {lowStock.length > 0 && (
        <Alert variant="warning" className="mt-4">
          <h5>⚠️ Médicaments à faible stock:</h5>
          <ul>
            {lowStock.map((med, index) => (
              <li key={index}>{med[0]} (Stock: {med[1]})</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;