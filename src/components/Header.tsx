import React, { useMemo } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { clearFirestoreCache, requestFirestoreRefresh } from '../firebase/firestoreService';

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed }) => {
  const { personnel, activeUser, setActiveUser } = useUser();
  const { isOnline, offlineMode, hasPendingWrites, fromCache } = useSyncStatus();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    const map: Record<string, string> = {
      '/': 'Accueil',
      '/pharmacie/dashboard': 'Dashboard',
      '/pharmacie/medicaments': 'Médicaments',
      '/pharmacie/patients': 'Patients',
      '/pharmacie/entrees': 'Entrées',
      '/pharmacie/sorties': 'Sorties',
      '/pharmacie/retour': 'Retours',
      '/pharmacie/stock-report': 'Rapport de Stock',
      '/pharmacie/daily-sales-report': 'Vente Journalier',
      '/pharmacie/expiring-stock-report': 'Stock Expirant',
      '/pharmacie/medicaments-edit': 'Modifier Médicaments',
      '/pharmacie/sorties-edit': 'Modifier Sorties',
      '/pharmacie/stock-restant': 'Stock Restant',
      '/pharmacie/stock-qr': 'QR Stock',
      '/pharmacie/stock-public': 'Stock actuel',
      '/requisition': 'Réquisition',
      '/settings': 'Paramètres',
      '/settings/users': 'Utilisateurs',
    };
    return map[path] || 'Hôpital Juvénat';
  }, [location.pathname]);

  const renderSyncLabel = () => {
    if (offlineMode) {
      return (
        <>
          <span className="material-icons">cloud_off</span>
          <span>Hors ligne (forcé)</span>
        </>
      );
    }
    if (!isOnline) {
      return (
        <>
          <span className="material-icons">cloud_off</span>
          <span>Hors ligne</span>
        </>
      );
    }
    if (hasPendingWrites) {
      return (
        <>
          <span className="material-icons spin">sync</span>
          <span>Synchronisation…</span>
        </>
      );
    }
    return (
      <>
        <span className="material-icons">cloud_done</span>
        <span>Synchronisé</span>
      </>
    );
  };

  const handleRefresh = () => {
    clearFirestoreCache();
    requestFirestoreRefresh();
    window.location.reload();
  };

  return (
    <header className={`app-header ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="hospital-info">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Hospital Logo" className="hospital-logo" />
        <div>
          <h5 className="hospital-name">HOPITAL DE JUVENAT</h5>
          <div className="hospital-subtitle">{pageTitle}</div>
        </div>
      </div>
      <div className="header-right-section">
        <button className="sync-status-header" type="button" onClick={handleRefresh} title="Rafraîchir les données">
          {renderSyncLabel()}
          <span className={`cache-pill ${fromCache ? 'cache' : 'live'}`}>
            {fromCache ? 'Cache' : 'Live'}
          </span>
        </button>
        <div className="user-info">
          <Dropdown>
            <Dropdown.Toggle as={Button} variant="light" id="dropdown-basic">
              <span className="material-icons">account_circle</span>
              <span className="ms-2">{activeUser ? activeUser.nom : 'Sélectionner un utilisateur'}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {personnel.map(user => (
                <Dropdown.Item key={user.id} onClick={() => setActiveUser(user)}>
                  {user.nom}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Link to="/requisition" className="btn btn-light" title="Réquisition">
          <span className="material-icons">assignment</span>
        </Link>
        <Link to="/settings" className="btn btn-light">
          <span className="material-icons">settings</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
