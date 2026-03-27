# Begriffserklärungen Ausgangsbasis

Diese Datei bündelt den aktuell vorhandenen Bestand an Thema-Objekten nach Oberthemen.

## Aktuell erklärte Thema-Objekte: 144

## Algorithmen und Datenstrukturen
- Oberthema-Beschreibung: Ablauflogik, Kontrollstrukturen, Such- und Sortierverfahren sowie Berechnungslogik.
- Aktuell erklärte Thema-Objekte: 11

### Abbruchbedingung
- ID: `alg_abbruchbedingung`
- Definition: die Regel, unter der ein wiederholter Ablauf beendet wird
- Beispiel: Eine Suche endet, sobald das gesuchte Element gefunden oder der letzte Eintrag geprueft wurde.
- Abgrenzung zu: Initialisierung
- Unterschied: Die Abbruchbedingung beendet einen Ablauf, die Initialisierung bereitet ihn nur vor.

### Algorithmus
- ID: `alg_algorithmus`
- Definition: eine endliche und eindeutige Folge von Schritten zur Loesung eines Problems
- Beispiel: Eine Routine liest Werte, vergleicht sie und gibt das Ergebnisobjekt zurueck.
- Abgrenzung zu: Heuristik
- Unterschied: Ein Algorithmus beschreibt eine nachvollziehbare Schrittfolge, eine Heuristik ist nur eine zweckmaessige Naeherung.

### Binaersuche
- ID: `alg_binaersuche`
- Definition: ein Suchverfahren, das in einer sortierten Menge den Suchraum schrittweise halbiert
- Beispiel: In einer geordneten Liste wird der mittlere Wert geprueft und danach nur links oder rechts weitergesucht.
- Abgrenzung zu: Lineare Suche
- Unterschied: Die Binaersuche halbiert den Suchraum in sortierten Daten, die lineare Suche prueft Element fuer Element.

### Doppelschleife
- ID: `alg_doppelschleife`
- Definition: eine verschachtelte Schleifenstruktur, bei der eine Schleife innerhalb einer anderen ausgefuehrt wird
- Beispiel: Fuer jeden Monat werden in einer inneren Schleife alle Messwerte dieses Monats ausgewertet.
- Abgrenzung zu: Einfache Schleife
- Unterschied: Eine Doppelschleife verarbeitet zwei Ebenen verschachtelt, eine einfache Schleife nur eine Ebene.

### Greedy-Algorithmus
- ID: `alg_greedy`
- Definition: ein Verfahren, das in jedem Schritt die lokal beste Option waehlt
- Beispiel: Bei einer Flugroute wird immer zuerst der naechstgelegene noch offene Flughafen gewaehlt.
- Abgrenzung zu: Globale Optimierung
- Unterschied: Ein Greedy-Verfahren entscheidet schrittweise lokal, eine globale Optimierung betrachtet den Gesamtraum der Loesungen.

### Iteration
- ID: `alg_iteration`
- Definition: die wiederholte Ausfuehrung eines Schritts ueber Schleifen statt ueber Selbstaufrufe
- Beispiel: Eine Liste wird in einer for-Schleife von links nach rechts abgearbeitet.
- Abgrenzung zu: Rekursion
- Unterschied: Iteration nutzt Schleifen, Rekursion nutzt Selbstaufrufe.

### Kontrollstruktur
- ID: `alg_kontrollstruktur`
- Definition: ein Grundbaustein wie Sequenz, Verzweigung oder Schleife zur Steuerung des Ablaufs
- Beispiel: Ein Algorithmus kombiniert nacheinander eine Pruefung, einen If-Zweig und eine Schleife.
- Abgrenzung zu: Datenstruktur
- Unterschied: Kontrollstrukturen steuern den Ablauf, Datenstrukturen halten Informationen.

### Pseudocode
- ID: `alg_pseudocode`
- Definition: eine sprachnahe, aber nicht an eine konkrete Syntax gebundene Beschreibung eines Algorithmus
- Beispiel: Eine PV2-Loesung beschreibt Schleifen, Vergleiche und Rueckgaben, ohne auf Java-Schreibweise festgelegt zu sein.
- Abgrenzung zu: Quelltext
- Unterschied: Pseudocode beschreibt die Logik sprachneutral, Quelltext ist bereits konkrete Implementierung.

### Rekursion
- ID: `alg_rekursion`
- Definition: eine Technik, bei der eine Funktion sich mit einem kleineren Teilproblem selbst aufruft
- Beispiel: Eine Routine zerlegt eine Zahl wiederholt in Quotient und Rest und ruft sich fuer den Quotienten erneut auf.
- Abgrenzung zu: Iteration
- Unterschied: Rekursion arbeitet ueber Selbstaufrufe, Iteration ueber Schleifenstrukturen.

### Schreibtischtest
- ID: `alg_schreibtischtest`
- Definition: eine manuelle Schritt-fuer-Schritt-Pruefung eines Ablaufs mit konkreten Eingabedaten
- Beispiel: Ein Team verfolgt fuer Beispielwerte jede Schleifenrunde und notiert Zwischenstaende von Variablen.
- Abgrenzung zu: Unit-Test
- Unterschied: Beim Schreibtischtest wird der Ablauf manuell verfolgt, ein Unit-Test wird automatisiert ausgefuehrt.

### Sortieralgorithmus
- ID: `alg_sortieralgorithmus`
- Definition: ein Verfahren, das Elemente nach einer Vergleichsregel in eine gewuenschte Reihenfolge bringt
- Beispiel: Kursdaten werden nach Name oder Wert geordnet, weil eine Vergleichsfunktion groesser, kleiner oder gleich meldet.
- Abgrenzung zu: Suchalgorithmus
- Unterschied: Sortieralgorithmen ordnen eine Menge neu, Suchalgorithmen finden gezielt Elemente.

## Anforderungen, UX und Barrierefreiheit
- Oberthema-Beschreibung: Stakeholder, Anforderungen, Mockups, Prototypen, Usability und barrierefreie Gestaltung.
- Aktuell erklärte Thema-Objekte: 11

### Barrierefreiheit
- ID: `req_barrierefreiheit`
- Definition: die Gestaltung von Systemen so, dass sie auch mit unterschiedlichen Einschraenkungen nutzbar sind
- Beispiel: Bedienelemente sind per Tastatur erreichbar und Inhalte werden fuer Screenreader sinnvoll strukturiert.
- Abgrenzung zu: Reine Aesthetik
- Unterschied: Barrierefreiheit betrifft Zugang und Nutzbarkeit fuer verschiedene Bedarfe, Aesthetik nur das Aussehen.

### Change Management
- ID: `req_change_management`
- Definition: der strukturierte Umgang mit Aenderungen an Anforderungen, Prozessen oder Systemen
- Beispiel: Eine Fachaenderung wird bewertet, kommuniziert, eingeplant und in ihren Folgen nachgezogen.
- Abgrenzung zu: Spontanumbau
- Unterschied: Change Management steuert Aenderungen kontrolliert, Spontanumbau ignoriert Folgen und Abstimmung.

### Funktionale Anforderung
- ID: `req_funktional`
- Definition: eine Anforderung daran, was ein System fachlich leisten oder tun soll
- Beispiel: Das System soll freie Tische fuer ein Datum ermitteln koennen.
- Abgrenzung zu: Nicht-funktionale Anforderung
- Unterschied: Funktionale Anforderungen beschreiben Leistungen, nicht-funktionale Rahmenbedingungen oder Qualitaeten.

### Mockup
- ID: `req_mockup`
- Definition: eine statische, fruehe Visualisierung einer Oberflaeche ohne vollstaendige Funktionslogik
- Beispiel: Ein Bildschirmentwurf zeigt Anordnung und Inhalt geplanter Felder und Buttons.
- Abgrenzung zu: Prototyp
- Unterschied: Ein Mockup ist eher statisch, ein Prototyp ermoeglicht meist mehr Interaktion oder Verhaltenssimulation.

### Nicht-funktionale Anforderung
- ID: `req_nichtfunktional`
- Definition: eine Anforderung an Qualitaeten oder Rahmenbedingungen eines Systems wie Sicherheit, Performance oder Benutzbarkeit
- Beispiel: Ein Bericht muss barrierefrei nutzbar sein und unter hoher Last stabil bleiben.
- Abgrenzung zu: Funktionale Anforderung
- Unterschied: Nicht-funktionale Anforderungen beschreiben Qualitaeten und Rahmen, funktionale Anforderungen konkrete Leistungen.

### Prototyp
- ID: `req_prototyp`
- Definition: eine fruehe, meist teilweise interaktive Umsetzung zum Erproben von Ideen oder Ablaufen
- Beispiel: Ein klickbarer Entwurf prueft, ob Nutzende die Terminbuchung verstehen.
- Abgrenzung zu: Mockup
- Unterschied: Ein Prototyp erprobt Verhalten oder Interaktion, ein Mockup primar Anordnung und Inhalt.

### Scrum
- ID: `req_scrum`
- Definition: ein agiles Rahmenwerk mit klaren Rollen, Inkrementen und regelmaessigen Feedback-Schleifen
- Beispiel: Arbeit wird in Sprints geplant, abgestimmt und ueber Reviews sichtbar gemacht.
- Abgrenzung zu: Wasserfall
- Unterschied: Scrum arbeitet iterativ mit Feedback-Schleifen, ein Wasserfallmodell eher phasenorientiert nacheinander.

