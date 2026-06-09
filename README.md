# Notare Wiehl – Website (Neubau)

Moderne, barrierefreie Website für die **Notare Dr. Tim Kasper und Philip Scholz** in Wiehl.
Vollständiger Neubau der bestehenden CM4all-Seite mit **Astro** (statisch) – seriös-modernes
Design, exzellente Navigation und 1:1 übernommene Inhalte.

## Tech-Stack

- **Astro** (statischer Output, `trailingSlash: 'always'`, Directory-Format → exakte Original-URLs)
- **Content Collections** (Markdown) für alle Rechtstexte – verlustfrei migriert
- **Self-hosted Fonts** via `@fontsource-variable` (Rubik + Lora) – kein Google-CDN (DSGVO)
- **astro:assets / Sharp** für responsive AVIF/WebP-Bilder
- **@astrojs/sitemap**, View Transitions, dezente Scroll-Reveals (IntersectionObserver)

## Befehle

```bash
npm install
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
npm run check      # TypeScript-/Astro-Typecheck
npm run fetch:assets   # Original-Bilder/PDFs erneut laden (einmalig, schon ausgeführt)
npm run migrate        # Inhalte aus /tmp/notare_src neu migrieren (einmalig)
```

## Projektstruktur

```
src/
  content.config.ts        Content-Collections (leistungen, seiten)
  content/                 migrierte Rechtstexte (Markdown)
  data/                    navigation.ts · kontakt.ts · downloads.ts · url-labels.ts
  layouts/                 BaseLayout · TextPageLayout
  components/              PageHead · Breadcrumb · Footer · Seo · LeistungenGrid ·
                           KontaktBlock · KarteBlock · SubpageLinks · nav/*
  styles/                  tokens.css · global.css · prose.css
  lib/                     breadcrumbs.ts · reveal.ts
  pages/                   1:1 zur Original-Sitemap (Groß-/Kleinschreibung erhalten)
scripts/                   fetch-assets.sh · migrate.mjs (einmalige Helfer)
public/                    favicon.svg · robots.txt · og-image.jpg · downloads/*.pdf
```

## Navigation

- **Desktop:** Sticky-Header; LEISTUNGEN öffnet ein Mega-Menü, übrige Punkte mit Untermenü
  einfache Dropdowns (Klick + Hover, ESC schließt). Single-Source: `src/data/navigation.ts`.
- **Mobile:** Off-Canvas-Drawer mit Accordion, Focus-Trap, Scroll-Lock.
- Verhalten: `src/components/nav/nav.client.ts` (Event-Delegation, View-Transition-fest).

## Barrierefreiheit & SEO

- WCAG 2.1 AA: axe-core-Audit über die Schlüsselseiten = **0 Verstöße**.
  Skip-Link, `aria-current`, Breadcrumbs, Fokus-Ringe, `prefers-reduced-motion`.
- JSON-LD (`Notary` + `BreadcrumbList`), Sitemap, individuelle Title/Description je Seite.
- Barrierefreiheitserklärung unter `/SONSTIGES/Barrierefreiheit/`.

## Deployment

Statischer Build (`dist/`) – läuft auf jeder modernen Plattform (Cloudflare Pages, Netlify,
Vercel) oder klassischem Webspace. `site` in `astro.config.mjs` ist auf
`https://www.notare-wiehl.de` gesetzt. `/HOME/` wird auf `/` umgeleitet.

> Hinweis: Trailing-Slash + Original-Groß-/Kleinschreibung der URLs sind bewusst erhalten
> (SEO-Kontinuität). Auf dem Zielhost ggf. case-sensitive Auslieferung sicherstellen.
