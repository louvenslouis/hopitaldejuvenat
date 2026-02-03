
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<'pharmacie' | 'rapports' | 'edition' | 'admin' | null>('pharmacie');
  const getServiceName = () => {
    const path = location.pathname;
    if (path.startsWith('/pharmacie')) return 'Pharmacie';
    // Add more services here if needed
    return '';
  };

  const toggleSection = (section: 'pharmacie' | 'rapports' | 'edition' | 'admin') => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <Nav className={`flex-column sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h5 className="service-name">{getServiceName()}</h5>}
        <button onClick={toggleSidebar} className="collapse-btn">
          <span className="material-icons">{isCollapsed ? 'menu' : 'chevron_left'}</span>
        </button>
      </div>
      {!isCollapsed && (
        <button className="sidebar-section-toggle" onClick={() => toggleSection('pharmacie')}>
          <span className="sidebar-section-label">Pharmacie</span>
          <span className="material-icons">{openSection === 'pharmacie' ? 'expand_more' : 'chevron_right'}</span>
        </button>
      )}
      {(isCollapsed || openSection === 'pharmacie') && (
        <>
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
        </>
      )}

      {!isCollapsed && (
        <button className="sidebar-section-toggle" onClick={() => toggleSection('rapports')}>
          <span className="sidebar-section-label">Rapports</span>
          <span className="material-icons">{openSection === 'rapports' ? 'expand_more' : 'chevron_right'}</span>
        </button>
      )}
      {(isCollapsed || openSection === 'rapports') && (
        <>
          <NavLink to="/pharmacie/stock-report" className="nav-link">
            <span className="material-icons">assessment</span> <span>Rapport de Stock</span>
          </NavLink>
          <NavLink to="/pharmacie/daily-sales-report" className="nav-link">
            <span className="material-icons">today</span> <span>Vente Journalier</span>
          </NavLink>
          <NavLink to="/pharmacie/expiring-stock-report" className="nav-link">
            <span className="material-icons">warning</span> <span>Stock Expirant</span>
          </NavLink>
        </>
      )}

      {!isCollapsed && (
        <button className="sidebar-section-toggle" onClick={() => toggleSection('edition')}>
          <span className="sidebar-section-label">Édition rapide</span>
          <span className="material-icons">{openSection === 'edition' ? 'expand_more' : 'chevron_right'}</span>
        </button>
      )}
      {(isCollapsed || openSection === 'edition') && (
        <>
          <NavLink to="/pharmacie/medicaments-edit" className="nav-link">
            <span className="material-icons">edit_note</span> <span>Modifier Médicaments</span>
          </NavLink>
          <NavLink to="/pharmacie/sorties-edit" className="nav-link">
            <span className="material-icons">edit</span> <span>Modifier Sorties</span>
          </NavLink>
          <NavLink to="/pharmacie/stock-restant" className="nav-link">
            <span className="material-icons">inventory_2</span> <span>Stock Restant</span>
          </NavLink>
          <NavLink to="/pharmacie/stock-qr" className="nav-link">
            <span className="material-icons">qr_code_2</span> <span>QR Stock</span>
          </NavLink>
        </>
      )}

      {!isCollapsed && (
        <button className="sidebar-section-toggle" onClick={() => toggleSection('admin')}>
          <span className="sidebar-section-label">Administration</span>
          <span className="material-icons">{openSection === 'admin' ? 'expand_more' : 'chevron_right'}</span>
        </button>
      )}
      {(isCollapsed || openSection === 'admin') && (
        <>
          <NavLink to="/settings" className="nav-link">
            <span className="material-icons">settings</span> <span>Paramètres</span>
          </NavLink>
          <NavLink to="/settings/users" className="nav-link">
            <span className="material-icons">manage_accounts</span> <span>Utilisateurs</span>
          </NavLink>
        </>
      )}
    </Nav>
  );
};

export default Sidebar;
