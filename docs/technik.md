# Demo-Portal – Technik

Dieses Dokument beschreibt den Prototyp, wie er heute ist, und wie daraus ein Pilot in einer Firma mit etwa 60 Personen werden kann. Im ganzen Dokument gilt diese Kennzeichnung:

- **(Stand heute)**: gibt es im Prototyp.
- **(geplant)**: Vorschlag für einen Pilot, noch nicht gebaut. Zahlen dazu sind Schätzungen, keine Messungen.

## Überblick

| Thema | Stand heute (Prototyp) | Geplant (Pilot) |
|---|---|---|
| Aufbau | drei statische Dateien | kleine Web-App mit API und Datenbank |
| Daten | nur im Browser (`localStorage`) | SQLite oder PostgreSQL auf einem Server |
| Anmeldung, Rollen | keine | Single Sign-on über das Firmenverzeichnis, drei Rollen |
| Nachvollziehbarkeit | keine | Audit-Trail |
| Benachrichtigung | keine | E-Mail oder Chat (z. B. Teams) |
| Ticketsystem, ERP | Anliegen-Nummer als Text, Demo als Link | Verknüpfung nur über IDs |
| Betrieb | jeder statische Webserver | eine VM mit Docker und Reverse Proxy, im Haus oder in der EU |

## 1. Der Prototyp (Stand heute)

### Aufbau

- Drei Dateien: `index.html`, `styles.css`, `app.js`. Kein Build, keine Bibliotheken, keine externen Ressourcen (keine CDNs, keine Webfonts, keine Tracker).
- Kein Server-Teil. Auslieferung über jeden statischen Webserver; online unter https://barneysintro.space/portal/ (auf der Website liegen die Dateien in `public/portal/`).
- Eine Seite mit zwei Reitern: **Demos** und **Anfrage stellen**.

### Datenmodell

```text
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

Eine Rückmeldung gehört über `demoId` und `version` zu genau einer Demo-Version. Die Anliegen-Nummer (`caseId`) ist freier Text: Sie kann aus jedem Ticketsystem stammen. Darum ist das Modell an kein Produkt gebunden.

### Speicherung

- Beispieldaten: fünf Demos, einige Rückmeldungen, zwei Anfragen. Alle erfunden; nur der Link von Demo 1 führt zu einer echten Live-Demo.
- Neue Rückmeldungen und Anfragen speichert der Browser im `localStorage` unter dem Schlüssel `demoPortal.v1`. Sie bleiben in diesem Browser auf diesem Gerät.
- Jeder Zugriff auf `localStorage` steht in `try/catch`. Ist kein Speicher verfügbar, funktioniert die Seite trotzdem, nur ohne Merken.
- „Beispieldaten wiederherstellen“ im Fuß der Seite setzt den Stand zurück.

### Sicherheitsmaßnahmen

| Maßnahme | Wirkung |
|---|---|
| Benutzereingaben werden nur über `textContent` angezeigt, nie über `innerHTML`. | Eingegebener Text wird nie als HTML interpretiert oder als Skript ausgeführt (Schutz vor XSS). |
| Längengrenzen: Name 60, Titel 120, Texte 1.000 Zeichen. | Keine übergroßen Einträge. |
| Kein Server-Teil, keine externen Ressourcen. | Das Portal schickt keine Eingaben weg und lädt keinen fremden Code. |
| Content-Security-Policy der Website: `default-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. | Der Browser lädt Skripte, Stile und Schriften nur von der eigenen Domain und baut keine Verbindungen zu fremden Servern auf. Die Seite lässt sich nicht in fremde Seiten einbetten. |

Hinweis: Die CSP gilt für die ganze Website und erlaubt dort wegen anderer Seiten noch `'unsafe-inline'` für Skripte und Stile. Für den Pilot ist eine eigene, strengere CSP ohne `'unsafe-inline'` vorgesehen.

### Bewusst weggelassen

Keine Anmeldung, keine gemeinsamen Daten zwischen Personen, keine Benachrichtigungen, keine Anbindung an Ticketsystem oder ERP, kein Anlegen von Demos über die Oberfläche. Der Prototyp macht den Ablauf sichtbar, damit man ihn besprechen kann.

## 2. Zielarchitektur für einen Pilot (geplant)

