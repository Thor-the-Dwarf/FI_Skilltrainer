# Oberthemen-Arbeitsstruktur

Die Datenbank trennt jetzt zwischen Bereichen, Oberthemen, Thema-Objekten und zusätzlichen Curriculum-Filtern.

## Begriffslogik

- Bereich: Ausbildungsjahr oder Prüfungsteil
- Oberthema: fachlicher Hauptblock
- Thema-Objekt: kleinste fachliche Einheit
- Curriculum-Knoten: filterbarer Eintrag aus Lernfeld, Ausbildungsrahmenplan oder Modulstruktur

## Bereiche und Oberthemen

### Ausbildungsjahr 1
- Hinweis: Lernfelder 1-5; gemeinsame Grundlagen.
- Oberthemen:
  - Arbeitsrecht und Mitbestimmung
  - Arbeitssicherheit und Umweltschutz
  - Ausbildung und Betriebsrolle
  - Betrieb, Markt und Wertschöpfung
  - Datenmodellierung und Normalisierung
  - Hardware und Arbeitsplatzsysteme
  - IT-Sicherheit und Datenschutz
  - Netzwerke und Adressierung
  - Präsentation, Dokumentation und Reflexion
  - SQL und relationale Datenpraxis

### Ausbildungsjahr 2
- Hinweis: Lernfelder 6-9; gemeinsame Grundlagen.
- Oberthemen:
  - Anforderungen, UX und Barrierefreiheit
  - Arbeitssicherheit und Umweltschutz
  - Cyber-physische Systeme und IoT
  - Datenintegration und Datenaustausch
  - IT-Sicherheit und Datenschutz
  - Netzwerkdienste und Virtualisierung
  - Objektorientierung und UML
  - Projektmanagement und Wirtschaftlichkeit
  - Service- und Supportprozesse
  - Testen und Qualitätssicherung

### Ausbildungsjahr 3
- Hinweis: Lernfelder 10-13; spezialisierungsbezogene Vertiefung für Fachinformatiker.
- Oberthemen:
  - Algorithmen und Datenstrukturen
  - Anforderungen, UX und Barrierefreiheit
  - Arbeitssicherheit und Umweltschutz
  - Datenbankobjekte und Transaktionen
  - Datenmodellierung und Normalisierung
  - Fachgespräch und berufliche Argumentation
  - IT-Sicherheit und Datenschutz
  - Objektorientierung und UML
  - Projektmanagement und Wirtschaftlichkeit
  - Prozessanalyse, Monitoring und Datenqualität
  - SQL und relationale Datenpraxis
  - Softwarearchitektur und Entwurfsmuster
  - Testen und Qualitätssicherung
  - Versionsverwaltung und Lieferketten
  - Web, APIs und Schnittstellen

### Prüfung 1
- Hinweis: Gemeinsame Grundlagen.
- Oberthemen:
  - Arbeitssicherheit und Umweltschutz
  - Ausbildung und Betriebsrolle
  - Datenmodellierung und Normalisierung
  - Hardware und Arbeitsplatzsysteme
  - IT-Sicherheit und Datenschutz
  - Netzwerke und Adressierung
  - Präsentation, Dokumentation und Reflexion
  - SQL und relationale Datenpraxis
  - Service- und Supportprozesse

### Prüfung 2/1
- Hinweis: Gemeinsame Grundlagen plus spezialisierungsbezogene Anteile.
- Oberthemen:
  - Anforderungen, UX und Barrierefreiheit
  - Datenmodellierung und Normalisierung
  - IT-Sicherheit und Datenschutz
  - Objektorientierung und UML
  - Projektmanagement und Wirtschaftlichkeit
  - Präsentation, Dokumentation und Reflexion
  - SQL und relationale Datenpraxis

### Prüfung 2/2
- Hinweis: Spezialisierungsbezogene schriftliche Vertiefung.
- Oberthemen:
  - Algorithmen und Datenstrukturen
  - Datenbankobjekte und Transaktionen
  - Datenmodellierung und Normalisierung
  - IT-Sicherheit und Datenschutz
  - Objektorientierung und UML
  - Prozessanalyse, Monitoring und Datenqualität
  - SQL und relationale Datenpraxis
  - Softwarearchitektur und Entwurfsmuster
  - Testen und Qualitätssicherung
  - Versionsverwaltung und Lieferketten
  - Web, APIs und Schnittstellen

### Prüfung 2/3
- Hinweis: Wirtschafts- und Sozialkunde.
- Oberthemen:
  - Arbeitssicherheit und Umweltschutz
  - Wirtschafts- und Sozialkunde

### Prüfung 2/4
- Hinweis: Fachgespräch plus spezialisierungsbezogene Argumentation.
- Oberthemen:
  - Anforderungen, UX und Barrierefreiheit
  - Fachgespräch und berufliche Argumentation
  - IT-Sicherheit und Datenschutz
  - Projektmanagement und Wirtschaftlichkeit
  - Präsentation, Dokumentation und Reflexion
  - Softwarearchitektur und Entwurfsmuster
  - Testen und Qualitätssicherung

## Curriculum-Filterebenen

- `ausbildungsjahr`: 3 Knoten
- `ausbildungsrahmenplan_official`: 34 Knoten
- `lernfeld`: 12 Knoten
- `modulplan_seed`: 33 Knoten
