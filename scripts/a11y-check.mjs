/* Automatisierter Barrierefreiheits-Check (WCAG 2.1 AA) gegen den statischen
   Build in dist/: eigener Mini-HTTP-Server + Playwright/Chromium + axe-core.
   Aufruf: `npm run build && npm run a11y` (kombiniert: `npm run verify`).
   Grenzen: axe deckt nur ca. 30–50 % der WCAG-Kriterien automatisiert ab;
   Kontrast über background-image wird ggf. nur als 'incomplete' gemeldet.
   Manuelle Prüfung (Tastatur, Screenreader, Zoom) bleibt erforderlich. */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const AXE_PATH = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');

const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Mobil', width: 375, height: 812 },
];

// Seiten, auf denen zusätzlich das Desktop-Nav-Panel geöffnet und erneut
// geprüft wird (deckt die sonst per [hidden] ausgeblendeten Menü-Inhalte ab).
const INTERACTION_PAGES = ['/', '/LEISTUNGEN/'];
const NAV_TOGGLE = '.nav-item__toggle';

const AXE_OPTIONS = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  rules: {
    'heading-order': { enabled: true },
    'target-size': { enabled: true },
  },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};

// Statischer Server für dist/ auf ephemärem Port (trailing slash -> index.html)
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      } catch {
        res.writeHead(400).end('Bad Request');
        return;
      }
      if (pathname.endsWith('/')) pathname += 'index.html';
      // Normalisieren gegen DIST auflösen; alles außerhalb ablehnen (Traversal)
      const filePath = path.resolve(DIST, '.' + pathname);
      if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404).end('Not Found');
          return;
        }
        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Alle dist/**/index.html -> URL-Pfade mit trailing slash
function collectPages(dir, urlBase = '/') {
  const pages = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isDirectory()) {
      pages.push(...collectPages(path.join(dir, entry.name), `${urlBase}${entry.name}/`));
    } else if (entry.name === 'index.html') {
      pages.push(urlBase);
    }
  }
  return pages;
}

async function runAxe(page) {
  const hasAxe = await page.evaluate(() => !!window.axe);
  if (!hasAxe) await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate((options) => window.axe.run(document, options), AXE_OPTIONS);
}

function fmtTargets(nodes) {
  const shown = nodes.slice(0, 5).map((n) => n.target.join(' '));
  const rest = nodes.length - shown.length;
  return shown.join(', ') + (rest > 0 ? ` (+${rest} weitere)` : '');
}

function report(label, result, totals) {
  totals.runs++;
  totals.violations += result.violations.length;
  totals.incomplete += result.incomplete.length;
  if (!result.violations.length && !result.incomplete.length) {
    console.log(`-- ${label} -- OK`);
    return;
  }
  console.log(`-- ${label}`);
  for (const v of result.violations) {
    console.log(`   VERSTOSS ${v.id} [${v.impact || 'n/a'}] – ${v.help}`);
    console.log(`     betroffen: ${fmtTargets(v.nodes)}`);
  }
  for (const i of result.incomplete) {
    const n = i.nodes.length;
    console.log(`   WARNUNG incomplete: ${i.id} (${n} Element${n === 1 ? '' : 'e'}) – manuell prüfen`);
  }
}

// Desktop-Nav-Toggle öffnen und die ganze Seite erneut prüfen.
// Fehlender Selektor oder fehlgeschlagenes Warten ist nur eine Warnung.
async function checkOpenNav(page, pagePath, totals) {
  try {
    const toggle = page.locator(NAV_TOGGLE).first();
    if ((await toggle.count()) === 0) {
      console.warn(`   WARNUNG ${NAV_TOGGLE} nicht gefunden – Menü-Prüfung übersprungen (${pagePath})`);
      return;
    }
    await toggle.click();
    const panelId = await toggle.getAttribute('aria-controls');
    if (panelId) {
      await page.waitForSelector(`[id="${panelId}"]:not([hidden])`, { state: 'visible', timeout: 3000 });
    } else {
      await page.waitForTimeout(300);
    }
    const result = await runAxe(page);
    report(`${pagePath} · Desktop, Menü geöffnet`, result, totals);
  } catch (err) {
    console.warn(`   WARNUNG Menü-Prüfung fehlgeschlagen (${pagePath}): ${err.message}`);
  }
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ fehlt – bitte zuerst npm run build ausführen.');
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(AXE_PATH)) {
    console.error('axe-core nicht gefunden – bitte zuerst npm install ausführen.');
    process.exitCode = 1;
    return;
  }

  const pages = collectPages(DIST);
  if (fs.existsSync(path.join(DIST, '404.html'))) pages.push('/404.html');
  for (const p of INTERACTION_PAGES) {
    if (!pages.includes(p)) {
      console.warn(`WARNUNG Interaktionsseite ${p} nicht in dist/ gefunden – wird übersprungen.`);
    }
  }

  const totals = { runs: 0, violations: 0, incomplete: 0, errors: 0 };
  let server;
  let browser;
  try {
    server = await startServer();
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
    console.log(`== WCAG-Check: ${pages.length} Seiten, ${VIEWPORTS.length} Viewports ==`);

    for (const pagePath of pages) {
      for (const vp of VIEWPORTS) {
        const label = `${pagePath} · ${vp.name} ${vp.width}×${vp.height}`;
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();
        try {
          await page.goto(base + pagePath, { waitUntil: 'networkidle' });
          const result = await runAxe(page);
          report(label, result, totals);
          if (vp.name === 'Desktop' && INTERACTION_PAGES.includes(pagePath)) {
            await checkOpenNav(page, pagePath, totals);
          }
        } catch (err) {
          totals.errors++;
          console.error(`-- ${label} -- FEHLER: ${err.message}`);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }

  console.log('\n== Zusammenfassung ==');
  console.log(`Seiten geprüft:     ${pages.length} (${totals.runs} Prüfläufe)`);
  console.log(`Violations gesamt:  ${totals.violations}`);
  console.log(`Incomplete gesamt:  ${totals.incomplete} (Warnungen, kein Fehler)`);
  if (totals.errors) console.log(`Prüffehler:         ${totals.errors}`);
  if (totals.violations > 0 || totals.errors > 0) process.exitCode = 1;
}

await main();
