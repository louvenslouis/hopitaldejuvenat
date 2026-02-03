import React, { useEffect, useState } from 'react';
import { Button, Form, Table, Card } from 'react-bootstrap';
import { addDocument, deleteDocument, getCollection } from '../firebase/firestoreService';

interface User {
  id: string;
  nom: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [nom, setNom] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    const data = await getCollection<User>('personnel');
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    setIsSaving(true);
    await addDocument('personnel', { nom: nom.trim(), created_at: new Date().toISOString() });
    setNom('');
    setIsSaving(false);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await deleteDocument('personnel', id);
    fetchUsers();
  };

  return (
    <div>
      <h1>Utilisateurs</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter un utilisateur</Card.Title>
          <Form onSubmit={handleAdd} className="d-flex gap-2 flex-wrap">
            <Form.Control
              style={{ maxWidth: '360px' }}
              placeholder="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Ajout...' : 'Ajouter'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="airtable-scroll">
        <Table className="airtable-table" bordered hover responsive>
          <thead>
            <tr>
              <th>Nom</th>
              <th className="airtable-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nom}</td>
                <td className="airtable-actions">
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-muted py-4">
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UsersPage;