### Stakeholder
- ID: `req_stakeholder`
- Definition: eine Person oder Gruppe mit Interesse, Einfluss oder Betroffenheit bezueglich eines Systems
- Beispiel: Nutzende, Auftraggeber, Betrieb und Support haben unterschiedliche Erwartungen an dieselbe Loesung.
- Abgrenzung zu: Entwicklungsteam
- Unterschied: Stakeholder umfasst alle relevanten Interessengruppen, das Entwicklungsteam ist nur ein Teil davon.

### Usability
- ID: `req_usability`
- Definition: das Ausmass, in dem Nutzende Aufgaben effektiv, effizient und zufriedenstellend erledigen koennen
- Beispiel: Ein Formular ist klar, fehlertolerant und fuehrt schnell zum Ziel.
- Abgrenzung zu: User Experience
- Unterschied: Usability betrifft die Gebrauchstauglichkeit bei Aufgaben, User Experience das umfassendere Erleben darum herum.

### User Story
- ID: `req_user_story`
- Definition: eine kurze Anforderungsform aus Sicht einer nutzenden Rolle mit Ziel und Nutzen
- Beispiel: Als Praxisassistenz moechte ich freie Termine finden, damit ich schnell buchen kann.
- Abgrenzung zu: Technische Aufgabe
- Unterschied: Eine User Story beschreibt Nutzerrolle, Ziel und Nutzen, eine technische Aufgabe nur Umsetzungsarbeit.

### Workshop
- ID: `req_workshop`
- Definition: ein moderiertes Arbeitsformat, in dem Beteiligte gemeinsam Informationen, Ziele oder Loesungen erarbeiten
- Beispiel: Fachbereich, Betrieb und Entwicklung klaeren gemeinsam Anforderungen und offene Konflikte.
- Abgrenzung zu: Einzelarbeit
- Unterschied: Ein Workshop nutzt gemeinsame Erarbeitung mehrerer Beteiligter, Einzelarbeit nicht.

## Arbeitssicherheit und Umweltschutz
- Oberthema-Beschreibung: Arbeitsschutz, Unfallverhütung, Brandschutz, Umweltschutz und ressourcenschonendes Verhalten.
- Aktuell erklärte Thema-Objekte: 4

### Arbeitsschutz
- ID: `safe_arbeitsschutz`
- Definition: alle Maßnahmen und Regeln zum Schutz von Sicherheit und Gesundheit bei der Arbeit
- Beispiel: Ein Arbeitsplatz wird so organisiert, dass Gefährdungen erkannt und Schutzmaßnahmen umgesetzt werden.
- Abgrenzung zu: reine Bequemlichkeitsregel
- Unterschied: Arbeitsschutz schützt Menschen vor Gefährdung, eine Bequemlichkeitsregel nicht.

### Brandschutz
- ID: `safe_brandschutz`
- Definition: organisatorische und technische Maßnahmen zur Vermeidung und Bekämpfung von Bränden
- Beispiel: Fluchtwege, Brandmelder und passende Reaktionen im Brandfall werden geplant und geübt.
- Abgrenzung zu: allgemeiner Gebäudekomfort
- Unterschied: Brandschutz schützt vor Brandfolgen, allgemeiner Gebäudekomfort nicht.

### Umweltschutz
- ID: `safe_umweltschutz`
- Definition: Maßnahmen zur Verringerung negativer Umweltwirkungen im betrieblichen Handeln
- Beispiel: Ein Betrieb achtet auf Entsorgung, Materialverbrauch und umweltschonende Abläufe.
- Abgrenzung zu: reine Kostenfrage
- Unterschied: Umweltschutz betrifft ökologische Verantwortung und Regeln, nicht nur Kosten.

### Unfallverhütung
- ID: `safe_unfallverhuetung`
- Definition: vorbeugende Maßnahmen zur Vermeidung von Arbeitsunfällen
- Beispiel: Gefährliche Situationen werden erkannt und vor Beginn der Tätigkeit abgesichert.
- Abgrenzung zu: Reparaturmaßnahme nach dem Schaden
- Unterschied: Unfallverhütung wirkt vorbeugend, eine Reparaturmaßnahme reagiert erst nach dem Ereignis.

## Cyber-physische Systeme und IoT
- Oberthema-Beschreibung: CPS-Grundlagen, Sensorik, Protokolle, Inbetriebnahme und Review.
- Aktuell erklärte Thema-Objekte: 2

### Anomalieerkennung
- ID: `dv_anomalieerkennung`
- Definition: das Erkennen auffälliger Abweichungen von erwarteten Zuständen oder Messwerten
- Beispiel: Messwerte werden so überwacht, dass ungewöhnliche Muster als Warnsignal erkannt werden.
- Abgrenzung zu: Normalbetrieb
- Unterschied: Anomalieerkennung sucht gezielt Abweichungen, Normalbetrieb beschreibt den erwarteten Zustand.

### Cyber-physisches System
- ID: `dv_cyber_physisches_system`
- Definition: ein System, in dem Software, Vernetzung, Sensorik und physische Prozesse eng zusammenwirken
- Beispiel: Sensoren, Aktoren und Software steuern gemeinsam einen realen technischen Ablauf.
- Abgrenzung zu: reine Office-Anwendung
- Unterschied: Ein cyber-physisches System koppelt digitale Logik mit physischen Prozessen, eine reine Office-Anwendung nicht.

## Datenbankobjekte und Transaktionen
- Oberthema-Beschreibung: DDL, Rechte, Trigger, Routinen, Transaktionslogik und Datenbankbetrieb.
- Aktuell erklärte Thema-Objekte: 9

### ACID
- ID: `dbo_acid`
- Definition: das Prinzip aus Atomaritaet, Konsistenz, Isolation und Dauerhaftigkeit fuer Transaktionen
- Beispiel: Nach einem Fehler wird eine mehrschrittige Buchung komplett zurueckgerollt statt halb gespeichert.
- Abgrenzung zu: Best-Effort-Speicherung
- Unterschied: ACID beschreibt strenge Garantien fuer Transaktionen, Best-Effort speichert ohne dieselbe Verbindlichkeit.

### CREATE TABLE
- ID: `dbo_create_table`
- Definition: eine DDL-Anweisung zum Anlegen einer neuen Tabelle mit Spalten und Datentypen
- Beispiel: Fuer Herstellerdaten wird eine neue Tabelle mit ID, Name und Kontaktfeldern definiert.
- Abgrenzung zu: INSERT
- Unterschied: CREATE TABLE definiert Struktur, INSERT fuellt vorhandene Struktur mit Daten.

### Datenwert
- ID: `dbo_datenwert`
- Definition: der konkrete Inhalt, der in einem Feld einer Zeile gespeichert ist
- Beispiel: Der Wert 2026-03-26 steht in einer Datumsspalte fuer einen Termin.
- Abgrenzung zu: Datentyp
- Unterschied: Der Datenwert ist der konkrete Inhalt, der Datentyp die Form dieses Inhalts.

### Dokumentenorientierte Datenbank
- ID: `dbo_dokumentendb`
- Definition: eine Datenbankform, die Daten typischerweise als Dokumente statt streng relationalen Tabellen speichert
- Beispiel: Ein JSON-basiertes Schema speichert unterschiedlich strukturierte Ereignisdokumente.
- Abgrenzung zu: Relationale Datenbank
- Unterschied: Dokumentenorientierte Datenbanken speichern flexible Dokumente, relationale Datenbanken strukturieren Daten tabellarisch mit Schluesseln.

### GRANT
- ID: `dbo_grant`
- Definition: eine Anweisung zur Vergabe von Rechten auf Datenbankobjekte
- Beispiel: Ein Reporting-Benutzer erhaelt Leserechte auf eine Auswertungstabelle.
- Abgrenzung zu: REVOKE
- Unterschied: GRANT vergibt Rechte, REVOKE entzieht sie wieder.

### REVOKE
- ID: `dbo_revoke`
- Definition: eine Anweisung zum Entziehen zuvor vergebener Rechte
- Beispiel: Ein alter Import-Benutzer verliert seine Schreibrechte nach dem Offboarding.
- Abgrenzung zu: GRANT
- Unterschied: REVOKE entzieht Rechte, GRANT vergibt sie.

### Stored Procedure
- ID: `dbo_stored_procedure`
- Definition: eine gekapselte, explizit aufrufbare Datenbankroutine fuer wiederkehrende Logik
- Beispiel: Ein Bericht oder eine Pflegeoperation wird ueber eine benannte Routine mit Parametern gestartet.
- Abgrenzung zu: Trigger
- Unterschied: Eine Stored Procedure wird gezielt aufgerufen, ein Trigger reagiert automatisch auf Ereignisse.

### Transaktion
- ID: `dbo_transaktion`
- Definition: eine logisch zusammengehoerige Folge von Datenbankoperationen, die gemeinsam erfolgreich oder gar nicht wirksam werden soll
- Beispiel: Buchung, Zahlungsstatus und Beleg werden nur zusammen bestaetigt.
- Abgrenzung zu: Einzelanweisung
- Unterschied: Eine Transaktion sichert mehrere zusammenhaengende Schritte gemeinsam ab, eine Einzelanweisung nur einen Schritt.

