import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, ListGroup, InputGroup, Badge } from 'react-bootstrap';
import { addDocument, getCollection, getDocument, updateDocument } from '../firebase/firestoreService';
import type { Medicament, Patient } from '../types';
import AddPatientModal from './AddPatientModal';
import AddMedicamentModal from './AddMedicamentModal';
import { useUser } from '../hooks/useUser';

interface AddSortieModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddSortieModal: React.FC<AddSortieModalProps> = ({ show, onHide, onSuccess }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [service, setService] = useState(''); // Initial state empty
  const [employe, setEmploye] = useState('');
  const [chambre, setChambre] = useState<number | undefined>();
  const [memo, setMemo] = useState('');
  type ArticleDraft = {
    article_id?: string;
    quantite: number;
    searchTerm: string;
    showResults: boolean;
  };

  const [articles, setArticles] = useState<ArticleDraft[]>([
    { article_id: undefined, quantite: 1, searchTerm: '', showResults: false },
  ]);
  const [stockError, setStockError] = useState<string | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddMedicamentModal, setShowAddMedicamentModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { activeUser } = useUser();
  const defaultEmployes = ['Azor', 'Naika', 'Tamara', 'Voltaire'];
  const employeOptions = Array.from(
    new Set([
      ...(activeUser?.nom ? [activeUser.nom] : []),
      ...defaultEmployes,
    ])
  );

  const resetState = () => {
    setSelectedPatient(undefined);
    setPatientSearchTerm('');
    setShowPatientResults(false);
    setService(''); // Reset to empty
    setEmploye(activeUser ? activeUser.nom : ''); // Set default employee from active user
    setChambre(undefined);
    setMemo('');
    setArticles([{ article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
    setStockError(null);
    setIsSaving(false);
  };

  const fetchData = async () => {
    const patientCollection = 'patients';
    const patientsData = await getCollection<Patient>(patientCollection);
    setPatients(patientsData);
    const medicamentsData = await getCollection<Medicament>('medicaments');
    setMedicaments(medicamentsData);
  };

  useEffect(() => {
    if (show) {
      fetchData();
      setEmploye(activeUser ? activeUser.nom : ''); // Set employee when modal opens
    }
  }, [show, activeUser]);

  useEffect(() => {
    if (service !== 'Medecine Interne' && service !== 'Maternité') {
      setChambre(undefined);
    }
  }, [service]);

  const handleArticleChange = <K extends keyof ArticleDraft>(
    index: number,
    field: K,
    value: ArticleDraft[K]
  ) => {
    const newArticles = [...articles];
    newArticles[index][field] = value;
    if (field === 'searchTerm') {
      newArticles[index]['showResults'] = true;
    }
    setArticles(newArticles);
    setStockError(null); // Clear error on change
  };

  const handleMedicamentSelect = (index: number, medicament: Medicament) => {
    const newArticles = [...articles];
    newArticles[index]['article_id'] = medicament.id;
    newArticles[index]['searchTerm'] = medicament.nom;
    newArticles[index]['showResults'] = false;
    setArticles(newArticles);
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient.id);
    setPatientSearchTerm(`${patient.prenom} ${patient.nom}`);
    setShowPatientResults(false);
  }

  const addArticle = () => {
    setArticles([...articles, { article_id: undefined, quantite: 1, searchTerm: '', showResults: false }]);
    setStockError(null); // Clear error on add
  };

  const removeArticle = (index: number) => {
    const newArticles = [...articles];
    newArticles.splice(index, 1);
    setArticles(newArticles);
    setStockError(null); // Clear error on remove
  };

  const selectedMedIds = useMemo(() => {
    return articles
      .map((article) => article.article_id)
      .filter((id): id is string => Boolean(id));
  }, [articles]);

  const totalsByMedicament = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    articles.forEach((article) => {
      if (!article.article_id || article.quantite <= 0) return;
      const med = medicaments.find((m) => m.id === article.article_id);
      const label = med?.nom || article.searchTerm || 'Médicament';
      const current = map.get(article.article_id);
      const nextTotal = (current?.total || 0) + article.quantite;
      map.set(article.article_id, { name: label, total: nextTotal });
    });
    return Array.from(map.values());
  }, [articles, medicaments]);

  const totalQuantite = useMemo(() => {
    return articles.reduce((sum, article) => sum + (Number(article.quantite) || 0), 0);
  }, [articles]);

  const totalMontant = useMemo(() => {
    return articles.reduce((sum, article) => {
      if (!article.article_id) return sum;
      const med = medicaments.find((m) => m.id === article.article_id);
      const prix = med?.prix ?? 0;
      return sum + (article.quantite || 0) * prix;
    }, 0);
  }, [articles, medicaments]);

  const getStockInfo = (article: ArticleDraft) => {
    if (!article.article_id) return { before: '—', after: '—' };
    const med = medicaments.find((m) => m.id === article.article_id);
    const before = med?.quantite_en_stock ?? 0;
    const after = before - (article.quantite || 0);
    return { before, after };
  };

  const buildReceiptHtml = () => {
    const patient = patients.find((p) => p.id === selectedPatient);
    const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'N/A';
    const dateLabel = new Date().toLocaleString('fr-HT');
    const rows = articles
      .filter((article) => article.article_id && article.quantite > 0)
      .map((article) => {
        const med = medicaments.find((m) => m.id === article.article_id);
        const prix = med?.prix ?? 0;
        const total = prix * article.quantite;
        return {
          nom: med?.nom || article.searchTerm,
          quantite: article.quantite,
          prix,
          total,
        };
      });

    const rowsHtml = rows
      .map(
        (row) => `
          <tr>
            <td>${row.nom}</td>
            <td style="text-align:center">${row.quantite}</td>
            <td style="text-align:right">${row.prix.toLocaleString('fr-HT')}</td>
            <td style="text-align:right">${row.total.toLocaleString('fr-HT')}</td>
          </tr>
        `
      )
      .join('');

    return `
      <html>
        <head>
          <title>Reçu - Sortie</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h2 { margin: 0 0 6px 0; }
            .meta { margin-bottom: 16px; font-size: 14px; color: #444; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; font-size: 13px; }
            th { text-align: left; background: #f5f7fb; }
            .totals { margin-top: 12px; text-align: right; font-weight: 600; }
          </style>
        </head>
        <body>
          <h2>HOPITAL DE JUVENAT</h2>
          <div class="meta">
            <div><strong>Reçu de sortie</strong></div>
            <div>Date: ${dateLabel}</div>
            <div>Patient: ${patientName}</div>
            <div>Service: ${service || '—'}</div>
            <div>Employé: ${employe || '—'}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Médicament</th>
                <th style="text-align:center">Qté</th>
                <th style="text-align:right">Prix</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="totals">Total: ${totalMontant.toLocaleString('fr-HT')} HTG</div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const validArticles = articles.filter((article) => article.article_id && article.quantite > 0);
    if (validArticles.length === 0) {
      setStockError("Ajoute au moins un médicament avant d'imprimer.");
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildReceiptHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const submitSortie = async (options?: { print?: boolean }) => {
    if (isSaving) return;
    setIsSaving(true);
    setStockError(null); // Clear previous errors
    try {
      // Validate service selection
      if (!service) {
        setStockError("Veuillez sélectionner un service.");
        return;
      }

      // Validate at least one article
      const validArticles = articles.filter(
        (article): article is ArticleDraft & { article_id: string } =>
          Boolean(article.article_id) && article.quantite > 0
      );
      if (validArticles.length === 0) {
        setStockError("Veuillez ajouter au moins un article avec une quantité valide.");
        return;
      }

      // Perform stock check and update
      for (const article of validArticles) {
        const medicament = await getDocument<Medicament>('medicaments', article.article_id);
        if (!medicament) {
          setStockError(`Médicament ${article.searchTerm} introuvable.`);
          return;
        }
        const currentStock = medicament.quantite_en_stock || 0;

        if (currentStock < article.quantite) {
          setStockError(`Stock insuffisant pour ${medicament.nom}. Stock actuel: ${currentStock}, Quantité demandée: ${article.quantite}`);
          return;
        }
        // Update stock in Firestore
        await updateDocument('medicaments', medicament.id, { quantite_en_stock: currentStock - article.quantite });
      }

      const newSortie = {
        date_sortie: new Date().toISOString(),
        service,
        employe,
        patient_id: selectedPatient || null,
        chambre: chambre || null,
        memo,
        articles: validArticles.map(art => ({ article_id: art.article_id, quantite: art.quantite })),
        created_at: new Date().toISOString(),
      };
      await addDocument('sorties', newSortie);

      if (options?.print) {
        handlePrint();
      }

      onSuccess();
      onHide();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitSortie();
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" onExited={resetState} backdrop="static" keyboard={false}> {/* Added backdrop and keyboard props */}
        <Modal.Header closeButton>
          <Modal.Title>Créer une sortie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
            <div>
              <h5 className="mb-1">Nouvelle sortie</h5>
              <div className="text-muted">Renseigne le patient, le service et les médicaments à sortir.</div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="light" text="dark" className="border">
                Total articles: {totalQuantite}
              </Badge>
              <Badge bg="light" text="dark" className="border">
                Montant total: {totalMontant.toLocaleString('fr-HT')} HTG
              </Badge>
            </div>
          </div>
          <Form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-title">Patient & Service</div>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 typeahead">
                  <Form.Label>Patient</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={patientSearchTerm}
                      onChange={e => { setPatientSearchTerm(e.target.value); setShowPatientResults(true); }}
                    />
                    <Button variant="outline-secondary" onClick={() => setShowAddPatientModal(true)}>Nouveau</Button>
                  </InputGroup>
                  {showPatientResults && patientSearchTerm && (
                    <ListGroup className="typeahead-results">
                      {patients
                        .filter((p: Patient) => `${p.prenom} ${p.nom}`.toLowerCase().includes(patientSearchTerm.toLowerCase()))
                        .map((p: Patient) => (
                          <ListGroup.Item key={p.id} onClick={() => handlePatientSelect(p)}>
                            {p.prenom} {p.nom}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service</Form.Label>
                  <Form.Select value={service} onChange={e => setService(e.target.value)} required> {/* Added required */}
                    <option value="">Sélectionner un service</option> {/* Added empty option */}
                    <option>Clinique externe</option>
                    <option>Urgence</option>
                    <option>Medecine Interne</option>
                    <option>Maternité</option>
                    <option>SOP</option>
                    <option>Pediatrie</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employé</Form.Label>
                  <Form.Select value={employe} onChange={e => setEmploye(e.target.value)}>
                    {employeOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Conditional rendering for Chambre field */}
              {(service === 'Medecine Interne' || service === 'Maternité') && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chambre</Form.Label>
                    <Form.Control type="number" value={chambre} onChange={e => setChambre(Number(e.target.value))} />
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Memo</Form.Label>
              <Form.Control as="textarea" rows={1} value={memo} onChange={e => setMemo(e.target.value)} /> {/* Changed rows to 1 */}
            </Form.Group>
            </div>

            {stockError && <Alert variant="danger">{stockError}</Alert>}
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

            <div className="form-section">
              <div className="form-section-title">Articles</div>
            {articles.map((article, index) => (
              <Row key={index} className="mb-2">
                <Col md={7} className="typeahead">
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un médicament..."
                    value={article.searchTerm}
                    onChange={e => handleArticleChange(index, 'searchTerm', e.target.value)}
                    isInvalid={!article.article_id && article.searchTerm.length > 0}
                  />
                  {article.showResults && article.searchTerm && (
                    <ListGroup className="typeahead-results">
                      {medicaments
                        .filter((m: Medicament) => m.nom.toLowerCase().includes(article.searchTerm.toLowerCase()))
                        .filter((m) => {
                          if (!article.article_id && selectedMedIds.includes(m.id)) return false;
                          if (article.article_id === m.id) return true;
                          return !selectedMedIds.includes(m.id);
                        })
                        .map((m: Medicament) => (
                          <ListGroup.Item key={m.id} onClick={() => handleMedicamentSelect(index, m)}>
                            {m.nom}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  )}
                  {!article.article_id && article.searchTerm.length > 0 && (
                    <div className="invalid-feedback d-block">
                      Sélectionne un médicament dans la liste.
                    </div>
                  )}
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    min={1}
                    value={article.quantite}
                    onChange={e => handleArticleChange(index, 'quantite', Number(e.target.value))}
                    isInvalid={article.quantite <= 0}
                  />
                  {article.quantite <= 0 && (
                    <div className="invalid-feedback d-block">Quantité minimale: 1.</div>
                  )}
                </Col>
                <Col md={2}>
                  <Button variant="danger" onClick={() => removeArticle(index)}>X</Button>
                </Col>
                <Col md={12} className="text-muted small mt-1">
                  Stock avant: <strong>{getStockInfo(article).before}</strong> • Stock après: <strong>{getStockInfo(article).after}</strong>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={addArticle} className="mt-2">Ajouter un article</Button>
            <Button variant="info" onClick={() => setShowAddMedicamentModal(true)} className="mt-2 ms-2">Nouveau Médicament</Button>
            </div>

          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <Button variant="outline-secondary" onClick={() => submitSortie({ print: true })} disabled={isSaving}>
              {isSaving ? 'Traitement...' : 'Enregistrer & Imprimer'}
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer la sortie'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>

    <AddPatientModal 
      show={showAddPatientModal} 
      onHide={() => setShowAddPatientModal(false)} 
      onSuccess={() => {
        setShowAddPatientModal(false);
        fetchData();
      }} 
    />

    <AddMedicamentModal 
      show={showAddMedicamentModal} 
      onHide={() => setShowAddMedicamentModal(false)} 
      onSuccess={() => {
        setShowAddMedicamentModal(false);
        fetchData();
      }} 
    />
  </>
  );
};

export default AddSortieModal;
