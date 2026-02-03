import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Table, Spinner } from 'react-bootstrap';
import { getCollection, updateDocument } from '../../firebase/firestoreService';
import type { Medicament } from '../../types';

const MEDICAMENT_TYPES = [
  'Comprimé',
  'Goutte',
  'Matériel médical',
  'Sirop',
  'Soluté',
  'Solution injectable',
];

const MedicamentEditor: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    const data = await getCollection('medicaments') as Medicament[];
    setMedicaments(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFieldChange = (id: string, field: keyof Medicament, value: any) => {
    setMedicaments((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleSave = async (id: string) => {
    const medicament = medicaments.find((med) => med.id === id);
    if (!medicament) return;
    setSavingId(id);
    await updateDocument('medicaments', id, {
      nom: medicament.nom,
      prix: Number(medicament.prix) || 0,
      type: medicament.type,
      presentation: medicament.presentation,
      lot: medicament.lot || '',
      expiration_date: medicament.expiration_date || '',
      updated_at: new Date().toISOString(),
    });
    setSavingId(null);
  };

  const filtered = medicaments.filter((med) =>
    med.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Modifier les médicaments</h1>
        <InputGroup className="search-group">
          <Form.Control
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              Effacer
            </Button>
          )}
        </InputGroup>
      </div>

      <div className="airtable-scroll">
        <Table className="airtable-table" bordered hover responsive>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prix</th>
              <th>Type</th>
              <th>Présentation</th>
              <th>Lot</th>
              <th>Expiration</th>
              <th>Stock</th>
              <th className="airtable-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med) => (
              <tr key={med.id}>
                <td>
                  <Form.Control
                    className="airtable-input"
                    value={med.nom}
                    onChange={(e) => handleFieldChange(med.id, 'nom', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    type="number"
                    value={med.prix}
                    onChange={(e) => handleFieldChange(med.id, 'prix', Number(e.target.value))}
                  />
                </td>
                <td>
                  <Form.Select
                    className="airtable-input"
                    value={med.type}
                    onChange={(e) => handleFieldChange(med.id, 'type', e.target.value)}
                  >
                    <option value="">—</option>
                    {MEDICAMENT_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    value={med.presentation || ''}
                    onChange={(e) => handleFieldChange(med.id, 'presentation', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    value={med.lot || ''}
                    onChange={(e) => handleFieldChange(med.id, 'lot', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    className="airtable-input"
                    type="date"
                    value={med.expiration_date || ''}
                    onChange={(e) => handleFieldChange(med.id, 'expiration_date', e.target.value)}
                  />
                </td>
                <td className="text-center">{med.quantite_en_stock}</td>
                <td className="airtable-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSave(med.id)}
                    disabled={savingId === med.id}
                  >
                    {savingId === med.id ? (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">
                  Aucun médicament trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default MedicamentEditor;