```text
Browser (Intranet oder VPN)
   │  HTTPS
Reverse Proxy (TLS)
   │
Web-App mit API ──── Datenbank (SQLite oder PostgreSQL), inkl. Audit-Trail
   ├── Anmeldung: Firmenverzeichnis, Single Sign-on (OpenID Connect oder SAML)
   ├── Benachrichtigung: E-Mail (Mailserver der Firma) oder Chat (z. B. Teams)
   └── Links: Ticketsystem und ERP, nur über IDs
```

- **Oberfläche:** dieselben drei Funktionen wie im Prototyp. Statt `localStorage` spricht sie mit der API.
- **API:** wenige JSON-Endpunkte, zum Beispiel `GET /api/demos`, `POST /api/demos/{id}/feedback`, `POST /api/requests`, `PATCH /api/requests/{id}`. Die API prüft jede Eingabe (Typ, erlaubte Werte, dieselben Längengrenzen) und bei jedem Aufruf die Rolle.
- **Datenbank:** SQLite reicht für den Pilot: eine Datei, einfach zu sichern. PostgreSQL, wenn die Firma es ohnehin betreibt oder mehrere Anwendungen darauf zugreifen sollen.
- **Anmeldung:** über das Firmenverzeichnis per Single Sign-on (zum Beispiel OpenID Connect oder SAML gegen den vorhandenen Identity Provider). Keine eigenen Passwörter. Die Rollen kommen aus Gruppen im Verzeichnis.

| Rolle | Sieht | Darf |
|---|---|---|
| Mitarbeitende | alle Demos und ihre Rückmeldungen, die eigenen Anfragen | ausprobieren, Rückmeldung geben, Anfragen stellen |
| Automatisierung | alles | Demos und Versionen pflegen, Status setzen, Anfragen bearbeiten |
| Leitung | alles, Auswertungen nur zusammengefasst | Prioritäten setzen, Demos freigeben |

- **Audit-Trail:** Jede Änderung (neue Version, Statuswechsel, Freigabe, Löschung) wird mit Zeit, Person, Objekt, altem und neuem Wert gespeichert. An die Tabelle wird nur angehängt; Freitexte stehen nicht darin.
- **Benachrichtigungen:** neue Anfrage → Automatisierung; neue Version zum Testen → anfragende Person; neue Rückmeldung → Automatisierung. Per E-Mail oder als Nachricht in einen Chat-Kanal (z. B. Teams). Inhalt nur Titel, Nummer und Link, keine Freitexte.
- **Ticketsystem und ERP:** Das Portal speichert nur Nummern (Ticketnummer, Auftrags- oder Belegnummer) und baut daraus Links. Es kopiert keine Daten und schreibt nichts ins ERP. So bleibt es für jedes Ticketsystem und jedes ERP gleich.

### Sicherheit im Pilot

- HTTPS überall; Sitzungs-Cookie mit `HttpOnly`, `Secure` und `SameSite`, Schutz gegen CSRF.
- Rollen werden serverseitig geprüft, nicht nur in der Oberfläche. Anzeige weiterhin nur über `textContent`.
- Eigene CSP ohne `'unsafe-inline'`; Begrenzung der Aufrufe (Rate Limit) am Reverse Proxy.
- Die Datenbank ist nur im internen Docker-Netz erreichbar, Container laufen ohne Root-Rechte. Zugangsdaten (SSO, Mail) liegen nur als Secrets auf dem Server, nie im Repository.

### Datenschutz (DSGVO)

- **Zweck:** Anfragen zu Automatisierungen sammeln und Demos gemeinsam verbessern. Nur dafür.
- **Datenminimierung:** Gespeichert wird, was der Ablauf braucht: Titel, Abteilung, heutiger Ablauf, Häufigkeit, Dauer, Programme, Dringlichkeit, Rückmeldung. Das Formular im Pilot bittet ausdrücklich: keine Kunden- oder Personaldaten, keine Passwörter. Ob der eigene Name bei einer Rückmeldung für andere sichtbar ist, bleibt freiwillig.
- **Wer sieht was:** siehe Rollen. Die Leitung sieht Zahlen pro Abteilung, aber keine Auswertung einzelner Personen. Das Portal dient nicht der Leistungs- oder Verhaltenskontrolle.
- **Aufbewahrung (Vorschlag, mit der Datenschutz-Ansprechperson abzustimmen):** Anfragen und Rückmeldungen 12 Monate nach Abschluss, dann löschen oder anonymisieren; Audit-Trail 24 Monate; Server-Logs 30 Tage; Sicherungen 30 Tage, damit Gelöschtes spätestens dann auch aus den Sicherungen verschwindet.
- **Betroffenenrechte:** Die Einträge einer Person lassen sich exportieren und löschen.
- **Organisatorisch:** Eintrag im Verzeichnis der Verarbeitungstätigkeiten; einen vorhandenen Betriebsrat früh einbinden; bei Cloud-Betrieb ein Auftragsverarbeitungsvertrag und ein Rechenzentrum in der EU.

