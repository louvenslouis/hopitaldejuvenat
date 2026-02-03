import React, { useMemo, useState, useEffect } from 'react';
import { Button, Form, Row, Col, ListGroup, Table, ButtonGroup, Card, Badge, Alert } from 'react-bootstrap';
import { getCollection, addDocument, updateDocument } from '../../firebase/firestoreService';
import EntreeCard from '../../components/EntreeCard';
import type { Entree, Medicament } from '../../types';

const Entrees: React.FC = () => {
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  type EntryDraft = {
    medicament_id?: string;
    searchTerm: string;
    showResults: boolean;
    quantite: number;
    dateExpiration: string;
  };

  const [entriesDraft, setEntriesDraft] = useState<EntryDraft[]>([
    { medicament_id: undefined, searchTerm: '', showResults: false, quantite: 0, dateExpiration: '' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'history' | 'cards'>('history');

  const fetchData = async () => {
    const allEntrees = await getCollection<Entree>('stock');
    const allMedicaments = await getCollection<Medicament>('medicaments');

    const enrichedEntrees = allEntrees.map((entree) => {
      const medicament = allMedicaments.find((med: Medicament) => med.id === entree.article_id);
      return { ...entree, nom: medicament ? medicament.nom : 'Inconnu' };
    });
    setEntrees(enrichedEntrees.sort((a, b) => new Date(b.date_enregistrement).getTime() - new Date(a.date_enregistrement).getTime()));

    setMedicaments(allMedicaments);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMedicamentSelect = (index: number, medicament: Medicament) => {
    const next = [...entriesDraft];
    next[index] = {
      ...next[index],
      medicament_id: medicament.id,
      searchTerm: medicament.nom,
      showResults: false,
    };
    setEntriesDraft(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validEntries = entriesDraft.filter(
      (entry): entry is EntryDraft & { medicament_id: string } =>
        Boolean(entry.medicament_id) && entry.quantite > 0
    );

    if (validEntries.length === 0) {
      setFormError('Ajoute au moins un médicament avec une quantité valide.');
      return;
    }

    for (const entry of validEntries) {
      await addDocument('stock', {
        article_id: entry.medicament_id,
        quantite: entry.quantite,
        date_expiration: entry.dateExpiration || null,
        date_enregistrement: new Date().toISOString(),
        date_modification: new Date().toISOString(),
      });

      const medicament = medicaments.find((m: Medicament) => m.id === entry.medicament_id);
      if (medicament) {
        const currentStock = medicament.quantite_en_stock ?? 0;
        await updateDocument('medicaments', entry.medicament_id, { quantite_en_stock: currentStock + entry.quantite });
      }
    }

    fetchData();
    setEntriesDraft([{ medicament_id: undefined, searchTerm: '', showResults: false, quantite: 0, dateExpiration: '' }]);
  };

  const totalQuantite = useMemo(() => {
    return entriesDraft.reduce((sum, entry) => sum + (Number(entry.quantite) || 0), 0);
  }, [entriesDraft]);

  const totalsByMedicament = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    entriesDraft.forEach((entry) => {
      if (!entry.medicament_id || entry.quantite <= 0) return;
      const med = medicaments.find((m) => m.id === entry.medicament_id);
      const label = med?.nom || entry.searchTerm || 'Médicament';
      const current = map.get(entry.medicament_id);
      const nextTotal = (current?.total || 0) + entry.quantite;
      map.set(entry.medicament_id, { name: label, total: nextTotal });
    });
    return Array.from(map.values());
  }, [entriesDraft, medicaments]);

  const handleDraftChange = <K extends keyof EntryDraft>(index: number, field: K, value: EntryDraft[K]) => {
    const next = [...entriesDraft];
    next[index] = { ...next[index], [field]: value };
    if (field === 'searchTerm') {
      next[index].showResults = true;
    }
    setEntriesDraft(next);
    setFormError(null);
  };

  const addRow = () => {
    setEntriesDraft((prev) => [
      ...prev,
      { medicament_id: undefined, searchTerm: '', showResults: false, quantite: 0, dateExpiration: '' },
    ]);
  };

  const removeRow = (index: number) => {
    setEntriesDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const getStockInfo = (entry: EntryDraft) => {
    if (!entry.medicament_id) return { before: '—', after: '—' };
    const med = medicaments.find((m) => m.id === entry.medicament_id);
    const before = med?.quantite_en_stock ?? 0;
    const after = before + (entry.quantite || 0);
    return { before, after };
  };

  const selectedMedIds = useMemo(() => {
    return entriesDraft
      .map((entry) => entry.medicament_id)
      .filter((id): id is string => Boolean(id));
  }, [entriesDraft]);

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
        <h1 className="mb-0">Entrées de stock</h1>
        <Badge bg="light" text="dark" className="px-3 py-2 border">
          Total entrée: <strong className="ms-1">{totalQuantite}</strong>
        </Badge>
      </div>
      <Card className="form-card mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Nouvelle entrée</Card.Title>
          <Form onSubmit={handleSubmit}>
            {formError && <Alert variant="danger">{formError}</Alert>}
            {totalsByMedicament.length > 0 && (
              <Alert variant="info" className="mb-3">
                <div className="fw-semibold mb-2">Total par médicament</div>
                <div className="d-flex flex-wrap gap-2">
                  {totalsByMedicament.map((item) => (
                    <Badge key={item.name} bg="light" text="dark" className="border">
                      {item.name}: {item.total}
                    </Badge>
                  ))}
                </div>
              </Alert>
            )}
            <div className="d-flex flex-column gap-3">
              {entriesDraft.map((entry, index) => {
                const stockInfo = getStockInfo(entry);
                const isMissingMed = !entry.medicament_id && entry.searchTerm.length > 0;
                const isInvalidQty = entry.quantite <= 0;
                return (
                  <Row className="g-3 align-items-end" key={`entry-${index}`}>
                    <Col md={5}>
                      <Form.Group className="typeahead">
                        <Form.Label>Médicament</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Rechercher un médicament..."
                          value={entry.searchTerm}
                          onChange={e => handleDraftChange(index, 'searchTerm', e.target.value)}
                          required
                          isInvalid={isMissingMed}
                        />
                        {entry.showResults && entry.searchTerm && (
                          <ListGroup className="typeahead-results">
                            {medicaments
                              .filter((m: Medicament) => m.nom.toLowerCase().includes(entry.searchTerm.toLowerCase()))
                              .filter((m) => {
                                if (!entry.medicament_id && selectedMedIds.includes(m.id)) return false;
                                if (entry.medicament_id === m.id) return true;
                                return !selectedMedIds.includes(m.id);
                              })
                              .map((m) => (
                                <ListGroup.Item key={m.id} onClick={() => handleMedicamentSelect(index, m)}>
                                  {m.nom}
                                </ListGroup.Item>
                              ))}
                          </ListGroup>
                        )}
                        {isMissingMed && (
                          <div className="invalid-feedback d-block">
                            Sélectionne un médicament dans la liste.
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Quantité</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          value={entry.quantite}
                          onChange={e => handleDraftChange(index, 'quantite', Number(e.target.value))}
                          required
                          isInvalid={isInvalidQty}
                        />
                        {isInvalidQty && (
                          <div className="invalid-feedback d-block">
                            Quantité minimale: 1.
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Date d'expiration</Form.Label>
                        <Form.Control
                          type="date"
                          value={entry.dateExpiration}
                          onChange={e => handleDraftChange(index, 'dateExpiration', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button variant="outline-secondary" onClick={addRow}>
                        + Ajouter
                      </Button>
                      {entriesDraft.length > 1 && (
                        <Button variant="outline-danger" onClick={() => removeRow(index)}>
                          Retirer
                        </Button>
                      )}
                    </Col>
                    <Col md={12} className="d-flex flex-wrap gap-2 text-muted small">
                      <span>Stock avant: <strong>{stockInfo.before}</strong></span>
                      <span>Stock après: <strong>{stockInfo.after}</strong></span>
                    </Col>
                  </Row>
                );
              })}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Total instantané: <strong>{totalQuantite}</strong>
              </div>
              <Button type="submit" className="px-4">Ajouter l'entrée</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

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
              {entrees.map((entree) => (
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
          {entrees.map((entree) => (
            <EntreeCard key={entree.id} entree={entree} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Entrees;
