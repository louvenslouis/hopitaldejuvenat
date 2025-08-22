
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const getServiceName = () => {
    const path = location.pathname;
    if (path.startsWith('/pharmacie')) return 'Pharmacie';
    // Add more services here if needed
    return '';
  };

  return (
    <Nav className={`flex-column sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h5 className="service-name">{getServiceName()}</h5>}
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
      
      <NavLink to="/pharmacie/expiring-stock-report" className="nav-link">
        <span className="material-icons">warning</span> <span>Stock Expirant</span>
      </NavLink>
    </Nav>
  );
};

export default Sidebar;
