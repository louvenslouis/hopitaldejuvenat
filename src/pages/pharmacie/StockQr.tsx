import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { getCollection } from '../../firebase/firestoreService';
import type { Medicament } from '../../types';
import { downloadTextFile } from '../../utils/export';

const MAX_QR_TEXT_LENGTH = 2800;
const MAX_AUTO_PAGES = 6;

const StockQr: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeLot, setIncludeLot] = useState(false);
  const [includeExpiration, setIncludeExpiration] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [csvMode, setCsvMode] = useState(false);
  const [maxItems, setMaxItems] = useState(120);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCollection('medicaments') as Medicament[];
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [compactMode, csvMode, includeLot, includeExpiration, maxItems]);

  const baseRows = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.nom.localeCompare(b.nom));
    return sorted.slice(0, maxItems);
  }, [items, maxItems]);

  const columns = useMemo(() => {
    const cols = ['Nom', 'Stock'];
    if (!compactMode) {
      if (includeLot) cols.push('Lot');
      if (includeExpiration) cols.push('Expiration');
    }
    return cols;
  }, [compactMode, includeLot, includeExpiration]);

  const formatRow = (item: Medicament) => {
    const values = [item.nom, String(item.quantite_en_stock ?? 0)];
    if (!compactMode) {
      if (includeLot) values.push(item.lot || '—');
      if (includeExpiration) {
        values.push(item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('fr-HT') : '—');
      }
    }
    return csvMode ? values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',') : values.join(' | ');
  };

  const headerLines = useMemo(() => {
    if (csvMode) {
      return [columns.join(',')];
    }
    return [
      'HOPITAL DE JUVENAT',
      'STOCK ACTUEL',
      `Date: ${new Date().toLocaleString('fr-HT')}`,
      '',
      columns.join(' | '),
    ];
  }, [columns, csvMode]);

  const chunks = useMemo(() => {
    if (baseRows.length === 0) return [];
    const rows = baseRows.map(formatRow);
    const pages: string[] = [];
    let current: string[] = [];
    for (const row of rows) {
      const candidate = [...current, row];
      const payload = [...headerLines, ...candidate].join('\n');
      if (payload.length > MAX_QR_TEXT_LENGTH && current.length > 0) {
        pages.push([...headerLines, ...current].join('\n'));
        current = [row];
      } else {
        current = candidate;
      }
    }
    if (current.length) {
      pages.push([...headerLines, ...current].join('\n'));
    }
    return pages;
  }, [baseRows, headerLines]);

  const totalPages = chunks.length;
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const payload = chunks[safePage - 1] || '';

  const payloadLength = payload.length;
  const isTooLarge = payloadLength > MAX_QR_TEXT_LENGTH;
  const isTooManyPages = totalPages > MAX_AUTO_PAGES;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadCsv = () => {
    const rows = baseRows.map((item) => {
      const values = [item.nom, String(item.quantite_en_stock ?? 0)];
      const line = values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
      return line;
    });
    const header = 'Nom,Stock';
    const content = [header, ...rows].join('\n');
    const dateTag = new Date().toISOString().slice(0, 10);
    downloadTextFile(`${dateTag}_stock.csv`, content, 'text/csv;charset=utf-8');
  };

  return (
    <div>
      <h1>QR Code - Stock actuel</h1>
      <p className="text-muted">
        Ce QR code contient directement la liste du stock en texte.
      </p>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <Form.Check
          type="switch"
          id="qr-compact-mode"
          label="Mode compact (Nom + Stock)"
          checked={compactMode}
          onChange={() => setCompactMode(!compactMode)}
        />
        <Form.Check
          type="switch"
          id="qr-csv-mode"
          label="Format CSV"
          checked={csvMode}
          onChange={() => setCsvMode(!csvMode)}
        />
        <Form.Check
          type="switch"
          id="qr-include-lot"
          label="Inclure le lot"
          checked={includeLot}
          onChange={() => setIncludeLot(!includeLot)}
          disabled={compactMode}
        />
        <Form.Check
          type="switch"
          id="qr-include-expiration"
          label="Inclure l’expiration"
          checked={includeExpiration}
          onChange={() => setIncludeExpiration(!includeExpiration)}
          disabled={compactMode}
        />
        <Form.Group className="d-flex align-items-center gap-2">
          <Form.Label className="mb-0">Nombre de lignes</Form.Label>
          <Form.Control
            type="number"
            min={10}
            max={500}
            style={{ width: '110px' }}
            value={maxItems}
            onChange={(e) => setMaxItems(Number(e.target.value) || 10)}
          />
        </Form.Group>
      </div>
      {isTooLarge && (
        <Alert variant="warning">
          Le contenu est trop long pour un QR code fiable. Réduis le nombre de lignes ou enlève des champs.
        </Alert>
      )}
      {isTooManyPages && (
        <Alert variant="info">
          Le contenu est découpé en {totalPages} QR codes. Tu peux naviguer entre les pages.
        </Alert>
      )}
      <Card className="qr-card">
        <Card.Body className="qr-card-body">
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Génération du QR…</span>
            </div>
          ) : isTooLarge ? (
            <div className="text-warning">
              Contenu trop volumineux pour un QR code fiable.
            </div>
          ) : (
            <QRCodeCanvas value={payload} size={240} includeMargin level="L" />
          )}
          <div className="qr-actions">
            <div className="qr-url">
              {payloadLength} caractères {totalPages > 1 ? `• QR ${safePage}/${totalPages}` : ''}
            </div>
            {totalPages > 1 && (
              <div className="d-flex gap-2 flex-wrap justify-content-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setPage(Math.max(safePage - 1, 1))}
                  disabled={safePage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setPage(Math.min(safePage + 1, totalPages))}
                  disabled={safePage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <Button variant="primary" onClick={handleCopy} disabled={loading}>
                {copied ? 'Copié' : 'Copier le texte'}
              </Button>
              <Button variant="outline-primary" onClick={handleDownloadCsv} disabled={loading}>
                Exporter CSV
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockQr;
