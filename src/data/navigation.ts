/* Zentrale Navigations-Definition (Single Source of Truth).
   Hierarchie 1:1 aus der bestehenden Website übernommen.
   Wird von Desktop-Nav, Mega-Menü, Mobile-Drawer und Footer genutzt. */

export interface NavNode {
  label: string;
  href: string;
  /** Icon-Key -> src/assets/icons/icon-<key>.png (nur Leistungen) */
  icon?: string;
  /** Kurzbeschreibung für Mega-Menü / Übersichts-Grid */
  desc?: string;
  external?: boolean;
  /** Top-Level: als großes Mega-Panel darstellen */
  mega?: boolean;
  children?: NavNode[];
}

/** Die Leistungsbereiche (auch für /LEISTUNGEN/-Übersicht und Mega-Menü). */
export const leistungen: NavNode[] = [
  {
    label: 'Allgemein',
    href: '/LEISTUNGEN/Allgemein/',
    icon: 'info',
    desc: 'Aufgaben des Notars, Beurkundung, Beglaubigung und der Ablauf.',
  },
  {
    label: 'Immobilien',
    href: '/LEISTUNGEN/Immobilien/',
    icon: 'immobilien',
    desc: 'Kauf, Verkauf, Übertragung und Grundpfandrechte.',
  },
  {
    label: 'Erb- & Pflichtteilsrecht',
    href: '/LEISTUNGEN/Erb-Pflichtteilsrecht/',
    icon: 'erbe',
    desc: 'Testament, Erbvertrag, Pflichtteil und Nachfolge.',
  },
  {
    label: 'Vorsorgevollmacht etc.',
    href: '/LEISTUNGEN/Vorsorgevollmacht-etc/',
    icon: 'notfall',
    desc: 'Vorsorgevollmacht, Betreuungs- und Patientenverfügung.',
  },
  {
    label: 'Ehe & Familie',
    href: '/LEISTUNGEN/Ehe-Familie/',
    icon: 'ehe',
    desc: 'Ehevertrag, Güterstand und Scheidungsfolgenvereinbarung.',
  },
  {
    label: 'Gesellschaften & Unternehmen',
    href: '/LEISTUNGEN/Gesellschaften-Unternehmen/',
    icon: 'unternehmen',
    desc: 'Gründung, Rechtsform, Verträge und Nachfolge.',
  },
  {
    label: 'Vereine',
    href: '/LEISTUNGEN/Vereine/',
    icon: 'vereine',
    desc: 'Eintragung, Vorstand und Satzungsänderungen.',
  },
  {
    label: 'Beratung und weiteres Verfahren',
    href: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/',
    icon: 'info',
    desc: 'Ablauf von der Beratung bis zur Beurkundung.',
    children: [
      {
        label: 'isolierte Beratung',
        href: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/isolierte-Beratung/',
      },
      {
        label: 'weiteres Verfahren mit Beurkundung',
        href: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/weiteres-Verfahren-mit-Beurkundung/',
      },
      {
        label: 'weiteres Verfahren ohne Beurkundung',
        href: '/LEISTUNGEN/Beratung-und-weiteres-Verfahren/weiteres-Verfahren-ohne-Beurkundung/',
      },
    ],
  },
  {
    label: 'Notarkosten',
    href: '/LEISTUNGEN/Notarkosten/',
    icon: 'kosten',
    desc: 'Gebühren nach GNotKG – transparent erklärt.',
  },
  {
    label: 'Wissenswertes / FAQ',
    href: '/LEISTUNGEN/Wissenswertes-FAQ/',
    icon: 'info',
    desc: 'Häufige Fragen rund um Termin, Ablauf und Unterlagen.',
  },
];

/** Hauptnavigation (Top-Level). */
export const navigation: NavNode[] = [
  { label: 'Home', href: '/' },
  { label: 'Über uns', href: '/UeBER-UNS/' },
  {
    label: 'Leistungen',
    href: '/LEISTUNGEN/',
    mega: true,
    children: leistungen,
  },
  { label: 'Karriere', href: '/KARRIERE/' },
  { label: 'Formulare & Downloads', href: '/FORMULARE-DOWNLOADS/' },
  {
    label: 'Links',
    href: '/links/',
    children: [
      { label: 'Register', href: '/LINKS/Register/' },
      { label: 'Standesorganisationen', href: '/standesorganisationen/' },
      { label: 'Weitere', href: '/weitere/' },
    ],
  },
  { label: 'News', href: '/NEWS/' },
  {
    label: 'Kontakt',
    href: '/KONTAKT/',
    children: [{ label: 'Impressum', href: '/KONTAKT/Impressum/' }],
  },
  {
    label: 'Sonstiges',
    href: '/SONSTIGES/',
    children: [
      {
        label: 'Datenschutz',
        href: '/SONSTIGES/Datenschutz/',
        children: [
          { label: 'Allgemein', href: '/SONSTIGES/Datenschutz/Allgemein/' },
          { label: 'Website', href: '/SONSTIGES/Datenschutz/Website/' },
          { label: 'Verantwortliche', href: '/verantwortliche/' },
        ],
      },
      { label: 'Geldwäsche-Prävention', href: '/SONSTIGES/Geldwaesche-Praevention/' },
    ],
  },
];

/** Footer-Spalten (kompakt, mit rechtlichen Pflichtseiten). */
export const footerNav = {
  rechtliches: [
    { label: 'Impressum', href: '/KONTAKT/Impressum/' },
    { label: 'Datenschutz', href: '/SONSTIGES/Datenschutz/Website/' },
    { label: 'Geldwäsche-Prävention', href: '/SONSTIGES/Geldwaesche-Praevention/' },
    { label: 'Barrierefreiheit', href: '/SONSTIGES/Barrierefreiheit/' },
  ],
  service: [
    { label: 'Kontakt & Anfahrt', href: '/KONTAKT/' },
    { label: 'Formulare & Downloads', href: '/FORMULARE-DOWNLOADS/' },
    { label: 'Karriere', href: '/KARRIERE/' },
    { label: 'Wissenswertes / FAQ', href: '/LEISTUNGEN/Wissenswertes-FAQ/' },
  ],
};
