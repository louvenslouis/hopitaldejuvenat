import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <Nav className="flex-column sidebar">
      <div className="sidebar-header">
        <h5>Hôpital Juvénat</h5>
      </div>
      <NavLink to="/" className="nav-link">
        <span role="img" aria-label="Dashboard">📊</span> Dashboard
      </NavLink>
      <NavLink to="/medicaments" className="nav-link">
        <span role="img" aria-label="Médicaments">💊</span> Médicaments
      </NavLink>
      <NavLink to="/patients" className="nav-link">
        <span role="img" aria-label="Patients">👥</span> Patients
      </NavLink>
      <NavLink to="/entrees" className="nav-link">
        <span role="img" aria-label="Entrées">📥</span> Entrées
      </NavLink>
      <NavLink to="/sorties" className="nav-link">
        <span role="img" aria-label="Sorties">📤</span> Sorties
      </NavLink>
      <NavLink to="/retour" className="nav-link">
        <span role="img" aria-label="Retour">↩️</span> Retours
      </NavLink>
      <NavLink to="/stock-report" className="nav-link">
        <span role="img" aria-label="Rapport de Stock">📈</span> Rapport de Stock
      </NavLink>
      <NavLink to="/daily-sales-report" className="nav-link">
        <span role="img" aria-label="Rapport de Vente Journalier">📅</span> Vente Journalier
      </NavLink>
      <NavLink to="/stock-adjustments" className="nav-link">
        <span role="img" aria-label="Ajustements de Stock">🛠️</span> Ajustements de Stock
      </NavLink>
      <NavLink to="/expiring-stock-report" className="nav-link">
        <span role="img" aria-label="Rapport de Stock Expirant">⏳</span> Stock Expirant
      </NavLink>
    </Nav>
  );
};

export default Sidebar;
