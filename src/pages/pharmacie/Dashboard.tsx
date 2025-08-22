import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { getCollection } from '../../firebase/firestoreService';
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
      // Expiring soon (in the next 30 days)
      const allMedicaments = await getCollection('liste_medicaments');
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      setExpiringSoon(allMedicaments.filter((med: any) => med.expiration_date && new Date(med.expiration_date) <= thirtyDaysFromNow));

      // Out of stock
      setOutOfStock(allMedicaments.filter((med: any) => med.quantite_en_stock <= 0));

      // Low stock (< 10)
      setLowStock(allMedicaments.filter((med: any) => med.quantite_en_stock > 0 && med.quantite_en_stock < 10));

      // Top 5 sold medicaments in the last 30 days
      const allSorties = await getCollection('sorties');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesData: { [key: string]: number } = {};
      allSorties.forEach((sortie: any) => {
        if (new Date(sortie.date_sortie) >= thirtyDaysAgo) {
          sortie.articles.forEach((article: any) => {
            const medicament = allMedicaments.find((med: any) => med.id === article.article_id);
            if (medicament) {
              salesData[medicament.nom] = (salesData[medicament.nom] || 0) + article.quantite;
            }
          });
        }
      });
      const sortedSales = Object.entries(salesData)
        .sort(([, quantityA], [, quantityB]) => (quantityB as number) - (quantityA as number))
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));
      setTopSold(sortedSales);

      // Sorties per day for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dailySorties: { [key: string]: number } = {};
      allSorties.forEach((sortie: any) => {
        const date = new Date(sortie.date_sortie).toISOString().split('T')[0];
        if (new Date(date) >= sevenDaysAgo) {
          dailySorties[date] = (dailySorties[date] || 0) + 1;
        }
      });
      const sortedDailySorties = Object.entries(dailySorties)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, count]) => ({ date, count }));
      setSortiesPerDay(sortedDailySorties);

      // Recent 5 sorties
      const allPatients = await getCollection('patient');
      const recentSortiesData = allSorties
        .sort((a: any, b: any) => new Date(b.date_sortie).getTime() - new Date(a.date_sortie).getTime())
        .slice(0, 5)
        .map((sortie: any) => ({
          date_sortie: sortie.date_sortie,
          service: sortie.service,
          employe: sortie.employe,
          patient_nom: allPatients.find((p: any) => p.id === sortie.patient_id)?.nom || 'N/A',
        }));
      setRecentSorties(recentSortiesData);
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
            {lowStock.map((med: any) => (
              <li key={med.id}>{med.nom} (Stock: {med.quantite_en_stock})</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;