## 3. Betriebsvarianten (geplant)

| | A: im eigenen Haus | B: kleiner Cloud-Server in der EU |
|---|---|---|
| Server | eine Linux-VM auf der vorhandenen Virtualisierung | ein kleiner virtueller Server mit Rechenzentrum in der EU |
| Software | Docker Compose: App, optional PostgreSQL, Reverse Proxy (zum Beispiel nginx oder Caddy); feste Image-Versionen, nicht `latest` | gleich |
| Zugang | HTTPS mit Zertifikat; nur im Intranet oder über VPN, keine Portfreigabe ins Internet | HTTPS; Zugang nur über VPN oder für die Firmen-IP freigegeben, dazu SSO |
| Datenschutz | Daten bleiben im Haus | Auftragsverarbeitungsvertrag mit dem Anbieter |
| Sinnvoll, wenn | Server und Sicherung schon vorhanden sind | es keine eigene Infrastruktur gibt |

## 4. Kapazitätsplan für etwa 60 Personen (geplant, Schätzung)

### Annahmen

Die Planwerte sind bewusst großzügig; realistisch ist es deutlich weniger.

| Größe | Planwert | Begründung |
|---|---|---|
| Personen mit Zugang | 60 | die ganze Organisation |
| Gleichzeitig aktiv (Spitze) | 15 | kurz nach einer Nachricht „Neue Version zum Testen“ |
| Seitenaufrufe | 200 pro Tag | 60 Personen mit gut drei Aufrufen |
| API-Aufrufe | 2.000 pro Tag | rund zehn pro Seitenaufruf |
| Anfragen | 5 pro Tag (realistisch 1–2) | Wünsche kommen nicht täglich von allen |
| Rückmeldungen | 20 pro Tag (realistisch 5–10) | wenige Demos gleichzeitig im Test, je Version eine Handvoll |

In der Spitze öffnen 15 Personen das Portal innerhalb einer Minute: 15 × (3 Dateien + 10 API-Aufrufe) ≈ 200 Aufrufe pro Minute, also rund 3 pro Sekunde.

### Speicher pro Jahr (220 Arbeitstage)

| Daten | Rechnung | Ergebnis |
|---|---|---|
| Rückmeldungen | 20 × 220 = 4.400, je höchstens ca. 2 KB | ca. 9 MB |
| Anfragen | 5 × 220 = 1.100, je höchstens ca. 5 KB | ca. 6 MB |
| Audit-Trail | 100 Ereignisse pro Tag (großzügig) × 220 = 22.000, je ca. 0,5 KB | ca. 11 MB |
| Demos, Versionen, Benutzer | | unter 1 MB |
| **Datenbank** | Summe ca. 27 MB, mit Indizes und Reserve | **unter 100 MB pro Jahr** |
| Server-Logs | ca. 2.600 Aufrufe × 250 Byte pro Tag, 30 Tage | ca. 20 MB |
| Sicherungen | 30 tägliche, komprimiert je höchstens ca. 30 MB | unter 1 GB |

Anhänge sind im Pilot nicht vorgesehen. Kämen sie dazu, bräuchten sie ein Größenlimit und einen eigenen Speicherplan.

### Server und Netzwerk

