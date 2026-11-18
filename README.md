# Demo-Portal

Ein neutrales, universelles Mini-Portal für die Zusammenarbeit zwischen der Person, die Abläufe automatisiert, und den Kolleginnen und Kollegen, für die sie arbeitet.

**Live-Prototyp:** https://barneysintro.space/portal/

> Prototyp: Alle Daten sind erfunden. Einträge bleiben nur im eigenen Browser.

## Das Problem

Demos landen verstreut in Mails und Chats. Rückmeldungen gehen verloren, und oft weiß niemand, welche Version gerade aktuell ist. Wünsche kommen mündlich und ohne die Angaben, die man für eine Automatisierung braucht: Wie oft? Wie lange dauert es heute? Mit welchen Programmen?

## Drei Funktionen, sonst nichts

1. **Demos ansehen und ausprobieren.** Jede Demo hängt an einem Anliegen (Nummer) und zeigt die anfragende Person, die Abteilung, die Version mit Änderungsverlauf und den Status: Idee · In Arbeit · Zum Testen · Freigegeben · Pausiert.
2. **Rückmeldung geben.** Pro Demo und Version: „Passt“, „Teilweise“ oder „Passt nicht“, dazu ein kurzer Text. Der Name ist freiwillig.
3. **Neue Anfrage stellen.** Ein kurzes Formular: Was machen Sie heute, wie oft, wie lange, mit welchen Programmen, wie dringend.

Gedacht für Menschen ohne IT-Hintergrund, etwa im Büro, im Lager, in der Buchhaltung oder im Kundendienst: auf Deutsch, wenige Wörter, große Klickflächen, eine Seite mit zwei Reitern.

## Warum neutral und universell

- **Für jedes Team und jedes Ticketsystem.** Das Anliegen ist nur eine Nummer, die Demo nur ein Link. Wo das Ticket liegt und womit die Automatisierung gebaut ist, spielt keine Rolle.
- **Keine echte Firma, keine echten Personen.** Die Beispieldaten sind erfunden: „Beispiel GmbH“, ausgedachte Namen, allgemeine Abteilungen und Programme (ERP, E-Mail, Excel, Ticketsystem).
- **Keine Abhängigkeiten.** Drei statische Dateien, kein Build, keine Bibliotheken, keine externen Ressourcen, kein Konto.

## Starten

- **Online:** https://barneysintro.space/portal/
- **Lokal:** `index.html` im Browser öffnen. Oder im Ordner einen beliebigen statischen Webserver starten, zum Beispiel:

  ```
  python -m http.server 8080 --bind 127.0.0.1
  ```

  Danach http://127.0.0.1:8080/ öffnen.

## Grenzen des Prototyps

- Statisch, ohne Server: `index.html`, `styles.css`, `app.js`.
- Rückmeldungen und Anfragen speichert nur dieser Browser (`localStorage`, Schlüssel `demoPortal.v1`). Niemand sonst sieht sie, und ein anderes Gerät kennt sie nicht.
- Ohne Speicher, etwa wenn der Browser ihn blockiert, funktioniert die Seite trotzdem, merkt sich aber nichts.
- „Beispieldaten wiederherstellen“ im Fuß der Seite setzt den Stand zurück.
- Keine Anmeldung, keine Benachrichtigungen, keine Anbindung an Ticketsystem oder ERP.

## Der Weg zu einem echten Pilot

- Kleine Web-App mit API und Datenbank (SQLite oder PostgreSQL), im Firmennetz oder bei einem Anbieter in der EU.
- Anmeldung über das Firmenverzeichnis (Single Sign-on), drei Rollen: Mitarbeitende, Automatisierung, Leitung.
- Audit-Trail: wer wann was geändert hat.
- Benachrichtigungen per E-Mail oder Chat (z. B. Teams).
- Ticketsystem und ERP nur über Nummern verknüpft, ohne Daten zu kopieren.
- Datenschutz von Anfang an: nur nötige Daten, Löschfristen, klare Regeln, wer was sieht.
- Zuerst ein Team, dann der Ausbau.

Technik, Architektur, Betrieb und Kapazitätsplanung: [docs/technik.md](docs/technik.md)

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | die Seite mit den zwei Reitern |
| `styles.css` | Gestaltung, hell und dunkel |
| `app.js` | Logik und Speicherung im Browser |
| `docs/technik.md` | Technik für Fachleute |

---

## English

**Demo-Portal** is a neutral, universal mini portal for the collaboration between the person who automates workflows and the colleagues they build them for. Live prototype: https://barneysintro.space/portal/ (interface in German).

It does three things: browse and try demos (each tied to a case number, with requester, department, version history and status), give feedback per demo and version ("fits", "partly", "does not fit", plus a short text), and submit a new request (what you do today, how often, how long, with which programs, how urgent).

It is neutral by design: the case is just a number and the demo just a link, so it works for any team, any ticket system and any tool. All data is fictional.

Prototype limits: three static files, no server, no build, no libraries. Entries are stored only in this browser (`localStorage`). To run it, open `index.html` or serve the folder with any static web server. Pilot architecture, security, GDPR and capacity planning are described in [docs/technik.md](docs/technik.md) (German).
