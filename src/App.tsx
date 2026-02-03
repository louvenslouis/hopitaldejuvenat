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
import ExpiringStockReport from './pages/pharmacie/ExpiringStockReport';
import MedicamentEditor from './pages/pharmacie/MedicamentEditor';
import SortiesEditor from './pages/pharmacie/SortiesEditor';
import StockRestant from './pages/pharmacie/StockRestant';
import StockQr from './pages/pharmacie/StockQr';
import StockPublic from './pages/pharmacie/StockPublic';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import Requisition from './pages/Requisition';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const { theme } = useTheme();

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

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className={`app-layout ${theme}`}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <Header isSidebarCollapsed={isSidebarCollapsed} /> {/* Pass isSidebarCollapsed to Header */}
        <div className={`main-content-area ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
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
              <Route path="/pharmacie/expiring-stock-report" element={<ExpiringStockReport />} />
              <Route path="/pharmacie/medicaments-edit" element={<MedicamentEditor />} />
              <Route path="/pharmacie/sorties-edit" element={<SortiesEditor />} />
              <Route path="/pharmacie/stock-restant" element={<StockRestant />} />
              <Route path="/pharmacie/stock-qr" element={<StockQr />} />
              <Route path="/pharmacie/stock-public" element={<StockPublic />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/users" element={<UsersPage />} />
              <Route path="/requisition" element={<Requisition />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}


export default App;
