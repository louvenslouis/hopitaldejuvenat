import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, ListGroup, Table, ButtonGroup } from 'react-bootstrap';
import { getCollection, addDocument, updateDocument } from '../../firebase/firestoreService';
import EntreeCard from '../../components/EntreeCard';
import type { Medicament } from '../../types';

const Entrees: React.FC = () => {
  const [entrees, setEntrees] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<string | undefined>();
  const [medicamentSearchTerm, setMedicamentSearchTerm] = useState('');
  const [showMedicamentResults, setShowMedicamentResults] = useState(false);
  const [quantite, setQuantite] = useState<number>(0);
  const [dateExpiration, setDateExpiration] = useState('');
  const [viewMode, setViewMode] = useState<'history' | 'cards'>('history');

  const fetchData = async () => {
    const allEntrees = await getCollection('stock');
    const allMedicaments = await getCollection('medicaments') as Medicament[];

    const enrichedEntrees = allEntrees.map((entree: any) => {
      const medicament = allMedicaments.find((med: Medicament) => med.id === entree.article_id);
      return { ...entree, nom: medicament ? medicament.nom : 'Inconnu' };
    });
    setEntrees(enrichedEntrees.sort((a: any, b: any) => new Date(b.date_enregistrement).getTime() - new Date(a.date_enregistrement).getTime()));

    setMedicaments(allMedicaments);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMedicamentSelect = (medicament: Medicament) => {
    setSelectedMedicament(medicament.id);
    setMedicamentSearchTerm(medicament.nom);
    setShowMedicamentResults(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicament && quantite > 0) { 
      // Add new stock entry
      await addDocument('stock', {
        article_id: selectedMedicament,
        quantite: quantite,
        date_expiration: dateExpiration || null,
        date_enregistrement: new Date().toISOString(),
        date_modification: new Date().toISOString(),
      });

      // Update medicament stock
      const medicament = medicaments.find((m: Medicament) => m.id === selectedMedicament);
      if (medicament) {
        const currentStock = medicament.quantite_en_stock ?? 0;
        await updateDocument('medicaments', selectedMedicament, { quantite_en_stock: currentStock + quantite });
      }

      fetchData();
      setSelectedMedicament(undefined);
      setMedicamentSearchTerm('');
      setQuantite(0);
      setDateExpiration('');
    }
  };

  return (
    <div>
      <h1>Entrées de stock</h1>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={5}>
            <Form.Group className="typeahead">
              <Form.Label>Médicament</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rechercher un médicament..."
                value={medicamentSearchTerm}
                onChange={e => { setMedicamentSearchTerm(e.target.value); setShowMedicamentResults(true); }}
                required
              />
              {showMedicamentResults && medicamentSearchTerm && (
                <ListGroup className="typeahead-results">
                  {medicaments
                    .filter((m: Medicament) => m.nom.toLowerCase().includes(medicamentSearchTerm.toLowerCase()))
                    .map((m) => (
                      <ListGroup.Item key={m.id} onClick={() => handleMedicamentSelect(m)}>
                        {m.nom}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              )}
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Quantité</Form.Label>
              <Form.Control type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Date d'expiration</Form.Label>
              <Form.Control type="date" value={dateExpiration} onChange={e => setDateExpiration(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button type="submit">Ajouter l'entrée</Button>
          </Col>
        </Row>
      </Form>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Historique</h4>
        <ButtonGroup size="sm">
          <Button
            variant={viewMode === 'history' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('history')}
          >
            Historique
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('cards')}
          >
            Cartes
          </Button>
        </ButtonGroup>
      </div>

      {viewMode === 'history' ? (
        <div className="airtable-scroll">
          <Table className="airtable-table" bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Médicament</th>
                <th>Quantité</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((entree: any) => (
                <tr key={entree.id}>
                  <td>{new Date(entree.date_enregistrement).toLocaleString('fr-HT')}</td>
                  <td>{entree.nom}</td>
                  <td className="text-center">{entree.quantite}</td>
                  <td>{entree.date_expiration ? new Date(entree.date_expiration).toLocaleDateString('fr-HT') : '—'}</td>
                </tr>
              ))}
              {entrees.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Aucune entrée trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="card-grid">
          {entrees.map((entree: any) => (
            <EntreeCard key={entree.id} entree={entree} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Entrees;
