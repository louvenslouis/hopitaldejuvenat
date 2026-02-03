import { getCollection } from '../firebase/firestoreService';

type CollectionData = Record<string, any[]>;

const COLLECTIONS = [
  { key: 'medicaments', label: 'medicaments' },
  { key: 'patients', label: 'patients' },
  { key: 'sorties', label: 'sorties' },
  { key: 'stock', label: 'entrees_stock' },
  { key: 'retour', label: 'retours' },
  { key: 'stock_adjustments', label: 'ajustements_stock' },
  { key: 'personnel', label: 'personnel' },
];

const toSafeString = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const escapeCsvValue = (value: unknown) => {
  const raw = toSafeString(value);
  if (raw.includes('"')) {
    const escaped = raw.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  if (raw.includes(',') || raw.includes('\n') || raw.includes('\r')) {
    return `"${raw}"`;
  }
  return raw;
};

const computeHeaders = (rows: any[]) => {
  const headerSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => headerSet.add(key));
  });
  return Array.from(headerSet);
};

export const fetchAllCollections = async (): Promise<CollectionData> => {
  const results = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const data = await getCollection(c.key);
      return [c.key, data] as const;
    })
  );
  return results.reduce<CollectionData>((acc, [key, data]) => {
    acc[key] = data;
    return acc;
  }, {});
};

export const buildCsvFiles = (data: CollectionData) => {
  const files: Array<{ filename: string; content: string }> = [];
  COLLECTIONS.forEach(({ key, label }) => {
    const rows = data[key] || [];
    const headers = computeHeaders(rows);
    const csvLines = [headers.join(',')];
    rows.forEach((row) => {
      const line = headers.map((h) => escapeCsvValue(row?.[h])).join(',');
      csvLines.push(line);
    });
    files.push({ filename: `${label}.csv`, content: csvLines.join('\n') });
  });
  return files;
};

const inferSqlType = (values: unknown[]) => {
  const filtered = values.filter((v) => v !== null && v !== undefined);
  if (filtered.length === 0) return 'TEXT';
  if (filtered.every((v) => typeof v === 'number')) return 'REAL';
  if (filtered.every((v) => typeof v === 'boolean')) return 'INTEGER';
  return 'TEXT';
};

const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;

const escapeSqlValue = (value: unknown) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (typeof value === 'object') {
    const json = JSON.stringify(value).replace(/'/g, "''");
    return `'${json}'`;
  }
  const text = String(value).replace(/'/g, "''");
  return `'${text}'`;
};

export const buildSqlExport = (data: CollectionData) => {
  const lines: string[] = [];
  lines.push('-- Export SQL - Hopital de Juvenat');
  lines.push('BEGIN TRANSACTION;');

  COLLECTIONS.forEach(({ key }) => {
    const rows = data[key] || [];
    const headers = computeHeaders(rows);
    if (!headers.includes('id')) {
      headers.unshift('id');
    }
    const columnTypes = headers.map((h) => {
      if (h === 'id') return `${quoteIdentifier(h)} TEXT PRIMARY KEY`;
      const values = rows.map((r) => r?.[h]);
      return `${quoteIdentifier(h)} ${inferSqlType(values)}`;
    });
    lines.push(`CREATE TABLE IF NOT EXISTS ${quoteIdentifier(key)} (${columnTypes.join(', ')});`);

    rows.forEach((row) => {
      const values = headers.map((h) => escapeSqlValue(row?.[h]));
      const columns = headers.map(quoteIdentifier).join(', ');
      lines.push(`INSERT INTO ${quoteIdentifier(key)} (${columns}) VALUES (${values.join(', ')});`);
    });
  });

  lines.push('COMMIT;');
  return lines.join('\n');
};

export const downloadTextFile = (filename: string, content: string, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
