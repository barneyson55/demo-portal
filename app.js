/*
 * Demo-Portal – Prototyp
 *
 * Statisch, ohne Server, ohne Bibliotheken, ohne Netzwerkzugriffe.
 * Rückmeldungen und Anfragen bleiben nur in diesem Browser
 * (localStorage, Schlüssel "demoPortal.v1"). Ohne Speicher läuft die Seite trotzdem, nur ohne Merken.
 * Benutzereingaben werden ausschließlich über textContent angezeigt – nie als HTML.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Grundwerte
  // ---------------------------------------------------------------------------

  const STORAGE_KEY = 'demoPortal.v1';
  const LIMIT = { name: 60, title: 120, text: 1000, minutes: 999 };

  const STATUS = {
    'idee': 'Idee',
    'in-arbeit': 'In Arbeit',
    'zum-testen': 'Zum Testen',
    'freigegeben': 'Freigegeben',
    'pausiert': 'Pausiert'
  };
  const RATING = { 'passt': 'Passt', 'teilweise': 'Teilweise', 'passt-nicht': 'Passt nicht' };
  const FREQUENCY = { 'taeglich': 'Täglich', 'woechentlich': 'Wöchentlich', 'monatlich': 'Monatlich', 'seltener': 'Seltener' };
  const URGENCY = { 'normal': 'Normal', 'bald': 'Bald', 'dringend': 'Dringend' };
  const REQUEST_STATUS = { 'eingegangen': 'Eingegangen' };

  // ---------------------------------------------------------------------------
  // Beispieldaten – frei erfunden („Beispiel GmbH“). Nur Demo 1 verlinkt eine echte Live-Demo.
  // ---------------------------------------------------------------------------

  const DEMOS = freeze([
    {
      id: 'd1',
      title: 'Support-Anfragen vorsortieren',
      caseId: 'ANL-2026-014',
      department: 'Kundendienst',
      requester: 'Anna Beispiel',
      status: 'zum-testen',
      summary: 'Macht aus einer formlosen Nachricht ein sortiertes Ticket mit Priorität und Antwortentwurf – ein Mensch prüft und entscheidet.',
      tryUrl: 'https://barneysintro.space/demo',
      versions: [
        { version: '0.3', date: '2026-11-14', notes: 'Persönliche Daten werden vor der KI-Auswertung maskiert. Antwortentwurf in der Sprache der Nachricht.' },
        { version: '0.2', date: '2026-11-07', notes: 'Priorität nach festen Regeln: Auswirkung × Dringlichkeit.' },
        { version: '0.1', date: '2026-10-30', notes: 'Erste Version: Kategorie und Antwortentwurf.' }
      ]
    },
    {
      id: 'd2',
      title: 'Lieferscheine mit Bestellungen abgleichen',
      caseId: 'ANL-2026-021',
      department: 'Lager',
      requester: 'Jonas Muster',
      status: 'zum-testen',
      summary: 'Vergleicht eingehende Lieferscheine mit der Bestellung und zeigt nur die Abweichungen.',
      steps: [
        'Der Lieferschein kommt als PDF per E-Mail.',
        'Artikelnummern und Mengen werden ausgelesen.',
        'Abgleich mit der offenen Bestellung im ERP.',
        'Nur die Abweichungen landen als kurze Liste beim Lager.'
      ],
      versions: [
        { version: '0.2', date: '2026-11-10', notes: 'Teillieferungen werden erkannt und nicht mehr als Fehler gezeigt.' },
        { version: '0.1', date: '2026-10-27', notes: 'Erster Abgleich: Artikelnummer und Menge.' }
      ]
    },
    {
      id: 'd3',
      title: 'Reisekostenbelege erfassen',
      caseId: 'ANL-2026-027',
      department: 'Buchhaltung',
      requester: 'Erika Musterfrau',
      status: 'in-arbeit',
      summary: 'Liest Datum, Betrag und Art aus Belegfotos und trägt sie in die Abrechnungsvorlage ein.',
      steps: [
        'Beleg fotografieren oder als PDF ablegen.',
        'Datum, Betrag und Art des Belegs werden ausgelesen.',
        'Die Werte landen in der Excel-Vorlage für die Abrechnung.',
        'Die Buchhaltung prüft und gibt frei.'
      ],
      versions: [
        { version: '0.1', date: '2026-11-13', notes: 'Erste Version: Datum und Betrag aus Belegen auslesen.' }
      ]
    },
    {
      id: 'd4',
      title: 'Wochenbericht aus dem ERP',
      caseId: 'ANL-2026-009',
      department: 'Vertrieb',
      requester: 'Max Mustermann',
      status: 'freigegeben',
      summary: 'Erstellt jeden Montag den Wochenbericht aus dem ERP und schickt ihn per E-Mail an das Team.',
      steps: [
        'Montag früh: Zahlen der Vorwoche aus dem ERP holen.',
        'Umsatz und offene Angebote je Region zusammenfassen.',
        'Bericht als Excel-Datei erstellen.',
        'Per E-Mail an das Vertriebsteam senden.'
      ],
      versions: [
        { version: '1.0', date: '2026-11-03', notes: 'Freigegeben: läuft jeden Montag automatisch.' },
        { version: '0.3', date: '2026-10-27', notes: 'Nach Rückmeldung: Spalte „Offene Angebote“ ergänzt.' },
        { version: '0.2', date: '2026-10-20', notes: 'Versand per E-Mail statt Ablage im Ordner.' },
        { version: '0.1', date: '2026-10-13', notes: 'Erster Entwurf des Berichts.' }
      ]
    },
    {
      id: 'd5',
      title: 'Urlaubsanträge sammeln',
      caseId: 'ANL-2026-031',
      department: 'Personal',
      requester: 'Lena Probe',
      status: 'idee',
      summary: 'Sammelt Urlaubsanträge über ein kurzes Formular statt über Mails und Zettel.',
      steps: [
        'Mitarbeitende füllen ein kurzes Formular aus.',
        'Die Führungskraft bekommt eine E-Mail zum Genehmigen.',
        'Genehmigte Anträge landen in einer gemeinsamen Liste.'
      ],
      versions: []
    }
  ]);

  const SAMPLE_FEEDBACK = freeze([
    { id: 'f1', demoId: 'd1', version: '0.3', rating: 'passt', text: 'Die Antwortentwürfe sparen mir Zeit, der Ton passt.', date: '2026-11-16' },
    { id: 'f2', demoId: 'd1', version: '0.3', rating: 'teilweise', text: 'Sortierung passt meistens. Die Rückfragen bei fehlenden Angaben dürften kürzer sein.', author: 'Anna Beispiel', date: '2026-11-15' },
    { id: 'f3', demoId: 'd2', version: '0.2', rating: 'teilweise', text: 'Abgleich stimmt. Bei zweiseitigen Lieferscheinen fehlt noch die zweite Seite.', author: 'Jonas Muster', date: '2026-11-12' },
    { id: 'f4', demoId: 'd4', version: '1.0', rating: 'passt', text: 'Kommt jeden Montag pünktlich. Spart mir rund eine Stunde.', author: 'Max Mustermann', date: '2026-11-10' }
  ]);

  const SAMPLE_REQUESTS = freeze([
    {
      id: 'r2',
      title: 'Auftragsbestätigungen ins ERP übertragen',
      department: 'Einkauf',
      today: 'Lieferanten schicken Auftragsbestätigungen als PDF. Ich trage Liefertermin und Preis von Hand ins ERP ein.',
      frequency: 'taeglich',
      minutes: 30,
      systems: 'E-Mail, PDF, ERP',
      urgency: 'bald',
      date: '2026-11-12',
      status: 'eingegangen'
    },
    {
      id: 'r1',
      title: 'Preislisten von Lieferanten vergleichen',
      department: 'Einkauf',
      today: 'Jeden Monat lege ich die neuen Preislisten von drei Lieferanten nebeneinander und markiere Änderungen von Hand.',
      frequency: 'monatlich',
      minutes: 120,
      systems: 'Excel, E-Mail',
      urgency: 'normal',
      date: '2026-11-06',
      status: 'eingegangen'
    }
  ]);

  // ---------------------------------------------------------------------------
  // Hilfsfunktionen
  // ---------------------------------------------------------------------------

  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }

  function has(map, key) {
    return typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function findDemo(id) {
    return DEMOS.find((demo) => demo.id === id) || null;
  }

  /** Baut ein Element. Text kommt nur über textContent hinein – nie als HTML. */
  function h(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach((key) => {
        const value = props[key];
        if (value === undefined || value === null || value === false) return;
        if (key === 'text') node.textContent = String(value);
        else if (key === 'class') node.className = value;
        else if (key === 'hidden') node.hidden = true;
        else node.setAttribute(key, value === true ? '' : String(value));
      });
    }
    if (children) {
      children.forEach((child) => {
        if (child) node.appendChild(child);
      });
    }
    return node;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    bubble: ['M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-8.5L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z'],
    external: ['M14 4h6v6', 'M20 4l-9 9', 'M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5'],
    check: ['M5 12.5l4.5 4.5L19 7.5']
  };

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    ICONS[name].forEach((d) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
    return svg;
  }

  /** Kürzt auf max Zeichen, ohne ein Emoji (Surrogatpaar) zu zerschneiden. */
  function cut(text, max) {
    if (text.length <= max) return text;
    let out = text.slice(0, max);
    const last = out.charCodeAt(out.length - 1);
    if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
    return out;
  }

  /** Einzeiliger Text: Leerraum zusammenfassen, kürzen. */
  function cleanLine(value, max) {
    if (typeof value !== 'string') return '';
    return cut(value.replace(/\s+/g, ' ').trim(), max).trim();
  }

  /** Mehrzeiliger Text: Zeilenumbrüche behalten, höchstens eine Leerzeile, kürzen. */
  function cleanText(value, max) {
    if (typeof value !== 'string') return '';
    const text = value.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return cut(text, max).trim();
  }

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function todayIso() {
    const now = new Date();
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  function isIsoDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parts = value.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 && date.getDate() === parts[2];
  }

  /** "2026-11-18" → "18.11.2026" */
  function formatDate(iso) {
    if (!isIsoDate(iso)) return '';
    const parts = iso.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  /** Für die Suche: klein, ohne Akzente, ß als ss. */
  function fold(text) {
    return String(text).toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function plural(count, one, many) {
    return count === 1 ? '1 ' + one : count + ' ' + many;
  }

  // ---------------------------------------------------------------------------
  // Speicher (localStorage) – jeder Zugriff in try/catch
  // ---------------------------------------------------------------------------

  let storageWorks = true;

  function sampleState() {
    return {
      feedback: SAMPLE_FEEDBACK.map((item) => Object.assign({}, item)),
      requests: SAMPLE_REQUESTS.map((item) => Object.assign({}, item))
    };
  }

  function loadState() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      storageWorks = false;
      return sampleState();
    }
    if (raw === null) return sampleState();
    try {
      return sanitizeState(JSON.parse(raw)) || sampleState();
    } catch (err) {
      return sampleState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 1,
        feedback: state.feedback,
        requests: state.requests
      }));
      storageWorks = true;
    } catch (err) {
      storageWorks = false;
    }
    renderStorageNote();
  }

  function forgetSaved() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      storageWorks = false;
    }
    renderStorageNote();
  }

  /** Gespeicherte Daten werden nie blind übernommen: Felder, Werte und Längen werden geprüft. */
  function sanitizeState(data) {
    if (!data || typeof data !== 'object' || data.v !== 1) return null;
    if (!Array.isArray(data.feedback) || !Array.isArray(data.requests)) return null;
    return {
      feedback: data.feedback.map(sanitizeFeedback).filter(Boolean),
      requests: data.requests.map(sanitizeRequest).filter(Boolean)
    };
  }

  function sanitizeFeedback(item) {
    if (!item || typeof item !== 'object') return null;
    const demo = findDemo(item.demoId);
    if (!demo || !demo.versions.some((v) => v.version === item.version)) return null;
    if (!has(RATING, item.rating) || !isIsoDate(item.date)) return null;
    const text = cleanText(item.text, LIMIT.text);
    if (!text) return null;
    const out = {
      id: cleanLine(item.id, 40) || uid('f'),
      demoId: demo.id,
      version: item.version,
      rating: item.rating,
      text: text,
      date: item.date
    };
    const author = cleanLine(item.author, LIMIT.name);
    if (author) out.author = author;
    return out;
  }

  function sanitizeRequest(item) {
    if (!item || typeof item !== 'object') return null;
    const title = cleanLine(item.title, LIMIT.title);
    const department = cleanLine(item.department, LIMIT.name);
    const today = cleanText(item.today, LIMIT.text);
    const systems = cleanLine(item.systems, LIMIT.title);
    const minutes = Number(item.minutes);
    if (!title || !department || !today || !systems) return null;
    if (!has(FREQUENCY, item.frequency) || !has(URGENCY, item.urgency) || !has(REQUEST_STATUS, item.status)) return null;
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > LIMIT.minutes || !isIsoDate(item.date)) return null;
    const out = {
      id: cleanLine(item.id, 40) || uid('r'),
      title: title,
      department: department,
      today: today,
      frequency: item.frequency,
      minutes: minutes,
      systems: systems,
      urgency: item.urgency,
      date: item.date,
      status: item.status
    };
    const author = cleanLine(item.author, LIMIT.name);
    if (author) out.author = author;
    return out;
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------

  let state = loadState();

  const ui = {
    openId: null, // aufgeklappte Demo (eine zur Zeit)
    query: '',
    status: '',
    drafts: {}, // angefangene Rückmeldungen je Demo
    previewOpen: new Set(),
    historyOpen: new Set()
  };

  const el = {
    tabs: [byId('tab-demos'), byId('tab-anfrage')],
    search: byId('suche'),
    chips: Array.from(document.querySelectorAll('.chip')),
    result: byId('ergebnis'),
    list: byId('demo-liste'),
    empty: byId('leer'),
    emptyReset: byId('leer-zuruecksetzen'),
    requestCount: byId('anfrage-zahl'),
    requestForm: byId('anfrage-form'),
    requestStatus: byId('anfrage-status'),
    requestList: byId('anfrage-liste'),
    requestEmpty: byId('anfrage-leer'),
    reset: byId('reset'),
    resetAsk: byId('reset-frage'),
    resetYes: byId('reset-ja'),
    resetNo: byId('reset-nein'),
    resetStatus: byId('reset-status'),
    storageNote: byId('speicher-hinweis')
  };

  // ---------------------------------------------------------------------------
  // Kleine Bausteine
  // ---------------------------------------------------------------------------

  function pill(kind, label) {
    return h('span', { class: 'pill pill--' + kind, text: label });
  }

  function ratingBadge(rating) {
    return h('span', { class: 'rating rating--' + rating, text: RATING[rating] });
  }

  function dateEl(iso) {
    return h('time', { datetime: iso, text: formatDate(iso) });
  }

  function confirmBox(title, text) {
    return h('div', { class: 'confirm' }, [
      icon('check'),
      h('p', null, [
        h('strong', { text: title }),
        h('span', { class: 'confirm-text', text: ' ' + text })
      ])
    ]);
  }

  function showError(control, box, message) {
    box.textContent = message;
    box.hidden = false;
    control.setAttribute('aria-invalid', 'true');
  }

  function hideError(control, box) {
    box.textContent = '';
    box.hidden = true;
    control.removeAttribute('aria-invalid');
  }

  function showGroupError(group, box, message) {
    box.textContent = message;
    box.hidden = false;
    group.classList.add('is-invalid');
  }

  function hideGroupError(group, box) {
    box.textContent = '';
    box.hidden = true;
    group.classList.remove('is-invalid');
  }

  function feedbackFor(demoId, version) {
    return state.feedback
      .filter((item) => item.demoId === demoId && item.version === version)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  // ---------------------------------------------------------------------------
  // Reiter
  // ---------------------------------------------------------------------------

  function selectTab(tab, moveFocus) {
    el.tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.tabIndex = selected ? 0 : -1;
      byId(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (moveFocus) tab.focus();
  }

  function wireTabs() {
    el.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab, false));
      tab.addEventListener('keydown', (event) => {
        const last = el.tabs.length - 1;
        let next = null;
        if (event.key === 'ArrowRight') next = el.tabs[index === last ? 0 : index + 1];
        else if (event.key === 'ArrowLeft') next = el.tabs[index === 0 ? last : index - 1];
        else if (event.key === 'Home') next = el.tabs[0];
        else if (event.key === 'End') next = el.tabs[last];
        if (next) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Reiter „Demos“: Suche, Filter, Liste
  // ---------------------------------------------------------------------------

  function matches(demo) {
    if (ui.status && demo.status !== ui.status) return false;
    const words = fold(ui.query).split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const haystack = fold([demo.title, demo.caseId, demo.department].join(' '));
    return words.every((word) => haystack.includes(word));
  }

  function renderDemos() {
    const shown = DEMOS.filter(matches);
    el.list.replaceChildren(...shown.map(buildRow));
    el.list.hidden = shown.length === 0;
    el.empty.hidden = shown.length !== 0;
    el.result.textContent = shown.length === DEMOS.length
      ? DEMOS.length + ' Demos'
      : shown.length + ' von ' + DEMOS.length + ' Demos';
  }

  function syncChips() {
    el.chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', (chip.dataset.status || '') === ui.status ? 'true' : 'false');
    });
  }

  function clearFilters() {
    ui.query = '';
    ui.status = '';
    el.search.value = '';
    syncChips();
    renderDemos();
  }

  function wireDemos() {
    el.search.addEventListener('input', () => {
      ui.query = el.search.value;
      renderDemos();
    });
    el.chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const status = chip.dataset.status || '';
        ui.status = has(STATUS, status) ? status : '';
        syncChips();
        renderDemos();
      });
    });
    el.emptyReset.addEventListener('click', () => {
      clearFilters();
      el.search.focus();
    });
  }

  function rowIds(id) {
    return { button: 'demo-' + id + '-knopf', panel: 'demo-' + id + '-inhalt' };
  }

  function countBadge(demo) {
    const current = demo.versions[0];
    const count = current ? feedbackFor(demo.id, current.version).length : 0;
    const label = plural(count, 'Rückmeldung', 'Rückmeldungen') + (current ? ' zu v' + current.version : '');
    return h('span', { class: count ? 'fb-count' : 'fb-count is-zero', title: label }, [
      icon('bubble'),
      h('span', { 'aria-hidden': 'true', text: String(count) }),
      h('span', { class: 'vh', text: label })
    ]);
  }

  function buildRow(demo) {
    const ids = rowIds(demo.id);
    const open = ui.openId === demo.id;
    const current = demo.versions[0];
    const meta = [demo.caseId, demo.department, current ? 'v' + current.version : 'noch keine Version'].join(' · ');

    const button = h('button', {
      type: 'button',
      class: 'demo-toggle',
      id: ids.button,
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.panel
    }, [
      h('span', { class: 'demo-title', text: demo.title }),
      h('span', { class: 'vh', text: ', ' }),
      h('span', { class: 'demo-meta', text: meta }),
      h('span', { class: 'vh', text: ', ' }),
      h('span', { class: 'demo-side' }, [
        pill(demo.status, STATUS[demo.status]),
        h('span', { class: 'vh', text: ', ' }),
        countBadge(demo)
      ]),
      h('span', { class: 'chevron', 'aria-hidden': 'true' })
    ]);
    button.addEventListener('click', () => toggleRow(demo.id));

    const panel = h('div', {
      class: 'demo-panel',
      id: ids.panel,
      role: 'region',
      'aria-labelledby': ids.button,
      hidden: !open
    }, open ? [buildDetails(demo)] : null);

    return h('li', { class: open ? 'demo is-open' : 'demo', 'data-id': demo.id }, [
      h('h3', { class: 'demo-heading' }, [button]),
      panel
    ]);
  }

  /** Klappt eine Demo auf oder zu. Die angeklickte Zeile bleibt dabei an ihrer Stelle im Bild. */
  function toggleRow(id) {
    const previous = ui.openId;
    ui.openId = previous === id ? null : id;
    const button = byId(rowIds(id).button);
    const before = button.getBoundingClientRect().top;
    if (previous && previous !== id) setRowOpen(previous, false);
    setRowOpen(id, ui.openId === id);
    const shift = button.getBoundingClientRect().top - before;
    if (Math.abs(shift) > 1) window.scrollBy(0, shift);
  }

  function setRowOpen(id, open) {
    const demo = findDemo(id);
    const ids = rowIds(id);
    const button = byId(ids.button);
    const panel = byId(ids.panel);
    if (!demo || !button || !panel) return;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.closest('.demo').classList.toggle('is-open', open);
    panel.replaceChildren(...(open ? [buildDetails(demo)] : []));
    panel.hidden = !open;
  }

  function refreshCount(demo) {
    const badge = el.list.querySelector('[data-id="' + demo.id + '"] .fb-count');
    if (badge) badge.replaceWith(countBadge(demo));
  }

  // ---------------------------------------------------------------------------
  // Aufgeklappte Demo
  // ---------------------------------------------------------------------------

  function buildDetails(demo) {
    const current = demo.versions[0];
    const left = h('div', { class: 'detail-col' }, [
      h('p', { class: 'summary', text: demo.summary }),
      h('p', { class: 'requester' }, [
        h('span', { text: 'Angefragt von ' }),
        h('strong', { text: demo.requester })
      ]),
      buildTry(demo),
      buildHistory(demo)
    ]);
    const right = h('div', { class: 'detail-col' }, [
      current
        ? buildFeedback(demo, current)
        : h('section', { class: 'feedback' }, [
          h('h4', { text: 'Rückmeldungen' }),
          h('p', { class: 'muted', text: 'Noch keine Version – Rückmeldung ist ab der ersten Version möglich.' })
        ])
    ]);
    return h('div', { class: 'detail' }, [left, right]);
  }

  /** „Ausprobieren“: Link zur Demo – oder, ohne Link, eine Vorschau mit den Schritten. */
  function buildTry(demo) {
    if (typeof demo.tryUrl === 'string' && /^https:\/\/\S+$/.test(demo.tryUrl)) {
      return h('div', { class: 'try' }, [
        h('a', { class: 'btn btn-primary', href: demo.tryUrl, target: '_blank', rel: 'noopener noreferrer' }, [
          h('span', { text: 'Ausprobieren' }),
          icon('external'),
          h('span', { class: 'vh', text: ' (öffnet in neuem Tab)' })
        ]),
        h('span', { class: 'try-hint', text: 'Echte Live-Demo · öffnet in neuem Tab' })
      ]);
    }

    const previewId = 'vorschau-' + demo.id;
    const open = ui.previewOpen.has(demo.id);
    const button = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': previewId
    }, [
      h('span', { text: 'Ausprobieren' }),
      h('span', { class: 'chevron', 'aria-hidden': 'true' })
    ]);
    const preview = h('div', { class: 'preview', id: previewId, hidden: !open }, [
      h('p', { class: 'preview-title', text: demo.status === 'idee' ? 'Vorschau: geplanter Ablauf' : 'Vorschau: So arbeitet die Demo' }),
      h('ol', { class: 'steps' }, (demo.steps || []).map((step) => h('li', { text: step }))),
      h('p', { class: 'muted small', text: 'Für diese Demo gibt es noch keinen Link zum Ausprobieren.' })
    ]);
    button.addEventListener('click', () => {
      const show = preview.hidden;
      preview.hidden = !show;
      button.setAttribute('aria-expanded', show ? 'true' : 'false');
      if (show) ui.previewOpen.add(demo.id);
      else ui.previewOpen.delete(demo.id);
    });
    return h('div', { class: 'try' }, [
      button,
      h('span', { class: 'try-hint', text: 'Vorschau mit Schritten' }),
      preview
    ]);
  }

  function buildHistory(demo) {
    if (!demo.versions.length) {
      return h('p', { class: 'muted', text: 'Noch keine Version – bisher eine Idee.' });
    }
    const details = h('details', { class: 'history' }, [
      h('summary', null, [
        h('span', { text: 'Versionsverlauf' }),
        h('span', { class: 'summary-count', text: '(' + plural(demo.versions.length, 'Version', 'Versionen') + ')' })
      ]),
      h('ol', { class: 'versions' }, demo.versions.map((entry, index) => h('li', null, [
        h('div', { class: 'version-head' }, [
          h('strong', { text: 'v' + entry.version }),
          h('span', { class: 'version-date' }, [dateEl(entry.date)]),
          index === 0 ? h('span', { class: 'version-current', text: 'aktuell' }) : null
        ]),
        h('p', { class: 'version-notes', text: entry.notes })
      ])))
    ]);
    details.open = ui.historyOpen.has(demo.id);
    details.addEventListener('toggle', () => {
      if (details.open) ui.historyOpen.add(demo.id);
      else ui.historyOpen.delete(demo.id);
    });
    return details;
  }

  function buildFeedback(demo, current) {
    const headingId = 'rm-' + demo.id + '-titel';
    const listBox = h('div', { class: 'fb-list-box' });

    function showList(newId) {
      const items = feedbackFor(demo.id, current.version);
      listBox.replaceChildren(items.length
        ? h('ul', { class: 'fb-list' }, items.map((item) => feedbackItem(item, item.id === newId)))
        : h('p', { class: 'muted', text: 'Noch keine Rückmeldung zu dieser Version.' }));
    }
    showList(null);

    return h('section', { class: 'feedback', 'aria-labelledby': headingId }, [
      h('h4', { id: headingId, text: 'Rückmeldungen zu v' + current.version }),
      listBox,
      buildFeedbackForm(demo, current, (entry) => {
        showList(entry.id);
        refreshCount(demo);
      })
    ]);
  }

  function feedbackItem(item, isNew) {
    return h('li', { class: isNew ? 'fb-item is-new' : 'fb-item' }, [
      h('div', { class: 'fb-head' }, [
        ratingBadge(item.rating),
        h('span', { class: 'fb-author', text: item.author || 'Anonym' }),
        dateEl(item.date)
      ]),
      h('p', { class: 'fb-text', text: item.text })
    ]);
  }

  function buildFeedbackForm(demo, current, onSaved) {
    const prefix = 'rm-' + demo.id;
    const draft = ui.drafts[demo.id] || (ui.drafts[demo.id] = { rating: '', text: '', author: '' });

    const radios = Object.keys(RATING).map((value) => {
      const input = h('input', { type: 'radio', name: prefix + '-wertung', value: value });
      input.checked = draft.rating === value;
      return input;
    });
    const ratingError = h('p', { class: 'error', id: prefix + '-wertung-fehler', hidden: true });
    const ratingGroup = h('fieldset', { class: 'field', 'aria-describedby': ratingError.id }, [
      h('legend', { class: 'label', text: 'Passt es?' }),
      h('div', { class: 'opts' }, radios.map((input) => h('label', { class: 'opt' }, [
        input,
        h('span', { text: RATING[input.value] })
      ]))),
      ratingError
    ]);

    const textError = h('p', { class: 'error', id: prefix + '-text-fehler', hidden: true });
    const text = h('textarea', {
      id: prefix + '-text',
      rows: '3',
      maxlength: String(LIMIT.text),
      placeholder: 'z. B. Klappt gut, nur ein Feld fehlt noch.',
      'aria-describedby': textError.id
    });
    text.value = draft.text;

    const name = h('input', {
      id: prefix + '-name',
      type: 'text',
      maxlength: String(LIMIT.name),
      autocomplete: 'name',
      placeholder: 'Leer lassen = anonym'
    });
    name.value = draft.author;

    const status = h('div', { class: 'form-status', role: 'status' });
    const headingId = prefix + '-form-titel';

    const form = h('form', { class: 'fb-form', novalidate: true, 'aria-labelledby': headingId }, [
      h('h4', { id: headingId, text: 'Ihre Rückmeldung zu v' + current.version }),
      ratingGroup,
      h('div', { class: 'field' }, [
        h('label', { class: 'label', for: text.id, text: 'Was passt, was fehlt?' }),
        text,
        textError
      ]),
      h('div', { class: 'field' }, [
        h('label', { class: 'label', for: name.id }, [
          h('span', { text: 'Name ' }),
          h('span', { class: 'optional', text: '(optional)' })
        ]),
        name
      ]),
      h('div', { class: 'form-end' }, [
        h('div', { class: 'form-actions' }, [
          h('button', { type: 'submit', class: 'btn btn-primary', text: 'Rückmeldung senden' })
        ]),
        status
      ])
    ]);

    function selectedRating() {
      const checked = radios.find((input) => input.checked);
      return checked ? checked.value : '';
    }

    function onEdit(event) {
      draft.rating = selectedRating();
      draft.text = text.value;
      draft.author = name.value;
      status.replaceChildren();
      if (event.target === text) hideError(text, textError);
      if (radios.includes(event.target)) hideGroupError(ratingGroup, ratingError);
    }
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.replaceChildren();
      const rating = selectedRating();
      const comment = cleanText(text.value, LIMIT.text);
      const author = cleanLine(name.value, LIMIT.name);

      hideGroupError(ratingGroup, ratingError);
      hideError(text, textError);
      let firstInvalid = null;
      if (!has(RATING, rating)) {
        showGroupError(ratingGroup, ratingError, 'Bitte wählen: Passt, Teilweise oder Passt nicht.');
        firstInvalid = radios[0];
      }
      if (!comment) {
        showError(text, textError, 'Bitte kurz schreiben, was passt oder was fehlt.');
        firstInvalid = firstInvalid || text;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const entry = {
        id: uid('f'),
        demoId: demo.id,
        version: current.version,
        rating: rating,
        text: comment,
        date: todayIso()
      };
      if (author) entry.author = author;
      state.feedback.unshift(entry);
      saveState();

      radios.forEach((input) => { input.checked = false; });
      text.value = '';
      name.value = '';
      draft.rating = '';
      draft.text = '';
      draft.author = '';
      onSaved(entry);
      status.replaceChildren(confirmBox('Danke!', 'Ihre Rückmeldung steht jetzt in der Liste.'));
      // Die Liste darüber ist gewachsen: Bestätigung sichtbar halten (vor allem am Handy).
      status.scrollIntoView({ block: 'nearest' });
    });

    return form;
  }

  // ---------------------------------------------------------------------------
  // Reiter „Anfrage stellen“
  // ---------------------------------------------------------------------------

  function renderRequests(newId) {
    const items = state.requests;
    el.requestCount.textContent = String(items.length);
    el.requestEmpty.hidden = items.length !== 0;
    el.requestList.hidden = items.length === 0;
    el.requestList.replaceChildren(...items.map((item) => h('li', { class: item.id === newId ? 'req is-new' : 'req' }, [
      h('div', { class: 'req-main' }, [
        h('p', { class: 'req-title', text: item.title }),
        h('p', { class: 'req-date' }, [dateEl(item.date)])
      ]),
      pill(item.status, REQUEST_STATUS[item.status])
    ])));
  }

  function checkedValue(form, name) {
    const checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  }

  function clearRequestErrors() {
    const form = el.requestForm;
    form.querySelectorAll('.error').forEach((box) => {
      box.textContent = '';
      box.hidden = true;
    });
    form.querySelectorAll('[aria-invalid]').forEach((control) => control.removeAttribute('aria-invalid'));
    form.querySelectorAll('.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
  }

  /** Erlaubt „20“, „20 min“ oder „20 Minuten“. */
  function parseMinutes(raw) {
    const match = /^(\d{1,3})\s*(min\.?|minuten)?$/i.exec(raw.trim());
    if (!match) return 0;
    const minutes = Number(match[1]);
    return minutes >= 1 && minutes <= LIMIT.minutes ? minutes : 0;
  }

  function submitRequest() {
    const form = el.requestForm;
    el.requestStatus.replaceChildren();
    clearRequestErrors();

    const field = {
      title: byId('a-titel'),
      today: byId('a-heute'),
      frequency: byId('a-oft'),
      minutes: byId('a-minuten'),
      systems: byId('a-programme'),
      urgency: byId('a-dringend'),
      department: byId('a-abteilung'),
      author: byId('a-name')
    };
    const value = {
      title: cleanLine(field.title.value, LIMIT.title),
      today: cleanText(field.today.value, LIMIT.text),
      frequency: checkedValue(form, 'frequency'),
      minutes: parseMinutes(field.minutes.value),
      systems: cleanLine(field.systems.value, LIMIT.title),
      urgency: checkedValue(form, 'urgency'),
      department: cleanLine(field.department.value, LIMIT.name),
      author: cleanLine(field.author.value, LIMIT.name)
    };

    const problems = [];
    if (!value.title) problems.push([field.title, 'Bitte kurz sagen, worum es geht.']);
    if (!value.today) problems.push([field.today, 'Bitte beschreiben, wie Sie es heute machen.']);
    if (!has(FREQUENCY, value.frequency)) problems.push([field.frequency, 'Bitte wählen, wie oft das vorkommt.']);
    if (!value.minutes) problems.push([field.minutes, 'Bitte die Minuten als Zahl eintragen, von 1 bis 999.']);
    if (!value.systems) problems.push([field.systems, 'Bitte die Programme nennen, z. B. E-Mail oder Excel.']);
    if (!has(URGENCY, value.urgency)) problems.push([field.urgency, 'Bitte wählen, wie dringend es ist.']);
    if (!value.department) problems.push([field.department, 'Bitte die Abteilung angeben.']);

    if (problems.length) {
      problems.forEach(([control, message]) => {
        const box = byId(control.id + '-fehler');
        if (control.tagName === 'FIELDSET') showGroupError(control, box, message);
        else showError(control, box, message);
      });
      const first = problems[0][0];
      if (first.tagName === 'FIELDSET') (first.querySelector('input:checked') || first.querySelector('input')).focus();
      else first.focus();
      return;
    }

    const entry = {
      id: uid('r'),
      title: value.title,
      department: value.department,
      today: value.today,
      frequency: value.frequency,
      minutes: value.minutes,
      systems: value.systems,
      urgency: value.urgency,
      date: todayIso(),
      status: 'eingegangen'
    };
    if (value.author) entry.author = value.author;
    state.requests.unshift(entry);
    saveState();
    renderRequests(entry.id);

    form.reset();
    el.requestStatus.replaceChildren(confirmBox('Eingegangen.', 'Danke! Ihre Anfrage steht jetzt in der Liste. Im Prototyp bleibt sie nur in diesem Browser.'));
  }

  function wireRequestForm() {
    const form = el.requestForm;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitRequest();
    });

    function onEdit(event) {
      const target = event.target;
      el.requestStatus.replaceChildren();
      if (target.type === 'radio') {
        const group = target.closest('fieldset');
        if (group) hideGroupError(group, byId(group.id + '-fehler'));
        return;
      }
      const box = target.id ? byId(target.id + '-fehler') : null;
      if (box) hideError(target, box);
    }
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
  }

  // ---------------------------------------------------------------------------
  // Fuß: Beispieldaten wiederherstellen, Hinweis zum Speicher
  // ---------------------------------------------------------------------------

  function renderStorageNote() {
    el.storageNote.hidden = storageWorks;
  }

  function closeResetAsk() {
    el.resetAsk.hidden = true;
    el.reset.setAttribute('aria-expanded', 'false');
    el.reset.focus();
  }

  function restoreSample() {
    state = sampleState();
    forgetSaved();
    ui.openId = null;
    ui.drafts = {};
    ui.previewOpen.clear();
    ui.historyOpen.clear();
    clearFilters();
    el.requestForm.reset();
    clearRequestErrors();
    el.requestStatus.replaceChildren();
    renderRequests(null);
  }

  function wireFooter() {
    el.reset.addEventListener('click', () => {
      el.resetStatus.textContent = '';
      const show = el.resetAsk.hidden;
      el.resetAsk.hidden = !show;
      el.reset.setAttribute('aria-expanded', show ? 'true' : 'false');
      if (show) el.resetYes.focus();
    });
    el.resetNo.addEventListener('click', closeResetAsk);
    el.resetAsk.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeResetAsk();
    });
    el.resetYes.addEventListener('click', () => {
      restoreSample();
      closeResetAsk();
      el.resetStatus.textContent = 'Beispieldaten wiederhergestellt.';
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  wireTabs();
  wireDemos();
  wireRequestForm();
  wireFooter();
  renderDemos();
  renderRequests(null);
  renderStorageNote();
})();
