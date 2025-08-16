
import React from 'react';
import { Nav, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useSync } from '../contexts/SyncContext';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { syncStatus, lastSyncTime } = useSync();

  const renderTooltip = (props: any) => (
    <Tooltip id="sync-tooltip" {...props}>
      {syncStatus === 'syncing' && 'Synchronisation en cours...'}
      {syncStatus === 'synced' && `Dernière synchro: ${lastSyncTime?.toLocaleTimeString()}`}
      {syncStatus === 'error' && 'Erreur de synchronisation'}
      {syncStatus === 'idle' && 'En attente de synchronisation'}
    </Tooltip>
  );

  return (
    <Nav className={`flex-column sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <NavLink to="/" className="nav-link"><h5></h5></NavLink>}
        <button onClick={toggleSidebar} className="collapse-btn">
          <span className="material-icons">{isCollapsed ? 'menu' : 'chevron_left'}</span>
        </button>
      </div>
      <NavLink to="/pharmacie/dashboard" className="nav-link">
        <span className="material-icons">dashboard</span> <span>Dashboard</span>
      </NavLink>
      <NavLink to="/pharmacie/medicaments" className="nav-link">
        <span className="material-icons">medication</span> <span>Médicaments</span>
      </NavLink>
      <NavLink to="/pharmacie/patients" className="nav-link">
        <span className="material-icons">people</span> <span>Patients</span>
      </NavLink>
      <NavLink to="/pharmacie/entrees" className="nav-link">
        <span className="material-icons">input</span> <span>Entrées</span>
      </NavLink>
      <NavLink to="/pharmacie/sorties" className="nav-link">
        <span className="material-icons">output</span> <span>Sorties</span>
      </NavLink>
      <NavLink to="/pharmacie/retour" className="nav-link">
        <span className="material-icons">assignment_return</span> <span>Retours</span>
      </NavLink>
      <NavLink to="/pharmacie/stock-report" className="nav-link">
        <span className="material-icons">assessment</span> <span>Rapport de Stock</span>
      </NavLink>
      <NavLink to="/pharmacie/daily-sales-report" className="nav-link">
        <span className="material-icons">today</span> <span>Vente Journalier</span>
      </NavLink>
      <NavLink to="/pharmacie/stock-adjustments" className="nav-link">
        <span className="material-icons">build</span> <span>Ajustements</span>
      </NavLink>
      <NavLink to="/pharmacie/expiring-stock-report" className="nav-link">
        <span className="material-icons">warning</span> <span>Stock Expirant</span>
      </NavLink>

      <div className="sidebar-footer">
        <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
          <div className={`sync-status ${syncStatus}`}>
            {syncStatus === 'syncing' && <span className="material-icons spin">sync</span>}
            {syncStatus === 'synced' && <span className="material-icons text-success">check_circle</span>}
            {syncStatus === 'error' && <span className="material-icons text-danger">error</span>}
            {syncStatus === 'idle' && <span className="material-icons">hourglass_empty</span>}
            {!isCollapsed && <span className="sync-text">{syncStatus}</span>}
          </div>
        </OverlayTrigger>
      </div>
    </Nav>
  );
};

export default Sidebar;