### Trigger
- ID: `dbo_trigger`
- Definition: eine automatisch durch Datenbankereignisse ausgeloeste Logik
- Beispiel: Nach einem INSERT wird automatisch ein Audit-Eintrag geschrieben.
- Abgrenzung zu: Stored Procedure
- Unterschied: Ein Trigger laeuft automatisch bei Ereignissen, eine Stored Procedure wird explizit aufgerufen.

## Datenmodellierung und Normalisierung
- Oberthema-Beschreibung: Fachmodelle, relationale Ableitung, Schlüssel, Normalformen und Anomalien.
- Aktuell erklärte Thema-Objekte: 11

### Aenderungsanomalie
- ID: `dbm_aenderungsanomalie`
- Definition: ein Problem, bei dem dieselbe Information an mehreren Stellen konsistent geaendert werden muss
- Beispiel: Der Name eines Standorts steht in vielen Buchungen und muss ueberall identisch nachgezogen werden.
- Abgrenzung zu: Zentrale Stammdatenhaltung
- Unterschied: Eine Aenderungsanomalie entsteht aus Redundanz, zentrale Stammdatenhaltung reduziert sie.

### Datentyp
- ID: `dbm_datentyp`
- Definition: die fachlich und technisch passende Form, in der ein Wert gespeichert wird
- Beispiel: Ein Datum wird als Datumstyp und eine Menge als numerischer Typ modelliert.
- Abgrenzung zu: Datenwert
- Unterschied: Der Datentyp beschreibt die Form eines Wertes, der Datenwert den konkreten Inhalt.

### Dritte Normalform
- ID: `dbm_3nf`
- Definition: eine Tabellenform, in der Nichtschluesselattribute nicht transitiv von einem Schluessel abhaengen
- Beispiel: Die Postleitzahl bestimmt nicht noch einmal den Ortsnamen in derselben Fachdaten-Tabelle, sondern wird sauber ausgelagert.
- Abgrenzung zu: Zweite Normalform
- Unterschied: Die dritte Normalform beseitigt transitive Abhaengigkeiten, die zweite Normalform Teilabhaengigkeiten.

### Einfuegeanomalie
- ID: `dbm_einfuegeanomalie`
- Definition: ein Problem, bei dem neue Informationen ohne unnoetige Zusatzdaten nicht gespeichert werden koennen
- Beispiel: Ein neuer Raum kann erst angelegt werden, wenn bereits eine Buchung dafuer existiert.
- Abgrenzung zu: Normalisierte Struktur
- Unterschied: Eine Einfuegeanomalie weist auf unguenstige Tabellenzuschnitte hin, eine normalisierte Struktur vermeidet genau das.

### Entity-Relationship-Modell
- ID: `dbm_erm`
- Definition: ein fachliches Modell aus Entitaeten, Attributen und Beziehungen fuer Datenobjekte
- Beispiel: Kunde, Buchung, Ressource und Standort werden mit ihren Beziehungen fachlich beschrieben.
- Abgrenzung zu: Relationales Datenmodell
- Unterschied: Ein ERM ist das fachliche Vorstufenmodell, das relationale Datenmodell die tabellarische Umsetzung.

### Erste Normalform
- ID: `dbm_1nf`
- Definition: eine Tabellenform, in der jedes Feld einen atomaren Einzelwert enthaelt
- Beispiel: Mehrere Telefonnummern werden nicht in einer Zelle gesammelt, sondern getrennt modelliert.
- Abgrenzung zu: Unnormalisierte Tabelle
- Unterschied: Die erste Normalform verlangt atomare Werte, eine unnormalisierte Tabelle erlaubt Wiederholungsgruppen.

### Fremdschluessel
- ID: `dbm_fk`
- Definition: ein Attribut, das auf den Primaerschluessel einer anderen Tabelle verweist
- Beispiel: Eine Buchung speichert die Kunden-ID der zugehoerigen Kundin.
- Abgrenzung zu: Primaerschluessel
- Unterschied: Ein Fremdschluessel verweist auf eine andere Tabelle, ein Primaerschluessel identifiziert die eigene Zeile.

### Loeschanomalie
- ID: `dbm_loeschanomalie`
- Definition: ein Problem, bei dem beim Entfernen eines Datensatzes ungewollt weitere wichtige Informationen verloren gehen
- Beispiel: Wird die letzte Buchung eines Standorts geloescht, verschwindet gleichzeitig die einzige gespeicherte Standortinformation.
- Abgrenzung zu: Getrennte Stammdaten
- Unterschied: Loeschanomalien entstehen bei vermischten Daten, getrennte Stammdaten vermeiden das.

### Primaerschluessel
- ID: `dbm_pk`
- Definition: ein Attribut oder Attributverbund, der jeden Datensatz eindeutig identifiziert
- Beispiel: Jede Reservierung besitzt eine eindeutige Reservierungsnummer.
- Abgrenzung zu: Fremdschluessel
- Unterschied: Der Primaerschluessel identifiziert den eigenen Datensatz eindeutig, der Fremdschluessel verweist auf einen anderen.

### Relationales Datenmodell
- ID: `dbm_relational`
- Definition: eine tabellarische Struktur aus Relationen, Schluesseln und Beziehungen zur Abbildung von Daten
- Beispiel: Aus einem Fachmodell werden Tabellen mit Primaer- und Fremdschluesseln gebildet.
- Abgrenzung zu: ERM
- Unterschied: Das relationale Datenmodell ist die tabellarische Umsetzung eines Fachmodells, das ERM die fachliche Beschreibung.

### Zweite Normalform
- ID: `dbm_2nf`
- Definition: eine Tabellenform, in der jedes Nichtschluesselattribut voll vom gesamten Schluessel abhaengt
- Beispiel: In einer Zuordnungstabelle haengt die Beschreibung nicht nur von einem Teil des zusammengesetzten Schluessels ab.
- Abgrenzung zu: Erste Normalform
- Unterschied: Die zweite Normalform beseitigt Teilabhaengigkeiten, die erste Normalform nur Mehrfachwerte.

## IT-Sicherheit und Datenschutz
- Oberthema-Beschreibung: Schutzziele, Bedrohungen, Schutzmaßnahmen, Rechte und datenschutzgerechte Verarbeitung.
- Aktuell erklärte Thema-Objekte: 19

### Archivierung
- ID: `ext_archivierung`
- Definition: eine langfristige, nachvollziehbare Aufbewahrung von Informationen fuer rechtliche oder fachliche Zwecke
- Beispiel: Abgeschlossene Dokumente werden unveraenderbar und fristgerecht aufbewahrt.
- Abgrenzung zu: Backup
- Unterschied: Archivierung dient langfristiger Nachvollziehbarkeit, Backups der Wiederherstellung nach Verlust.

### Authentifizierung
- ID: `sec_authentifizierung`
- Definition: die Pruefung, ob eine Person oder ein System wirklich die behauptete Identitaet besitzt
- Beispiel: Ein Login prueft Benutzername und Passwort oder einen zweiten Faktor.
- Abgrenzung zu: Autorisierung
- Unterschied: Authentifizierung prueft die Identitaet, Autorisierung die danach erlaubten Aktionen.

### Autorisierung
- ID: `sec_autorisierung`
- Definition: die Entscheidung, welche Aktionen eine bereits authentifizierte Identitaet ausfuehren darf
- Beispiel: Ein Reporting-Benutzer darf lesen, aber keine Medikationsdaten aendern.
- Abgrenzung zu: Authentifizierung
- Unterschied: Autorisierung legt erlaubte Aktionen fest, Authentifizierung bestaetigt zuerst die Identitaet.

### Backup
- ID: `ext_backup`
- Definition: eine Sicherung zur Wiederherstellung von Daten nach Verlust oder Beschaedigung
- Beispiel: Produktivdaten werden regelmaessig gesichert, damit nach einem Ausfall wiederhergestellt werden kann.
- Abgrenzung zu: Archivierung
- Unterschied: Backups dienen der Wiederherstellung, Archivierung der langfristigen und oft rechtlich motivierten Aufbewahrung.

### Berechtigungskonzept
- ID: `sys_berechtigungskonzept`
- Definition: die Festlegung, wer auf welche Systeme, Daten und Funktionen in welchem Umfang zugreifen darf
- Beispiel: Rollen und Rechte werden so beschrieben, dass nur passende Zugriffe möglich sind.
- Abgrenzung zu: spontane Freigabe
- Unterschied: Ein Berechtigungskonzept ist systematisch und nachvollziehbar, eine spontane Freigabe nicht.

### Datenminimierung
- ID: `sec_datenminimierung`
- Definition: der Datenschutzgrundsatz, nur die fuer den Zweck notwendigen Daten zu erheben und zu verarbeiten
- Beispiel: Ein Formular fragt nur die wirklich benoetigten Felder fuer eine Terminbuchung ab.
- Abgrenzung zu: Datensammeln auf Vorrat
- Unterschied: Datenminimierung beschraenkt Erhebung auf den Zweck, Datensammeln auf Vorrat ignoriert diese Grenze.

