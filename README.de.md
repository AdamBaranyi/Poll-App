# Poll App

Umfragen erstellen, teilen und die Ergebnisse live mitverfolgen. Ein Schulprojekt der Developer
Akademie, gebaut mit Angular und Supabase.

Live: https://poll-app.adambaranyi.xyz

[English version](README.md)

## Was die App kann

- Die Startseite zeigt alle Umfragen mit Kategorie, Titel und Enddatum, getrennt nach laufenden und
  vergangenen, und lässt sich nach Kategorie filtern.
- Umfragen, die bald enden, stehen über der Liste, die mit dem frühesten Ende zuerst.
- «New survey» öffnet ein Formular in einem Overlay: Name, Enddatum (freiwillig), Kategorie,
  Beschreibung (freiwillig) und bis zu zwanzig Fragen mit je bis zu sechs Antworten.
- Eine Umfrageseite zeigt die Fragen, nimmt die Antworten entgegen und zeigt daneben den aktuellen
  Stand. Die Ergebnisse ändern sich live, während andere abstimmen.
- Vergangene Umfragen lassen sich ansehen, aber nicht mehr beantworten. Der Browser merkt sich eine
  Umfrage, die man schon beantwortet hat.

## Technik

- Angular 22 mit Standalone-Komponenten, Signals und ohne Zone.js
- Supabase für die Datenbank und die Live-Aktualisierung
- Playwright für die Tests, ESLint und Prettier für den Stil
- Keine UI-Bibliothek: Das Design kommt aus Figma und ist mit eigenem SCSS gebaut

## Lokal starten

```bash
npm install
npm start
```

Die App läuft dann auf http://localhost:4200/.

Tests, Lint und Build:

```bash
npm run test:e2e
npm run lint
npm run build
```

Die Tests beantworten jede Anfrage an Supabase selbst und rühren die echte Datenbank nie an.
`npm run test:e2e:browsers` wiederholt sie in Safari und Firefox, `npm run test:dist` prüft den
gebauten Stand hinter den Kopfzeilen der Live-Version, und `npm run test:db` prüft die
Datenbankregeln in einem Wegwerf-Postgres (braucht Docker).

## Datenbank

In `supabase/` liegt die ganze Datenbank: `schema.sql` für die Tabellen, `policies.sql` für die
Zugriffsregeln und `seed.sql` für die Beispielumfragen.

Die Supabase-Adresse und der öffentliche Schlüssel in `src/environments/` sind zur Veröffentlichung
gedacht. Jede Tabelle hat Row Level Security: Lesen darf jeder, und jeder darf Umfragen, Fragen,
Antworten und Stimmen anlegen, aber nur so, wie die App es braucht. Nachträglich ändern oder löschen
kann niemand etwas, und Stimmen werden nur angenommen, solange eine Umfrage läuft. Geprüft wird das
in `supabase/tests/`.
