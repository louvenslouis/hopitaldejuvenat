import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed }) => {
  const { personnel, activeUser, setActiveUser } = useUser();

  return (
    <header className={`app-header ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="hospital-info">

        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Hospital Logo" className="hospital-logo" />
        <h5 className="hospital-name">HOPITAL DE JUVENAT</h5>
      </div>
      <div className="header-right-section">
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
        <Link to="/settings" className="btn btn-light">
          <span className="material-icons">settings</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;