- **CPU: 2 vCPU.** Eine einfache API mit SQLite beantwortet einen Aufruf in wenigen Millisekunden. Bei rund 3 Aufrufen pro Sekunde bleibt die Last deutlich unter 5 %.
- **RAM: 4 GB.** Betriebssystem ca. 0,5 GB, App ca. 0,3 GB, PostgreSQL (falls genutzt) ca. 0,5 GB, Reverse Proxy unter 0,1 GB: zusammen etwa 1,5 GB. 2 GB würden reichen, 4 GB geben Reserve.
- **Platte: 40 GB SSD.** System und Container-Images ca. 10 GB; Datenbank, Logs und lokale Sicherungen zusammen unter 2 GB pro Jahr.
- **Netzwerk:** Seite, Stile und Skript geschätzt unter 100 KB, API-Antworten wenige KB. Pro Tag: 200 × 100 KB + 2.000 × 5 KB ≈ 30 MB. Spitze: 15 Seitenaufrufe pro Minute × ca. 150 KB ≈ 2,3 MB pro Minute ≈ 0,3 Mbit/s. Jede Büroleitung reicht.

### Sicherung und Wiederherstellung

- Jede Nacht eine Sicherung der Datenbank (SQLite: Online-Backup mit `.backup`, PostgreSQL: `pg_dump`), verschlüsselt, auf ein zweites System (Backup-Server oder NAS der Firma, bei Variante B ein Speicher in der EU). Aufbewahrung 30 Tage.
- Ziele: höchstens 24 Stunden Datenverlust (RPO), wieder verfügbar innerhalb von 4 Stunden (RTO).
- Wiederherstellungstest vor dem Start und danach vierteljährlich auf einer Test-VM: Sicherung einspielen, anmelden, Stichprobe prüfen, Dauer notieren.

### Monitoring

- Erreichbarkeit: Health-Check (`/healthz`) alle 5 Minuten über das vorhandene Monitoring der Firma.
- Alarm bei: Dienst nicht erreichbar, Plattenplatz über 80 %, Zertifikat läuft in weniger als 14 Tagen ab, nächtliche Sicherung fehlt oder ist fehlgeschlagen, auffällig viele Serverfehler (HTTP 5xx).

### Warum eine kleine VM reicht

- **Die Last ist klein:** wenige Aufrufe pro Sekunde in der Spitze, die Daten wachsen um Megabytes, nicht um Gigabytes. Auch die zehnfache Last läge weit unter dem, was diese VM schafft.
- **Das Portal ist nicht geschäftskritisch:** Fällt es ein paar Stunden aus, gehen Wünsche kurz per E-Mail. Ein Cluster oder eine zweite VM brächte mehr Aufwand und mehr Fehlerquellen, aber keinen Nutzen.
- **Wachstum ist einfach:** mehr RAM, von SQLite auf PostgreSQL. Ein zweiter Server ist erst bei einem Vielfachen der Nutzung ein Thema.

## 5. Betrieb (geplant)

- **Updates:** Sicherheitsupdates für Betriebssystem und Container zeitnah, kritische innerhalb weniger Tage; sonst monatlich in einem festen Wartungsfenster. Ablauf: Sicherung → Update in einer Testinstanz → kurzer Funktionstest → Produktion.
- **Sicherungen:** wie oben; das Ergebnis jeder Sicherung landet im Monitoring.
- **Logs:** Zugriffs- und Fehlerlogs ohne Eingabedaten und ohne Freitexte, 30 Tage. Fachliche Änderungen stehen im Audit-Trail, nicht im Log.
- **Zuständigkeit:** Betrieb durch die Automatisierung, Vertretung durch die IT. Ein kurzes Betriebshandbuch: Start, Stopp, Update, Wiederherstellung.
- **Aufwand (Schätzung):** etwa ein bis zwei Stunden im Monat für Updates und Kontrollen, dazu der vierteljährliche Wiederherstellungstest.

## 6. Roadmap

| Phase | Inhalt | Status |
|---|---|---|
| 0. Prototyp | drei statische Dateien, Beispieldaten, Speicherung im Browser; den Ablauf zeigen und besprechen | **Stand heute** |
| 1. Pilot mit einem Team | Web-App mit API und SQLite, Single Sign-on, Rollen, Audit-Trail, Benachrichtigungen, Links über Nummern. Ein Team mit 5–15 Personen, 4–6 Wochen. Aufbau grob zwei bis drei Wochen, je nachdem, wie schnell Anmeldung, Server und Mailzugang bereitstehen. Danach Auswertung: Kommen Anfragen mit allen Angaben? Gibt es Rückmeldungen pro Version? Wie lange dauert es von der Anfrage bis zur ersten Demo? | geplant |
| 2. Ausbau | weitere Teams, Löschfristen automatisch, bei Bedarf PostgreSQL, Kurzanleitung und eine Einschulung von 15 Minuten | geplant |
