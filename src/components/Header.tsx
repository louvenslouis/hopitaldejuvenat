
import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  // No props needed for now, as it uses context
}

const Header: React.FC<HeaderProps> = () => {
  const { personnel, activeUser, setActiveUser } = useUser();

  return (
    <header className="app-header">
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
    </header>
  );
};

export default Header;
