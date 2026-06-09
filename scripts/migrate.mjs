/* Einmalige Content-Migration: CM4all-HTML (lokal in /tmp/notare_src) -> Markdown
   in src/content/. Extrahiert #content_main, bereinigt CM4all-Ballast, löst
   Layout-Tabellen auf, normalisiert Überschriften, mappt Bilder/Links und
   schreibt Frontmatter. Aufruf: `npm run migrate`.
   Erzeugt am Ende einen QA-Diff-Report (Zeichenzahl Original vs. Markdown). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = '/tmp/notare_src';
const TITLE_SUFFIX = / *\| *Notare Dr\. Tim Kasper und Philip Scholz/;

// slug -> Zielsammlung + Dateiname; optionaler Titel-Override
const PAGES = [
  // --- Leistungen ---
  ['LEISTUNGEN__Allgemein.html', 'leistungen', 'allgemein'],
  ['LEISTUNGEN__Immobilien.html', 'leistungen', 'immobilien'],
  ['LEISTUNGEN__Erb-Pflichtteilsrecht.html', 'leistungen', 'erb-pflichtteilsrecht'],
  ['LEISTUNGEN__Vorsorgevollmacht-etc.html', 'leistungen', 'vorsorgevollmacht-etc', 'Notfallvorsorge'],
  ['LEISTUNGEN__Ehe-Familie.html', 'leistungen', 'ehe-familie'],
  ['LEISTUNGEN__Gesellschaften-Unternehmen.html', 'leistungen', 'gesellschaften-unternehmen'],
  ['LEISTUNGEN__Vereine.html', 'leistungen', 'vereine'],
  ['LEISTUNGEN__Beratung-und-weiteres-Verfahren.html', 'leistungen', 'beratung-und-weiteres-verfahren'],
  ['LEISTUNGEN__Beratung-und-weiteres-Verfahren__isolierte-Beratung.html', 'leistungen', 'isolierte-beratung'],
  ['LEISTUNGEN__Beratung-und-weiteres-Verfahren__weiteres-Verfahren-mit-Beurkundung.html', 'leistungen', 'weiteres-verfahren-mit-beurkundung'],
  ['LEISTUNGEN__Beratung-und-weiteres-Verfahren__weiteres-Verfahren-ohne-Beurkundung.html', 'leistungen', 'weiteres-verfahren-ohne-beurkundung'],
  ['LEISTUNGEN__Notarkosten.html', 'leistungen', 'notarkosten'],
  ['LEISTUNGEN__Wissenswertes-FAQ.html', 'leistungen', 'wissenswertes-faq'],
  // --- Seiten ---
  ['UeBER-UNS.html', 'seiten', 'ueber-uns', 'Über uns'],
  ['UeBER-UNS__Umzug.html', 'seiten', 'umzug', 'Wir sind umgezogen'],
  ['KARRIERE.html', 'seiten', 'karriere', 'Karriere'],
  ['KONTAKT__Impressum.html', 'seiten', 'impressum', 'Impressum'],
  ['SONSTIGES.html', 'seiten', 'sonstiges', 'Sonstiges'],
  ['SONSTIGES__Datenschutz.html', 'seiten', 'datenschutz', 'Datenschutz'],
  ['SONSTIGES__Datenschutz__Allgemein.html', 'seiten', 'datenschutz-allgemein', 'Datenschutz – Allgemein'],
  ['SONSTIGES__Datenschutz__Website.html', 'seiten', 'datenschutz-website', 'Datenschutz – Website'],
  ['SONSTIGES__Geldwaesche-Praevention.html', 'seiten', 'geldwaesche-praevention', 'Geldwäsche-Prävention'],
  ['verantwortliche.html', 'seiten', 'verantwortliche', 'Verantwortliche'],
  ['links.html', 'seiten', 'links', 'Links'],
  ['LINKS__Register.html', 'seiten', 'register', 'Register'],
  ['standesorganisationen.html', 'seiten', 'standesorganisationen', 'Standesorganisationen'],
  ['weitere.html', 'seiten', 'weitere', 'Weitere'],
  ['NEWS.html', 'seiten', 'news', 'News'],
  ['LEISTUNGEN.html', 'seiten', 'leistungen-intro', 'Leistungen'],
  ['UeBER-UNS.html', 'seiten', 'ueber-uns-dup-skip', '__SKIP__'], // platzhalter, wird gefiltert
];

const IMG_SPECIAL = {
  'haus schmitz bild 4a korrigiert_dxo.jpg': 'haus-schmitz.jpg',
  'titelbild.jpg': 'titelbild.jpg',
  'portrait_dr_kasper_02.png': 'portrait-kasper.png',
  'portrait_philip_schulz.png': 'portrait-scholz.png',
  'hauptstr. 41 kartenausschnitt1.jpg.png': 'kartenausschnitt.png',
};
const ICON_MAP = {
  'icon_erbe_03.png': 'icon-erbe.png',
  'icon_immobilien_03.png': 'icon-immobilien.png',
  'icon_unternhemensgruendung_03.png': 'icon-unternehmen.png',
  'icon_ehe_03.png': 'icon-ehe.png',
  'icon_kosten.png': 'icon-kosten.png',
  'icon_notfall.png': 'icon-notfall.png',
  'icon_vereine.png': 'icon-vereine.png',
  'icon_info.png': 'icon-info.png',
};

function mapImage(src) {
  let p = decodeURIComponent(src.split('?')[0]).replace(/\/picture-\d+$/, '');
  const base = p.split('/').pop() || '';
  const name = base.replace(/^\./, '');
  const lower = name.toLowerCase();
  if (IMG_SPECIAL[lower]) return { file: IMG_SPECIAL[lower], dir: 'images' };
  if (ICON_MAP[lower]) return { file: ICON_MAP[lower], dir: 'icons' };
  return { file: name, dir: 'images' }; // Contentbilder unverändert
}

function cleanHref(href) {
  if (!href) return href;
  href = href.replace(/^link:/i, '').trim(); // CM4all-Eigenart "link:/…"
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  let h = decodeURIComponent(href);
  h = h.replace(/(desktop\/)?index\.php\//gi, '');
  h = h.replace(/^\/HOME\/?$/i, '/');
  if (!h.startsWith('/')) h = '/' + h;
  if (!h.endsWith('/') && !/\.[a-z0-9]+$/i.test(h)) h += '/';
  return h;
}

function normalizeHeadings($, scope) {
  const levels = [];
  scope.find('h1,h2,h3,h4,h5,h6').each((_, el) => levels.push(+el.tagName[1]));
  if (!levels.length) return;
  const min = Math.min(...levels);
  const shift = 2 - min; // kleinste Ebene -> h2 (h1 liefert das Layout)
  if (shift === 0) return;
  scope.find('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const lvl = Math.min(6, Math.max(2, +el.tagName[1] + shift));
    el.tagName = 'h' + lvl;
  });
}

function handleTables($, scope) {
  scope.find('table').each((_, tbl) => {
    const $tbl = $(tbl);
    let maxCells = 0;
    $tbl.find('tr').each((__, tr) => {
      maxCells = Math.max(maxCells, $(tr).find('td,th').length);
    });
    if (maxCells <= 1) {
      // Layout-Tabelle: Zellinhalte als Blockfolge ausgeben
      const parts = [];
      $tbl.find('td,th').each((__, cell) => parts.push($(cell).html() || ''));
      $tbl.replaceWith('<div>' + parts.join('\n') + '</div>');
    } else {
      // Echte Datentabelle: erste Zeile -> <th scope=col>, als sauberes HTML behalten
      const firstRow = $tbl.find('tr').first();
      firstRow.find('td').each((__, td) => {
        td.tagName = 'th';
        $(td).attr('scope', 'col');
      });
    }
  });
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  hr: '---',
});
// Echte Datentabellen als sauberes HTML im Markdown behalten (prose.css stylt sie).
turndown.keep(['table']);
// Bilder als Markdown mit (bereits gesetztem) relativen Pfad
turndown.addRule('cleanImg', {
  filter: 'img',
  replacement: (_c, node) => {
    const src = node.getAttribute('src') || '';
    const alt = (node.getAttribute('alt') || '').replace(/\n/g, ' ').trim();
    return src ? `![${alt}](${src})` : '';
  },
});

function plain(t) {
  return t.replace(/\s+/g, ' ').trim();
}
function stripMd(md) {
  return md
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function migrate(file, collection, slug, titleOverride) {
  const fp = path.join(SRC, file);
  if (!fs.existsSync(fp)) return { slug, status: 'FEHLT' };
  const html = fs.readFileSync(fp, 'utf8');
  const $ = cheerio.load(html);

  // Titel
  let title = titleOverride;
  if (!title) {
    title = ($('title').first().text() || slug).replace(TITLE_SUFFIX, '').trim();
  }

  let main = $('#content_main');
  if (!main.length) main = $('main').first();
  if (!main.length) main = $('body');

  // Ballast entfernen
  main
    .find(
      'script,style,noscript,iframe,[class*="cookie"],.cm-templates-triangle,.triangle,.cm-wp-container,[id*="cookie"]'
    )
    .remove();

  // Rausch-Attribute global entfernen, <span> auflösen
  main.find('*').each((_, el) => {
    for (const a of ['style', 'class', 'id', 'align', 'valign', 'width', 'height', 'bgcolor', 'data-cm-hintable', 'role', 'tabindex']) {
      $(el).removeAttr(a);
    }
  });
  main.find('span,font').each((_, el) => $(el).replaceWith($(el).html() || ''));
  // Leere Links entfernen (Text leer)
  main.find('a').each((_, el) => {
    if (!$(el).text().trim() && !$(el).find('img').length) $(el).remove();
  });

  // Tabellen behandeln, Überschriften normalisieren
  handleTables($, main);
  normalizeHeadings($, main);

  // Bilder umschreiben (relativer Pfad zu src/assets/<dir>)
  main.find('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (!src.includes('uproc.php')) {
      $(el).remove();
      return;
    }
    const { file: f, dir } = mapImage(src);
    $(el).attr('src', `../../assets/${dir}/${f}`);
    $(el).removeAttr('srcset width height style class loading');
  });

  // Links säubern
  main.find('a').each((_, el) => {
    let href = ($(el).attr('href') || '').replace(/^link:/i, '').trim();
    // Nicht navigierbare bzw. nicht migrierte Ziele -> Anker entfernen, Text behalten
    if (!href || /^javascript:/i.test(href) || href === '#' || /(\/\.cm4all\/|uproc\.php)/i.test(href)) {
      $(el).replaceWith($(el).html() || $(el).text() || '');
      return;
    }
    const nh = cleanHref(href);
    $(el).attr('href', nh);
    $(el).removeAttr('class title target rel onclick');
    if (/^https?:/i.test(nh)) {
      $(el).attr('target', '_blank');
      $(el).attr('rel', 'noopener noreferrer');
    }
  });

  const originalText = plain(main.text());

  let md = turndown.turndown(main.html() || '');
  md = md
    .replace(/ /g, ' ')
    .replace(/(?<!!)\[\]\([^)]*\)/g, '') // leere Links – aber NICHT Bilder ![](…)
    .replace(/^(#{1,6} )\*\*(.+?)\*\*\s*$/gm, '$1$2') // Bold um ganze Überschrift entfernen
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Beschreibung aus erstem Absatz
  const firstPara = (md.split('\n').find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('![')) || '');
  let desc = stripMd(firstPara).slice(0, 155);
  if (desc.length === 155) desc = desc.replace(/\s+\S*$/, '') + ' …';

  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(desc)}`,
    '---',
    '',
  ].join('\n');

  const outDir = path.join(ROOT, 'src', 'content', collection);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${slug}.md`), fm + md + '\n', 'utf8');

  const mdText = stripMd(md);
  const diff = originalText.length ? Math.round((mdText.length / originalText.length) * 100) : 0;
  return { slug, collection, status: 'ok', orig: originalText.length, md: mdText.length, pct: diff };
}

console.log('== Content-Migration ==');
const report = [];
for (const [file, col, slug, title] of PAGES) {
  if (title === '__SKIP__') continue;
  report.push(migrate(file, col, slug, title));
}
console.log('\nslug'.padEnd(40), 'orig'.padStart(7), 'md'.padStart(7), '  %');
for (const r of report) {
  if (r.status !== 'ok') {
    console.log(r.slug.padEnd(40), r.status);
    continue;
  }
  const warn = r.pct < 90 || r.pct > 115 ? '  <-- PRÜFEN' : '';
  console.log(r.slug.padEnd(40), String(r.orig).padStart(7), String(r.md).padStart(7), String(r.pct).padStart(4) + '%' + warn);
}
console.log('\nFertig. Dateien in src/content/.');
