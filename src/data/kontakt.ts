/* Kanzlei-Stammdaten – einmal definiert, überall verwendet.
   Werte 1:1 aus der bestehenden Website übernommen. */
export const kontakt = {
  kanzlei: 'Notare Dr. Tim Kasper und Philip Scholz',
  notare: ['Dr. Tim Kasper', 'Philip Scholz'],
  strasse: 'Hauptstraße 41',
  plz: '51674',
  ort: 'Wiehl',
  land: 'Deutschland',
  telefonAnzeige: '+49 (0) 2262 / 6921 - 0',
  telefonLink: 'tel:+49226269210',
  faxAnzeige: '+49 (0) 2262 / 6921 - 21',
  email: 'info@notare-wiehl.de',
  emailLink: 'mailto:info@notare-wiehl.de',
  // Bewerbungen (Karriere-Seite)
  bewerbungEmail: 'info@notare-wiehl.de',
  bewerbungEmailLink: 'mailto:info@notare-wiehl.de',
  tagline:
    'Wir sind für Sie da – fachkundig, pflichtbewusst und serviceorientiert.',
  // Öffnungszeiten (Kundenverkehr)
  oeffnungszeiten: [
    { tage: 'Montag, Dienstag, Donnerstag und Freitag', zeit: 'nach Vereinbarung' },
    { tage: 'Mittwoch', zeit: 'kein Kundenverkehr' },
  ],
  // Telefonzeiten der Telefonzentrale
  telefonzeiten: [
    { tage: 'Montag, Dienstag, Donnerstag', zeit: '09:00 – 12:00 Uhr und 15:00 – 17:00 Uhr' },
    { tage: 'Mittwoch und Freitag', zeit: '09:00 – 12:00 Uhr' },
  ],
  // Inhaltliche Rückfragen zu laufenden Verfahren
  rueckfragen:
    'Inhaltliche Auskünfte, Rückfragen und Mitteilungen zu laufenden Verfahren erfolgen durch die jeweils zuständige Sachbearbeitung montags, dienstags, donnerstags und freitags von 11:00 bis 12:00 Uhr oder nach vorheriger Terminvereinbarung.',
  // Externes Formularsystem für Mandantendaten
  onlineFormulareUrl: 'https://notar-formulare.de/wiehl/',
} as const;

export type Kontakt = typeof kontakt;
