# Demo-Portal – Spezifikation (Prototyp)

Ein neutrales, universelles Mini-Portal für die Zusammenarbeit zwischen einer Person, die Abläufe automatisiert, und den Kolleginnen und Kollegen, für die sie arbeitet. Es löst ein alltägliches Problem: Demos landen verstreut in Mails und Chats, Rückmeldungen gehen verloren, Wünsche kommen mündlich und ohne die Angaben, die man braucht.

Drei Dinge, sonst nichts:
1. **Demos ansehen und ausprobieren** – jede Demo hängt an einem Anliegen (Nummer), hat eine anfragende Person, eine Abteilung, eine Version mit Änderungsverlauf und einen Status.
2. **Rückmeldung geben** – pro Demo und Version: „Passt“ / „Teilweise“ / „Passt nicht“ plus kurzer Text, optional mit Namen.
3. **Neue Anfrage stellen** – kurzes Formular: Was machen Sie heute, wie oft, wie lange, mit welchen Programmen, wie dringend.

Zielgruppe: Menschen ohne IT-Hintergrund in Büro, Lager, Buchhaltung, Kundendienst. Deshalb: deutsch, wenige Wörter, große Klickflächen, nichts Verstecktes, nichts Verwirrendes. Platzsparend: eine Seite, zwei Reiter.

**Neutral und universell:** keine echte Firma, keine echten Personen, kein Produktname eines Arbeitgebers. Beispieldaten: „Beispiel GmbH“, erfundene Namen, allgemeine Abteilungen und Programme (ERP, E-Mail, Excel, Ticketsystem). Funktioniert für jedes Team und jedes Ticketsystem: Das Anliegen ist nur eine Nummer, die Demo nur ein Link.

## Prototyp-Grenzen (ehrlich und sichtbar)

- Statisch, ohne Server: `index.html`, `styles.css`, `app.js`. Kein Build, keine Bibliotheken, keine externen Ressourcen (die Website erlaubt nur eigene Skripte und Stile: CSP `default-src 'self'`).
- Einträge (Rückmeldungen, Anfragen) werden nur im Browser gespeichert (`localStorage`, Schlüssel `demoPortal.v1`), damit man den Ablauf ausprobieren kann. Ein Hinweis im Fuß sagt das, mit Knopf „Beispieldaten wiederherstellen“.
- Alle Zugriffe auf `localStorage` in `try/catch`; ohne Speicher funktioniert die Seite trotzdem (nur ohne Merken).
- Benutzereingaben werden nur über `textContent` angezeigt (nie `innerHTML`), Längen begrenzt (Name 60, Titel 120, Texte 1.000 Zeichen).

## Datenmodell

```
Demo {
  id: string                 // "d1"
  title: string              // "Support-Anfragen vorsortieren"
  caseId: string             // "ANL-2026-014" (Anliegen-Nummer, frei wählbar)
  department: string         // "Kundendienst"
  requester: string          // "Anna Beispiel" (erfunden)
  status: "idee" | "in-arbeit" | "zum-testen" | "freigegeben" | "pausiert"
  summary: string            // ein Satz: was die Demo tut
  tryUrl?: string            // Link zum Ausprobieren; fehlt = "Vorschau" mit Schritten
  steps?: string[]           // 3–5 Schritte, was die Demo macht (für die Vorschau)
  versions: { version: string; date: string; notes: string }[]   // neueste zuerst
}
Feedback { id, demoId, version, rating: "passt" | "teilweise" | "passt-nicht", text, author?, date }
Request  { id, title, department, author?, today, frequency: "taeglich" | "woechentlich" | "monatlich" | "seltener",
           minutes: number, systems, urgency: "normal" | "bald" | "dringend", date, status: "eingegangen" }
```

Beispieldaten (5 Demos, ein paar Rückmeldungen, zwei Anfragen):
1. „Support-Anfragen vorsortieren“ – Kundendienst – zum Testen – v0.3 – `tryUrl: "https://barneysintro.space/demo"` (die echte Live-Demo).
2. „Lieferscheine mit Bestellungen abgleichen“ – Lager – zum Testen – v0.2 – Vorschau.
3. „Reisekostenbelege erfassen“ – Buchhaltung – in Arbeit – v0.1 – Vorschau.
4. „Wochenbericht aus dem ERP“ – Vertrieb – freigegeben – v1.0 – Vorschau.
5. „Urlaubsanträge sammeln“ – Personal – Idee – noch keine Version.

## Oberfläche

- Kopf: „Demo-Portal“, Untertitel „Demos ausprobieren · Rückmeldung geben · Anfrage stellen“, zwei Reiter: **Demos** | **Anfrage stellen** (mit Zähler der eigenen Anfragen).
- Reiter Demos: eine Suchzeile (Titel, Nummer, Abteilung) und Status-Filter als kleine Chips. Liste kompakter Zeilen: Titel, darunter Nummer · Abteilung · Version; rechts Status-Pille und Zahl der Rückmeldungen. Klick klappt die Zeile auf (eine zur Zeit): Satz, Knopf „Ausprobieren“ (Link oder Vorschau mit Schritten), Versionsverlauf (eingeklappt), Rückmeldungen der aktuellen Version und das kleine Rückmeldeformular.
- Reiter Anfrage stellen: sechs Felder in sinnvoller Reihenfolge, mit Beispieltext als Platzhalter; „Anfrage senden“ → Bestätigung „Eingegangen“ und die Anfrage erscheint in der Liste darunter (Titel, Datum, Status).
- Fuß: „Prototyp – Einträge bleiben nur in diesem Browser.“ · „Beispieldaten wiederherstellen“ · Link zur Website.
- Hell und dunkel (prefers-color-scheme), Akzent Smaragdgrün (#047857 hell / #34d399 dunkel), Systemschrift. Ab 900 px Liste und Formular zweispaltig sinnvoll nutzen, darunter eine Spalte. Tastatur bedienbar, sichtbarer Fokus, `prefers-reduced-motion`.
- Status-Wörter: Idee · In Arbeit · Zum Testen · Freigegeben · Pausiert.

## Hosting

- Auf der Website unter `/portal/` (statische Dateien in `public/portal/`).
- Code öffentlich auf GitHub (`demo-portal`): dieselben drei Dateien, README und `docs/technik.md`.