### Datensicherungskonzept
- ID: `sys_datensicherungskonzept`
- Definition: die geplante Regelung, wie Daten gesichert, aufbewahrt und wiederhergestellt werden
- Beispiel: Ein Betrieb legt Sicherungsart, Rhythmus, Aufbewahrung und Prüfungen der Wiederherstellung fest.
- Abgrenzung zu: Einzelbackup
- Unterschied: Ein Datensicherungskonzept beschreibt die Gesamtregelung, ein Einzelbackup nur eine einzelne Sicherung.

### Digitale Signatur
- ID: `sec_signatur`
- Definition: ein Verfahren, das Herkunft und Unveraendertheit einer Nachricht pruefbar macht
- Beispiel: Eine signierte Nachricht kann auf Manipulation und auf den Signaturinhaber zurueckgefuehrt werden.
- Abgrenzung zu: Verschluesselung
- Unterschied: Digitale Signaturen sichern Herkunft und Integritaet, Verschluesselung primar Vertraulichkeit.

### Hashverfahren
- ID: `sec_hash`
- Definition: ein Verfahren, das Daten auf einen festen Fingerabdruck abbildet, ohne den Ursprungswert wiederherzustellen
- Beispiel: Ein Passwort wird nicht im Klartext, sondern nur als Hashwert abgelegt.
- Abgrenzung zu: Verschluesselung
- Unterschied: Ein Hash bildet auf einen Fingerabdruck ab, Verschluesselung ermoeglicht spaeteres Entschluesseln.

### Integritaet
- ID: `sec_integritaet`
- Definition: das Schutzziel, dass Daten vollstaendig und unveraendert korrekt bleiben
- Beispiel: Messwerte duerfen nicht unbemerkt manipuliert oder unvollstaendig gespeichert werden.
- Abgrenzung zu: Vertraulichkeit
- Unterschied: Integritaet schuetzt Korrektheit und Unveraendertheit, Vertraulichkeit den Zugriff.

### Phishing
- ID: `sec_phishing`
- Definition: ein tauschend echter Angriffsversuch, der Nutzende zur Preisgabe sensibler Daten verleiten soll
- Beispiel: Eine Mail fordert zum angeblich dringenden Passwort-Reset ueber einen gefaelschten Link auf.
- Abgrenzung zu: Legitime Nachricht
- Unterschied: Phishing taeuscht Vertrauen vor, legitime Nachrichten sind nachvollziehbar und konsistent.

### Ransomware
- ID: `sec_ransomware`
- Definition: Schadsoftware, die Daten oder Systeme verschluesselt oder blockiert, um Erpressungsdruck zu erzeugen
- Beispiel: Produktivdaten werden unbrauchbar gemacht und erst gegen Zahlung scheinbar wieder freigegeben.
- Abgrenzung zu: Bedienfehler
- Unterschied: Ransomware ist ein gezielter Schadcodeangriff, ein Bedienfehler kein Angriffsverfahren.

### SQL Injection
- ID: `dbo_sql_injection`
- Definition: eine Angriffstechnik, bei der unsicher zusammengesetzte Eingaben SQL-Befehle manipulieren
- Beispiel: Ein Login baut SQL aus ungeprueftem Freitext zusammen und laesst damit ungewollte Abfragen zu.
- Abgrenzung zu: Parametrisierte Abfrage
- Unterschied: SQL Injection nutzt unsicher zusammengesetzte Abfragen aus, parametrisierte Abfragen trennen Struktur und Wert.

### Systemwiederherstellung
- ID: `sys_systemwiederherstellung`
- Definition: die Rückführung eines Systems in einen funktionsfähigen Zustand nach Ausfall oder Schaden
- Beispiel: Nach einem Vorfall werden Daten, Dienste und Konfiguration kontrolliert wiederhergestellt.
- Abgrenzung zu: Neuinstallation ohne Zielbild
- Unterschied: Systemwiederherstellung stellt gezielt den Sollzustand wieder her, eine beliebige Neuinstallation nicht.

### VPN
- ID: `ext_vpn`
- Definition: eine abgesicherte Verbindung, die Datenverkehr logisch durch ein geschuetztes Tunnelverfahren fuehrt
- Beispiel: Ein Mitarbeitender greift von aussen verschluesselt auf interne Dienste zu.
- Abgrenzung zu: Direkte Internetfreigabe
- Unterschied: Ein VPN schuetzt den Transport in einem Tunnel, eine direkte Freigabe stellt Dienste offen ins Netz.

### Verfuegbarkeit
- ID: `sec_verfuegbarkeit`
- Definition: das Schutzziel, dass Informationen und Systeme bei Bedarf nutzbar sind
- Beispiel: Ein Terminservice bleibt auch bei Stoerungen oder Lastspitzen erreichbar.
- Abgrenzung zu: Integritaet
- Unterschied: Verfuegbarkeit betrifft Nutzbarkeit bei Bedarf, Integritaet die Korrektheit der Daten.

### Verschluesselung
- ID: `sec_verschluesselung`
- Definition: eine Umwandlung von Klartext in eine fuer Unbefugte unlesbare Form mithilfe eines Schluessels
- Beispiel: Transportdaten werden ueber TLS so uebertragen, dass Dritte den Inhalt nicht direkt lesen koennen.
- Abgrenzung zu: Hashverfahren
- Unterschied: Verschluesselung ist fuer spaeteres Entschluesseln gedacht, ein Hash nicht.

### Vertraulichkeit
- ID: `sec_vertraulichkeit`
- Definition: das Schutzziel, dass Informationen nur befugten Personen bekannt werden
- Beispiel: Patientendaten sind nur fuer berechtigte Rollen einsehbar.
- Abgrenzung zu: Verfuegbarkeit
- Unterschied: Vertraulichkeit schuetzt vor unbefugter Kenntnisnahme, Verfuegbarkeit vor Nicht-Erreichbarkeit.

### Zertifikat
- ID: `ext_zertifikat`
- Definition: eine digitale Bescheinigung, die einen Schluessel mit einer Identitaet verknuepft
- Beispiel: Ein TLS-Zertifikat bestaetigt, zu welchem Dienst ein oeffentlicher Schluessel gehoert.
- Abgrenzung zu: Passwort
- Unterschied: Ein Zertifikat bindet einen Schluessel an eine Identitaet, ein Passwort authentifiziert anders und ohne diese Bescheinigung.

## Netzwerkdienste und Virtualisierung
- Oberthema-Beschreibung: Bereitstellung von Diensten, Rollout, Konfiguration, Messung und Virtualisierung.
- Aktuell erklärte Thema-Objekte: 1

### Systemauslastung
- ID: `sys_systemauslastung`
- Definition: die Inanspruchnahme von Ressourcen wie CPU, Speicher, Netz oder Speicherplatz durch ein System
- Beispiel: Ein Betrieb beobachtet Lastwerte, um Engpässe und Überlasten früh zu erkennen.
- Abgrenzung zu: Einmalige Systembeschreibung
- Unterschied: Systemauslastung beschreibt laufende Ressourcennutzung, eine einmalige Systembeschreibung nicht.

## Netzwerke und Adressierung
- Oberthema-Beschreibung: Netzwerktechnik, Topologien, Protokolle, Adressierung und Client-Einbindung.
- Aktuell erklärte Thema-Objekte: 2

### Netzwerkprotokoll
- ID: `sys_netzwerkprotokoll`
- Definition: eine festgelegte Regelmenge für Aufbau, Austausch und Interpretation von Daten in Netzwerken
- Beispiel: Beteiligte Systeme kommunizieren nach gemeinsam vereinbarten Regeln über das Netz.
- Abgrenzung zu: Netzwerkkabel
- Unterschied: Ein Netzwerkprotokoll regelt die Kommunikation, ein Netzwerkkabel ist nur das Übertragungsmedium.

### Netzwerkschnittstelle
- ID: `sys_netzwerkschnittstelle`
- Definition: eine technische Anbindung, über die Systeme Daten in einem Netzwerk senden und empfangen
- Beispiel: Eine Komponente stellt eine definierte Verbindung zu anderen Netzwerkteilnehmern her.
- Abgrenzung zu: Anwendungsfenster
- Unterschied: Eine Netzwerkschnittstelle verbindet Systeme technisch, ein Anwendungsfenster nicht.

## Objektorientierung und UML
- Oberthema-Beschreibung: OO-Grundlagen, Verantwortungen, Beziehungen und UML-Diagrammarten.
- Aktuell erklärte Thema-Objekte: 11

### Aktivitaetsdiagramm
- ID: `uml_aktivitaetsdiagramm`
- Definition: ein UML-Diagramm zur Darstellung von Schritten, Entscheidungen und Parallelitaeten in einem Ablauf
- Beispiel: Ein Prozess zur Terminvergabe zeigt Start, Entscheidung, Buchung und Rueckmeldung in fachlicher Reihenfolge.
- Abgrenzung zu: Sequenzdiagramm
- Unterschied: Das Aktivitaetsdiagramm zeigt den fachlichen Ablauf, das Sequenzdiagramm die Nachrichten zwischen Beteiligten.

