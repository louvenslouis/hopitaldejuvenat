import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, InputGroup, Table } from 'react-bootstrap';
import { getCollection, requestFirestoreRefresh, clearFirestoreCache } from '../firebase/firestoreService';
import type { JournalEntry } from '../types';

const JournalPage: React.FC = () => {
  const [logs, setLogs] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  const fetchLogs = useCallback(async () => {
    const data = await getCollection<JournalEntry>('journal');
    const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setLogs(sorted);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && log.is_online && !log.offline_mode) ||
        (statusFilter === 'offline' && (!log.is_online || log.offline_mode));
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        log.action.toLowerCase().includes(term) ||
        (log.collection || '').toLowerCase().includes(term) ||
        (log.user_name || '').toLowerCase().includes(term) ||
        (log.doc_id || '').toLowerCase().includes(term)
      );
    });
  }, [logs, searchTerm, statusFilter]);

  const handleRefresh = () => {
    clearFirestoreCache();
    requestFirestoreRefresh();
    fetchLogs();
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
        <div>
          <h1>Journal des actions</h1>
          <p className="text-muted mb-0">Historique des opérations réalisées dans l’application.</p>
        </div>
        <Button variant="outline-primary" onClick={handleRefresh}>
          Rafraîchir
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-3">
        <InputGroup className="search-group">
          <Form.Control
            placeholder="Rechercher (action, utilisateur, collection, id)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              Effacer
            </Button>
          )}
        </InputGroup>
        <Form.Select
          style={{ maxWidth: '220px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline')}
        >
          <option value="all">Tous les statuts</option>
          <option value="online">En ligne</option>
          <option value="offline">Hors ligne</option>
        </Form.Select>
      </div>

      <div className="airtable-scroll">
        <Table className="airtable-table" bordered hover responsive>
          <thead>
            <tr>
              <th>Date & Heure</th>
              <th>Action</th>
              <th>Collection</th>
              <th>Utilisateur</th>
              <th>Statut</th>
              <th>Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString('fr-HT')}</td>
                <td>{log.action}</td>
                <td>{log.collection || '—'}</td>
                <td>{log.user_name || '—'}</td>
                <td>
                  {log.offline_mode || !log.is_online ? (
                    <Badge bg="secondary">Hors ligne</Badge>
                  ) : (
                    <Badge bg="success">En ligne</Badge>
                  )}
                </td>
                <td>{log.ip || 'Inconnu'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Aucun événement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default JournalPage;
