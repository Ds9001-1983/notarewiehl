/* Bewerbungs-Assistent (Karriere-Seite) – progressive Enhancement.
   Ohne JS stehen alle vier Schritte sichtbar untereinander; erst dieses
   Skript macht daraus einen Wizard (Fortschritt, Validierung, Mailto).
   Muster wie reveal.ts: Init sofort + nach Astro View Transitions.
   Idempotent über data-funnel-ready am Form-Element – nach einem
   DOM-Swap ist das Form frisch und wird sauber neu initialisiert. */

const MAX_URL = 1900;

function initFunnel() {
  const form = document.querySelector<HTMLFormElement>('form[data-funnel]');
  if (!form || form.dataset.funnelReady) return;
  form.dataset.funnelReady = 'true';

  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>('.funnel__step'));
  if (steps.length === 0) return;

  const email = form.dataset.email ?? '';
  const progress = form.querySelector<HTMLElement>('[data-funnel-progress]');
  const summary = form.querySelector<HTMLDListElement>('[data-funnel-summary]');
  const mailto = form.querySelector<HTMLAnchorElement>('[data-funnel-mailto]');

  let current = 0;

  const radioValue = (name: string): string =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';
  const textValue = (selector: string): string =>
    form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector)
      ?.value.trim() ?? '';
  const setErrorText = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  function show(index: number, moveFocus: boolean) {
    const target = steps[index];
    if (!target) return;
    current = index;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    progress?.style.setProperty('--p', String((index + 1) / steps.length));
    target.classList.add('is-entering');
    target.addEventListener('animationend', () => target.classList.remove('is-entering'), {
      once: true,
    });
    if (moveFocus) target.querySelector<HTMLElement>('.funnel__legend')?.focus();
  }

  const validate = (index: number): boolean => {
    const stepNo = steps[index]?.dataset.step;
    if (stepNo === '1' && !radioValue('weg')) {
      setErrorText('bf-err-weg', 'Bitte wählen Sie aus, wofür Sie sich bewerben möchten.');
      form.querySelector<HTMLInputElement>('input[name="weg"]')?.focus();
      return false;
    }
    if (stepNo === '3') {
      const name = form.querySelector<HTMLInputElement>('#bf-name');
      if (name && name.value.trim() === '') {
        setErrorText('bf-err-name', 'Bitte geben Sie Ihren Namen an.');
        name.setAttribute('aria-invalid', 'true');
        name.focus();
        return false;
      }
    }
    return true;
  };

  /* Zusammenfassung füllen und Mailto-Link aus den Angaben bauen. */
  function updateSummary() {
    const weg = radioValue('weg');
    const arbeitszeit = radioValue('arbeitszeit') || 'Keine Angabe';
    const beginn = textValue('#bf-beginn') || 'Keine Angabe';
    const erfahrung = textValue('#bf-erfahrung') || 'Keine Angabe';
    const name = textValue('#bf-name');
    const telefon = textValue('#bf-telefon');
    const nachricht = textValue('#bf-nachricht');

    if (summary) {
      const rows: Array<[string, string]> = [
        ['Bewerbung als', weg],
        ['Arbeitszeit', arbeitszeit],
        ['Frühestmöglicher Eintritt', beginn],
        ['Berufserfahrung', erfahrung],
        ['Name', name],
        ['Telefon', telefon || 'Keine Angabe'],
      ];
      if (nachricht) rows.push(['Nachricht', nachricht]);
      summary.replaceChildren(
        ...rows.flatMap(([label, value]) => {
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          dd.textContent = value;
          return [dt, dd];
        })
      );
    }

    if (!mailto || !email) return;

    const buildHref = (message: string): string => {
      const lines = [
        'Bewerbung über die Karriere-Seite',
        '',
        `Bewerbungsweg: ${weg}`,
        `Arbeitszeit: ${arbeitszeit}`,
        `Frühestmöglicher Eintritt: ${beginn}`,
        `Berufserfahrung: ${erfahrung}`,
        '',
        `Name: ${name}`,
      ];
      if (telefon) lines.push(`Telefon: ${telefon}`);
      if (message) lines.push('', `Nachricht: ${message}`);
      lines.push('', 'Anlagen: Lebenslauf und Zeugnisse (vor dem Senden angehängt)');
      const subject = encodeURIComponent(`Bewerbung: ${weg} – ${name}`);
      return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(lines.join('\r\n'))}`;
    };

    // Überlange Mailto-URLs scheitern in manchen Clients:
    // Nachricht schrittweise kürzen, bis die URL passt.
    let message = nachricht;
    let href = buildHref(message);
    while (href.length > MAX_URL && message !== '') {
      message = message.slice(0, Math.max(0, message.length - 20)).trimEnd();
      href = buildHref(message === '' ? '' : `${message} …`);
    }
    mailto.href = href;
  }

  function goNext() {
    if (!validate(current)) return;
    if (current >= steps.length - 1) return;
    if (current + 1 === steps.length - 1) updateSummary();
    show(current + 1, true);
  }

  // Falls doch ein Submit ausgelöst wird (z. B. künftiger Submit-Button):
  // abfangen und wie „Weiter“ behandeln
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    goNext();
  });

  // Enter in Textfeldern löst ohne Submit-Button KEINE implizite Submission
  // aus (mehrere Textfelder) → explizit wie „Weiter“ behandeln.
  // Textarea ausgenommen (Enter = Zeilenumbruch).
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLSelectElement) {
      e.preventDefault();
      goNext();
    }
  });

  form.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    if (t.closest('[data-next]')) {
      goNext();
    } else if (t.closest('[data-prev]')) {
      if (current > 0) show(current - 1, true);
    }
  });

  // Eingabe hebt den Fehlerzustand des Feldes wieder auf
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.name === 'weg') setErrorText('bf-err-weg', '');
    if (t.id === 'bf-name') {
      t.removeAttribute('aria-invalid');
      setErrorText('bf-err-name', '');
    }
  });

  // Wizard-Chrome einschalten, Schritt 1 zeigen – ohne Fokus beim Init
  form.querySelectorAll<HTMLElement>('[data-js-show]').forEach((el) => {
    el.hidden = false;
  });
  show(0, false);
}

initFunnel();
document.addEventListener('astro:page-load', initFunnel);
