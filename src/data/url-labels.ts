/* Pfad -> Anzeigelabel + Elternpfad. Treibt die Breadcrumbs.
   Der letzte Krümel kann von der Seite mit dem echten Seitentitel überschrieben werden. */
export interface PageLabel {
  label: string;
  parent?: string;
}

export const pageLabels: Record<string, PageLabel> = {
  '/': { label: 'Startseite' },

  '/UeBER-UNS/': { label: 'Über uns', parent: '/' },
  '/UeBER-UNS/Umzug/': { label: 'Umzug', parent: '/UeBER-UNS/' },

  '/LEISTUNGEN/': { label: 'Leistungen', parent: '/' },
  '/LEISTUNGEN/Allgemein/': { label: 'Allgemein', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Immobilien/': { label: 'Immobilien', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Erb-Pflichtteilsrecht/': { label: 'Erb- & Pflichtteilsrecht', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Vorsorgevollmacht-etc/': { label: 'Notfallvorsorge', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Ehe-Familie/': { label: 'Ehe & Familie', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Gesellschaften-Unternehmen/': { label: 'Gesellschaften & Unternehmen', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Vereine/': { label: 'Vereine', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/': { label: 'Beratung und weiteres Verfahren', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/isolierte-Beratung/': { label: 'isolierte Beratung', parent: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/' },
  '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/weiteres-Verfahren-mit-Beurkundung/': { label: 'weiteres Verfahren mit Beurkundung', parent: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/' },
  '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/weiteres-Verfahren-ohne-Beurkundung/': { label: 'weiteres Verfahren ohne Beurkundung', parent: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/' },
  '/LEISTUNGEN/Notarkosten/': { label: 'Notarkosten', parent: '/LEISTUNGEN/' },
  '/LEISTUNGEN/Wissenswertes-FAQ/': { label: 'Wissenswertes / FAQ', parent: '/LEISTUNGEN/' },

  '/KARRIERE/': { label: 'Karriere', parent: '/' },
  '/FORMULARE-DOWNLOADS/': { label: 'Formulare & Downloads', parent: '/' },

  '/links/': { label: 'Links', parent: '/' },
  '/LINKS/Register/': { label: 'Register', parent: '/links/' },
  '/standesorganisationen/': { label: 'Standesorganisationen', parent: '/links/' },
  '/weitere/': { label: 'Weitere', parent: '/links/' },

  '/NEWS/': { label: 'News', parent: '/' },

  '/KONTAKT/': { label: 'Kontakt', parent: '/' },
  '/KONTAKT/Impressum/': { label: 'Impressum', parent: '/KONTAKT/' },

  '/SONSTIGES/': { label: 'Sonstiges', parent: '/' },
  '/SONSTIGES/Datenschutz/': { label: 'Datenschutz', parent: '/SONSTIGES/' },
  '/SONSTIGES/Datenschutz/Allgemein/': { label: 'Allgemein', parent: '/SONSTIGES/Datenschutz/' },
  '/SONSTIGES/Datenschutz/Website/': { label: 'Website', parent: '/SONSTIGES/Datenschutz/' },
  '/verantwortliche/': { label: 'Verantwortliche', parent: '/SONSTIGES/Datenschutz/' },
  '/SONSTIGES/Geldwaesche-Praevention/': { label: 'Geldwäsche-Prävention', parent: '/SONSTIGES/' },
  '/SONSTIGES/Barrierefreiheit/': { label: 'Barrierefreiheit', parent: '/SONSTIGES/' },
};
