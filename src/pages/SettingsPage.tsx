import React, { useEffect, useState } from 'react';
import { Button, Form, Card, ListGroup, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { setFirestoreNetworkEnabled } from '../firebase';
import { fetchAllCollections, buildCsvFiles, buildSqlExport, downloadTextFile } from '../utils/export';
import { usePwaInstall } from '../hooks/usePwaInstall';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [godModePin, setGodModePin] = useState(localStorage.getItem('godModePin') || '');
  const [offlineMode, setOfflineMode] = useState(localStorage.getItem('offlineMode') === 'true');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [exportFormat, setExportFormat] = useState<'csv' | 'sql'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGodModePin(e.target.value);
  };

  const handleSavePin = () => {
    localStorage.setItem('godModePin', godModePin);
    alert('PIN du GOD Mode enregistré !');
  };

  useEffect(() => {
    const handleNetworkChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('offlineMode', offlineMode ? 'true' : 'false');
    setFirestoreNetworkEnabled(!offlineMode).catch(() => undefined);
    window.dispatchEvent(new Event('offline-mode-changed'));
  }, [offlineMode]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAllCollections();
      const dateTag = new Date().toISOString().slice(0, 10);
      if (exportFormat === 'csv') {
        const files = buildCsvFiles(data);
        files.forEach((file) => {
          downloadTextFile(`${dateTag}_${file.filename}`, file.content, 'text/csv;charset=utf-8');
        });
      } else {
        const sql = buildSqlExport(data);
        downloadTextFile(`${dateTag}_export_hopital_juvenat.sql`, sql, 'text/sql;charset=utf-8');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Échec de l’export. Vérifie la connexion ou réessaie.');
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div>
      <h1>Paramètres</h1>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Général</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  Mode Sombre
                  <Form.Check 
                    type="switch"
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  <Form.Group>
                    <Form.Label>PIN du GOD Mode</Form.Label>
                    <Form.Control type="password" value={godModePin} onChange={handlePinChange} />
                    <Button variant="primary" size="sm" className="mt-2" onClick={handleSavePin}>Enregistrer</Button>
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Synchronisation & Export</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  État de connexion
                  <Badge bg={isOnline ? 'success' : 'secondary'}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  Mode hors ligne (forcé)
                  <Form.Check
                    type="switch"
                    id="offline-switch"
                    checked={offlineMode}
                    onChange={() => setOfflineMode(!offlineMode)}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  <Form.Group>
                    <Form.Label>Exporter les données</Form.Label>
                    <Form.Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as 'csv' | 'sql')}>
                      <option value="csv">CSV (un fichier par collection)</option>
                      <option value="sql">SQL (un seul fichier)</option>
                    </Form.Select>
                    <Button
                      variant="primary"
                      className="mt-2"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Export en cours...' : 'Exporter'}
                    </Button>
                    <Form.Text className="text-muted d-block mt-2">
                      {offlineMode
                        ? 'Mode hors ligne forcé : la synchronisation reprendra quand tu le désactives.'
                        : 'Le mode hors ligne utilise le cache local. Dès que la connexion revient, les données se synchronisent avec Firebase.'}
                    </Form.Text>
                  </Form.Group>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Form.Group>
                    <Form.Label>Application installable</Form.Label>
                    {isInstalled ? (
                      <div className="text-success">Application déjà installée.</div>
                    ) : (
                      <>
                        <Button variant="outline-primary" disabled={!canInstall} onClick={promptInstall}>
                          {canInstall ? 'Installer l’application' : 'Installation indisponible'}
                        </Button>
                        {!canInstall && (
                          <Form.Text className="text-muted d-block mt-2">
                            Si le bouton est indisponible: utilise Chrome/Edge sur Android ou Desktop.
                            Sur iPhone/iPad, ouvre le menu Partager puis “Ajouter à l’écran d’accueil”.
                          </Form.Text>
                        )}
                      </>
                    )}
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>À Propos</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>Version: 1.0.0</ListGroup.Item>
                <ListGroup.Item>Développeur: Louis Louvens</ListGroup.Item>
                <ListGroup.Item>Contact: <a href="mailto:louvenslouisl@gmail.com">louvenslouisl@gmail.com</a></ListGroup.Item>
                <ListGroup.Item>
                  <a href="mailto:louvenslouisl@gmail.com?subject=Bug Report" className="btn btn-danger">Signaler un bug</a>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Gestion des Employés</Card.Title>
              <p>Ajoute et gère les utilisateurs de l’application.</p>
              <Link to="/settings/users" className="btn btn-primary">
                Ouvrir la gestion des utilisateurs
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
