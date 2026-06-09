import { pageLabels } from '../data/url-labels';

export interface Crumb {
  label: string;
  href: string;
  current: boolean;
}

/** Normalisiert auf führenden + abschließenden Slash. */
function norm(path: string): string {
  if (!path.startsWith('/')) path = '/' + path;
  if (!path.endsWith('/')) path = path + '/';
  return path;
}

/**
 * Baut die Breadcrumb-Kette über die parent-Zeiger in pageLabels.
 * @param pathname  aktueller Pfad (Astro.url.pathname)
 * @param currentLabel  optionaler Titel, der den letzten Krümel überschreibt
 */
export function getBreadcrumbs(pathname: string, currentLabel?: string): Crumb[] {
  const path = norm(pathname);
  const chain: string[] = [];
  let cursor: string | undefined = path;
  const guard = new Set<string>();

  while (cursor && pageLabels[cursor] && !guard.has(cursor)) {
    guard.add(cursor);
    chain.unshift(cursor);
    cursor = pageLabels[cursor].parent;
  }

  // Wenn der Pfad unbekannt ist, wenigstens Start + aktuelle Seite zeigen.
  if (chain.length === 0) {
    return [
      { label: 'Startseite', href: '/', current: false },
      { label: currentLabel ?? 'Seite', href: path, current: true },
    ];
  }

  return chain.map((href, i) => {
    const isLast = i === chain.length - 1;
    return {
      href,
      current: isLast,
      label: isLast && currentLabel ? currentLabel : pageLabels[href].label,
    };
  });
}
