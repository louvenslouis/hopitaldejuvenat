
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ServiceSelectorPage from './pages/ServiceSelectorPage';
import Dashboard from './pages/pharmacie/Dashboard';
import Medicaments from './pages/pharmacie/Medicaments';
import Patients from './pages/pharmacie/Patients';
import Entrees from './pages/pharmacie/Entrees';
import Sorties from './pages/pharmacie/Sorties';
import Retour from './pages/pharmacie/Retour';
import StockReport from './pages/pharmacie/StockReport';
import DailySalesReport from './pages/pharmacie/DailySalesReport';
import StockAdjustments from './pages/pharmacie/StockAdjustments';
import ExpiringStockReport from './pages/pharmacie/ExpiringStockReport';
import { useSync } from './contexts/SyncContext';
import './App.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const { runSync } = useSync();

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Run sync on initial load
    runSync();

    // Set up periodic sync every 5 minutes
    const intervalId = setInterval(runSync, 5 * 60 * 1000);

    // Set up online/offline event listeners
    window.addEventListener('online', runSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', runSync);
    };
  }, [runSync]);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className={`main-content-area ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ServiceSelectorPage />} />
              <Route path="/pharmacie/dashboard" element={<Dashboard />} />
              <Route path="/pharmacie/medicaments" element={<Medicaments />} />
              <Route path="/pharmacie/patients" element={<Patients />} />
              <Route path="/pharmacie/entrees" element={<Entrees />} />
              <Route path="/pharmacie/sorties" element={<Sorties />} />
              <Route path="/pharmacie/retour" element={<Retour />} />
              <Route path="/pharmacie/stock-report" element={<StockReport />} />
              <Route path="/pharmacie/daily-sales-report" element={<DailySalesReport />} />
              <Route path="/pharmacie/stock-adjustments" element={<StockAdjustments />} />
              <Route path="/pharmacie/expiring-stock-report" element={<ExpiringStockReport />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}


export default App;