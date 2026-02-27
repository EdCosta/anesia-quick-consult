const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const procs = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/procedures.v3.json'), 'utf8'),
);
const guidelines = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/guidelines.v1.json'), 'utf8'),
);
const protocoles = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/protocoles.v1.json'), 'utf8'),
);
const alr = JSON.parse(fs.readFileSync(path.join(root, 'public/data/alr.v1.json'), 'utf8'));

// Escape single quotes for SQL
function esc(obj) {
  return JSON.stringify(obj).replace(/'/g, "''");
}
function escStr(s) {
  return (s || '').replace(/'/g, "''");
}

let sql = '';

// ── PROCEDURES ──────────────────────────────────────────────────────────────
sql += '-- ── 12. PROCEDURES ──────────────────────────────────────────\n\n';
sql +=
  'INSERT INTO public.procedures (id, specialty, titles, synonyms, content, tags, is_pro) VALUES\n';

const procRows = procs.map((p) => {
  const content = { quick: p.quick || {}, deep: p.deep || {} };
  return `('${escStr(p.id)}', '${escStr(p.specialty)}', '${esc(p.titles || {})}'::jsonb, '${esc(p.synonyms || {})}'::jsonb, '${esc(content)}'::jsonb, '${esc(p.tags || [])}'::jsonb, ${p.is_pro ? 'true' : 'false'})`;
});

sql += procRows.join(',\n');
sql += `
ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  is_pro = EXCLUDED.is_pro,
  updated_at = now();

`;

// ── GUIDELINES ──────────────────────────────────────────────────────────────
sql += '-- ── 13. GUIDELINES ──────────────────────────────────────────\n\n';
if (guidelines.length > 0) {
  sql += 'INSERT INTO public.guidelines (id, category, titles, items, refs, tags) VALUES\n';
  const gRows = guidelines.map((g) => {
    const refs = g.references || g.refs || [];
    return `('${escStr(g.id)}', '${escStr(g.category)}', '${esc(g.titles || {})}'::jsonb, '${esc(g.items || {})}'::jsonb, '${esc(refs)}'::jsonb, '${esc(g.tags || [])}'::jsonb)`;
  });
  sql += gRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
} else {
  sql += '-- (no guidelines in JSON)\n\n';
}

// ── PROTOCOLES ──────────────────────────────────────────────────────────────
sql += '-- ── 14. PROTOCOLES ──────────────────────────────────────────\n\n';
if (protocoles.length > 0) {
  sql += 'INSERT INTO public.protocoles (id, category, titles, steps, refs, tags) VALUES\n';
  const pRows = protocoles.map((p) => {
    const refs = p.references || p.refs || [];
    return `('${escStr(p.id)}', '${escStr(p.category)}', '${esc(p.titles || {})}'::jsonb, '${esc(p.steps || {})}'::jsonb, '${esc(refs)}'::jsonb, '${esc(p.tags || [])}'::jsonb)`;
  });
  sql += pRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
} else {
  sql += '-- (no protocoles in JSON)\n\n';
}

// ── ALR BLOCKS ──────────────────────────────────────────────────────────────
sql += '-- ── 15. ALR BLOCKS ──────────────────────────────────────────\n\n';
if (alr.length > 0) {
  sql +=
    'INSERT INTO public.alr_blocks (id, region, titles, indications, contraindications, technique, drugs, tags) VALUES\n';
  const aRows = alr.map((a) => {
    return `('${escStr(a.id)}', '${escStr(a.region)}', '${esc(a.titles || {})}'::jsonb, '${esc(a.indications || {})}'::jsonb, '${esc(a.contraindications || {})}'::jsonb, '${esc(a.technique || {})}'::jsonb, '${esc(a.drugs || {})}'::jsonb, '${esc(a.tags || [])}'::jsonb)`;
  });
  sql += aRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
} else {
  sql += '-- (no ALR blocks in JSON)\n\n';
}

sql += '-- =============================================================\n';
sql += '-- FIM — Dados completos AnesIA\n';
sql += '-- =============================================================\n';

fs.writeFileSync(path.join(root, 'supabase/seed_data.sql'), sql);
console.log(`Done!`);
console.log(`  Procedures: ${procs.length}`);
console.log(`  Guidelines: ${guidelines.length}`);
console.log(`  Protocoles: ${protocoles.length}`);
console.log(`  ALR blocks: ${alr.length}`);
console.log(`Output: supabase/seed_data.sql`);
