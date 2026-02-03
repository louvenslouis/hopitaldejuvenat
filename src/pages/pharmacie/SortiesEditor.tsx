import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Table, Spinner } from 'react-bootstrap';
import { getCollection, updateDocument } from '../../firebase/firestoreService';
import type { Medicament, Patient, Sortie } from '../../types';

const DEFAULT_SERVICES = [
  'Clinique externe',
  'Urgence',
  'Medecine Interne',
  'Maternité',
  'SOP',
  'Pediatrie',
];

const DEFAULT_EMPLOYES = ['Azor', 'Naika', 'Tamara', 'Voltaire'];

const toLocalInputValue = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toIsoFromLocal = (value: string) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return date.toISOString();
};

const SortiesEditor: React.FC = () => {
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    const collectionName = 'patients';
    const [sortiesData, patientsData, medicamentsData] = await Promise.all([
      getCollection<Sortie>('sorties'),
      getCollection<Patient>(collectionName),
      getCollection<Medicament>('medicaments'),
    ]);
    setSorties(sortiesData);
    setPatients(patientsData);
    setMedicaments(medicamentsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const medicamentMap = useMemo(() => {
    const map = new Map<string, string>();
    medicaments.forEach((m) => map.set(m.id, m.nom));
    return map;
  }, [medicaments]);

  const serviceOptions = useMemo(() => {
    const fromData = sorties.map((s) => s.service).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SERVICES, ...fromData]));
  }, [sorties]);

  const employeOptions = useMemo(() => {
    const fromData = sorties.map((s) => s.employe).filter(Boolean);
    return Array.from(new Set([...DEFAULT_EMPLOYES, ...fromData]));
  }, [sorties]);

  const articlesSummary = (sortie: Sortie) => {
    if (!sortie.articles || sortie.articles.length === 0) return '—';
    return sortie.articles
      .map((article) => `${article.quantite} ${medicamentMap.get(article.article_id) || 'Inconnu'}`)
      .join(', ');
  };

  const handleFieldChange = <K extends keyof Sortie>(id: string, field: K, value: Sortie[K]) => {
    setSorties((prev) =>
      prev.map((sortie) => (sortie.id === id ? { ...sortie, [field]: value } : sortie))
    );
  };

  const handleSave = async (id: string) => {
    const sortie = sorties.find((s) => s.id === id);
    if (!sortie) return;
    setSavingId(id);
    await updateDocument('sorties', id, {
      date_sortie: sortie.date_sortie,
      service: sortie.service,
      employe: sortie.employe,
      patient_id: sortie.patient_id || null,
      chambre: sortie.chambre ?? null,
      memo: sortie.memo || '',
      updated_at: new Date().toISOString(),
    });
    setSavingId(null);
  };

  return (
    <div>
      <h1>Modifier les sorties</h1>
      <div className="airtable-scroll">
        <Table className="airtable-table" bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Service</th>
              <th>Employé</th>
              <th>Patient</th>
              <th>Chambre</th>
              <th>Mémo</th>
              <th>Articles</th>
              <th className="airtable-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorties.map((sortie) => (
              <tr key={sortie.id}>
                <td>
                  <Form.Control
                    className="airtable-input"
                    type="datetime-local"
                    value={toLocalInputValue(sortie.date_sortie)}
                    onChange={(e) => handleFieldChange(sortie.id, 'date_sortie', toIsoFromLocal(e.target.value))}
                  />
                </td>
                <td>
                  <Form.Select
                    className="airtable-input"
                    value={sortie.service || ''}
                    onChange={(e) => handleFieldChange(sortie.id, 'service', e.target.value)}
                  >
                    <option value="">—</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Form.Select
                    className="airtable-input"
                    value={sortie.employe || ''}
                    onChange={(e) => handleFieldChange(sortie.id, 'employe', e.target.value)}
                  >
                    <option value="">—</option>
                    {employeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Form.Select
                    className="airtable-input"
                    value={sortie.patient_id || ''}
                    onChange={(e) => handleFieldChange(sortie.id, 'patient_id', e.target.value || undefined)}
                  >
                    <option value="">—</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    type="number"
                    value={sortie.chambre ?? ''}
                    onChange={(e) => handleFieldChange(sortie.id, 'chambre', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    value={sortie.memo || ''}
                    onChange={(e) => handleFieldChange(sortie.id, 'memo', e.target.value)}
                  />
                </td>
                <td className="text-muted">{articlesSummary(sortie)}</td>
                <td className="airtable-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSave(sortie.id)}
                    disabled={savingId === sortie.id}
                  >
                    {savingId === sortie.id ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Sauvegarde
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {sorties.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">
                  Aucune sortie trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SortiesEditor;
