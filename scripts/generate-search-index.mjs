#!/usr/bin/env node
/**
 * Generiert public/search-index.json aus Content-Collections + Hauptseiten.
 * Läuft als prebuild-Hook vor `astro build`.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(root, '..');
const contentDir = join(repoRoot, 'src', 'content');
const publicDir = join(repoRoot, 'public');
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

/* ── Frontmatter-Parser (minimal, kein npm-dep) ── */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    fm[kv[1]] = val;
  }
  return fm;
}

/* ── YAML-Parser (minimal — name + description top-level) ── */
function parseYamlTop(raw) {
  const out = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m && !line.startsWith(' ')) {
      out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
    if (Object.keys(out).length > 6) break;
  }
  return out;
}

const entries = [];

/* Hauptseiten — hardcoded mit guten Titeln + Aliases */
const mainPages = [
  { url: '/', title: 'Microvista — Industrielle Computertomographie', desc: 'Defektanalyse, Dimensionsmessung, Montage- & Fügekontrolle.', kind: 'page', tags: ['Home', 'Start', 'Microvista'] },
  { url: '/labor', title: 'CT-Labor — Externe Qualitätskontrolle', desc: 'Stationäre CT-Prüfung im zertifizierten Labor.', kind: 'service', tags: ['Labor', 'Erstmuster', 'CT-Labor'] },
  { url: '/labor/erstmusterpruefung', title: 'Erstmusterprüfung (EMPB)', desc: 'EMPB nach VDA 2 / PPAP. CT-basiert, FAIR.', kind: 'service', tags: ['EMPB', 'FAIR', 'PPAP', 'Erstmuster', 'Bemusterung'] },
  { url: '/labor/schadensanalyse', title: 'Schadensanalyse', desc: 'Bauteilversagen, Defektanalyse, Ursachenermittlung.', kind: 'service', tags: ['Reklamation', 'Schaden', 'Defekt', 'Failure Analysis'] },
  { url: '/labor/reverse-engineering', title: 'Reverse Engineering', desc: 'CAD-Modelle aus realen Bauteilen, Soll-Ist-Vergleich.', kind: 'service', tags: ['Reverse', 'CAD', 'Soll-Ist'] },
  { url: '/serie', title: 'Serienprüfung', desc: 'Vollautomatische CT-Inspektion großer Stückzahlen.', kind: 'service', tags: ['Serie', '100% Prüfung', 'Inline-CT'] },
  { url: '/serie/inline-ct', title: 'Inline-CT', desc: 'CT-Prüfung direkt in der Produktionslinie.', kind: 'service', tags: ['Inline', 'In-Line', 'Linie'] },
  { url: '/serie/100-prozent-pruefung', title: '100%-Prüfung', desc: '100% Stückprüfung mit industrieller CT.', kind: 'service', tags: ['100%', 'Prüfung', 'Vollprüfung'] },
  { url: '/serie/ki-automatisierung', title: 'KI-Automatisierung', desc: 'KI-gestützte Auswertung mit InspectVista.', kind: 'service', tags: ['KI', 'AI', 'Automatisierung'] },
  { url: '/software', title: 'InspectVista Software', desc: 'CT-Software & Cloud-Auswertung. 5× schneller, 10× höher aufgelöst.', kind: 'service', tags: ['Software', 'InspectVista', 'Cloud', 'VistaXPro'] },
  { url: '/branchen', title: 'Branchenlösungen', desc: '14 Branchen — Automotive bis Medizintechnik.', kind: 'page', tags: ['Branchen', 'Industrien'] },
  { url: '/magazin', title: 'Magazin', desc: 'Praxisartikel, Marktanalysen, Trends.', kind: 'page', tags: ['Magazin', 'Blog', 'Artikel'] },
  { url: '/wiki', title: 'CT-Wiki', desc: 'Begriffe der industriellen CT erklärt.', kind: 'page', tags: ['Wiki', 'Glossar', 'Definitionen'] },
  { url: '/express-ct-inspektion', title: 'Express CT-Inspektion', desc: 'Akute Reklamation? Inspektion in 24h.', kind: 'service', tags: ['Express', '24h', 'Eil', 'Reklamation'] },
  { url: '/forschung-entwicklung', title: 'Forschung & Entwicklung', desc: 'F&E-gefördert seit 2011.', kind: 'page', tags: ['F&E', 'Forschung', 'R&D'] },
  { url: '/zertifizierungen', title: 'Zertifizierungen', desc: 'ISO 9001 zertifiziert, TISAX 27001 in Zertifizierung.', kind: 'page', tags: ['ISO 9001', 'TISAX', 'Zertifikate'] },
  { url: '/industrial-ct-scanner-cost', title: 'Industrial CT Scanner: Kaufen oder Mieten?', desc: 'Wirtschaftlichkeitsrechner für ScanExpress.', kind: 'page', tags: ['Rechner', 'Kosten', 'Mieten', 'Kaufen', 'ROI'] },
  { url: '/kontakt', title: 'Kontakt', desc: 'Beratung, Angebot, Rückruf.', kind: 'page', tags: ['Kontakt', 'Beratung'] },
  { url: '/fragebogen', title: 'Fragebogen', desc: 'Detaillierten Anfragefragebogen ausfüllen.', kind: 'page', tags: ['Fragebogen', 'Anfrage'] },
  { url: '/faq', title: 'FAQ', desc: 'Häufige Fragen.', kind: 'page', tags: ['FAQ', 'Fragen'] },
];
entries.push(...mainPages);

/* Branchen */
try {
  const files = readdirSync(join(contentDir, 'branchen')).filter(f => f.endsWith('.yaml'));
  for (const f of files) {
    const slug = f.replace(/\.yaml$/, '');
    const raw = readFileSync(join(contentDir, 'branchen', f), 'utf-8');
    const yml = parseYamlTop(raw);
    entries.push({
      url: `/branchen/${slug}`,
      title: yml.name || slug,
      desc: (yml.description || '').slice(0, 140),
      kind: 'branche',
      tags: ['Branche', yml.name || slug],
    });
  }
} catch (e) { console.warn('Branchen skipped:', e.message); }

/* Wiki DE */
try {
  const dir = join(contentDir, 'wiki', 'de');
  const files = readdirSync(dir).filter(f => f.endsWith('.mdx'));
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    const fm = parseFrontmatter(readFileSync(join(dir, f), 'utf-8'));
    entries.push({
      url: `/wiki/${slug}`,
      title: fm.title || slug,
      desc: (fm.description || '').slice(0, 140),
      kind: 'wiki',
      tags: ['Wiki', fm.title || slug],
    });
  }
} catch (e) { console.warn('Wiki skipped:', e.message); }

/* Magazin DE — Titel + Slug */
try {
  const dir = join(contentDir, 'magazin', 'de');
  const files = readdirSync(dir).filter(f => f.endsWith('.mdx') && f !== 'posts.mdx');
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    const fm = parseFrontmatter(readFileSync(join(dir, f), 'utf-8'));
    entries.push({
      url: `/magazin/${slug}`,
      title: fm.title || slug,
      desc: (fm.description || '').slice(0, 140),
      kind: 'magazin',
      tags: ['Magazin', 'Artikel'],
    });
  }
} catch (e) { console.warn('Magazin skipped:', e.message); }

/* Schreibe Index */
const out = { generated: new Date().toISOString(), count: entries.length, entries };
writeFileSync(join(publicDir, 'search-index.json'), JSON.stringify(out));
console.log(`✓ search-index.json — ${entries.length} entries`);
