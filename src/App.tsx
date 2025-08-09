import { useState, useEffect, useRef } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getDB } from './db';
import Dashboard from './pages/Dashboard';
import Medicaments from './pages/Medicaments';
import Patients from './pages/Patients';
import Entrees from './pages/Entrees';
import Sorties from './pages/Sorties';
import Retour from './pages/Retour';
import StockReport from './pages/StockReport';
import DailySalesReport from './pages/DailySalesReport';
import StockAdjustments from './pages/StockAdjustments';
import ExpiringStockReport from './pages/ExpiringStockReport';
import Sidebar from './components/Sidebar';
import { syncData } from './services/syncService';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isSyncingRef = useRef(false); // To prevent multiple syncs at once

  useEffect(() => {
    const initialize = async () => {
      try {
        await getDB();
        
        // Initial sync
        if (!isSyncingRef.current) {
          isSyncingRef.current = true;
          setSyncStatus('syncing');
          try {
            await syncData();
            setSyncStatus('synced');
          } catch (syncError) {
            console.error("Initial sync failed:", syncError);
            setSyncStatus('error');
          } finally {
            isSyncingRef.current = false;
          }
        }

        // Set up periodic sync (e.g., every 30 seconds)
        const syncInterval = setInterval(async () => {
          if (navigator.onLine && !isSyncingRef.current) {
            isSyncingRef.current = true;
            setSyncStatus('syncing');
            try {
              await syncData();
              setSyncStatus('synced');
            } catch (syncError) {
              console.error("Periodic sync failed:", syncError);
              setSyncStatus('error');
            } finally {
              isSyncingRef.current = false;
            }
          }
        }, 30000);

        return () => clearInterval(syncInterval); // Cleanup on unmount

      } catch (err) {
        console.error("Database initialization failed:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    initialize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="ms-3">Loading database...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant="danger">Error loading database: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '2rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>Hôpital Juvénat</h4>
            <div>
              {isOnline ? (
                <span className="text-success me-2">Online ✅</span>
              ) : (
                <span className="text-danger me-2">Offline ❌</span>
              )}
              {syncStatus === 'syncing' && (
                <Spinner animation="border" size="sm" role="status" className="me-2">
                  <span className="visually-hidden">Syncing...</span>
                </Spinner>
              )}
              {syncStatus === 'synced' && (
                <span className="text-success">Synced</span>
              )}
              {syncStatus === 'error' && (
                <span className="text-danger">Sync Error</span>
              )}
            </div>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicaments" element={<Medicaments />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/entrees" element={<Entrees />} />
            <Route path="/sorties" element={<Sorties />} />
            <Route path="/retour" element={<Retour />} />
            <Route path="/stock-report" element={<StockReport />} />
            <Route path="/daily-sales-report" element={<DailySalesReport />} />
            <Route path="/stock-adjustments" element={<StockAdjustments />} />
            <Route path="/expiring-stock-report" element={<ExpiringStockReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