### Assoziation
- ID: `uml_assoziation`
- Definition: eine Beziehung zwischen Klassen, die ausdrueckt, dass Objekte fachlich miteinander verbunden sind
- Beispiel: Ein Termin ist mit genau einer Patientin und einem Arzt verbunden.
- Abgrenzung zu: Komposition
- Unterschied: Eine Assoziation beschreibt eine fachliche Verbindung, eine Komposition eine starke Teil-Ganzes-Bindung.

### Kardinalitaet
- ID: `uml_kardinalitaet`
- Definition: die Angabe, wie viele Objekte einer Klasse zu wie vielen Objekten einer anderen Klasse in Beziehung stehen koennen
- Beispiel: Eine Buchung kann genau einem Raum zugeordnet sein, ein Raum aber vielen Buchungen ueber die Zeit.
- Abgrenzung zu: Attribut
- Unterschied: Kardinalitaet beschreibt Mengenbeziehungen zwischen Klassen, ein Attribut beschreibt eine Eigenschaft einer Klasse.

### Klassendiagramm
- ID: `uml_klassendiagramm`
- Definition: ein UML-Diagramm zur Darstellung von Klassen, Attributen, Methoden und Beziehungen
- Beispiel: Ein Modell zeigt Klassen wie Patient, Termin und Arzt mit ihren Beziehungen.
- Abgrenzung zu: ERM
- Unterschied: Ein Klassendiagramm beschreibt Softwareklassen, ein ERM fachliche Datenobjekte und Beziehungen.

### Komposition
- ID: `uml_komposition`
- Definition: eine starke Teil-Ganzes-Beziehung, bei der das Teil ohne das Ganze nicht sinnvoll existiert
- Beispiel: Ein Buchungsvorgang enthaelt Positionen, die ohne diesen Vorgang nicht eigenstaendig fortbestehen sollen.
- Abgrenzung zu: Assoziation
- Unterschied: Komposition bindet Lebensdauer und Zugehoerigkeit stark, Assoziation ist lose gekoppelt.

### Objektorientierung
- ID: `uml_objektorientierung`
- Definition: ein Ansatz, bei dem Daten und Verhalten in Objekten mit klaren Verantwortungen zusammengefasst werden
- Beispiel: Eine Klasse TerminService kapselt Regeln zur Vergabe und Pruefung von Terminen.
- Abgrenzung zu: Prozedurales Skript
- Unterschied: Objektorientierung kapselt Zustand und Verhalten in Objekten, ein rein prozeduraler Stil trennt das nicht in derselben Form.

### Polymorphie
- ID: `uml_polymorphie`
- Definition: die Faehigkeit, dass verschiedene Objekte ueber dieselbe Schnittstelle unterschiedliches Verhalten zeigen
- Beispiel: Mehrere Versandarten beantworten dieselbe Methode berechnePreis jeweils mit eigener Logik.
- Abgrenzung zu: Vererbung
- Unterschied: Polymorphie betrifft unterschiedliches Verhalten ueber einen gemeinsamen Vertrag, Vererbung beschreibt nur die Strukturbeziehung.

### Sequenzdiagramm
- ID: `uml_sequenzdiagramm`
- Definition: ein UML-Diagramm, das Nachrichten zwischen Beteiligten in zeitlicher Reihenfolge zeigt
- Beispiel: UI, Service und Datenquelle senden nacheinander Anfragen und Antworten fuer einen Aufruf.
- Abgrenzung zu: Zustandsdiagramm
- Unterschied: Ein Sequenzdiagramm zeigt Kommunikationsreihenfolgen, ein Zustandsdiagramm Zustandswechsel eines Objekts.

### Use-Case-Diagramm
- ID: `uml_use_case`
- Definition: ein UML-Diagramm, das Akteure und fachliche Anwendungsfaelle auf hoher Ebene zeigt
- Beispiel: Kundin, Administrator und Buchungssystem sind mit den Faellen Reservierung anlegen und Storno pruefen verbunden.
- Abgrenzung zu: Aktivitaetsdiagramm
- Unterschied: Das Use-Case-Diagramm zeigt Akteure und Ziele, das Aktivitaetsdiagramm den Detailablauf.

### Vererbung
- ID: `uml_vererbung`
- Definition: ein Mechanismus, bei dem eine spezialisierte Klasse Eigenschaften und Verhalten einer allgemeineren Klasse uebernimmt
- Beispiel: Eine Klasse PremiumKunde uebernimmt Stammdaten und Basisverhalten von Kunde.
- Abgrenzung zu: Komposition
- Unterschied: Vererbung uebernimmt Struktur und Verhalten aus einer Oberklasse, Komposition setzt Objekte aus anderen zusammen.

### Zustandsdiagramm
- ID: `uml_zustandsdiagramm`
- Definition: ein UML-Diagramm, das moegliche Zustaende eines Objekts und deren Uebergaenge beschreibt
- Beispiel: Ein Lieferroboter wechselt zwischen Warten, Fahren, Hindernis und Rueckkehr.
- Abgrenzung zu: Sequenzdiagramm
- Unterschied: Ein Zustandsdiagramm beschreibt Zustandswechsel, ein Sequenzdiagramm die Interaktion zwischen Beteiligten.

## Projektmanagement und Wirtschaftlichkeit
- Oberthema-Beschreibung: Planung, Aufwand, Zielsteuerung, Risiken, Wirtschaftlichkeit und Projektorganisation.
- Aktuell erklärte Thema-Objekte: 14

### Abnahme
- ID: `proj_abnahme`
- Definition: die formale Bestätigung, dass ein Ergebnis die vereinbarten Anforderungen erfüllt
- Beispiel: Nach Prüfung der vereinbarten Kriterien bestätigt der Auftraggeber die Leistung.
- Abgrenzung zu: Zwischenfeedback
- Unterschied: Eine Abnahme ist formal und abschließend, Zwischenfeedback begleitet nur den Verlauf.

### Abschlussbericht
- ID: `proj_abschlussbericht`
- Definition: die strukturierte Zusammenfassung von Verlauf, Ergebnis, Abweichungen und Erkenntnissen eines Projekts
- Beispiel: Zum Projektende werden Ergebnisse, offene Punkte und Lernerfahrungen nachvollziehbar dokumentiert.
- Abgrenzung zu: Statusnotiz
- Unterschied: Ein Abschlussbericht bewertet das gesamte Vorhaben, eine Statusnotiz beschreibt nur einen Zwischenstand.

### Arbeitspaket
- ID: `proj_arbeitspaket`
- Definition: eine klar abgegrenzte Einheit von Aufgaben mit Ergebnis, Verantwortung und Aufwand
- Beispiel: Ein Teil der Projektarbeit wird mit Zuständigkeit, Inhalt und erwartetem Ergebnis einzeln geplant.
- Abgrenzung zu: lose Tätigkeit
- Unterschied: Ein Arbeitspaket ist plan- und kontrollierbar, eine lose Tätigkeit ist nicht sauber abgegrenzt.

### Kick-off-Meeting
- ID: `proj_kickoff_meeting`
- Definition: das formale Starttreffen eines Projekts zur Klärung von Ziel, Rollen, Vorgehen und Organisation
- Beispiel: Zum Projektstart werden Erwartungen, Zuständigkeiten und Kommunikationswege gemeinsam abgestimmt.
- Abgrenzung zu: Statusmeeting
- Unterschied: Ein Kick-off startet ein Projekt, ein Statusmeeting verfolgt einen laufenden Stand.

### Kostenplan
- ID: `proj_kostenplan`
- Definition: die strukturierte Planung der erwarteten Projektkosten
- Beispiel: Aufwand für Personal, Infrastruktur und externe Leistungen wird vorab finanziell bewertet.
- Abgrenzung zu: Ressourcenplan
- Unterschied: Ein Kostenplan bewertet Kosten, ein Ressourcenplan beschreibt die eingesetzten Mittel.

### Lastenheft
- ID: `proj_lastenheft`
- Definition: die Beschreibung der fachlichen Anforderungen aus Sicht des Auftraggebers
- Beispiel: Ein Kunde beschreibt, welche Funktionen, Randbedingungen und Ziele eine Lösung erfüllen muss.
- Abgrenzung zu: Pflichtenheft
- Unterschied: Das Lastenheft beschreibt das Was aus Auftraggebersicht, das Pflichtenheft das Wie aus Umsetzungssicht.

### Pflichtenheft
- ID: `proj_pflichtenheft`
- Definition: die Beschreibung, wie ein Auftragnehmer die Anforderungen fachlich und technisch umsetzen will
- Beispiel: Ein Umsetzungsteam beschreibt Architektur, Abläufe, Schnittstellen und Prüfkriterien für eine Lösung.
- Abgrenzung zu: Lastenheft
- Unterschied: Das Pflichtenheft konkretisiert die Umsetzung, das Lastenheft formuliert die Anforderungen.

### Projektdefinition
- ID: `proj_projektdefinition`
- Definition: die klare Festlegung von Ausgangslage, Ziel, Rahmen und Ergebnis eines Projekts
- Beispiel: Zu Beginn eines Vorhabens wird schriftlich festgehalten, welches Problem gelöst und welches Ergebnis erreicht werden soll.
- Abgrenzung zu: spontane Aufgabenliste
- Unterschied: Eine Projektdefinition grenzt Ziel und Rahmen ab, eine spontane Aufgabenliste enthält nur lose Tätigkeiten.

