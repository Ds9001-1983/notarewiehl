/* Download-Formulare (PDF) – 1:1 aus der Formulare-Seite übernommen.
   Dateien liegen unter public/downloads/. */
export interface DownloadItem {
  title: string;
  desc: string;
  file: string;
  sizeLabel: string;
}
export interface DownloadGroup {
  heading: string;
  intro?: string;
  items: DownloadItem[];
}

export const downloadGroups: DownloadGroup[] = [
  {
    heading: 'Auftragsformulare zum Download',
    intro:
      '… für Aufträge in Angelegenheiten, für die vorstehend kein Online-Formular zur Verfügung steht, nutzen Sie bitte das folgende Formular:',
    items: [
      {
        title: 'Sonstige Aufträge',
        desc: 'Formular zur Erteilung sonstiger Aufträge',
        file: '/downloads/auftragserteilung.pdf',
        sizeLabel: '32,57 KB',
      },
    ],
  },
  {
    heading: 'Wertermittlungsformulare zum Download',
    intro: '… als Grundlage für die gesetzlich geregelte Gebührenberechnung:',
    items: [
      {
        title: 'Grundbesitz / Übertragungsvertrag',
        desc: 'Formular zur Ermittlung von Immobilienwerten',
        file: '/downloads/wertermittlung-grundbesitz.pdf',
        sizeLabel: '137,22 KB',
      },
      {
        title: 'Ehevertrag und Scheidungsfolgenvereinbarung',
        desc: 'Formular zur Ermittlung des Geschäftswerts in ehevertraglichen Angelegenheiten',
        file: '/downloads/wertermittlung-ehevertrag.pdf',
        sizeLabel: '147,49 KB',
      },
      {
        title: 'Einzeltestament',
        desc: 'Formular zur Ermittlung des Geschäftswerts bei einem notariellen Einzeltestament',
        file: '/downloads/wertermittlung-testament.pdf',
        sizeLabel: '145,65 KB',
      },
      {
        title: 'Erbvertrag',
        desc: 'Formular zur Ermittlung des Geschäftswerts bei einem Erbvertrag',
        file: '/downloads/wertermittlung-erbvertrag.pdf',
        sizeLabel: '146,19 KB',
      },
      {
        title: 'Sonstige Nachlassangelegenheiten',
        desc: 'Formular zur Ermittlung des Geschäftswerts in sonstigen Nachlassangelegenheiten, insb. bei Erbscheinsverfahren',
        file: '/downloads/wertermittlungsbogen-nachlass.pdf',
        sizeLabel: '1,91 MB',
      },
      {
        title: 'Vollmachten',
        desc: 'Formular zur Ermittlung des Geschäftswerts einer Vollmacht, insb. General- und Vorsorgevollmacht',
        file: '/downloads/wertermittlung-generalvollmacht.pdf',
        sizeLabel: '148,84 KB',
      },
    ],
  },
  {
    heading: 'Sonstiges',
    items: [
      {
        title: 'Fragebogen zur Ermittlung des wirtschaftlich Berechtigten',
        desc: 'Zur gesetzlich vorgeschriebenen Geldwäscheprävention',
        file: '/downloads/fragebogen-wirtschaftlich-berechtigter.pdf',
        sizeLabel: '185,29 KB',
      },
      {
        title: 'Wohnungskauf – Verwaltergenehmigung',
        desc: 'Informationen zur Kostentragung',
        file: '/downloads/weg-verwaltergenehmigung-kosten.pdf',
        sizeLabel: '545,96 KB',
      },
    ],
  },
];
