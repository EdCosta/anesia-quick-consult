import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

type ProcedureSeedRow = {
  id: string;
  specialty: string;
  titles: Record<string, unknown>;
  synonyms: Record<string, unknown>;
  content: Record<string, unknown>;
  tags: unknown[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CSV_PATH = path.join(REPO_ROOT, 'data', 'procedures', 'procedures.csv');
const BATCH_SIZE = 100;

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ';' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

async function loadEnvFile(filePath: string): Promise<void> {
  try {
    const raw = await readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException;
    if (fsError.code !== 'ENOENT') {
      throw error;
    }
  }
}

function parseJsonField<T>(value: string, fallback: T, context: string): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${context}: ${(error as Error).message}`);
  }
}

function parseProceduresCsv(csvText: string): ProcedureSeedRow[] {
  const cleaned = csvText
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const header = parseCSVLine(lines[0]).map((field) => field.trim().toLowerCase());
  const getIndex = (fieldName: string) => header.indexOf(fieldName);
  const requiredFields = ['id', 'specialty', 'titles', 'synonyms', 'content', 'tags'];

  for (const fieldName of requiredFields) {
    if (getIndex(fieldName) < 0) {
      throw new Error(`CSV missing required column "${fieldName}"`);
    }
  }

  const rows: ProcedureSeedRow[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const values = parseCSVLine(lines[rowIndex]);
    const pick = (fieldName: string) => {
      const index = getIndex(fieldName);
      return index >= 0 && index < values.length ? values[index].trim() : '';
    };

    const id = pick('id');
    const specialty = pick('specialty');

    if (!id || !specialty) {
      continue;
    }

    rows.push({
      id,
      specialty,
      titles: parseJsonField<Record<string, unknown>>(
        pick('titles'),
        {},
        `row ${rowIndex + 1} titles`,
      ),
      synonyms: parseJsonField<Record<string, unknown>>(
        pick('synonyms'),
        {},
        `row ${rowIndex + 1} synonyms`,
      ),
      content: parseJsonField<Record<string, unknown>>(
        pick('content'),
        {},
        `row ${rowIndex + 1} content`,
      ),
      tags: parseJsonField<unknown[]>(pick('tags'), [], `row ${rowIndex + 1} tags`),
    });
  }

  return rows;
}

async function main(): Promise<void> {
  await loadEnvFile(path.join(REPO_ROOT, '.env.local'));
  await loadEnvFile(path.join(REPO_ROOT, '.env'));

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  const csvPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : DEFAULT_CSV_PATH;
  const csvText = await readFile(csvPath, 'utf8');
  const rows = parseProceduresCsv(csvText);

  if (rows.length === 0) {
    console.log(`No rows found in ${csvPath}`);
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const updatedAt = new Date().toISOString();
  let processed = 0;

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE).map((row) => ({
      id: row.id,
      specialty: row.specialty,
      titles: row.titles,
      synonyms: row.synonyms,
      content: row.content,
      tags: row.tags,
      updated_at: updatedAt,
    }));

    const { error } = await supabase.from('procedures').upsert(batch, {
      onConflict: 'id',
    });

    if (error) {
      throw new Error(
        `Supabase upsert failed at batch ${index / BATCH_SIZE + 1}: ${error.message}`,
      );
    }

    processed += batch.length;
    console.log(`Upserted ${processed}/${rows.length} procedures`);
  }

  console.log(`Seed complete from ${csvPath}`);
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