### Projektstrukturplan
- ID: `proj_projektstrukturplan`
- Definition: die hierarchische Zerlegung eines Projekts in planbare Teilbereiche und Arbeitspakete
- Beispiel: Ein Projekt wird in Phasen, Teilaufgaben und Arbeitspakete gegliedert, damit Zuständigkeiten und Umfang sichtbar werden.
- Abgrenzung zu: Zeitplan
- Unterschied: Der Projektstrukturplan zerlegt Inhalte, der Zeitplan ordnet Termine und Reihenfolge.

### Qualitätsplan
- ID: `proj_qualitaetsplan`
- Definition: die Festlegung von Qualitätszielen, Prüfungen, Nachweisen und Verantwortlichkeiten im Projekt
- Beispiel: Ein Projekt legt fest, wann getestet, dokumentiert und anhand welcher Kriterien geprüft wird.
- Abgrenzung zu: Testprotokoll
- Unterschied: Ein Qualitätsplan legt Regeln und Prüfpunkte fest, ein Testprotokoll dokumentiert einzelne Prüfergebnisse.

### Ressourcenplan
- ID: `proj_ressourcenplan`
- Definition: die Planung von Personal, Zeit, Material und weiteren benötigten Mitteln
- Beispiel: Für ein Vorhaben wird festgelegt, welche Personen, Werkzeuge und Zeiten benötigt werden.
- Abgrenzung zu: Kostenplan
- Unterschied: Ein Ressourcenplan beschreibt benötigte Mittel, ein Kostenplan bewertet sie finanziell.

### Risikoanalyse
- ID: `ext_risikoanalyse`
- Definition: eine strukturierte Bewertung moeglicher Bedrohungen, Eintrittswahrscheinlichkeiten und Auswirkungen
- Beispiel: Fuer ein Portal werden Angriffe, Ausfaelle und ihre fachlichen Folgen systematisch bewertet.
- Abgrenzung zu: Bauchgefuehl
- Unterschied: Eine Risikoanalyse bewertet Risiken strukturiert, Bauchgefuehl nicht.

### SMART-Prinzip
- ID: `proj_smart_prinzip`
- Definition: ein Zielschema, nach dem Ziele spezifisch, messbar, akzeptiert, realistisch und terminiert formuliert werden
- Beispiel: Ein Projektziel wird so beschrieben, dass Erfolg, Frist und Umfang nachvollziehbar überprüft werden können.
- Abgrenzung zu: vage Zielbeschreibung
- Unterschied: Das SMART-Prinzip macht Ziele überprüfbar, eine vage Zielbeschreibung bleibt auslegbar.

### Zeitplan
- ID: `proj_zeitplan`
- Definition: die zeitliche Planung von Vorgängen, Meilensteinen und Terminen
- Beispiel: Für Analyse, Umsetzung und Test werden konkrete Zeitfenster und Abhängigkeiten festgelegt.
- Abgrenzung zu: Projektstrukturplan
- Unterschied: Ein Zeitplan legt Reihenfolge und Termine fest, ein Projektstrukturplan gliedert die Inhalte.

## Prozessanalyse, Monitoring und Datenqualität
- Oberthema-Beschreibung: Prozessdarstellung, Kennzahlen, Monitoringsysteme, Datenqualität und auswertungsbezogene Optimierung.
- Aktuell erklärte Thema-Objekte: 6

### Datenklassifizierung
- ID: `dpa_datenklassifizierung`
- Definition: die Einordnung von Daten nach Schutzbedarf, Sensibilität oder Verwendungsart
- Beispiel: Daten werden etwa nach intern, vertraulich oder besonders schutzwürdig unterschieden.
- Abgrenzung zu: beliebige Dateibenennung
- Unterschied: Datenklassifizierung bewertet Schutz- und Verwendungsbedarf, eine Dateibenennung nicht.

### Datenqualitaet
- ID: `ext_datenqualitaet`
- Definition: das Ausmass, in dem Daten korrekt, konsistent, vollstaendig und zweckgeeignet sind
- Beispiel: Importdaten verwenden einheitliche Schreibweisen, gueltige Formate und nachvollziehbare Werte.
- Abgrenzung zu: Datenmenge
- Unterschied: Datenqualitaet beschreibt Brauchbarkeit und Korrektheit, Datenmenge nur das Volumen.

### Datenquelle
- ID: `dpa_datenquelle`
- Definition: der Ursprung von Daten, aus dem Informationen übernommen oder ausgewertet werden
- Beispiel: Daten stammen etwa aus Office-Dateien, Webquellen, Cloud-Diensten oder Datenbanken.
- Abgrenzung zu: Datenziel
- Unterschied: Eine Datenquelle liefert Daten, ein Datenziel nimmt sie auf.

### Kennzahl
- ID: `dpa_kennzahl`
- Definition: eine verdichtete Messgröße zur Bewertung von Leistung, Qualität oder Zielerreichung
- Beispiel: Bearbeitungszeiten, Fehlerraten oder Auslastungen werden als Kennzahlen ausgewertet.
- Abgrenzung zu: Einzelbeobachtung
- Unterschied: Eine Kennzahl verdichtet Messwerte systematisch, eine Einzelbeobachtung nicht.

### Monitoringsystem
- ID: `dpa_monitoringsystem`
- Definition: ein System zur laufenden Beobachtung von Zuständen, Kennzahlen und Abweichungen
- Beispiel: Messwerte und Warnschwellen werden fortlaufend erfasst und ausgewertet.
- Abgrenzung zu: Einmalige Auswertung
- Unterschied: Ein Monitoringsystem beobachtet laufend, eine einmalige Auswertung nur punktuell.

### Prozessanalyse
- ID: `dpa_prozessanalyse`
- Definition: die systematische Untersuchung eines Arbeits- oder Geschäftsprozesses auf Ablauf, Beteiligte, Schwachstellen und Ziele
- Beispiel: Ein Prozess wird aufgenommen, beschrieben und auf Engpässe oder Medienbrüche geprüft.
- Abgrenzung zu: Einzellösung ohne Prozesssicht
- Unterschied: Eine Prozessanalyse betrachtet den Gesamtablauf, eine Einzellösung nur einen Ausschnitt.

## Präsentation, Dokumentation und Reflexion
- Oberthema-Beschreibung: Adressatengerechte Darstellung, Nachweise, Feedback und Verbesserungsarbeit.
- Aktuell erklärte Thema-Objekte: 1

### Technische Dokumentation
- ID: `doc_technische_dokumentation`
- Definition: eine strukturierte Beschreibung von Aufbau, Betrieb, Nutzung oder Pflege eines technischen Systems
- Beispiel: Ein System wird so dokumentiert, dass Betrieb, Support und Weiterentwicklung nachvollziehbar möglich sind.
- Abgrenzung zu: mündliche Einzelabsprache
- Unterschied: Technische Dokumentation ist dauerhaft und nachvollziehbar, eine mündliche Einzelabsprache nicht.

## SQL und relationale Datenpraxis
- Oberthema-Beschreibung: Abfragen, Filter, Joins, Aggregationen und datenbanknahe Praxisaufgaben.
- Aktuell erklärte Thema-Objekte: 10

### CREATE INDEX
- ID: `sql_create_index`
- Definition: eine Anweisung zum Anlegen einer Suchstruktur fuer schnellere Zugriffe auf bestimmte Spalten
- Beispiel: Hauefig gefilterte Zeit- oder Schluesselspalten werden fuer Berichte besser suchbar gemacht.
- Abgrenzung zu: CREATE TABLE
- Unterschied: CREATE INDEX verbessert Zugriffe auf bestehende Daten, CREATE TABLE erzeugt die Tabellenstruktur.

### DELETE
- ID: `sql_delete`
- Definition: eine SQL-Anweisung zum Entfernen vorhandener Datensaetze
- Beispiel: Alte Archivdaten oder fachlich ungueltige Zeilen werden gezielt geloescht.
- Abgrenzung zu: SELECT
- Unterschied: DELETE entfernt Zeilen, SELECT liest sie nur.

### GROUP BY
- ID: `sql_group_by`
- Definition: eine SQL-Klausel zum Gruppieren von Zeilen fuer Aggregationen
- Beispiel: Umsaetze werden boersenweise oder standortweise zusammengefasst.
- Abgrenzung zu: ORDER BY
- Unterschied: GROUP BY bildet Gruppen fuer Kennzahlen, ORDER BY sortiert nur das Ergebnis.

### HAVING
- ID: `sql_having`
- Definition: eine Klausel zum Filtern bereits gruppierter Ergebnisse
- Beispiel: Es werden nur Gruppen mit mehr als drei offenen Faellen angezeigt.
- Abgrenzung zu: WHERE
- Unterschied: HAVING filtert Gruppen nach der Aggregation, WHERE filtert Rohzeilen davor.

### INNER JOIN
- ID: `sql_inner_join`
- Definition: eine Verknuepfung, die nur Datensaetze mit passenden Treffern auf beiden Seiten liefert
- Beispiel: Nur Mitarbeitende mit vorhandenen Urlaubseintraegen erscheinen im Ergebnis.
- Abgrenzung zu: LEFT JOIN
- Unterschied: INNER JOIN liefert nur gemeinsame Treffer, LEFT JOIN behaelt auch linke Zeilen ohne Match.

