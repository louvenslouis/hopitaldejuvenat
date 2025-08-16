
import React from 'react';
import { Dropdown, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import { useSync } from '../contexts/SyncContext';

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed }) => {
  const { personnel, activeUser, setActiveUser } = useUser();
  const { syncStatus, lastSyncTime } = useSync();

  const renderSyncTooltip = (props: any) => (
    <Tooltip id="sync-tooltip" {...props}>
      {syncStatus === 'syncing' && 'Synchronisation en cours...'}
      {syncStatus === 'synced' && `Dernière synchro: ${lastSyncTime?.toLocaleTimeString()}`}
      {syncStatus === 'error' && 'Erreur de synchronisation'}
      {syncStatus === 'idle' && 'En attente de synchronisation'}
    </Tooltip>
  );

  return (
    <header className={`app-header ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="hospital-info">
                <img src= ./assets/logo.png alt="Hospital Logo" className="hospital-logo" /> {/* Placeholder for logo */}
        <h5 style="color: white;">HOPITAL DE JUVENAT</h5>
      </div>
      <div className="header-right-section">
        <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderSyncTooltip}>
          <div className={`sync-status-header ${syncStatus}`}>
            {syncStatus === 'syncing' && <span className="material-icons spin">sync</span>}
            {syncStatus === 'synced' && <span className="material-icons text-success">check_circle</span>}
            {syncStatus === 'error' && <span className="material-icons text-danger">error</span>}
            {syncStatus === 'idle' && <span className="material-icons">hourglass_empty</span>}
          </div>
        </OverlayTrigger>
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
      </div>
    </header>
  );
};

export default Header;