### INSERT
- ID: `sql_insert`
- Definition: eine SQL-Anweisung zum Einfuegen neuer Datensaetze
- Beispiel: Ein neuer Wirkstoff oder ein neuer Raum wird als Zeile angelegt.
- Abgrenzung zu: UPDATE
- Unterschied: INSERT legt neue Zeilen an, UPDATE aendert vorhandene.

### LEFT JOIN
- ID: `sql_left_join`
- Definition: eine Verknuepfung, bei der alle Zeilen der linken Tabelle erhalten bleiben, auch ohne Treffer rechts
- Beispiel: Alle Mitarbeitenden werden gelistet, Urlaubsdaten fehlen bei manchen als NULL.
- Abgrenzung zu: INNER JOIN
- Unterschied: LEFT JOIN behaelt linke Zeilen ohne Treffer, INNER JOIN nicht.

### SELECT
- ID: `sql_select`
- Definition: die SQL-Anweisung zum Lesen und Projektionieren von Daten
- Beispiel: Eine Abfrage listet offene Reservierungen mit Datum und Tischnummer.
- Abgrenzung zu: UPDATE
- Unterschied: SELECT liest Daten, UPDATE veraendert bestehende Daten.

### UNION ALL
- ID: `sql_union_all`
- Definition: eine Verknuepfung, die Ergebnismengen unter Erhalt aller Zeilen zusammenfuehrt
- Beispiel: Aktuelle und archivierte Daten werden in einem Bericht gemeinsam ausgegeben, auch wenn Werte doppelt vorkommen.
- Abgrenzung zu: UNION
- Unterschied: UNION ALL behaelt alle Zeilen inklusive Duplikaten, UNION entfernt doppelte Zeilen.

### UPDATE
- ID: `sql_update`
- Definition: eine SQL-Anweisung zum Aendern bestehender Datensaetze
- Beispiel: Ein Status oder eine Bezeichnung wird fuer vorhandene Zeilen angepasst.
- Abgrenzung zu: INSERT
- Unterschied: UPDATE aendert vorhandene Zeilen, INSERT fuegt neue hinzu.

## Service- und Supportprozesse
- Oberthema-Beschreibung: Serviceanfragen, Ticketarbeit, Monitoring, Kommunikation und Deeskalation.
- Aktuell erklärte Thema-Objekte: 2

### Störungsmeldung
- ID: `sys_stoerungsmeldung`
- Definition: die strukturierte Meldung eines Problems oder Ausfalls an Support oder Betrieb
- Beispiel: Ein Vorfall wird mit Symptomen, Zeitpunkt und betroffenen Systemen nachvollziehbar aufgenommen.
- Abgrenzung zu: vage Beschwerde
- Unterschied: Eine Störungsmeldung enthält verwertbare technische Informationen, eine vage Beschwerde nicht.

### Systemübergabe
- ID: `sys_systemuebergabe`
- Definition: die abgestimmte Übergabe eines Systems an Betrieb, Support oder Kunden nach Umsetzung und Prüfung
- Beispiel: Vor der Nutzung werden Zuständigkeiten, Dokumentation und Betriebsinformationen übergeben.
- Abgrenzung zu: bloßer Versand eines Links
- Unterschied: Eine Systemübergabe umfasst abgestimmte Informationen und Verantwortung, ein bloßer Versand eines Links nicht.

## Softwarearchitektur und Entwurfsmuster
- Oberthema-Beschreibung: Architekturzuschnitte, Muster, Komponenten und systemischer Entwurf.
- Aktuell erklärte Thema-Objekte: 7

### Entwicklungsumgebung
- ID: `arch_entwicklungsumgebung`
- Definition: die Arbeitsumgebung aus Werkzeugen, Einstellungen und Hilfsmitteln zur Softwareentwicklung
- Beispiel: Ein Team nutzt IDE, Build-Werkzeuge, Testwerkzeuge und Konfigurationen für die Umsetzung.
- Abgrenzung zu: Produktivsystem
- Unterschied: Eine Entwicklungsumgebung dient der Erstellung und Prüfung, ein Produktivsystem dem laufenden Betrieb.

### Factory Method
- ID: `ext_factory_method`
- Definition: ein Pattern, bei dem die Erzeugung passender Objekte ueber eine Fabrikmethode gekapselt wird
- Beispiel: Je nach Dokumenttyp liefert die Fabrik die passende konkrete Exportklasse.
- Abgrenzung zu: Direkte Instanziierung
- Unterschied: Factory Method kapselt die Objekterzeugung, direkte Instanziierung verteilt sie im Code.

### Framework
- ID: `arch_framework`
- Definition: ein vorgegebener Anwendungsrahmen mit Strukturen, Regeln und Hilfsfunktionen für eine bestimmte Art von Software
- Beispiel: Ein Projekt nutzt einen bestehenden Rahmen, um Oberflächen, Anfragen oder Komponenten schneller umzusetzen.
- Abgrenzung zu: Bibliothek
- Unterschied: Ein Framework gibt stärker Struktur und Ablauf vor, eine Bibliothek liefert eher gezielte Bausteine.

### MVC
- ID: `web_mvc`
- Definition: ein Muster, das Modell, Darstellung und Steuerung voneinander trennt
- Beispiel: Controller nimmt Anfragen an, Modell haelt Fachdaten und View stellt Ergebnisse dar.
- Abgrenzung zu: Schichtenmodell
- Unterschied: MVC trennt speziell Modell, View und Controller, ein allgemeines Schichtenmodell ist breiter gefasst.

### Microservices
- ID: `web_microservices`
- Definition: ein Architekturansatz, bei dem fachliche Teilbereiche als eigenstaendige kleine Dienste organisiert werden
- Beispiel: Ein Buchungsdienst, ein Benachrichtigungsdienst und ein Reportingdienst werden getrennt betrieben.
- Abgrenzung zu: Monolith
- Unterschied: Microservices verteilen Verantwortung auf mehrere kleine Dienste, ein Monolith buendelt sie in einer Anwendung.

### Monolith
- ID: `web_monolith`
- Definition: eine Anwendung, in der viele Fachbereiche gemeinsam als ein zusammenhaengendes Deployable betrieben werden
- Beispiel: UI, Fachlogik und Datenzugriffe werden in einer gemeinsamen Anwendung ausgeliefert.
- Abgrenzung zu: Microservices
- Unterschied: Ein Monolith buendelt Bereiche in einer Anwendung, Microservices trennen sie in mehrere Dienste.

### Observer
- ID: `ext_observer`
- Definition: ein Design Pattern, bei dem Beobachter ueber Aenderungen eines Subjekts informiert werden
- Beispiel: Mehrere Anzeigen reagieren automatisch, wenn sich ein Messwert oder Status aendert.
- Abgrenzung zu: Direkter Aufrufverbund
- Unterschied: Observer entkoppelt Benachrichtigung ueber Beobachter, direkter Aufruf bindet Komponenten enger zusammen.

## Testen und Qualitätssicherung
- Oberthema-Beschreibung: Testarten, Testdesign, Auswertung, Qualitätsprüfung und Verbesserungszyklen.
- Aktuell erklärte Thema-Objekte: 14

### Aequivalenzklasse
- ID: `tst_aequivalenzklasse`
- Definition: eine Gruppe von Eingaben, die sich hinsichtlich des erwarteten Verhaltens gleich behandeln lassen
- Beispiel: Mehrere ungueltige Werte werden als eine Klasse betrachtet, wenn sie denselben Fehlerpfad ausloesen.
- Abgrenzung zu: Einzelwerttest
- Unterschied: Aequivalenzklassen fassen gleichartige Eingaben zusammen, Einzelwerttests betrachten konkrete Einzelwerte.

### Black-Box-Test
- ID: `tst_blackbox`
- Definition: ein Testansatz, der Verhalten anhand von Ein- und Ausgaben prueft, ohne den inneren Code zu betrachten
- Beispiel: Eine Funktion wird mit gueltigen und ungueltigen Eingaben auf ihr sichtbares Ergebnis geprueft.
- Abgrenzung zu: White-Box-Test
- Unterschied: Black-Box-Tests leiten Faelle aus Verhalten ab, White-Box-Tests aus dem internen Code.

### Code Coverage
- ID: `tst_coverage`
- Definition: ein Mass dafuer, wie viel vom Code durch Tests ausgefuehrt wurde
- Beispiel: Ein Bericht zeigt, dass bestimmte Zweige oder Zeilen nie von Tests erreicht wurden.
- Abgrenzung zu: Testqualitaet
- Unterschied: Coverage misst ausgefuehrte Codeanteile, Testqualitaet die Aussagekraft der Tests insgesamt.

### Code Review
- ID: `tst_code_review`
- Definition: eine strukturierte fachliche und technische Pruefung von Code durch andere Personen
- Beispiel: Ein Pull Request wird auf Lesbarkeit, Risiken, Tests und Seiteneffekte geprueft.
- Abgrenzung zu: Performance-Test
- Unterschied: Ein Code Review bewertet Aenderungen inhaltlich, ein Performance-Test misst Laufzeitverhalten.

### Debugging
- ID: `tst_debugging`
- Definition: die systematische Fehlersuche und Ablaufverfolgung in einer laufenden oder nachgestellten Situation
- Beispiel: Zwischenwerte und Sprungbedingungen werden im Debugger schrittweise beobachtet.
- Abgrenzung zu: Raten
- Unterschied: Debugging untersucht den Ablauf systematisch, Raten liefert keine belastbare Analyse.

### PDCA
- ID: `tst_pdca`
- Definition: ein Verbesserungszyklus aus Plan, Do, Check und Act
- Beispiel: Eine Massnahme wird geplant, umgesetzt, anhand von Kennzahlen geprueft und danach angepasst.
- Abgrenzung zu: Ad-hoc-Feuerwehr
- Unterschied: PDCA ist ein geschlossener Verbesserungszyklus, Ad-hoc-Feuerwehr reagiert ohne systematische Rueckkopplung.

### Regressionstest
- ID: `tst_regression`
- Definition: ein Test, der absichert, dass bereits funktionierende Teile nach einer Aenderung weiterhin korrekt laufen
- Beispiel: Nach einer Korrektur an der Sortierlogik werden alte Faelle erneut automatisiert pruefbar ausgefuehrt.
- Abgrenzung zu: Ersttest
- Unterschied: Regressionstests sichern bestehendes Verhalten nach Aenderungen ab, Ersttests pruefen neue Faelle erstmalig.

### Soll-Ist-Vergleich
- ID: `tst_soll_ist`
- Definition: eine Gegenueberstellung von Zielzustand und tatsaechlichem Ergebnis
- Beispiel: Testprotokolle zeigen erwartete und tatsaechliche Ausgaben nebeneinander.
- Abgrenzung zu: Zieldefinition
- Unterschied: Der Soll-Ist-Vergleich bewertet Abweichungen, die Zieldefinition beschreibt nur den angestrebten Zustand.

### Testauswertung
- ID: `test_testauswertung`
- Definition: die fachliche Bewertung von Testergebnissen, Abweichungen und daraus abgeleiteten Maßnahmen
- Beispiel: Testdaten werden so bewertet, dass Fehler, Risiken und nächste Schritte sichtbar werden.
- Abgrenzung zu: Rohdatenliste
- Unterschied: Eine Testauswertung bewertet Ergebnisse, eine Rohdatenliste sammelt sie nur.

### Testfall
- ID: `test_testfall`
- Definition: eine konkrete Prüfsituation mit Eingaben, Schritten und erwartetem Ergebnis
- Beispiel: Für eine definierte Eingabe wird festgelegt, welches Verhalten das System zeigen muss.
- Abgrenzung zu: Teststrategie
- Unterschied: Ein Testfall beschreibt eine einzelne Prüfung, eine Teststrategie die übergeordnete Ausrichtung.

### Testplan
- ID: `test_testplan`
- Definition: die geplante Festlegung von Testzielen, Testumfang, Verfahren, Zuständigkeiten und Terminen
- Beispiel: Vor Beginn der Tests wird festgelegt, was geprüft wird, wie geprüft wird und wer verantwortlich ist.
- Abgrenzung zu: Einzelner Testfall
- Unterschied: Ein Testplan beschreibt den Gesamtansatz, ein Testfall nur eine konkrete Prüfung.

### Testprotokoll
- ID: `test_testprotokoll`
- Definition: die nachvollziehbare Dokumentation eines Testdurchlaufs und seiner Ergebnisse
- Beispiel: Nach einem Test werden Durchführung, Beobachtung und Ergebnis sauber festgehalten.
- Abgrenzung zu: Testplan
- Unterschied: Ein Testprotokoll dokumentiert die Durchführung, ein Testplan die vorherige Planung.

### Unit-Test
- ID: `tst_unit`
- Definition: ein automatisierter Test fuer eine kleine, abgegrenzte Softwareeinheit
- Beispiel: Eine Methode zur Passwortpruefung wird mit mehreren Eingaben direkt getestet.
- Abgrenzung zu: Systemtest
- Unterschied: Ein Unit-Test prueft eine kleine Einheit isoliert, ein Systemtest ein groesseres Gesamtsystem.

### White-Box-Test
- ID: `tst_whitebox`
- Definition: ein Testansatz, der Testfaelle aus Verzweigungen, Pfaden und internen Strukturen des Codes ableitet
- Beispiel: Ein Test prueft gezielt den Fall, in dem im Login-Code beide Bedingungen hintereinander erfuellt sind.
- Abgrenzung zu: Black-Box-Test
- Unterschied: White-Box-Tests orientieren sich am internen Aufbau, Black-Box-Tests am sichtbaren Verhalten.

## Versionsverwaltung und Lieferketten
- Oberthema-Beschreibung: Historie, Zusammenarbeit, Integration, Auslieferung und wiederholbare Build-Ketten.
- Aktuell erklärte Thema-Objekte: 2

### CI/CD
- ID: `ext_ci_cd`
- Definition: ein Ansatz, bei dem Integration, Pruefung und Auslieferung staerker automatisiert und haeufig wiederholt werden
- Beispiel: Nach jedem Merge laufen Tests und ein Releaseprozess automatisiert an.
- Abgrenzung zu: Manuelles Deployment
- Unterschied: CI/CD automatisiert Integration und Auslieferung staerker, manuelles Deployment verlaesst sich auf Handarbeit.

### Versionsverwaltung
- ID: `ext_versionsverwaltung`
- Definition: ein System zur nachvollziehbaren Verwaltung von Aenderungen an Dateien und Code
- Beispiel: Aenderungen werden als Commits dokumentiert und sind spaeter nachvollziehbar.
- Abgrenzung zu: Dateikopie
- Unterschied: Versionsverwaltung bietet Historie und Zusammenarbeit, Dateikopien nicht in derselben Form.

## Web, APIs und Schnittstellen
- Oberthema-Beschreibung: HTTP, REST, Datenformate, Zustandslosigkeit und Integrationsschnittstellen.
- Aktuell erklärte Thema-Objekte: 7

### HTTP-Methode
- ID: `web_http_method`
- Definition: die Angabe, welche Art von Aktion ein Request fachlich ausfuehren soll
- Beispiel: GET liest, POST legt an, DELETE entfernt und PUT ersetzt fachlich passend Daten.
- Abgrenzung zu: HTTP-Statuscode
- Unterschied: Die HTTP-Methode beschreibt die beabsichtigte Aktion, der Statuscode das Ergebnis.

### HTTP-Statuscode
- ID: `web_http_status`
- Definition: eine Rueckmeldung ueber das Ergebnis eines HTTP-Aufrufs
- Beispiel: 200 signalisiert Erfolg, 404 einen nicht gefundenen Pfad und 500 einen Serverfehler.
- Abgrenzung zu: HTTP-Methode
- Unterschied: Ein Statuscode beschreibt das Ergebnis, die Methode die Aktion des Requests.

### Idempotenz
- ID: `web_idempotenz`
- Definition: die Eigenschaft, dass mehrfach identische Ausfuehrung denselben fachlichen Endzustand hinterlaesst
- Beispiel: Mehrere gleiche PUT-Requests schreiben denselben Zielzustand, ohne immer neue Folgen zu erzeugen.
- Abgrenzung zu: Nicht-idempotente Aktion
- Unterschied: Idempotenz vermeidet zusaetzliche Seiteneffekte bei Wiederholung, nicht-idempotente Aktionen erzeugen neue Folgen.

### JSON
- ID: `web_json`
- Definition: ein leichtgewichtiges, textbasiertes Format fuer strukturierte Daten
- Beispiel: Ein API-Endpunkt liefert eine Liste von Objekten mit Schluesseln und Werten im JSON-Format.
- Abgrenzung zu: XML
- Unterschied: JSON ist kompakt und objektorientiert aufgebaut, XML arbeitet mit Tags und Dokumentstruktur.

### REST
- ID: `web_rest`
- Definition: ein Architekturstil fuer Schnittstellen, der Ressourcen, standardisierte HTTP-Methoden und lose Kopplung betont
- Beispiel: Ein Dienst stellt Ressourcen ueber URLs bereit und nutzt GET, POST oder DELETE passend zum Zweck.
- Abgrenzung zu: RPC
- Unterschied: REST arbeitet ressourcenorientiert ueber HTTP-Semantik, RPC eher ueber benannte Aktionen.

### XML
- ID: `web_xml`
- Definition: ein textbasiertes Auszeichnungsformat mit Tags fuer strukturierte Dokumente und Daten
- Beispiel: Ein Datenaustauschformat beschreibt Inhalte mit oeffnenden und schliessenden Elementen.
- Abgrenzung zu: JSON
- Unterschied: XML arbeitet mit Tags und Dokumentstruktur, JSON mit Schluessel-Wert-Paaren.

### Zustandslosigkeit
- ID: `web_stateless`
- Definition: das Prinzip, dass ein Request alle fuer seine Bearbeitung noetigen Informationen mitbringt
- Beispiel: Ein API-Aufruf kann ohne versteckten Serversitzungszustand verarbeitet werden.
- Abgrenzung zu: Session-Zustand
- Unterschied: Zustandslosigkeit minimiert versteckte Sitzungsabhaengigkeiten, Session-Zustand speichert Informationen serverseitig zwischen Aufrufen.
