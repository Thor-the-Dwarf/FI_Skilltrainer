#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


def concept(
    concept_id: str,
    cluster: str,
    term: str,
    definition: str,
    example: str,
    non_example: str,
    best_practice: str,
    risk: str,
    contrast_term: str,
    contrast_diff: str,
    false_claim: str,
) -> dict[str, str]:
    return {
        "id": concept_id,
        "cluster": cluster,
        "term": term,
        "definition": definition,
        "example": example,
        "non_example": non_example,
        "best_practice": best_practice,
        "risk": risk,
        "contrast_term": contrast_term,
        "contrast_diff": contrast_diff,
        "false_claim": false_claim,
    }


ROOT = Path(__file__).resolve().parents[2]
QUIZ_DIR = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-2-FIAE-Quiz"
QUIZ_SUBDIR = QUIZ_DIR / "quiz_ap2_fiae_gesamtpool"
QUIZ_FILE = QUIZ_SUBDIR / "quiz01_V01_ap2_fiae_gesamtpool.json"
MANIFEST_FILE = QUIZ_DIR / "quiz-manifest.json"
MIRROR_QUIZ_DIR = ROOT / "QuizMaster" / "Kurse" / "Pruefungsvorbereitung-2-FIAE-Quiz"
MIRROR_QUIZ_SUBDIR = MIRROR_QUIZ_DIR / "quiz_ap2_fiae_gesamtpool"
MIRROR_QUIZ_FILE = MIRROR_QUIZ_SUBDIR / "quiz01_V01_ap2_fiae_gesamtpool.json"
MIRROR_MANIFEST_FILE = MIRROR_QUIZ_DIR / "quiz-manifest.json"
BONUS_QUESTION_COUNT = 100

ROOT_TOPICS = [
    "Algorithmen und Pseudocode",
    "UML und OOP",
    "Datenmodellierung und Normalisierung",
    "SQL und Datenbankpraxis",
    "Testen und Qualitaetssicherung",
    "Sicherheit und Datenschutz",
    "Web, APIs und Architektur",
    "Anforderungen und UX",
    "Erweiterte Praxis",
]

BADGE_POOL_BY_KIND = {
    "aussage_bewerten": ["Aussagecheck", "Prueffrage", "Einordnung", "Stimmt das?", "Bewertung"],
    "eine_richtige_antwort_waehlen": ["Treffer", "Auswahl", "Passende Antwort", "Einordnung", "Fachwahl"],
    "mehrere_richtige_antworten_waehlen": ["Mehrfachtreffer", "Mehrfachauswahl", "Treffende Aussagen", "Mehr als eine", "Richtige Punkte"],
    "beste_option_im_mini_szenario": ["Naechster Schritt", "Praxisfall", "Vorgehen", "Mini-Szenario", "Entscheidung"],
    "begriff_zu_definition": ["Begriff", "Fachwort", "Benennung", "Zuordnung", "Wortwahl"],
    "definition_zu_begriff": ["Bedeutung", "Erklaerung", "Definition", "Einordnung", "Begriffsbild"],
    "beispiel_erkennen": ["Praxisfall", "Mini-Fall", "Beispiel", "Treffer", "Zuordnung"],
    "gegenbeispiel_erkennen": ["Gegenbeispiel", "Fehlfall", "Ausreisser", "Nicht passend", "Abgrenzung"],
    "vergleich_treffen": ["Abgrenzung", "Vergleich", "Unterschied", "Trennlinie", "Gegenueberstellung"],
    "fehler_finden": ["Irrtum", "Denkfalle", "Fehlerbild", "Falsche Spur", "Missverstaendnis"],
    "ursache_folge_erkennen": ["Folge", "Auswirkung", "Risiko", "Konsequenz", "Nachwirkung"],
    "was_fehlt": ["Luecke", "Ergaenzung", "Fehlender Schritt", "Vervollstaendigen", "Was fehlt?"],
    "passende_massnahme_auswaehlen": ["Massnahme", "Vorgehen", "Praxisentscheidung", "Handlung", "Naechster Schritt"],
    "ziel_mittel_zuordnung": ["Ziel und Mittel", "Geeigneter Schritt", "Umsetzung", "Hilfreiche Option", "Praxisbezug"],
}

CLUSTER_SCENARIOS = {
    "Algorithmen": [
        "einer Auswertung von Monatswerten",
        "einer Fahrzeitberechnung im Linienbetrieb",
        "einer Tischauswahl im Reservierungssystem",
        "einer Terminmatrix im Praxisportal",
        "einer Besucherauswertung im Parkbetrieb",
    ],
    "UML und OOP": [
        "einem Investor-Portal",
        "einem Praxisportal",
        "einer Fahrzeit-API",
        "einer Buchungsplattform",
        "einem Meldesystem",
    ],
    "Datenmodellierung": [
        "einem Buchungs- und Ressourcenmodell",
        "Messdaten aus mehreren Quellen",
        "einer Medikationsverwaltung",
        "einem Vertriebs- und Berichtsschema",
        "einer Kontroll- und Ereignisdatenbank",
    ],
    "SQL": [
        "einem Bericht fuer Fehlzeiten",
        "einer Auswertung fuer Haltestellenzeiten",
        "einer Liste fuer aktive Reservierungen",
        "einer Jahresauswertung fuer Verbrauchsdaten",
        "einem Managementbericht fuer Kursdaten",
    ],
    "Datenbankobjekte": [
        "einer produktiven Datenbank",
        "einem Klinikschema",
        "einem Auswertungssystem",
        "einer Archivierungspipeline",
        "einer API mit relationalem Backend",
    ],
    "Testen und QS": [
        "einem Pseudocodeblock aus einer AP2-Aufgabe",
        "einer Login-Pruefroutine",
        "einer Besucherzaehlung",
        "einem API-Endpunkt",
        "einem Sortiermodul",
    ],
    "Sicherheit und Datenschutz": [
        "einem Investor-Portal",
        "einem Praxisportal",
        "einem Kunden-Login",
        "einem Datenexport",
        "einer mobilen Anwendung",
    ],
    "Web und Architektur": [
        "einer REST-Schnittstelle",
        "einem Webportal",
        "einer mobilen Webanwendung",
        "einer servicebasierten Plattform",
        "einem Berichtsdienst",
    ],
    "Anforderungen und UX": [
        "einem Kundenworkshop",
        "einer Projektvorbereitung",
        "einem UI-Entwurf",
        "einer Abnahmebesprechung",
        "einer Produktiteration",
    ],
    "Erweiterte Praxis": [
        "einem Teamworkflow",
        "einem Backup- und Archivkonzept",
        "einer Pattern-Entscheidung",
        "einer Datenbereinigung vor dem Import",
        "einer Sicherheitsbewertung",
    ],
}

CONCEPTS = [
    concept("alg_algorithmus", "Algorithmen", "Algorithmus", "eine endliche und eindeutige Folge von Schritten zur Loesung eines Problems", "Eine Routine liest Werte, vergleicht sie und gibt das Ergebnisobjekt zurueck.", "Eine lose Ideensammlung ohne feste Reihenfolge oder Abbruch.", "Eingaben, Verarbeitung, Bedingungen und Rueckgabe klar und nachvollziehbar festlegen.", "Sonderfaelle oder Abbruchbedingungen werden uebersehen.", "Heuristik", "Ein Algorithmus beschreibt eine nachvollziehbare Schrittfolge, eine Heuristik ist nur eine zweckmaessige Naeherung.", "Ein Algorithmus ist erst dann ein Algorithmus, wenn er bereits in einer Programmiersprache kompiliert werden kann."),
    concept("alg_pseudocode", "Algorithmen", "Pseudocode", "eine sprachnahe, aber nicht an eine konkrete Syntax gebundene Beschreibung eines Algorithmus", "Eine PV2-Loesung beschreibt Schleifen, Vergleiche und Rueckgaben, ohne auf Java-Schreibweise festgelegt zu sein.", "Ein Quelltextblock mit konkreten Klassen, Typen und Bibliotheksaufrufen.", "Zuerst die Fachlogik sprachneutral beschreiben und erst danach in Code uebersetzen.", "Fachlogik und Sprachsyntax werden vermischt und Denkfehler bleiben unentdeckt.", "Quelltext", "Pseudocode beschreibt die Logik sprachneutral, Quelltext ist bereits konkrete Implementierung.", "Pseudocode muss in jeder Zeile bereits der exakten Syntax der Zielsprache folgen."),
    concept("alg_schreibtischtest", "Algorithmen", "Schreibtischtest", "eine manuelle Schritt-fuer-Schritt-Pruefung eines Ablaufs mit konkreten Eingabedaten", "Ein Team verfolgt fuer Beispielwerte jede Schleifenrunde und notiert Zwischenstaende von Variablen.", "Ein automatischer Testlauf in der CI-Pipeline.", "Mit reprasentativen Testdaten jeden Entscheidungspfad und jede Schleifeniteration nachvollziehen.", "Fehler in Zweigen oder Zwischenwerten bleiben bis spaet in der Umsetzung unsichtbar.", "Unit-Test", "Beim Schreibtischtest wird der Ablauf manuell verfolgt, ein Unit-Test wird automatisiert ausgefuehrt.", "Ein Schreibtischtest ist nur sinnvoll, wenn der Code bereits kompiliert werden kann."),
    concept("alg_rekursion", "Algorithmen", "Rekursion", "eine Technik, bei der eine Funktion sich mit einem kleineren Teilproblem selbst aufruft", "Eine Routine zerlegt eine Zahl wiederholt in Quotient und Rest und ruft sich fuer den Quotienten erneut auf.", "Eine Schleife, die denselben Block ohne Selbstaufruf wiederholt.", "Einen klaren Basisfall und eine garantierte Verringerung des Problems definieren.", "Ohne Basisfall drohen Endlosaufrufe oder Stapelueberlaeufe.", "Iteration", "Rekursion arbeitet ueber Selbstaufrufe, Iteration ueber Schleifenstrukturen.", "Rekursion benoetigt keinen Basisfall, wenn die Eingabe klein genug ist."),
    concept("alg_iteration", "Algorithmen", "Iteration", "die wiederholte Ausfuehrung eines Schritts ueber Schleifen statt ueber Selbstaufrufe", "Eine Liste wird in einer for-Schleife von links nach rechts abgearbeitet.", "Eine Methode ruft sich wiederholt selbst auf.", "Startwert, Schleifenbedingung und Schrittfolge sauber trennen.", "Fehlerhafte Schleifenbedingungen fuehren zu ausgelassenen oder unendlichen Durchlaeufen.", "Rekursion", "Iteration nutzt Schleifen, Rekursion nutzt Selbstaufrufe.", "Iteration bedeutet, dass eine Funktion sich in jeder Runde selbst aufruft."),
    concept("alg_greedy", "Algorithmen", "Greedy-Algorithmus", "ein Verfahren, das in jedem Schritt die lokal beste Option waehlt", "Bei einer Flugroute wird immer zuerst der naechstgelegene noch offene Flughafen gewaehlt.", "Es werden alle moeglichen Gesamtrouten vollstaendig durchgerechnet, bevor entschieden wird.", "Pruefen, ob lokale Teilentscheidungen fuer das Zielproblem tatsaechlich geeignet sind.", "Eine lokal gute Wahl kann global zu einer schlechteren Gesamtloesung fuehren.", "Globale Optimierung", "Ein Greedy-Verfahren entscheidet schrittweise lokal, eine globale Optimierung betrachtet den Gesamtraum der Loesungen.", "Ein Greedy-Algorithmus liefert automatisch immer die weltweit beste Gesamtloesung."),
    concept("alg_sortieralgorithmus", "Algorithmen", "Sortieralgorithmus", "ein Verfahren, das Elemente nach einer Vergleichsregel in eine gewuenschte Reihenfolge bringt", "Kursdaten werden nach Name oder Wert geordnet, weil eine Vergleichsfunktion groesser, kleiner oder gleich meldet.", "Eine Suche, die nur prueft, ob ein einzelnes Element existiert.", "Vergleichsregel, Abbruch und Tauschlogik sauber aufeinander abstimmen.", "Bei falscher Vergleichslogik entstehen instabile oder unvollstaendige Reihenfolgen.", "Suchalgorithmus", "Sortieralgorithmen ordnen eine Menge neu, Suchalgorithmen finden gezielt Elemente.", "Ein Sortieralgorithmus muss die Daten immer nach ihrer Eingabereihenfolge belassen."),
    concept("alg_binaersuche", "Algorithmen", "Binaersuche", "ein Suchverfahren, das in einer sortierten Menge den Suchraum schrittweise halbiert", "In einer geordneten Liste wird der mittlere Wert geprueft und danach nur links oder rechts weitergesucht.", "Eine unsortierte Liste wird Element fuer Element von vorne nach hinten untersucht.", "Vor dem Einsatz sicherstellen, dass die Daten sortiert und die Grenzen korrekt gesetzt sind.", "Auf unsortierten Daten oder mit falschen Grenzen liefert die Suche unzuverlaessige Ergebnisse.", "Lineare Suche", "Die Binaersuche halbiert den Suchraum in sortierten Daten, die lineare Suche prueft Element fuer Element.", "Die Binaersuche funktioniert auch dann unveraendert korrekt, wenn die Liste nicht sortiert ist."),
    concept("alg_doppelschleife", "Algorithmen", "Doppelschleife", "eine verschachtelte Schleifenstruktur, bei der eine Schleife innerhalb einer anderen ausgefuehrt wird", "Fuer jeden Monat werden in einer inneren Schleife alle Messwerte dieses Monats ausgewertet.", "Eine einzelne Schleife, die nur einen Zaehler hochzaehlt.", "Aeusseren und inneren Schleifenzweck eindeutig trennen und Indizes sauber benennen.", "Indexfehler oder unnoetige Mehrfachdurchlaeufe faelschen Ergebnisse und Laufzeit.", "Einfache Schleife", "Eine Doppelschleife verarbeitet zwei Ebenen verschachtelt, eine einfache Schleife nur eine Ebene.", "Eine Doppelschleife ist nur eine andere Schreibweise fuer eine einzelne Schleife."),
    concept("alg_abbruchbedingung", "Algorithmen", "Abbruchbedingung", "die Regel, unter der ein wiederholter Ablauf beendet wird", "Eine Suche endet, sobald das gesuchte Element gefunden oder der letzte Eintrag geprueft wurde.", "Die reine Initialisierung von Startwerten vor einer Schleife.", "Abbruchregeln so formulieren, dass Treffer und Grenzfaelle beide sauber abgedeckt sind.", "Fehlende oder falsche Abbruchbedingungen fuehren zu Endlosschleifen oder ausgelassenen Treffern.", "Initialisierung", "Die Abbruchbedingung beendet einen Ablauf, die Initialisierung bereitet ihn nur vor.", "Eine Schleife braucht keine Abbruchbedingung, solange im Inneren etwas passiert."),
    concept("alg_kontrollstruktur", "Algorithmen", "Kontrollstruktur", "ein Grundbaustein wie Sequenz, Verzweigung oder Schleife zur Steuerung des Ablaufs", "Ein Algorithmus kombiniert nacheinander eine Pruefung, einen If-Zweig und eine Schleife.", "Eine reine Datenstruktur ohne Einfluss auf den Ablauf.", "Fachliche Bedingungen und Wiederholungen gezielt auf passende Kontrollstrukturen abbilden.", "Wenn die falsche Struktur gewaehlt wird, bleibt der Ablauf unklar oder fachlich falsch.", "Datenstruktur", "Kontrollstrukturen steuern den Ablauf, Datenstrukturen halten Informationen.", "Kontrollstrukturen dienen nur der Darstellung und veraendern den Ablauf nicht."),

    concept("uml_aktivitaetsdiagramm", "UML und OOP", "Aktivitaetsdiagramm", "ein UML-Diagramm zur Darstellung von Schritten, Entscheidungen und Parallelitaeten in einem Ablauf", "Ein Prozess zur Terminvergabe zeigt Start, Entscheidung, Buchung und Rueckmeldung in fachlicher Reihenfolge.", "Ein Diagramm, das Klassen mit Attributen und Methoden zeigt.", "Aktionen, Verzweigungen und verantwortliche Rollen klar voneinander abgrenzen.", "Unklare Verzweigungen machen den Prozess fachlich missverstaendlich.", "Sequenzdiagramm", "Das Aktivitaetsdiagramm zeigt den fachlichen Ablauf, das Sequenzdiagramm die Nachrichten zwischen Beteiligten.", "Ein Aktivitaetsdiagramm wird primaer genutzt, um Attribute und Methoden einer Klasse zu dokumentieren."),
    concept("uml_klassendiagramm", "UML und OOP", "Klassendiagramm", "ein UML-Diagramm zur Darstellung von Klassen, Attributen, Methoden und Beziehungen", "Ein Modell zeigt Klassen wie Patient, Termin und Arzt mit ihren Beziehungen.", "Eine Schrittfolge mit Entscheidungen und Endknoten.", "Klassenverantwortungen, Attribute und Beziehungen fachlich sauber trennen.", "Vermischte Verantwortungen fuehren zu unklaren Modellen und spaeterem Umbaubedarf.", "ERM", "Ein Klassendiagramm beschreibt Softwareklassen, ein ERM fachliche Datenobjekte und Beziehungen.", "Ein Klassendiagramm dient vor allem dazu, SQL-Abfragen in Tabellenform aufzuschreiben."),
    concept("uml_sequenzdiagramm", "UML und OOP", "Sequenzdiagramm", "ein UML-Diagramm, das Nachrichten zwischen Beteiligten in zeitlicher Reihenfolge zeigt", "UI, Service und Datenquelle senden nacheinander Anfragen und Antworten fuer einen Aufruf.", "Ein Diagramm, das Zustandswechsel eines einzelnen Objekts zeigt.", "Beteiligte, Nachrichtenrichtung und Reihenfolge von Aufrufen klar herausarbeiten.", "Fehlende oder vertauschte Nachrichten lassen API- oder Serviceablaeufe unplausibel wirken.", "Zustandsdiagramm", "Ein Sequenzdiagramm zeigt Kommunikationsreihenfolgen, ein Zustandsdiagramm Zustandswechsel eines Objekts.", "Ein Sequenzdiagramm wird genutzt, um Tabellen in dritte Normalform zu ueberfuehren."),
    concept("uml_zustandsdiagramm", "UML und OOP", "Zustandsdiagramm", "ein UML-Diagramm, das moegliche Zustaende eines Objekts und deren Uebergaenge beschreibt", "Ein Lieferroboter wechselt zwischen Warten, Fahren, Hindernis und Rueckkehr.", "Ein Diagramm, das alle Projektbeteiligten und deren Nachrichten zeigt.", "Zustaende, ausloesende Ereignisse und Sonderfaelle wie Fehler oder Zielerreichung sauber unterscheiden.", "Fehlende Zustandswechsel fuehren zu Luecken in der Fachlogik.", "Sequenzdiagramm", "Ein Zustandsdiagramm beschreibt Zustandswechsel, ein Sequenzdiagramm die Interaktion zwischen Beteiligten.", "Ein Zustandsdiagramm wird vor allem verwendet, um Benutzeroberflaechen pixelgenau zu skizzieren."),
    concept("uml_use_case", "UML und OOP", "Use-Case-Diagramm", "ein UML-Diagramm, das Akteure und fachliche Anwendungsfaelle auf hoher Ebene zeigt", "Kundin, Administrator und Buchungssystem sind mit den Faellen Reservierung anlegen und Storno pruefen verbunden.", "Ein Diagramm mit Attributen, Datentypen und Methoden einer Klasse.", "Akteure und Ziele auf fachlicher Ebene halten und keine Detailablauflogik hineinziehen.", "Zu viel Detail macht das Diagramm unlesbar und verfehlt seinen Zweck.", "Aktivitaetsdiagramm", "Das Use-Case-Diagramm zeigt Akteure und Ziele, das Aktivitaetsdiagramm den Detailablauf.", "Ein Use-Case-Diagramm dient primaer dazu, Schleifen und Fallunterscheidungen im Code exakt abzubilden."),
    concept("uml_assoziation", "UML und OOP", "Assoziation", "eine Beziehung zwischen Klassen, die ausdrueckt, dass Objekte fachlich miteinander verbunden sind", "Ein Termin ist mit genau einer Patientin und einem Arzt verbunden.", "Ein Teilobjekt kann ohne das Gesamtobjekt nicht existieren und wird mit diesem geloescht.", "Beziehungsrichtung und Fachbedeutung sauber aus den Fachregeln ableiten.", "Unscharfe Beziehungen erschweren spaeter Modell, Code und Datenhaltung.", "Komposition", "Eine Assoziation beschreibt eine fachliche Verbindung, eine Komposition eine starke Teil-Ganzes-Bindung.", "Eine Assoziation bedeutet automatisch, dass Teilobjekte beim Loeschen immer mit entfernt werden."),
    concept("uml_komposition", "UML und OOP", "Komposition", "eine starke Teil-Ganzes-Beziehung, bei der das Teil ohne das Ganze nicht sinnvoll existiert", "Ein Buchungsvorgang enthaelt Positionen, die ohne diesen Vorgang nicht eigenstaendig fortbestehen sollen.", "Zwei Klassen kennen sich nur lose und koennen unabhaengig voneinander existieren.", "Nur dann als Komposition modellieren, wenn Lebensdauer und Sinnhaftigkeit wirklich eng gekoppelt sind.", "Zu starke Bindungen machen Modelle unflexibel und fachlich falsch.", "Assoziation", "Komposition bindet Lebensdauer und Zugehoerigkeit stark, Assoziation ist lose gekoppelt.", "Eine Komposition ist nur eine dekorative Notation ohne besondere fachliche Aussage."),
    concept("uml_vererbung", "UML und OOP", "Vererbung", "ein Mechanismus, bei dem eine spezialisierte Klasse Eigenschaften und Verhalten einer allgemeineren Klasse uebernimmt", "Eine Klasse PremiumKunde uebernimmt Stammdaten und Basisverhalten von Kunde.", "Eine Klasse haelt eine andere Klasse nur als Attribut.", "Nur gemeinsame, verallgemeinerbare Eigenschaften in die Oberklasse ziehen.", "Ueberzogene Vererbungsbaeume machen Systeme starr und schwer wartbar.", "Komposition", "Vererbung uebernimmt Struktur und Verhalten aus einer Oberklasse, Komposition setzt Objekte aus anderen zusammen.", "Vererbung bedeutet, dass jede Unterklasse automatisch dieselben Datenobjekte physisch teilt."),
    concept("uml_polymorphie", "UML und OOP", "Polymorphie", "die Faehigkeit, dass verschiedene Objekte ueber dieselbe Schnittstelle unterschiedliches Verhalten zeigen", "Mehrere Versandarten beantworten dieselbe Methode berechnePreis jeweils mit eigener Logik.", "Eine Klasse erbt nur Datenfelder, aber es gibt keinen gemeinsamen Aufruf ueber dieselbe Schnittstelle.", "Gemeinsame Schnittstellen definieren und das unterschiedliche Verhalten an den konkreten Typ delegieren.", "Ohne klares Vertragsverhalten entstehen Sonderfaelle und Typabfragen im Code.", "Vererbung", "Polymorphie betrifft unterschiedliches Verhalten ueber einen gemeinsamen Vertrag, Vererbung beschreibt nur die Strukturbeziehung.", "Polymorphie bedeutet, dass alle Unterklassen zwingend genau dasselbe Verhalten zeigen."),
    concept("uml_kardinalitaet", "UML und OOP", "Kardinalitaet", "die Angabe, wie viele Objekte einer Klasse zu wie vielen Objekten einer anderen Klasse in Beziehung stehen koennen", "Eine Buchung kann genau einem Raum zugeordnet sein, ein Raum aber vielen Buchungen ueber die Zeit.", "Die Liste von Attributnamen innerhalb einer einzelnen Klasse.", "Kardinalitaeten aus den fachlichen Regeln des Problems begruenden, nicht raten.", "Falsche Kardinalitaeten fuehren zu unpassenden Datenmodellen und Logikfehlern.", "Attribut", "Kardinalitaet beschreibt Mengenbeziehungen zwischen Klassen, ein Attribut beschreibt eine Eigenschaft einer Klasse.", "Kardinalitaeten legen nur das Layout eines Diagramms fest und haben keine fachliche Bedeutung."),
    concept("uml_objektorientierung", "UML und OOP", "Objektorientierung", "ein Ansatz, bei dem Daten und Verhalten in Objekten mit klaren Verantwortungen zusammengefasst werden", "Eine Klasse TerminService kapselt Regeln zur Vergabe und Pruefung von Terminen.", "Ein unstrukturierter Block aus globalen Variablen und losen Hilfsfunktionen.", "Verantwortungen entlang fachlicher Rollen und Objekte schneiden.", "Ohne klare Kapselung steigen Seiteneffekte und Kopplung.", "Prozedurales Skript", "Objektorientierung kapselt Zustand und Verhalten in Objekten, ein rein prozeduraler Stil trennt das nicht in derselben Form.", "Objektorientierung bedeutet, dass jede Klasse zwingend vererbt werden muss."),

    concept("dbm_erm", "Datenmodellierung", "Entity-Relationship-Modell", "ein fachliches Modell aus Entitaeten, Attributen und Beziehungen fuer Datenobjekte", "Kunde, Buchung, Ressource und Standort werden mit ihren Beziehungen fachlich beschrieben.", "Eine konkrete SQL-Abfrage mit WHERE und GROUP BY.", "Zuerst Fachobjekte und ihre Beziehungen klaeren, bevor Tabellen oder Code entworfen werden.", "Unsaubere Fachobjekte fuehren zu schlechten Tabellenstrukturen und unklaren Regeln.", "Relationales Datenmodell", "Ein ERM ist das fachliche Vorstufenmodell, das relationale Datenmodell die tabellarische Umsetzung.", "Ein ERM wird genutzt, um HTTP-Statuscodes und API-Endpunkte festzulegen."),
    concept("dbm_relational", "Datenmodellierung", "Relationales Datenmodell", "eine tabellarische Struktur aus Relationen, Schluesseln und Beziehungen zur Abbildung von Daten", "Aus einem Fachmodell werden Tabellen mit Primaer- und Fremdschluesseln gebildet.", "Ein UML-Sequenzdiagramm mit Nachrichten zwischen UI und Service.", "Tabellen so schneiden, dass Attribute eindeutig zu einer Entitaet gehoeren und Beziehungen sauber ueber Schluessel laufen.", "Redundanz, Anomalien und schwer auswertbare Datenbestande entstehen.", "ERM", "Das relationale Datenmodell ist die tabellarische Umsetzung eines Fachmodells, das ERM die fachliche Beschreibung.", "Ein relationales Datenmodell besteht im Kern aus Methodenaufrufen zwischen Objekten."),
    concept("dbm_pk", "Datenmodellierung", "Primaerschluessel", "ein Attribut oder Attributverbund, der jeden Datensatz eindeutig identifiziert", "Jede Reservierung besitzt eine eindeutige Reservierungsnummer.", "Eine Spalte, die beliebig oft denselben Wert enthalten darf und nur fuer Sortierung gedacht ist.", "Einen stabilen, eindeutigen und moeglichst unveraenderlichen Schluessel verwenden.", "Uneindeutige Datensaetze koennen nicht sauber referenziert oder geaendert werden.", "Fremdschluessel", "Der Primaerschluessel identifiziert den eigenen Datensatz eindeutig, der Fremdschluessel verweist auf einen anderen.", "Ein Primaerschluessel darf gerade in produktiven Daten mehrfach denselben Wert enthalten."),
    concept("dbm_fk", "Datenmodellierung", "Fremdschluessel", "ein Attribut, das auf den Primaerschluessel einer anderen Tabelle verweist", "Eine Buchung speichert die Kunden-ID der zugehoerigen Kundin.", "Eine interne Hilfsspalte ohne Bezug zu einer anderen Tabelle.", "Beziehungen ueber konsistente Schluessel definieren und referenzielle Integritaet beachten.", "Verwaiste oder unzuordenbare Datensaetze entstehen.", "Primaerschluessel", "Ein Fremdschluessel verweist auf eine andere Tabelle, ein Primaerschluessel identifiziert die eigene Zeile.", "Ein Fremdschluessel identifiziert immer den Datensatz in derselben Tabelle."),
    concept("dbm_1nf", "Datenmodellierung", "Erste Normalform", "eine Tabellenform, in der jedes Feld einen atomaren Einzelwert enthaelt", "Mehrere Telefonnummern werden nicht in einer Zelle gesammelt, sondern getrennt modelliert.", "Eine Spalte enthaelt comma-getrennte Listen mit mehreren Werten je Datensatz.", "Wiederholungsgruppen und Mehrfachwerte aufloesen.", "Abfragen, Pflege und Integritaet werden unnoetig kompliziert.", "Unnormalisierte Tabelle", "Die erste Normalform verlangt atomare Werte, eine unnormalisierte Tabelle erlaubt Wiederholungsgruppen.", "Die erste Normalform fordert nur, dass Tabellen mindestens zwei Spalten besitzen."),
    concept("dbm_2nf", "Datenmodellierung", "Zweite Normalform", "eine Tabellenform, in der jedes Nichtschluesselattribut voll vom gesamten Schluessel abhaengt", "In einer Zuordnungstabelle haengt die Beschreibung nicht nur von einem Teil des zusammengesetzten Schluessels ab.", "Ein Attribut beschreibt nur einen Teil eines zusammengesetzten Schluessels, bleibt aber trotzdem in derselben Tabelle.", "Teilabhaengigkeiten bei zusammengesetzten Schluesseln gezielt auslagern.", "Redundanz und Pflegefehler bleiben erhalten.", "Erste Normalform", "Die zweite Normalform beseitigt Teilabhaengigkeiten, die erste Normalform nur Mehrfachwerte.", "Die zweite Normalform ist automatisch erreicht, sobald jede Zelle nur einen Einzelwert enthaelt."),
    concept("dbm_3nf", "Datenmodellierung", "Dritte Normalform", "eine Tabellenform, in der Nichtschluesselattribute nicht transitiv von einem Schluessel abhaengen", "Die Postleitzahl bestimmt nicht noch einmal den Ortsnamen in derselben Fachdaten-Tabelle, sondern wird sauber ausgelagert.", "Eine Tabelle speichert sowohl Kundendaten als auch die vollstaendige Ortsbeschreibung mehrfach pro Buchung.", "Transitive Abhaengigkeiten erkennen und in eigene Relationen ueberfuehren.", "Aenderungen muessen an vielen Stellen synchron gepflegt werden.", "Zweite Normalform", "Die dritte Normalform beseitigt transitive Abhaengigkeiten, die zweite Normalform Teilabhaengigkeiten.", "Die dritte Normalform betrifft nur die Reihenfolge von Spalten, nicht ihre Abhaengigkeiten."),
    concept("dbm_einfuegeanomalie", "Datenmodellierung", "Einfuegeanomalie", "ein Problem, bei dem neue Informationen ohne unnoetige Zusatzdaten nicht gespeichert werden koennen", "Ein neuer Raum kann erst angelegt werden, wenn bereits eine Buchung dafuer existiert.", "Ein Datensatz kann ohne Probleme eigenstaendig gespeichert werden.", "Tabellen so schneiden, dass Fachobjekte unabhaengig voneinander angelegt werden koennen.", "Neue Stammdaten lassen sich nur mit kuenstlichen Platzhalterwerten speichern.", "Normalisierte Struktur", "Eine Einfuegeanomalie weist auf unguenstige Tabellenzuschnitte hin, eine normalisierte Struktur vermeidet genau das.", "Eine Einfuegeanomalie bedeutet nur, dass eine Abfrage langsam laeuft."),
    concept("dbm_aenderungsanomalie", "Datenmodellierung", "Aenderungsanomalie", "ein Problem, bei dem dieselbe Information an mehreren Stellen konsistent geaendert werden muss", "Der Name eines Standorts steht in vielen Buchungen und muss ueberall identisch nachgezogen werden.", "Eine Information kommt nur einmal vor und wird zentral geaendert.", "Redundante Fachinformationen in eigene Tabellen auslagern.", "Widerspruechliche Datenstaende entstehen.", "Zentrale Stammdatenhaltung", "Eine Aenderungsanomalie entsteht aus Redundanz, zentrale Stammdatenhaltung reduziert sie.", "Eine Aenderungsanomalie betrifft ausschliesslich die Reihenfolge von Datensaetzen."),
    concept("dbm_loeschanomalie", "Datenmodellierung", "Loeschanomalie", "ein Problem, bei dem beim Entfernen eines Datensatzes ungewollt weitere wichtige Informationen verloren gehen", "Wird die letzte Buchung eines Standorts geloescht, verschwindet gleichzeitig die einzige gespeicherte Standortinformation.", "Das Entfernen eines Datensatzes beeinflusst keine anderen Fachinformationen.", "Stammdaten und Bewegungsdaten logisch trennen.", "Fachlich benoetigte Informationen gehen unbeabsichtigt verloren.", "Getrennte Stammdaten", "Loeschanomalien entstehen bei vermischten Daten, getrennte Stammdaten vermeiden das.", "Eine Loeschanomalie bedeutet nur, dass ein DELETE-Befehl lange braucht."),
    concept("dbm_datentyp", "Datenmodellierung", "Datentyp", "die fachlich und technisch passende Form, in der ein Wert gespeichert wird", "Ein Datum wird als Datumstyp und eine Menge als numerischer Typ modelliert.", "Jeder Wert wird pauschal als freier Text gespeichert.", "Typen an Fachbedeutung, Validierung und Auswertbarkeit ausrichten.", "Falsche Typen erschweren Pruefung, Sortierung und Berechnung.", "Datenwert", "Der Datentyp beschreibt die Form eines Wertes, der Datenwert den konkreten Inhalt.", "Datentypen sind nur fuer die optische Darstellung relevant, nicht fuer Logik und Auswertung."),

    concept("sql_select", "SQL", "SELECT", "die SQL-Anweisung zum Lesen und Projektionieren von Daten", "Eine Abfrage listet offene Reservierungen mit Datum und Tischnummer.", "Eine Anweisung loescht bestehende Datensaetze aus einer Tabelle.", "Nur die benoetigten Spalten und saubere Filter fuer die Fachfrage auswaehlen.", "Unklare oder ueberbreite Ergebnisse erschweren Auswertung und Performance.", "UPDATE", "SELECT liest Daten, UPDATE veraendert bestehende Daten.", "SELECT dient primaer dazu, Datensaetze in einer Tabelle dauerhaft zu veraendern."),
    concept("sql_inner_join", "SQL", "INNER JOIN", "eine Verknuepfung, die nur Datensaetze mit passenden Treffern auf beiden Seiten liefert", "Nur Mitarbeitende mit vorhandenen Urlaubseintraegen erscheinen im Ergebnis.", "Alle Mitarbeitenden erscheinen, auch wenn auf einer Seite kein passender Treffer existiert.", "Join-Bedingung ueber die fachlich richtigen Schluessel formulieren.", "Falsche oder fehlende Verknuepfungen liefern unvollstaendige oder falsche Ergebnisse.", "LEFT JOIN", "INNER JOIN liefert nur gemeinsame Treffer, LEFT JOIN behaelt auch linke Zeilen ohne Match.", "Ein INNER JOIN ist genau dann geeignet, wenn auch linke Zeilen ohne Treffer erhalten bleiben sollen."),
    concept("sql_left_join", "SQL", "LEFT JOIN", "eine Verknuepfung, bei der alle Zeilen der linken Tabelle erhalten bleiben, auch ohne Treffer rechts", "Alle Mitarbeitenden werden gelistet, Urlaubsdaten fehlen bei manchen als NULL.", "Es erscheinen nur Datensaetze, fuer die rechts ein passender Eintrag existiert.", "LEFT JOIN einsetzen, wenn auch Datensaetze ohne Gegenstueck sichtbar bleiben sollen.", "Mit INNER JOIN waeren fachlich relevante Leermengen unsichtbar.", "INNER JOIN", "LEFT JOIN behaelt linke Zeilen ohne Treffer, INNER JOIN nicht.", "Ein LEFT JOIN ist nur eine Schreibvariante fuer ORDER BY."),
    concept("sql_group_by", "SQL", "GROUP BY", "eine SQL-Klausel zum Gruppieren von Zeilen fuer Aggregationen", "Umsaetze werden boersenweise oder standortweise zusammengefasst.", "Ein Ergebnis wird nur alphabetisch sortiert, ohne Gruppen zu bilden.", "Nur nach den Attributen gruppieren, ueber die spaeter aggregiert oder berichtet werden soll.", "Ohne passende Gruppierung stimmen Summen und Durchschnittswerte nicht zur Fachfrage.", "ORDER BY", "GROUP BY bildet Gruppen fuer Kennzahlen, ORDER BY sortiert nur das Ergebnis.", "GROUP BY dient ausschliesslich der optischen Sortierung einer Ergebnisliste."),
    concept("sql_having", "SQL", "HAVING", "eine Klausel zum Filtern bereits gruppierter Ergebnisse", "Es werden nur Gruppen mit mehr als drei offenen Faellen angezeigt.", "Es werden einzelne Rohzeilen vor der Aggregation nach Datum gefiltert.", "HAVING nach der Aggregation fuer Gruppenbedingungen verwenden.", "Mit WHERE an der falschen Stelle werden Gruppenbedingungen nicht korrekt umgesetzt.", "WHERE", "HAVING filtert Gruppen nach der Aggregation, WHERE filtert Rohzeilen davor.", "HAVING ersetzt grundsaetzlich jede WHERE-Bedingung, auch ohne GROUP BY."),
    concept("sql_insert", "SQL", "INSERT", "eine SQL-Anweisung zum Einfuegen neuer Datensaetze", "Ein neuer Wirkstoff oder ein neuer Raum wird als Zeile angelegt.", "Ein bestehender Datensatz wird inhaltlich geaendert.", "Pflichtfelder und fachlich notwendige Werte vollstaendig setzen.", "Unvollstaendige oder inkonsistente Stammdaten gelangen in den Bestand.", "UPDATE", "INSERT legt neue Zeilen an, UPDATE aendert vorhandene.", "INSERT ist die richtige Anweisung, wenn vorhandene Datensaetze nur korrigiert werden sollen."),
    concept("sql_update", "SQL", "UPDATE", "eine SQL-Anweisung zum Aendern bestehender Datensaetze", "Ein Status oder eine Bezeichnung wird fuer vorhandene Zeilen angepasst.", "Neue Zeilen werden erstmalig in eine Tabelle geschrieben.", "WHERE-Bedingungen sauber setzen, damit nur die gewuenschten Zeilen geaendert werden.", "Ohne gezielten Filter werden versehentlich zu viele Daten geaendert.", "INSERT", "UPDATE aendert vorhandene Zeilen, INSERT fuegt neue hinzu.", "UPDATE eignet sich vor allem dann, wenn neue Datensaetze erstmalig angelegt werden sollen."),
    concept("sql_delete", "SQL", "DELETE", "eine SQL-Anweisung zum Entfernen vorhandener Datensaetze", "Alte Archivdaten oder fachlich ungueltige Zeilen werden gezielt geloescht.", "Eine Ergebnismenge wird nur gelesen und angezeigt.", "Loeschbedingungen pruefen und fachliche Folgen vorab absichern.", "Unbedachte Loeschungen entfernen benoetigte Daten dauerhaft.", "SELECT", "DELETE entfernt Zeilen, SELECT liest sie nur.", "DELETE ist die passende Anweisung, wenn Daten nur sortiert angezeigt werden sollen."),
    concept("sql_union_all", "SQL", "UNION ALL", "eine Verknuepfung, die Ergebnismengen unter Erhalt aller Zeilen zusammenfuehrt", "Aktuelle und archivierte Daten werden in einem Bericht gemeinsam ausgegeben, auch wenn Werte doppelt vorkommen.", "Nur gemeinsame Schnittmengen zweier Ergebnismengen werden behalten.", "Die Spaltenstruktur beider Teilabfragen sauber kompatibel halten.", "Nicht zueinander passende Teilabfragen erzeugen fachlich falsche Berichte.", "UNION", "UNION ALL behaelt alle Zeilen inklusive Duplikaten, UNION entfernt doppelte Zeilen.", "UNION ALL entfernt automatisch alle doppelten Treffer aus der Ergebnismenge."),
    concept("sql_create_index", "SQL", "CREATE INDEX", "eine Anweisung zum Anlegen einer Suchstruktur fuer schnellere Zugriffe auf bestimmte Spalten", "Hauefig gefilterte Zeit- oder Schluesselspalten werden fuer Berichte besser suchbar gemacht.", "Eine neue Tabelle mitsamt Spalten und Typen wird angelegt.", "Indizes gezielt auf haeufig gesuchte oder sortierte Spalten setzen.", "Falsch oder uebermaessig eingesetzte Indizes kosten Speicher und Schreibaufwand.", "CREATE TABLE", "CREATE INDEX verbessert Zugriffe auf bestehende Daten, CREATE TABLE erzeugt die Tabellenstruktur.", "CREATE INDEX wird genutzt, um den Inhalt bestehender Datensaetze zu aktualisieren."),

    concept("dbo_create_table", "Datenbankobjekte", "CREATE TABLE", "eine DDL-Anweisung zum Anlegen einer neuen Tabelle mit Spalten und Datentypen", "Fuer Herstellerdaten wird eine neue Tabelle mit ID, Name und Kontaktfeldern definiert.", "Es werden nur einzelne Zeilen in eine vorhandene Tabelle eingefuegt.", "Schluessel, Datentypen und Pflichtfelder bereits beim Tabellenentwurf sauber festlegen.", "Schwache Tabellendefinitionen erzeugen spaeter aufwaendige Nacharbeiten.", "INSERT", "CREATE TABLE definiert Struktur, INSERT fuellt vorhandene Struktur mit Daten.", "CREATE TABLE dient nur dazu, einzelne Werte in einer bestehenden Tabelle zu ueberschreiben."),
    concept("dbo_grant", "Datenbankobjekte", "GRANT", "eine Anweisung zur Vergabe von Rechten auf Datenbankobjekte", "Ein Reporting-Benutzer erhaelt Leserechte auf eine Auswertungstabelle.", "Bestehende Rechte werden einem Benutzer entzogen.", "Nur die Rechte vergeben, die fuer den konkreten Zweck wirklich noetig sind.", "Zu breite Berechtigungen vergroessern das Sicherheitsrisiko.", "REVOKE", "GRANT vergibt Rechte, REVOKE entzieht sie wieder.", "GRANT wird verwendet, um Tabellenstruktur und Datentypen anzulegen."),
    concept("dbo_revoke", "Datenbankobjekte", "REVOKE", "eine Anweisung zum Entziehen zuvor vergebener Rechte", "Ein alter Import-Benutzer verliert seine Schreibrechte nach dem Offboarding.", "Ein neuer Benutzer erhaelt erstmals Zugriff auf eine Tabelle.", "Rechte nach Rollenwechseln oder Offboarding gezielt zuruecknehmen.", "Veraltete Berechtigungen bleiben bestehen und oeffnen unnoetige Zugriffe.", "GRANT", "REVOKE entzieht Rechte, GRANT vergibt sie.", "REVOKE ist die Standardanweisung, um neuen Konten Leserechte zu geben."),
    concept("dbo_trigger", "Datenbankobjekte", "Trigger", "eine automatisch durch Datenbankereignisse ausgeloeste Logik", "Nach einem INSERT wird automatisch ein Audit-Eintrag geschrieben.", "Ein manueller Bericht wird nur auf ausdruecklichen Aufruf gestartet.", "Trigger nur fuer klar abgegrenzte, gut dokumentierte Reaktionen auf Ereignisse einsetzen.", "Versteckte Nebenwirkungen erschweren Fehleranalyse und Wartung.", "Stored Procedure", "Ein Trigger laeuft automatisch bei Ereignissen, eine Stored Procedure wird explizit aufgerufen.", "Ein Trigger wird nur aktiv, wenn ein Benutzer ihn wie eine normale Funktion manuell startet."),
    concept("dbo_stored_procedure", "Datenbankobjekte", "Stored Procedure", "eine gekapselte, explizit aufrufbare Datenbankroutine fuer wiederkehrende Logik", "Ein Bericht oder eine Pflegeoperation wird ueber eine benannte Routine mit Parametern gestartet.", "Eine Logik reagiert automatisch auf jedes UPDATE, ohne expliziten Aufruf.", "Wiederkehrende Datenbanklogik mit klaren Parametern und Zweck kapseln.", "Unklare oder verstreute SQL-Logik wird schwer wiederverwendbar und schwer testbar.", "Trigger", "Eine Stored Procedure wird gezielt aufgerufen, ein Trigger reagiert automatisch auf Ereignisse.", "Eine Stored Procedure wird ausschliesslich von der Datenbank selbst ohne Aufruf ausgefuehrt."),
    concept("dbo_sql_injection", "Datenbankobjekte", "SQL Injection", "eine Angriffstechnik, bei der unsicher zusammengesetzte Eingaben SQL-Befehle manipulieren", "Ein Login baut SQL aus ungeprueftem Freitext zusammen und laesst damit ungewollte Abfragen zu.", "Eine parametrisierte Abfrage bindet Eingaben getrennt von der SQL-Struktur.", "Parametrisierte Abfragen und Eingabevalidierung verwenden.", "Angreifer koennen Daten auslesen, veraendern oder umgehen, was eigentlich geprueft werden sollte.", "Parametrisierte Abfrage", "SQL Injection nutzt unsicher zusammengesetzte Abfragen aus, parametrisierte Abfragen trennen Struktur und Wert.", "SQL Injection ist nur bei DELETE-Befehlen moeglich, nicht bei SELECT oder Login-Faellen."),
    concept("dbo_transaktion", "Datenbankobjekte", "Transaktion", "eine logisch zusammengehoerige Folge von Datenbankoperationen, die gemeinsam erfolgreich oder gar nicht wirksam werden soll", "Buchung, Zahlungsstatus und Beleg werden nur zusammen bestaetigt.", "Mehrere voneinander unabhaengige Einzelabfragen ohne gemeinsamen Erfolgsbezug.", "Fachlich zusammenhaengende Aenderungen atomar absichern.", "Teilerfolge fuehren zu inkonsistenten Datenstaenden.", "Einzelanweisung", "Eine Transaktion sichert mehrere zusammenhaengende Schritte gemeinsam ab, eine Einzelanweisung nur einen Schritt.", "Eine Transaktion ist nur ein anderer Name fuer eine normale SELECT-Abfrage."),
    concept("dbo_acid", "Datenbankobjekte", "ACID", "das Prinzip aus Atomaritaet, Konsistenz, Isolation und Dauerhaftigkeit fuer Transaktionen", "Nach einem Fehler wird eine mehrschrittige Buchung komplett zurueckgerollt statt halb gespeichert.", "Ein System akzeptiert bewusst unvollstaendige Zwischenstaende ohne Absicherung.", "Transaktionen so modellieren, dass fachliche Ganzheit und Wiederherstellbarkeit gewahrt bleiben.", "Halbe Datenstaende oder Seiteneffekte unter Last werden nicht kontrolliert.", "Best-Effort-Speicherung", "ACID beschreibt strenge Garantien fuer Transaktionen, Best-Effort speichert ohne dieselbe Verbindlichkeit.", "ACID bedeutet nur, dass Tabellen mit einem Primaerschluessel versehen werden."),
    concept("dbo_dokumentendb", "Datenbankobjekte", "Dokumentenorientierte Datenbank", "eine Datenbankform, die Daten typischerweise als Dokumente statt streng relationalen Tabellen speichert", "Ein JSON-basiertes Schema speichert unterschiedlich strukturierte Ereignisdokumente.", "Ein relationales Schema mit normalisierten Tabellen und festen Fremdschluesseln.", "Das Modell passend zur Datenstruktur und zu den Abfrageanforderungen auswaehlen.", "Unpassende Modellwahl erschwert Konsistenz, Auswertung oder Weiterentwicklung.", "Relationale Datenbank", "Dokumentenorientierte Datenbanken speichern flexible Dokumente, relationale Datenbanken strukturieren Daten tabellarisch mit Schluesseln.", "Dokumentenorientierte Datenbanken erzwingen dieselbe starre dritte Normalform wie relationale Tabellen."),
    concept("dbo_datenwert", "Datenbankobjekte", "Datenwert", "der konkrete Inhalt, der in einem Feld einer Zeile gespeichert ist", "Der Wert 2026-03-26 steht in einer Datumsspalte fuer einen Termin.", "Die Entscheidung, ob eine Spalte vom Typ DATE oder VARCHAR sein soll.", "Konkrete Werte immer im Zusammenhang mit ihrem Datentyp und ihrer Fachbedeutung betrachten.", "Wenn Werte und Typen verwechselt werden, entstehen Validierungs- und Auswertungsfehler.", "Datentyp", "Der Datenwert ist der konkrete Inhalt, der Datentyp die Form dieses Inhalts.", "Ein Datenwert legt fest, welche Art von Werten eine Spalte grundsaetzlich speichern darf."),

    concept("tst_unit", "Testen und QS", "Unit-Test", "ein automatisierter Test fuer eine kleine, abgegrenzte Softwareeinheit", "Eine Methode zur Passwortpruefung wird mit mehreren Eingaben direkt getestet.", "Ein kompletter End-to-End-Ablauf ueber viele Systeme hinweg.", "Kleine Einheiten isoliert und mit klaren Erwartungswerten pruefen.", "Fehler in Basismethoden werden erst spaet und schwerer lokalisierbar entdeckt.", "Systemtest", "Ein Unit-Test prueft eine kleine Einheit isoliert, ein Systemtest ein groesseres Gesamtsystem.", "Ein Unit-Test muss immer die gesamte Anwendung mit Datenbank und Netzwerk starten."),
    concept("tst_blackbox", "Testen und QS", "Black-Box-Test", "ein Testansatz, der Verhalten anhand von Ein- und Ausgaben prueft, ohne den inneren Code zu betrachten", "Eine Funktion wird mit gueltigen und ungueltigen Eingaben auf ihr sichtbares Ergebnis geprueft.", "Ein Testfall wird aus internen Verzweigungen und Pfaden des Quelltexts abgeleitet.", "Fachliche Anforderungen und sichtbares Verhalten systematisch in Testfaelle uebersetzen.", "Wichtige Fachfaelle bleiben ungetestet, wenn nur zufaellige Eingaben ausprobiert werden.", "White-Box-Test", "Black-Box-Tests leiten Faelle aus Verhalten ab, White-Box-Tests aus dem internen Code.", "Ein Black-Box-Test benoetigt zwingend Kenntnis jedes internen Pfads im Quelltext."),
    concept("tst_whitebox", "Testen und QS", "White-Box-Test", "ein Testansatz, der Testfaelle aus Verzweigungen, Pfaden und internen Strukturen des Codes ableitet", "Ein Test prueft gezielt den Fall, in dem im Login-Code beide Bedingungen hintereinander erfuellt sind.", "Ein Test betrachtet nur das sichtbare Verhalten, ohne den Code zu kennen.", "Kritische Bedingungen, Pfade und Zweige im Code explizit identifizieren.", "Pfadluecken bleiben unerkannt und Fehler ueberleben scheinbar hohe Testzahlen.", "Black-Box-Test", "White-Box-Tests orientieren sich am internen Aufbau, Black-Box-Tests am sichtbaren Verhalten.", "White-Box-Tests verzichten bewusst auf jede Kenntnis ueber den Quelltext."),
    concept("tst_regression", "Testen und QS", "Regressionstest", "ein Test, der absichert, dass bereits funktionierende Teile nach einer Aenderung weiterhin korrekt laufen", "Nach einer Korrektur an der Sortierlogik werden alte Faelle erneut automatisiert pruefbar ausgefuehrt.", "Ein einmaliger Ersttest ohne Bezug zu frueherem Verhalten.", "Bestehende wichtige Faelle nach Aenderungen wiederholt mitlaufen lassen.", "Eine Fehlerbehebung kann unbemerkt neue Nebenwirkungen erzeugen.", "Ersttest", "Regressionstests sichern bestehendes Verhalten nach Aenderungen ab, Ersttests pruefen neue Faelle erstmalig.", "Regressionstests sind nur sinnvoll, wenn komplett neue Funktionen getestet werden."),
    concept("tst_aequivalenzklasse", "Testen und QS", "Aequivalenzklasse", "eine Gruppe von Eingaben, die sich hinsichtlich des erwarteten Verhaltens gleich behandeln lassen", "Mehrere ungueltige Werte werden als eine Klasse betrachtet, wenn sie denselben Fehlerpfad ausloesen.", "Jeder moegliche Wert wird immer zwingend einzeln getestet.", "Sinnvolle Eingabebereiche in gueltige und ungueltige Klassen aufteilen.", "Tests werden ineffizient oder lassen systematische Luecken offen.", "Einzelwerttest", "Aequivalenzklassen fassen gleichartige Eingaben zusammen, Einzelwerttests betrachten konkrete Einzelwerte.", "Aequivalenzklassen bedeuten, dass nur genau ein beliebiger Testfall fuer die gesamte Funktion ausreicht."),
    concept("tst_coverage", "Testen und QS", "Code Coverage", "ein Mass dafuer, wie viel vom Code durch Tests ausgefuehrt wurde", "Ein Bericht zeigt, dass bestimmte Zweige oder Zeilen nie von Tests erreicht wurden.", "Eine fachliche Aussage, dass das Programm deshalb automatisch fehlerfrei ist.", "Coverage als Hinweis auf Luecken nutzen, aber nicht mit fachlicher Korrektheit verwechseln.", "Hohe Coverage kann ueber fehlende inhaltliche Qualitaet hinwegtaueschen.", "Testqualitaet", "Coverage misst ausgefuehrte Codeanteile, Testqualitaet die Aussagekraft der Tests insgesamt.", "Volle Code Coverage beweist automatisch, dass keine fachlichen Fehler mehr moeglich sind."),
    concept("tst_debugging", "Testen und QS", "Debugging", "die systematische Fehlersuche und Ablaufverfolgung in einer laufenden oder nachgestellten Situation", "Zwischenwerte und Sprungbedingungen werden im Debugger schrittweise beobachtet.", "Ein Team sammelt nur spontane Vermutungen, ohne den Ablauf zu untersuchen.", "Problem reproduzieren, Hypothesen pruefen und Beobachtungen dokumentieren.", "Fehlerbilder bleiben diffus und werden nur oberflaechlich behandelt.", "Raten", "Debugging untersucht den Ablauf systematisch, Raten liefert keine belastbare Analyse.", "Debugging bedeutet, den Code ohne Beispielwerte einfach nur schnell durchzulesen."),
    concept("tst_code_review", "Testen und QS", "Code Review", "eine strukturierte fachliche und technische Pruefung von Code durch andere Personen", "Ein Pull Request wird auf Lesbarkeit, Risiken, Tests und Seiteneffekte geprueft.", "Eine Laufzeitmessung eines Programms unter Last.", "Aenderungen gezielt auf Risiken, Verstaendlichkeit und Testabdeckung pruefen.", "Denkfehler und Seiteneffekte bleiben eher bis spaet im Verlauf verborgen.", "Performance-Test", "Ein Code Review bewertet Aenderungen inhaltlich, ein Performance-Test misst Laufzeitverhalten.", "Code Reviews sind ueberfluessig, sobald der Code erfolgreich kompiliert."),
    concept("tst_pdca", "Testen und QS", "PDCA", "ein Verbesserungszyklus aus Plan, Do, Check und Act", "Eine Massnahme wird geplant, umgesetzt, anhand von Kennzahlen geprueft und danach angepasst.", "Ein Problem wird einmal spontan behoben und danach nie mehr betrachtet.", "Massnahmen inklusive Ziel, Umsetzung, Kontrolle und Nachsteuerung denken.", "Verbesserungen bleiben zufaellig und ihre Wirksamkeit wird nicht abgesichert.", "Ad-hoc-Feuerwehr", "PDCA ist ein geschlossener Verbesserungszyklus, Ad-hoc-Feuerwehr reagiert ohne systematische Rueckkopplung.", "PDCA besteht nur aus Plan und Do; eine spaetere Wirkungskontrolle ist nicht vorgesehen."),
    concept("tst_soll_ist", "Testen und QS", "Soll-Ist-Vergleich", "eine Gegenueberstellung von Zielzustand und tatsaechlichem Ergebnis", "Testprotokolle zeigen erwartete und tatsaechliche Ausgaben nebeneinander.", "Es wird nur ein Rohwert genannt, ohne Bezug zu einem Ziel.", "Zielgroessen vorab klar definieren und spaeter transparent gegenmessen.", "Abweichungen werden nicht sauber erkannt oder falsch bewertet.", "Zieldefinition", "Der Soll-Ist-Vergleich bewertet Abweichungen, die Zieldefinition beschreibt nur den angestrebten Zustand.", "Ein Soll-Ist-Vergleich ist nur eine formale Tabelle ohne Nutzen fuer Analyse oder Verbesserung."),

    concept("sec_vertraulichkeit", "Sicherheit und Datenschutz", "Vertraulichkeit", "das Schutzziel, dass Informationen nur befugten Personen bekannt werden", "Patientendaten sind nur fuer berechtigte Rollen einsehbar.", "Daten bleiben fuer alle offen lesbar, solange sie nicht veraendert werden.", "Zugriffsrechte und technische Schutzmassnahmen auf den tatsaechlichen Bedarf begrenzen.", "Unbefugte Einsicht fuehrt zu Datenschutz- und Sicherheitsvorfaellen.", "Verfuegbarkeit", "Vertraulichkeit schuetzt vor unbefugter Kenntnisnahme, Verfuegbarkeit vor Nicht-Erreichbarkeit.", "Vertraulichkeit bedeutet in erster Linie, dass ein System moeglichst immer online ist."),
    concept("sec_integritaet", "Sicherheit und Datenschutz", "Integritaet", "das Schutzziel, dass Daten vollstaendig und unveraendert korrekt bleiben", "Messwerte duerfen nicht unbemerkt manipuliert oder unvollstaendig gespeichert werden.", "Daten sind zwar jederzeit erreichbar, koennen aber beliebig veraendert werden.", "Aenderungen nachvollziehbar machen und unerwuenschte Manipulationen verhindern.", "Falsche Entscheidungen werden auf unzuverlaessiger Datenbasis getroffen.", "Vertraulichkeit", "Integritaet schuetzt Korrektheit und Unveraendertheit, Vertraulichkeit den Zugriff.", "Integritaet ist gegeben, sobald nur autorisierte Personen auf Daten zugreifen duerfen."),
    concept("sec_verfuegbarkeit", "Sicherheit und Datenschutz", "Verfuegbarkeit", "das Schutzziel, dass Informationen und Systeme bei Bedarf nutzbar sind", "Ein Terminservice bleibt auch bei Stoerungen oder Lastspitzen erreichbar.", "Daten sind korrekt, aber ein kritischer Dienst ist ueber lange Zeit nicht nutzbar.", "Ausfallrisiken, Redundanz und Wiederanlauf fuer kritische Prozesse mitdenken.", "Nicht erreichbare Systeme blockieren Geschaeftsprozesse oder Versorgung.", "Integritaet", "Verfuegbarkeit betrifft Nutzbarkeit bei Bedarf, Integritaet die Korrektheit der Daten.", "Verfuegbarkeit bedeutet nur, dass Daten nicht heimlich veraendert werden."),
    concept("sec_authentifizierung", "Sicherheit und Datenschutz", "Authentifizierung", "die Pruefung, ob eine Person oder ein System wirklich die behauptete Identitaet besitzt", "Ein Login prueft Benutzername und Passwort oder einen zweiten Faktor.", "Nach erfolgreichem Login werden Rechte fuer einzelne Funktionen zugeordnet.", "Identitaet verlaesslich pruefen, bevor weitere Rechteentscheidungen getroffen werden.", "Falsche Identitaeten koennen sich als legitime Nutzer ausgeben.", "Autorisierung", "Authentifizierung prueft die Identitaet, Autorisierung die danach erlaubten Aktionen.", "Authentifizierung entscheidet, welche Tabellen oder Menuepunkte jemand nach dem Login nutzen darf."),
    concept("sec_autorisierung", "Sicherheit und Datenschutz", "Autorisierung", "die Entscheidung, welche Aktionen eine bereits authentifizierte Identitaet ausfuehren darf", "Ein Reporting-Benutzer darf lesen, aber keine Medikationsdaten aendern.", "Vor dem Login wird geprueft, ob Passwort und Benutzername zusammenpassen.", "Rechte nach Rollen und Minimalprinzip vergeben.", "Zu breite Rechte vergroessern Schadenspotenziale und Fehlbedienungen.", "Authentifizierung", "Autorisierung legt erlaubte Aktionen fest, Authentifizierung bestaetigt zuerst die Identitaet.", "Autorisierung ist die eigentliche Identitaetspruefung beim Login."),
    concept("sec_verschluesselung", "Sicherheit und Datenschutz", "Verschluesselung", "eine Umwandlung von Klartext in eine fuer Unbefugte unlesbare Form mithilfe eines Schluessels", "Transportdaten werden ueber TLS so uebertragen, dass Dritte den Inhalt nicht direkt lesen koennen.", "Ein Kennwert wird nur zu einem festen Fingerabdruck ohne Rueckrechenweg verarbeitet.", "Geeignete Verfahren fuer Transport, Speicherung und Schluesselverwaltung waehlen.", "Unverschluesselte Daten koennen mitgelesen oder abgegriffen werden.", "Hashverfahren", "Verschluesselung ist fuer spaeteres Entschluesseln gedacht, ein Hash nicht.", "Verschluesselung und Hashverfahren verfolgen denselben Zweck und sind austauschbar."),
    concept("sec_hash", "Sicherheit und Datenschutz", "Hashverfahren", "ein Verfahren, das Daten auf einen festen Fingerabdruck abbildet, ohne den Ursprungswert wiederherzustellen", "Ein Passwort wird nicht im Klartext, sondern nur als Hashwert abgelegt.", "Dateiinhalte werden bewusst so verschluesselt, dass sie spaeter mit einem Schluessel lesbar werden.", "Hashes fuer Integritaets- oder Passwortpruefung einsetzen, nicht als Ersatz fuer reversible Verschluesselung.", "Wer Hash und Verschluesselung verwechselt, schuetzt Daten falsch oder unvollstaendig.", "Verschluesselung", "Ein Hash bildet auf einen Fingerabdruck ab, Verschluesselung ermoeglicht spaeteres Entschluesseln.", "Ein Hashverfahren ist die richtige Wahl, wenn vertrauliche Dokumente spaeter wieder im Original gelesen werden sollen."),
    concept("sec_signatur", "Sicherheit und Datenschutz", "Digitale Signatur", "ein Verfahren, das Herkunft und Unveraendertheit einer Nachricht pruefbar macht", "Eine signierte Nachricht kann auf Manipulation und auf den Signaturinhaber zurueckgefuehrt werden.", "Eine Datei wird nur lokal komprimiert, um Speicherplatz zu sparen.", "Signaturen dort einsetzen, wo Authentizitaet und Integritaet nachweisbar sein muessen.", "Manipulationen oder gefaelschte Herkunft lassen sich schlechter erkennen.", "Verschluesselung", "Digitale Signaturen sichern Herkunft und Integritaet, Verschluesselung primar Vertraulichkeit.", "Eine digitale Signatur dient in erster Linie dazu, Dateigroessen zu reduzieren."),
    concept("sec_phishing", "Sicherheit und Datenschutz", "Phishing", "ein tauschend echter Angriffsversuch, der Nutzende zur Preisgabe sensibler Daten verleiten soll", "Eine Mail fordert zum angeblich dringenden Passwort-Reset ueber einen gefaelschten Link auf.", "Eine legitime Benachrichtigung mit verifizierbarem Absender und passender Zieladresse.", "Absender, Links und Begleitumstaende pruefen und keine sensiblen Daten ueber fragwuerdige Wege eingeben.", "Zugangsdaten werden abgegriffen und fuer weitere Angriffe missbraucht.", "Legitime Nachricht", "Phishing taeuscht Vertrauen vor, legitime Nachrichten sind nachvollziehbar und konsistent.", "Phishing liegt nur dann vor, wenn Schadsoftware als Dateianhang mitgeliefert wird."),
    concept("sec_ransomware", "Sicherheit und Datenschutz", "Ransomware", "Schadsoftware, die Daten oder Systeme verschluesselt oder blockiert, um Erpressungsdruck zu erzeugen", "Produktivdaten werden unbrauchbar gemacht und erst gegen Zahlung scheinbar wieder freigegeben.", "Ein System meldet nur einen harmlosen Bedienfehler ohne Schadcode oder Erpressung.", "Backups, Segmentierung und sichere Grundkonfiguration als Vorsorge mitdenken.", "Betriebsausfaelle, Datenverlust und Erpressungsschaden koennen zugleich auftreten.", "Bedienfehler", "Ransomware ist ein gezielter Schadcodeangriff, ein Bedienfehler kein Angriffsverfahren.", "Ransomware ist nur ein anderes Wort fuer jede beliebige Loeschung durch Administratoren."),
    concept("sec_datenminimierung", "Sicherheit und Datenschutz", "Datenminimierung", "der Datenschutzgrundsatz, nur die fuer den Zweck notwendigen Daten zu erheben und zu verarbeiten", "Ein Formular fragt nur die wirklich benoetigten Felder fuer eine Terminbuchung ab.", "Aus Vorsicht werden moeglichst viele Zusatzdaten gesammelt, weil sie spaeter vielleicht nuetzlich sein koennten.", "Verarbeitungszweck und benoetigte Daten vorab sauber begrenzen.", "Unnoetige Daten vergroessern Risiko, Angriffsflache und Rechtsprobleme.", "Datensammeln auf Vorrat", "Datenminimierung beschraenkt Erhebung auf den Zweck, Datensammeln auf Vorrat ignoriert diese Grenze.", "Datenminimierung bedeutet, dass erhobene Daten moeglichst in vielen Systemen gleichzeitig verteilt werden."),

    concept("web_rest", "Web und Architektur", "REST", "ein Architekturstil fuer Schnittstellen, der Ressourcen, standardisierte HTTP-Methoden und lose Kopplung betont", "Ein Dienst stellt Ressourcen ueber URLs bereit und nutzt GET, POST oder DELETE passend zum Zweck.", "Ein Aufruf versteckt jede Aktion in beliebigen Methodenamen ohne Bezug zu HTTP-Semantik.", "Ressourcen klar benennen und HTTP-Semantik konsistent einsetzen.", "Unklare Schnittstellen erschweren Nutzung, Wartung und Integration.", "RPC", "REST arbeitet ressourcenorientiert ueber HTTP-Semantik, RPC eher ueber benannte Aktionen.", "REST bedeutet, dass jede Aktion ausschliesslich ueber POST abgewickelt werden sollte."),
    concept("web_http_method", "Web und Architektur", "HTTP-Methode", "die Angabe, welche Art von Aktion ein Request fachlich ausfuehren soll", "GET liest, POST legt an, DELETE entfernt und PUT ersetzt fachlich passend Daten.", "Eine Zahl wie 404 oder 200 zur Beschreibung des Ergebnisses eines Aufrufs.", "Methoden gemaess ihrer Semantik wie Lesen, Anlegen oder Loeschen waehlen.", "Falsch gewaehlte Methoden machen APIs missverstaendlich oder unsicher.", "HTTP-Statuscode", "Die HTTP-Methode beschreibt die beabsichtigte Aktion, der Statuscode das Ergebnis.", "HTTP-Methoden beschreiben ausschliesslich den Erfolg oder Misserfolg eines Aufrufs."),
    concept("web_http_status", "Web und Architektur", "HTTP-Statuscode", "eine Rueckmeldung ueber das Ergebnis eines HTTP-Aufrufs", "200 signalisiert Erfolg, 404 einen nicht gefundenen Pfad und 500 einen Serverfehler.", "GET oder POST legen fest, was der Client anfragen moechte.", "Statuscodes passend zu Erfolg, Fehlerart und Erwartung des Clients waehlen.", "Unpraezise Rueckmeldungen erschweren Fehlerbehandlung und Integration.", "HTTP-Methode", "Ein Statuscode beschreibt das Ergebnis, die Methode die Aktion des Requests.", "HTTP-Statuscodes legen fest, ob ein Aufruf lesen, loeschen oder aendern soll."),
    concept("web_json", "Web und Architektur", "JSON", "ein leichtgewichtiges, textbasiertes Format fuer strukturierte Daten", "Ein API-Endpunkt liefert eine Liste von Objekten mit Schluesseln und Werten im JSON-Format.", "Ein Format mit Start- und Endtags zur hierarchischen Auszeichnung von Dokumenten.", "Klare Feldnamen und konsistente Strukturen fuer Datenaustausch verwenden.", "Uneinheitliche Strukturen machen Parsing und Schnittstellenpflege fehleranfaellig.", "XML", "JSON ist kompakt und objektorientiert aufgebaut, XML arbeitet mit Tags und Dokumentstruktur.", "JSON benoetigt zwingend schliessende Tags fuer jedes Feld wie in XML."),
    concept("web_xml", "Web und Architektur", "XML", "ein textbasiertes Auszeichnungsformat mit Tags fuer strukturierte Dokumente und Daten", "Ein Datenaustauschformat beschreibt Inhalte mit oeffnenden und schliessenden Elementen.", "Ein kompaktes Objektformat aus geschweiften Klammern und Schluessel-Wert-Paaren.", "Schema, Struktur und Tag-Hierarchie konsistent halten.", "Zu komplexe oder inkonsistente XML-Strukturen erschweren Austausch und Verarbeitung.", "JSON", "XML arbeitet mit Tags und Dokumentstruktur, JSON mit Schluessel-Wert-Paaren.", "XML ist nur eine Schreibweise fuer SQL-Tabellen und nicht fuer Datenaustausch gedacht."),
    concept("web_microservices", "Web und Architektur", "Microservices", "ein Architekturansatz, bei dem fachliche Teilbereiche als eigenstaendige kleine Dienste organisiert werden", "Ein Buchungsdienst, ein Benachrichtigungsdienst und ein Reportingdienst werden getrennt betrieben.", "Die gesamte Fachlogik laeuft als ein einziger ungeteilter Deployable Block.", "Schnittstellen, Verantwortungen und Betriebsaufwand pro Dienst bewusst abwaegen.", "Zu feine oder schlecht geschnittene Dienste erhoehen Komplexitaet und Integrationslast.", "Monolith", "Microservices verteilen Verantwortung auf mehrere kleine Dienste, ein Monolith buendelt sie in einer Anwendung.", "Microservices bedeuten, dass keine Schnittstellen oder Abstimmungen zwischen Diensten mehr noetig sind."),
    concept("web_monolith", "Web und Architektur", "Monolith", "eine Anwendung, in der viele Fachbereiche gemeinsam als ein zusammenhaengendes Deployable betrieben werden", "UI, Fachlogik und Datenzugriffe werden in einer gemeinsamen Anwendung ausgeliefert.", "Jeder Fachbereich wird als eigener, unabhaengig deploybarer Dienst betrieben.", "Den Zuschnitt bewusst waehlen und nicht jede Architekturfrage reflexhaft verteilen.", "Ein zu grosser Monolith kann Aenderungen, Releases und Verantwortungen erschweren.", "Microservices", "Ein Monolith buendelt Bereiche in einer Anwendung, Microservices trennen sie in mehrere Dienste.", "Ein Monolith bedeutet automatisch, dass kein sauberes Schichtenmodell moeglich ist."),
    concept("web_mvc", "Web und Architektur", "MVC", "ein Muster, das Modell, Darstellung und Steuerung voneinander trennt", "Controller nimmt Anfragen an, Modell haelt Fachdaten und View stellt Ergebnisse dar.", "Ein Datenbankindex fuer schnellere Suchzugriffe.", "Darstellung und Fachlogik bewusst entkoppeln.", "Vermischte Verantwortungen erschweren Wartung und Testbarkeit.", "Schichtenmodell", "MVC trennt speziell Modell, View und Controller, ein allgemeines Schichtenmodell ist breiter gefasst.", "MVC bedeutet, dass dieselbe Klasse gleichzeitig Modell, View und Controller darstellen sollte."),
    concept("web_stateless", "Web und Architektur", "Zustandslosigkeit", "das Prinzip, dass ein Request alle fuer seine Bearbeitung noetigen Informationen mitbringt", "Ein API-Aufruf kann ohne versteckten Serversitzungszustand verarbeitet werden.", "Das Ergebnis haengt davon ab, was irgendwo unsichtbar in einer alten Session liegt.", "Schnittstellen so entwerfen, dass Requests fuer sich verstaendlich und verarbeitbar bleiben.", "Versteckte Zustaende erschweren Skalierung, Fehlersuche und Wiederholbarkeit.", "Session-Zustand", "Zustandslosigkeit minimiert versteckte Sitzungsabhaengigkeiten, Session-Zustand speichert Informationen serverseitig zwischen Aufrufen.", "Zustandslosigkeit bedeutet, dass ein Dienst keinerlei Datenbank oder persistenten Speicher nutzen darf."),
    concept("web_idempotenz", "Web und Architektur", "Idempotenz", "die Eigenschaft, dass mehrfach identische Ausfuehrung denselben fachlichen Endzustand hinterlaesst", "Mehrere gleiche PUT-Requests schreiben denselben Zielzustand, ohne immer neue Folgen zu erzeugen.", "Jeder wiederholte Aufruf erzeugt absichtlich einen neuen Datensatz.", "Bei API-Operationen bedenken, ob Wiederholungen gefahrlos moeglich sein muessen.", "Netzwerk-Wiederholungen koennen ohne Idempotenz zu Doppelaktionen fuehren.", "Nicht-idempotente Aktion", "Idempotenz vermeidet zusaetzliche Seiteneffekte bei Wiederholung, nicht-idempotente Aktionen erzeugen neue Folgen.", "Idempotenz bedeutet, dass eine Anfrage niemals Daten veraendern darf."),

    concept("req_stakeholder", "Anforderungen und UX", "Stakeholder", "eine Person oder Gruppe mit Interesse, Einfluss oder Betroffenheit bezueglich eines Systems", "Nutzende, Auftraggeber, Betrieb und Support haben unterschiedliche Erwartungen an dieselbe Loesung.", "Nur die Entwickelnden selbst gelten als relevante Perspektive.", "Betroffene und Einflussgruppen frueh identifizieren und ihre Sichtweisen unterscheiden.", "Wichtige Anforderungen oder Konflikte werden zu spaet sichtbar.", "Entwicklungsteam", "Stakeholder umfasst alle relevanten Interessengruppen, das Entwicklungsteam ist nur ein Teil davon.", "Stakeholder sind ausschliesslich die Personen, die spaeter Code schreiben."),
    concept("req_user_story", "Anforderungen und UX", "User Story", "eine kurze Anforderungsform aus Sicht einer nutzenden Rolle mit Ziel und Nutzen", "Als Praxisassistenz moechte ich freie Termine finden, damit ich schnell buchen kann.", "Eine technische Notiz wie refaktorisiere die Methode X ohne Bezug zu Rolle und Nutzen.", "Rolle, Ziel und fachlichen Mehrwert knapp und nutzerorientiert formulieren.", "Anforderungen bleiben technisch unscharf oder ohne erkennbaren Zweck.", "Technische Aufgabe", "Eine User Story beschreibt Nutzerrolle, Ziel und Nutzen, eine technische Aufgabe nur Umsetzungsarbeit.", "Eine User Story ist im Kern nur die Benennung des Datenbanktabellennamens."),
    concept("req_funktional", "Anforderungen und UX", "Funktionale Anforderung", "eine Anforderung daran, was ein System fachlich leisten oder tun soll", "Das System soll freie Tische fuer ein Datum ermitteln koennen.", "Die Antwortzeit soll unter zwei Sekunden liegen.", "Konkrete Fachfunktion und beobachtbares Verhalten klar beschreiben.", "Unklare Fachziele fuehren zu Fehlentwicklungen und Streit in der Abnahme.", "Nicht-funktionale Anforderung", "Funktionale Anforderungen beschreiben Leistungen, nicht-funktionale Rahmenbedingungen oder Qualitaeten.", "Eine funktionale Anforderung beschreibt in erster Linie nur die bevorzugte Schriftart der Oberflaeche."),
    concept("req_nichtfunktional", "Anforderungen und UX", "Nicht-funktionale Anforderung", "eine Anforderung an Qualitaeten oder Rahmenbedingungen eines Systems wie Sicherheit, Performance oder Benutzbarkeit", "Ein Bericht muss barrierefrei nutzbar sein und unter hoher Last stabil bleiben.", "Das System soll einen neuen Termin anlegen koennen.", "Qualitaetsziele messbar oder wenigstens klar nachvollziehbar beschreiben.", "Wichtige Erwartungen an Sicherheit, Performance oder Nutzbarkeit bleiben unklar.", "Funktionale Anforderung", "Nicht-funktionale Anforderungen beschreiben Qualitaeten und Rahmen, funktionale Anforderungen konkrete Leistungen.", "Nicht-funktionale Anforderungen sind nur optionales Beiwerk und nie abnahmerelevant."),
    concept("req_mockup", "Anforderungen und UX", "Mockup", "eine statische, fruehe Visualisierung einer Oberflaeche ohne vollstaendige Funktionslogik", "Ein Bildschirmentwurf zeigt Anordnung und Inhalt geplanter Felder und Buttons.", "Ein klickbarer Prototyp mit bereits simulierter Ablauflogik und Datenreaktion.", "Mockups gezielt fuer Struktur und Diskussion von Layout und Inhalten nutzen.", "Zu fruehe Detaildiskussionen ueber Implementation verdecken eigentliche Nutzungsfragen.", "Prototyp", "Ein Mockup ist eher statisch, ein Prototyp ermoeglicht meist mehr Interaktion oder Verhaltenssimulation.", "Ein Mockup muss bereits dieselbe technische Funktionslogik wie die fertige Anwendung enthalten."),
    concept("req_prototyp", "Anforderungen und UX", "Prototyp", "eine fruehe, meist teilweise interaktive Umsetzung zum Erproben von Ideen oder Ablaufen", "Ein klickbarer Entwurf prueft, ob Nutzende die Terminbuchung verstehen.", "Ein rein statisches Bild ohne nachvollziehbaren Interaktionsablauf.", "Prototypen gezielt fuer Lernen, Testen und Feedback einsetzen, nicht fuer Scheinsicherheit.", "Ein bloesser Schein von Fertigkeit kann fachliche oder technische Risiken verdecken.", "Mockup", "Ein Prototyp erprobt Verhalten oder Interaktion, ein Mockup primar Anordnung und Inhalt.", "Ein Prototyp ist nur dann ein Prototyp, wenn er bereits produktiv ausgerollt wurde."),
    concept("req_usability", "Anforderungen und UX", "Usability", "das Ausmass, in dem Nutzende Aufgaben effektiv, effizient und zufriedenstellend erledigen koennen", "Ein Formular ist klar, fehlertolerant und fuehrt schnell zum Ziel.", "Eine Oberflaeche sieht modern aus, ist aber verwirrend und fehleranfaellig.", "Aufgaben, Verstaendlichkeit, Fehlertoleranz und Lernbarkeit mitdenken.", "Nutzende brauchen unnoetig lange oder machen vermeidbare Fehler.", "User Experience", "Usability betrifft die Gebrauchstauglichkeit bei Aufgaben, User Experience das umfassendere Erleben darum herum.", "Usability beschreibt ausschliesslich den visuellen Stil einer Anwendung."),
    concept("req_barrierefreiheit", "Anforderungen und UX", "Barrierefreiheit", "die Gestaltung von Systemen so, dass sie auch mit unterschiedlichen Einschraenkungen nutzbar sind", "Bedienelemente sind per Tastatur erreichbar und Inhalte werden fuer Screenreader sinnvoll strukturiert.", "Eine farblich ansprechende Oberflaeche ohne Ruecksicht auf Kontrast oder Alternativtexte.", "Barrieren fuer Wahrnehmung, Bedienung und Verstehen systematisch abbauen.", "Bestimmte Nutzergruppen werden ausgeschlossen oder machen vermehrt Fehler.", "Reine Aesthetik", "Barrierefreiheit betrifft Zugang und Nutzbarkeit fuer verschiedene Bedarfe, Aesthetik nur das Aussehen.", "Barrierefreiheit ist nur relevant, wenn gesetzlich ausdruecklich ein Screenreader genannt wird."),
    concept("req_scrum", "Anforderungen und UX", "Scrum", "ein agiles Rahmenwerk mit klaren Rollen, Inkrementen und regelmaessigen Feedback-Schleifen", "Arbeit wird in Sprints geplant, abgestimmt und ueber Reviews sichtbar gemacht.", "Alle Aufgaben werden nur einmal zu Projektbeginn bis zum Ende ohne Rueckkopplung geplant.", "Backlog, Inkremente und kurze Lernzyklen diszipliniert leben.", "Ohne echte Transparenz und Rueckkopplung bleibt Scrum nur Etikett ohne Wirkung.", "Wasserfall", "Scrum arbeitet iterativ mit Feedback-Schleifen, ein Wasserfallmodell eher phasenorientiert nacheinander.", "Scrum bedeutet, dass Planung grundsaetzlich verboten ist und alles spontan entschieden wird."),
    concept("req_change_management", "Anforderungen und UX", "Change Management", "der strukturierte Umgang mit Aenderungen an Anforderungen, Prozessen oder Systemen", "Eine Fachaenderung wird bewertet, kommuniziert, eingeplant und in ihren Folgen nachgezogen.", "Eine wichtige Aenderung wird informell eingebaut, ohne Auswirkungen auf Test, Doku oder Termine zu betrachten.", "Aenderungswunsch, Auswirkung und Kommunikation systematisch zusammenfuehren.", "Nebenwirkungen auf Zeit, Kosten, Qualitaet oder Betrieb werden uebersehen.", "Spontanumbau", "Change Management steuert Aenderungen kontrolliert, Spontanumbau ignoriert Folgen und Abstimmung.", "Change Management bedeutet, dass jede Aenderung automatisch ohne Pruefung sofort umgesetzt wird."),
    concept("req_workshop", "Anforderungen und UX", "Workshop", "ein moderiertes Arbeitsformat, in dem Beteiligte gemeinsam Informationen, Ziele oder Loesungen erarbeiten", "Fachbereich, Betrieb und Entwicklung klaeren gemeinsam Anforderungen und offene Konflikte.", "Eine einzelne Person arbeitet still allein an einem Diagramm, ohne Austausch.", "Ziele, Teilnehmende und erwartete Ergebnisse eines Workshops klar vorbereiten.", "Gespräche verlaufen unstrukturiert und liefern wenig belastbare Ergebnisse.", "Einzelarbeit", "Ein Workshop nutzt gemeinsame Erarbeitung mehrerer Beteiligter, Einzelarbeit nicht.", "Ein Workshop ersetzt automatisch jede spaetere Dokumentation oder Entscheidungssicherung."),

    concept("ext_versionsverwaltung", "Erweiterte Praxis", "Versionsverwaltung", "ein System zur nachvollziehbaren Verwaltung von Aenderungen an Dateien und Code", "Aenderungen werden als Commits dokumentiert und sind spaeter nachvollziehbar.", "Dateien werden nur per Hand unter neuen Namen abgespeichert.", "Aenderungen mit klaren Schritten, Historie und Rueckverfolgbarkeit organisieren.", "Konflikte, Verluste und unklare Staende entstehen leichter.", "Dateikopie", "Versionsverwaltung bietet Historie und Zusammenarbeit, Dateikopien nicht in derselben Form.", "Versionsverwaltung ist nur relevant, wenn mehrere Teams gleichzeitig an derselben Datei tippen."),
    concept("ext_ci_cd", "Erweiterte Praxis", "CI/CD", "ein Ansatz, bei dem Integration, Pruefung und Auslieferung staerker automatisiert und haeufig wiederholt werden", "Nach jedem Merge laufen Tests und ein Releaseprozess automatisiert an.", "Releases werden nur selten und vollstaendig manuell ohne wiederholbare Pruefung ausgefuehrt.", "Automatisierte Pruef- und Lieferketten schrittweise aufbauen und transparent halten.", "Fehlerhafte Aenderungen werden spaeter entdeckt und Releases werden riskanter.", "Manuelles Deployment", "CI/CD automatisiert Integration und Auslieferung staerker, manuelles Deployment verlaesst sich auf Handarbeit.", "CI/CD bedeutet, dass Tests nicht mehr gebraucht werden, weil ohnehin alles automatisch gebaut wird."),
    concept("ext_observer", "Erweiterte Praxis", "Observer", "ein Design Pattern, bei dem Beobachter ueber Aenderungen eines Subjekts informiert werden", "Mehrere Anzeigen reagieren automatisch, wenn sich ein Messwert oder Status aendert.", "Jede abhängige Komponente fragt staendig selbst ohne Struktur nach Aenderungen.", "Aenderungsereignisse klar kapseln und Beobachter lose anbinden.", "Direkte starre Kopplung macht Erweiterungen aufwaendig.", "Direkter Aufrufverbund", "Observer entkoppelt Benachrichtigung ueber Beobachter, direkter Aufruf bindet Komponenten enger zusammen.", "Observer ist nur ein anderer Name fuer eine SQL-Triggerfunktion."),
    concept("ext_factory_method", "Erweiterte Praxis", "Factory Method", "ein Pattern, bei dem die Erzeugung passender Objekte ueber eine Fabrikmethode gekapselt wird", "Je nach Dokumenttyp liefert die Fabrik die passende konkrete Exportklasse.", "An allen Stellen des Codes werden konkrete Klassen direkt per Hand verzweigt instanziiert.", "Objekterzeugung dort kapseln, wo Varianten zentral entschieden werden sollen.", "Verstreute Erzeugungslogik erschwert Pflege und Erweiterung neuer Typen.", "Direkte Instanziierung", "Factory Method kapselt die Objekterzeugung, direkte Instanziierung verteilt sie im Code.", "Factory Method wird genutzt, um Datenbankrechte an Benutzer zu vergeben."),
    concept("ext_datenqualitaet", "Erweiterte Praxis", "Datenqualitaet", "das Ausmass, in dem Daten korrekt, konsistent, vollstaendig und zweckgeeignet sind", "Importdaten verwenden einheitliche Schreibweisen, gueltige Formate und nachvollziehbare Werte.", "Rohdaten enthalten widerspruechliche Schreibweisen, Dubletten und unerklaerte Luecken.", "Vor Import und Auswertung Bereinigung, Validierung und Standardisierung einplanen.", "Schlechte Datenqualitaet verdirbt Modelle, Berichte und Entscheidungen.", "Datenmenge", "Datenqualitaet beschreibt Brauchbarkeit und Korrektheit, Datenmenge nur das Volumen.", "Hohe Datenqualitaet bedeutet vor allem, dass moeglichst viele Datensaetze gesammelt wurden."),
    concept("ext_risikoanalyse", "Erweiterte Praxis", "Risikoanalyse", "eine strukturierte Bewertung moeglicher Bedrohungen, Eintrittswahrscheinlichkeiten und Auswirkungen", "Fuer ein Portal werden Angriffe, Ausfaelle und ihre fachlichen Folgen systematisch bewertet.", "Ein Team verlässt sich nur auf Bauchgefuehl ohne dokumentierte Abwaegung.", "Risiken nach Auswirkung und Wahrscheinlichkeit bewerten und passende Massnahmen ableiten.", "Wesentliche Gefahren werden falsch priorisiert oder ganz uebersehen.", "Bauchgefuehl", "Eine Risikoanalyse bewertet Risiken strukturiert, Bauchgefuehl nicht.", "Eine Risikoanalyse ist erst noetig, nachdem bereits ein schwerer Vorfall eingetreten ist."),
    concept("ext_backup", "Erweiterte Praxis", "Backup", "eine Sicherung zur Wiederherstellung von Daten nach Verlust oder Beschaedigung", "Produktivdaten werden regelmaessig gesichert, damit nach einem Ausfall wiederhergestellt werden kann.", "Unterlagen werden rechtssicher fuer lange Aufbewahrungsfristen unveraenderbar abgelegt.", "Sicherungsziele, Wiederherstellbarkeit und regelmaessige Restore-Tests mitdenken.", "Ohne brauchbare Sicherung lassen sich Verluste oder Ransomware-Folgen schwer beheben.", "Archivierung", "Backups dienen der Wiederherstellung, Archivierung der langfristigen und oft rechtlich motivierten Aufbewahrung.", "Ein Backup ersetzt automatisch jede Form der revisionssicheren Langzeitaufbewahrung."),
    concept("ext_archivierung", "Erweiterte Praxis", "Archivierung", "eine langfristige, nachvollziehbare Aufbewahrung von Informationen fuer rechtliche oder fachliche Zwecke", "Abgeschlossene Dokumente werden unveraenderbar und fristgerecht aufbewahrt.", "Tagesaktuelle Sicherungen werden nur fuer schnelle Wiederherstellung rotiert.", "Aufbewahrungszweck, Fristen und Unveraenderbarkeit vom Backup unterscheiden.", "Wiederherstellung und Langzeitaufbewahrung werden verwechselt und falsch organisiert.", "Backup", "Archivierung dient langfristiger Nachvollziehbarkeit, Backups der Wiederherstellung nach Verlust.", "Archivierung bedeutet nur, dass besonders alte Dateien loeschbar werden."),
    concept("ext_zertifikat", "Erweiterte Praxis", "Zertifikat", "eine digitale Bescheinigung, die einen Schluessel mit einer Identitaet verknuepft", "Ein TLS-Zertifikat bestaetigt, zu welchem Dienst ein oeffentlicher Schluessel gehoert.", "Ein beliebiges Passwort, das nur lokal auf dem Server gespeichert wird.", "Gueltigkeit, Aussteller und Einsatzzweck eines Zertifikats pruefen.", "Ohne vertrauenswuerdige Zuordnung wird die Echtheit eines Kommunikationspartners unsicher.", "Passwort", "Ein Zertifikat bindet einen Schluessel an eine Identitaet, ein Passwort authentifiziert anders und ohne diese Bescheinigung.", "Ein Zertifikat ersetzt den eigentlichen kryptographischen Schluessel und enthaelt keinerlei Identitaetsbezug."),
    concept("ext_vpn", "Erweiterte Praxis", "VPN", "eine abgesicherte Verbindung, die Datenverkehr logisch durch ein geschuetztes Tunnelverfahren fuehrt", "Ein Mitarbeitender greift von aussen verschluesselt auf interne Dienste zu.", "Ein Dienst wird ungeschuetzt direkt ueber das offene Internet erreichbar gemacht.", "Tunnel, Authentisierung und Einsatzzweck eines VPN sauber planen.", "Ohne geschuetzte Verbindung werden interne Dienste und Datenverkehr leichter angreifbar.", "Direkte Internetfreigabe", "Ein VPN schuetzt den Transport in einem Tunnel, eine direkte Freigabe stellt Dienste offen ins Netz.", "Ein VPN ist nur ein anderer Begriff fuer jedes beliebige WLAN."),
]


def rotate(items: list[dict], offset: int) -> list[dict]:
    if not items:
        return []
    real_offset = offset % len(items)
    return items[real_offset:] + items[:real_offset]


def human_text(text: str) -> str:
    replacements = [
        ("Aender", "Änder"),
        ("aender", "änder"),
        ("Aesthet", "Ästhet"),
        ("aesthet", "ästhet"),
        ("Aeusser", "Äußer"),
        ("aeusser", "äußer"),
        ("Aequivalenz", "Äquivalenz"),
        ("aequivalenz", "äquivalenz"),
        ("Aktivitaet", "Aktivität"),
        ("aktivitaet", "aktivität"),
        ("Atomaritaet", "Atomarität"),
        ("atomaritaet", "atomarität"),
        ("Ablaeuf", "Abläuf"),
        ("ablaeuf", "abläuf"),
        ("abwaeg", "abwäg"),
        ("Abwaeg", "Abwäg"),
        ("Abhaeng", "Abhäng"),
        ("abhaeng", "abhäng"),
        ("Bauchgefuehl", "Bauchgefühl"),
        ("bauchgefuehl", "bauchgefühl"),
        ("Anwendungsfaell", "Anwendungsfäll"),
        ("anwendungsfaell", "anwendungsfäll"),
        ("Authentizitaet", "Authentizität"),
        ("authentizitaet", "authentizität"),
        ("Ausloes", "Auslös"),
        ("ausloes", "auslös"),
        ("bestaet", "bestät"),
        ("Bestaet", "Bestät"),
        ("beruecks", "berücks"),
        ("bezueg", "bezüg"),
        ("Bezueg", "Bezüg"),
        ("Benoet", "Benöt"),
        ("benoet", "benöt"),
        ("Binaer", "Binär"),
        ("binaer", "binär"),
        ("Beschaed", "Beschäd"),
        ("beschaed", "beschäd"),
        ("begruend", "begründ"),
        ("Begruend", "Begründ"),
        ("beschraenk", "beschränk"),
        ("Beschraenk", "Beschränk"),
        ("buendel", "bündel"),
        ("Buendel", "Bündel"),
        ("Durchlaeuf", "Durchläuf"),
        ("durchlaeuf", "durchläuf"),
        ("Datensaetz", "Datensätz"),
        ("datensaetz", "datensätz"),
        ("Datenstaend", "Datenständ"),
        ("datenstaend", "datenständ"),
        ("duerf", "dürf"),
        ("Duerf", "Dürf"),
        ("Einschraenk", "Einschränk"),
        ("einschraenk", "einschränk"),
        ("Entitaet", "Entität"),
        ("entitaet", "entität"),
        ("Entitaeten", "Entitäten"),
        ("entitaeten", "entitäten"),
        ("Einfueg", "Einfüg"),
        ("einfueg", "einfüg"),
        ("Faehig", "Fähig"),
        ("faehig", "fähig"),
        ("Faell", "Fäll"),
        ("faell", "fäll"),
        ("Fremdschluessel", "Fremdschlüssel"),
        ("fremdschluessel", "fremdschlüssel"),
        ("Fuer", "Für"),
        ("fuer", "für"),
        ("Fuehr", "Führ"),
        ("fuehr", "führ"),
        ("fueg", "füg"),
        ("Fueg", "Füg"),
        ("fuell", "füll"),
        ("Fuell", "Füll"),
        ("fragwuerd", "fragwürd"),
        ("Fragwuerd", "Fragwürd"),
        ("frueh", "früh"),
        ("Frueh", "Früh"),
        ("erfuell", "erfüll"),
        ("Erfuell", "Erfüll"),
        ("erhoeh", "erhöh"),
        ("Erhoeh", "Erhöh"),
        ("faelsch", "fälsch"),
        ("Faelsch", "Fälsch"),
        ("gefaelsch", "gefälsch"),
        ("Gefaelsch", "Gefälsch"),
        ("gehoer", "gehör"),
        ("Gehoer", "Gehör"),
        ("Geschaeft", "Geschäft"),
        ("geschaeft", "geschäft"),
        ("gaenge", "gänge"),
        ("Gaenge", "Gänge"),
        ("guelt", "gült"),
        ("Guelt", "Gült"),
        ("Gegenstueck", "Gegenstück"),
        ("gegenstueck", "gegenstück"),
        ("haeng", "häng"),
        ("Haeng", "Häng"),
        ("Hauefig", "Häufig"),
        ("hauefig", "häufig"),
        ("haeufig", "häufig"),
        ("Haeufig", "Häufig"),
        ("haelt", "hält"),
        ("Haelt", "Hält"),
        ("heisst", "heißt"),
        ("Heisst", "Heißt"),
        ("groess", "größ"),
        ("Groess", "Größ"),
        ("Integritaet", "Integrität"),
        ("integritaet", "integrität"),
        ("Komplexitaet", "Komplexität"),
        ("komplexitaet", "komplexität"),
        ("Kardinalitaet", "Kardinalität"),
        ("kardinalitaet", "kardinalität"),
        ("Kardinalitaeten", "Kardinalitäten"),
        ("kardinalitaeten", "kardinalitäten"),
        ("klaer", "klär"),
        ("Klaer", "Klär"),
        ("koenn", "könn"),
        ("Koenn", "Könn"),
        ("kuenst", "künst"),
        ("Kuenst", "Künst"),
        ("laeuf", "läuf"),
        ("Laeuf", "Läuf"),
        ("laess", "läss"),
        ("Laess", "Läss"),
        ("Lueck", "Lück"),
        ("lueck", "lück"),
        ("Loesch", "Lösch"),
        ("loesch", "lösch"),
        ("Loes", "Lös"),
        ("loes", "lös"),
        ("muess", "müss"),
        ("Muess", "Müss"),
        ("Massnahme", "Maßnahme"),
        ("massnahme", "maßnahme"),
        ("maess", "mäß"),
        ("Maess", "Mäß"),
        ("moecht", "möcht"),
        ("Moecht", "Möcht"),
        ("moegl", "mögl"),
        ("Moegl", "Mögl"),
        ("Naeher", "Näher"),
        ("naeher", "näher"),
        ("naech", "näch"),
        ("Naech", "Näch"),
        ("noet", "nöt"),
        ("Noet", "Nöt"),
        ("nuetz", "nütz"),
        ("Nuetz", "Nütz"),
        ("Parallelitaet", "Parallelität"),
        ("parallelitaet", "parallelität"),
        ("Primaer", "Primär"),
        ("primaer", "primär"),
        ("praez", "präz"),
        ("Praez", "Präz"),
        ("oeff", "öff"),
        ("Oeff", "Öff"),
        ("Oberflaech", "Oberfläch"),
        ("oberflaech", "oberfläch"),
        ("pruef", "prüf"),
        ("Pruef", "Prüf"),
        ("Qualitaet", "Qualität"),
        ("qualitaet", "qualität"),
        ("Rueck", "Rück"),
        ("rueck", "rück"),
        ("schluess", "schlüss"),
        ("Schluess", "Schlüss"),
        ("schuetz", "schütz"),
        ("Schuetz", "Schütz"),
        ("spaet", "spät"),
        ("Spaet", "Spät"),
        ("staend", "ständ"),
        ("Staend", "Ständ"),
        ("staerk", "stärk"),
        ("Staerk", "Stärk"),
        ("taeg", "täg"),
        ("Taeg", "Täg"),
        ("tatsaech", "tatsäch"),
        ("Tatsaech", "Tatsäch"),
        ("taeusch", "täusch"),
        ("Taeusch", "Täusch"),
        ("tauesch", "täusch"),
        ("Tauesch", "Täusch"),
        ("hinwegtaeusch", "hinwegtäusch"),
        ("Hinwegtaeusch", "Hinwegtäusch"),
        ("stoe", "stö"),
        ("Stoe", "Stö"),
        ("unguenst", "ungünst"),
        ("Unguenst", "Ungünst"),
        ("unzuverlaess", "unzuverläss"),
        ("Unzuverlaess", "Unzuverläss"),
        ("unnoet", "unnöt"),
        ("Unnoet", "Unnöt"),
        ("ueber", "über"),
        ("Ueber", "Über"),
        ("uebrig", "übrig"),
        ("Uebrig", "Übrig"),
        ("Umsaetz", "Umsätz"),
        ("umsaetz", "umsätz"),
        ("Urlaubseintraeg", "Urlaubseinträg"),
        ("urlaubseintraeg", "urlaubseinträg"),
        ("verlaess", "verläss"),
        ("Verlaess", "Verläss"),
        ("verstaend", "verständ"),
        ("Verstaend", "Verständ"),
        ("Vererbungsbaeum", "Vererbungsbäum"),
        ("vererbungsbaeum", "vererbungsbäum"),
        ("verfueg", "verfüg"),
        ("Verfueg", "Verfüg"),
        ("verknuepf", "verknüpf"),
        ("Verknuepf", "Verknüpf"),
        ("vertrauenswuerdig", "vertrauenswürdig"),
        ("Vertrauenswuerdig", "Vertrauenswürdig"),
        ("vollstaend", "vollständ"),
        ("Vollstaend", "Vollständ"),
        ("aufwaend", "aufwend"),
        ("Aufwaend", "Aufwend"),
        ("waehl", "wähl"),
        ("Waehl", "Wähl"),
        ("waer", "wär"),
        ("Waer", "Wär"),
        ("wuensch", "wünsch"),
        ("Wuensch", "Wünsch"),
        ("zaehl", "zähl"),
        ("Zaehl", "Zähl"),
        ("Zustaend", "Zuständ"),
        ("zustaend", "zuständ"),
        ("zusaetz", "zusätz"),
        ("Zusaetz", "Zusätz"),
        ("zusammenhaeng", "zusammenhäng"),
        ("Zusammenhaeng", "Zusammenhäng"),
        ("zugehoer", "zugehör"),
        ("Zugehoer", "Zugehör"),
        ("zurueck", "zurück"),
        ("Zurueck", "Zurück"),
        ("zweckmaess", "zweckmäß"),
        ("Zweckmaess", "Zweckmäß"),
        ("Widerspruech", "Widersprüch"),
        ("widerspruech", "widersprüch"),
    ]
    result = text
    for source, target in replacements:
        result = result.replace(source, target)
    return result


def option(text: str, correct: bool, explanation: str) -> dict[str, object]:
    return {
        "text": human_text(text),
        "correct": correct,
        "explanation": human_text(explanation),
    }


def with_option_ids(options: list[dict[str, object]], seed: int) -> list[dict[str, object]]:
    ordered = rotate(options, seed)
    labelled: list[dict[str, object]] = []
    for idx, entry in enumerate(ordered):
        copy = dict(entry)
        copy["id"] = chr(ord("a") + idx)
        labelled.append(copy)
    return labelled


def cluster_peers(concept_item: dict[str, str], concepts_by_cluster: dict[str, list[dict[str, str]]], count: int, offset: int) -> list[dict[str, str]]:
    peers = [item for item in concepts_by_cluster[concept_item["cluster"]] if item["id"] != concept_item["id"]]
    return rotate(peers, offset)[:count]


def scenario_for(concept_item: dict[str, str], index: int) -> str:
    scenarios = CLUSTER_SCENARIOS[concept_item["cluster"]]
    return scenarios[index % len(scenarios)]


def term_forms(term: str) -> dict[str, str]:
    pretty = human_text(term)
    lower = pretty.lower()
    phrase_overrides = {
        "select": {"pretty": pretty, "nom": "das SELECT-Statement", "acc": "das SELECT-Statement", "dat": "dem SELECT-Statement"},
        "insert": {"pretty": pretty, "nom": "das INSERT-Statement", "acc": "das INSERT-Statement", "dat": "dem INSERT-Statement"},
        "update": {"pretty": pretty, "nom": "das UPDATE-Statement", "acc": "das UPDATE-Statement", "dat": "dem UPDATE-Statement"},
        "delete": {"pretty": pretty, "nom": "das DELETE-Statement", "acc": "das DELETE-Statement", "dat": "dem DELETE-Statement"},
        "group by": {"pretty": pretty, "nom": "die GROUP-BY-Klausel", "acc": "die GROUP-BY-Klausel", "dat": "der GROUP-BY-Klausel"},
        "having": {"pretty": pretty, "nom": "die HAVING-Klausel", "acc": "die HAVING-Klausel", "dat": "der HAVING-Klausel"},
        "inner join": {"pretty": pretty, "nom": "der INNER JOIN", "acc": "den INNER JOIN", "dat": "dem INNER JOIN"},
        "left join": {"pretty": pretty, "nom": "der LEFT JOIN", "acc": "den LEFT JOIN", "dat": "dem LEFT JOIN"},
        "union all": {"pretty": pretty, "nom": "der Operator UNION ALL", "acc": "den Operator UNION ALL", "dat": "dem Operator UNION ALL"},
        "create table": {"pretty": pretty, "nom": "das CREATE-TABLE-Statement", "acc": "das CREATE-TABLE-Statement", "dat": "dem CREATE-TABLE-Statement"},
        "create index": {"pretty": pretty, "nom": "das CREATE-INDEX-Statement", "acc": "das CREATE-INDEX-Statement", "dat": "dem CREATE-INDEX-Statement"},
        "grant": {"pretty": pretty, "nom": "das GRANT-Statement", "acc": "das GRANT-Statement", "dat": "dem GRANT-Statement"},
        "revoke": {"pretty": pretty, "nom": "das REVOKE-Statement", "acc": "das REVOKE-Statement", "dat": "dem REVOKE-Statement"},
        "rest": {"pretty": pretty, "nom": "das REST-Prinzip", "acc": "das REST-Prinzip", "dat": "dem REST-Prinzip"},
        "json": {"pretty": pretty, "nom": "das JSON-Format", "acc": "das JSON-Format", "dat": "dem JSON-Format"},
        "xml": {"pretty": pretty, "nom": "das XML-Format", "acc": "das XML-Format", "dat": "dem XML-Format"},
        "code coverage": {"pretty": pretty, "nom": "die Code Coverage", "acc": "die Code Coverage", "dat": "der Code Coverage"},
        "factory method": {"pretty": pretty, "nom": "die Factory Method", "acc": "die Factory Method", "dat": "der Factory Method"},
        "ci/cd": {"pretty": pretty, "nom": "das CI/CD-Prinzip", "acc": "das CI/CD-Prinzip", "dat": "dem CI/CD-Prinzip"},
        "vpn": {"pretty": pretty, "nom": "das VPN", "acc": "das VPN", "dat": "dem VPN"},
    }
    if lower in phrase_overrides:
        return phrase_overrides[lower]
    overrides = {
        "algorithmus": "m",
        "pseudocode": "m",
        "schreibtischtest": "m",
        "greedy-algorithmus": "m",
        "sortieralgorithmus": "m",
        "kontrollstruktur": "f",
        "primärschlüssel": "m",
        "fremdschlüssel": "m",
        "datentyp": "m",
        "inner join": "m",
        "left join": "m",
        "group by": "f",
        "having": "f",
        "select": "n",
        "insert": "n",
        "update": "n",
        "delete": "n",
        "union all": "n",
        "create table": "n",
        "create index": "n",
        "grant": "n",
        "revoke": "n",
        "rest": "n",
        "json": "n",
        "xml": "n",
        "code coverage": "f",
        "user story": "f",
        "factory method": "f",
        "observer": "m",
        "workshop": "m",
        "scrum": "n",
        "ci/cd": "n",
        "backup": "n",
        "change management": "n",
        "vpn": "n",
    }
    if lower in overrides:
        gender = overrides[lower]
    elif lower.endswith(("diagramm", "modell", "system", "schema", "format", "konzept")):
        gender = "n"
    elif lower.endswith(
        (
            "ung",
            "keit",
            "heit",
            "ion",
            "tät",
            "form",
            "suche",
            "schleife",
            "bedingung",
            "struktur",
            "anomalie",
            "vererbung",
            "polymorphie",
            "objektorientierung",
            "integrität",
            "verfügbarkeit",
            "vertraulichkeit",
            "authentifizierung",
            "autorisierung",
            "verschlüsselung",
            "signatur",
            "barrierefreiheit",
            "versionsverwaltung",
            "archivierung",
            "datenqualität",
            "risikoanalyse",
            "rekursion",
            "iteration",
            "assoziation",
            "komposition",
            "kardinalität",
            "transaktion",
        )
    ):
        gender = "f"
    else:
        gender = "m"

    if gender == "m":
        return {"pretty": pretty, "nom": f"der {pretty}", "acc": f"den {pretty}", "dat": f"dem {pretty}"}
    if gender == "f":
        return {"pretty": pretty, "nom": f"die {pretty}", "acc": f"die {pretty}", "dat": f"der {pretty}"}
    return {"pretty": pretty, "nom": f"das {pretty}", "acc": f"das {pretty}", "dat": f"dem {pretty}"}


def bare(text: str) -> str:
    return text.strip().rstrip(".!?")


def emphasized_line(text: str) -> str:
    return f'Wichtig ist vor allem: {bare(text)}.'


def risk_line(text: str) -> str:
    return f'Dann droht vor allem: {bare(text)}.'


def stable_index(key: str, size: int) -> int:
    if size <= 0:
        return 0
    return sum(ord(ch) for ch in key) % size


def choose_by_key(items: list[str], key: str) -> str:
    return items[stable_index(key, len(items))]


def badge_for_question(question_kind: str, question_id: str) -> str:
    return choose_by_key(BADGE_POOL_BY_KIND[question_kind], question_id)


def question(
    question_id: str,
    concept_id: str,
    variant_id: str,
    interaction_type: str,
    question_kind: str,
    prompt: str,
    options: list[dict[str, object]],
    max_selections: int = 1,
) -> dict[str, object]:
    data = {
        "id": question_id,
        "conceptId": concept_id,
        "variantId": variant_id,
        "interactionType": interaction_type,
        "questionKind": question_kind,
        "badgeLabel": human_text(badge_for_question(question_kind, question_id)),
        "prompt": human_text(prompt),
        "options": options,
    }
    if interaction_type in {"single", "multi", "best", "binary"}:
        data["maxSelections"] = max_selections
    return data


def build_questions() -> list[dict[str, object]]:
    concepts_by_cluster: dict[str, list[dict[str, str]]] = {}
    for item in CONCEPTS:
        concepts_by_cluster.setdefault(item["cluster"], []).append(item)

    questions: list[dict[str, object]] = []

    for index, item in enumerate(CONCEPTS):
        peers = cluster_peers(item, concepts_by_cluster, 4, index + 1)
        scenario = scenario_for(item, index)
        pretty_term = human_text(item["term"])
        definition_prompt_templates = [
            "Welche Aussage beschreibt am treffendsten, was mit dem Thema {term} gemeint ist?",
            "Welche Erklärung passt fachlich am besten zu {term}?",
            "Welche Einordnung trifft {term} am saubersten?",
            "Wofür steht {term} in der Fachsprache am ehesten?",
            "Welche Beschreibung bringt {term} am besten auf den Punkt?",
        ]
        example_prompt_templates = [
            "Welcher Mini-Fall passt am ehesten zu {term}?",
            "Welche kurze Situation zeigt {term} am besten?",
            "Woran würdest du {term} in einem Fallbeispiel erkennen?",
            "Welche Beschreibung ist der sauberste Treffer für {term}?",
            "Welcher Fall gehört fachlich zu {term}?",
        ]
        counter_prompt_templates = [
            "Welcher Fall passt gerade nicht zum Thema {term}?",
            "Welche Situation wäre für {term} der falsche Treffer?",
            "Welcher Mini-Fall verfehlt {term} am deutlichsten?",
            "Was wäre hier kein passendes Beispiel für {term}?",
            "Welche Beschreibung gehört nicht zu {term}?",
        ]
        binary_prompt_templates = [
            "Prüfe diese Aussage zu {term}: {statement}",
            "Wie würdest du diese Aussage zu {term} bewerten? {statement}",
            "Ist diese Einordnung zu {term} tragfähig? {statement}",
            "Trifft diese Aussage auf {term} zu? {statement}",
            "Ist das fachlich richtig für {term}? {statement}",
        ]
        action_prompt_templates = [
            "In {scenario} entsteht Unsicherheit bei {term}. Was ist jetzt der sinnvollste Schritt?",
            "Ein Team arbeitet an {scenario}. Welche Maßnahme hilft bei {term} am meisten?",
            "Für {scenario} soll {term} sauber umgesetzt werden. Welches Vorgehen passt am besten?",
            "Welche Reaktion bringt {term} in {scenario} am ehesten voran?",
            "In {scenario} hakt es bei {term}. Was sollte als Nächstes passieren?",
        ]
        bonus_prompt_templates = [
            "Praxischeck zu {term} in {scenario}: Welche Linie trägt fachlich am weitesten?",
            "Welche Aussage hält {term} in {scenario} am ehesten auf Kurs?",
            "Im Fall {scenario}: Welche Option passt fachlich am besten zu {term}?",
            "Welche Entscheidung ist in {scenario} für {term} am tragfähigsten?",
            "Worauf sollte das Team in {scenario} bei {term} am ehesten setzen?",
        ]
        bonus_risk_prompt_templates = [
            "Worauf muss das Team in {scenario} bei {term} besonders achten?",
            "Welches Risiko liegt in {scenario} bei {term} am ehesten nahe?",
            "Welche Folge droht in {scenario}, wenn {term} unsauber bleibt?",
            "Was kann in {scenario} bei {term} am schnellsten schiefgehen?",
            "Welches Problem steht bei {term} in {scenario} am ehesten im Raum?",
        ]
        bonus_prevent_prompt_templates = [
            "Was hält in {scenario} das Risiko bei {term} am ehesten klein?",
            "Welche Maßnahme schützt {term} in {scenario} am wirksamsten vor Problemen?",
            "Womit beugt das Team in {scenario} typischen Fehlern bei {term} am besten vor?",
            "Welche Reaktion stabilisiert {term} in {scenario} am ehesten?",
            "Was hilft in {scenario} am meisten, {term} sauber abzusichern?",
        ]
        consequence_prompt_templates = [
            "Welche Folge liegt am nächsten, wenn {term} bei {scenario} unsauber behandelt wird?",
            "Womit ist bei {scenario} am ehesten zu rechnen, wenn {term} missachtet wird?",
            "Welches Problem entsteht am leichtesten, wenn {term} in {scenario} schlecht umgesetzt ist?",
            "Welche Auswirkung passt am besten zu einer schwachen Umsetzung von {term} in {scenario}?",
            "Wenn {term} bei {scenario} untergeht, welches Risiko drängt sich auf?",
        ]
        missing_prompt_templates = [
            "In {scenario} gilt schon: {example} Was ergänzt {term} jetzt am besten?",
            "Bei {scenario} wurde schon erkannt: {example} Welche Ergänzung ist für {term} jetzt am wichtigsten?",
            "Aus {example} ist schon etwas klar. Welcher Baustein fehlt bei {term} noch?",
            "In {scenario} ist folgendes Teilwissen vorhanden: {example} Was vervollständigt {term} am besten?",
            "Welche Ergänzung schließt bei {scenario} die wichtigste Lücke rund um {term}, wenn schon gilt: {example}?",
        ]
        multi_prompt_templates = [
            "Welche Aussagen passen zum Thema {term}?",
            "Welche zwei Aussagen treffen auf das Thema {term} zu?",
            "Wo liegen bei {term} die richtigen Treffer?",
            "Welche Aussagen kannst du {term} sauber zuordnen?",
            "Welche Punkte sind für {term} fachlich richtig?",
        ]
        error_prompt_templates = [
            "In welcher Aussage steckt der fachliche Irrtum zu {term}?",
            "Welche Aussage führt bei {term} in die falsche Richtung?",
            "Wo wird {term} klar falsch verstanden?",
            "Welche Einordnung zu {term} ist nicht tragfähig?",
            "Welche Option kippt bei {term} fachlich ins Falsche?",
        ]
        goal_prompt_templates = [
            "Welche Option hilft am ehesten, {term} in {scenario} sauber umzusetzen?",
            "Welcher Schritt unterstützt {term} in {scenario} am wirksamsten?",
            "Was bringt {term} in {scenario} am ehesten in eine saubere Umsetzung?",
            "Welche Handlung bringt {term} in {scenario} fachlich am besten voran?",
            "Welches Vorgehen stützt {term} in {scenario} am deutlichsten?",
        ]

        term_prompt_templates = [
            "Welcher Begriff passt am besten zu dieser Beschreibung: {definition}?",
            "Welcher Fachbegriff ist hier gemeint: {definition}?",
            "Wie heisst das Konzept, das am ehesten so beschrieben wird: {definition}?",
            "Wie nennt man in der Fachsprache Folgendes: {definition}?",
            "Welcher Begriff trifft diese Beschreibung am saubersten: {definition}?",
        ]
        term_prompt = choose_by_key(term_prompt_templates, f'{item["id"]}:term').format(definition=item["definition"])
        term_options = [
            option(
                item["term"],
                True,
                f'Richtig, weil {item["term"]} genau {bare(item["definition"])} bezeichnet.',
            )
        ] + [
            option(
                peer["term"],
                False,
                f'Falsch, weil {peer["term"]} {bare(peer["definition"])} bezeichnet; gesucht war aber der Begriff für {bare(item["definition"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_term',
                item["id"],
                f'{item["id"]}_term_v1',
                "single",
                "begriff_zu_definition",
                term_prompt,
                with_option_ids(term_options, index),
            )
        )

        definition_prompt = choose_by_key(definition_prompt_templates, f'{item["id"]}:definition').format(term=pretty_term)
        definition_options = [
            option(
                item["definition"],
                True,
                f'Richtig, weil diese Beschreibung genau {item["term"]} trifft: {bare(item["definition"])}.',
            )
        ] + [
            option(
                peer["definition"],
                False,
                f'Falsch, weil diese Beschreibung {peer["term"]} meint: {bare(peer["definition"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_definition',
                item["id"],
                f'{item["id"]}_definition_v1',
                "single",
                "definition_zu_begriff",
                definition_prompt,
                with_option_ids(definition_options, index + 1),
            )
        )

        example_prompt = choose_by_key(example_prompt_templates, f'{item["id"]}:example').format(term=pretty_term)
        example_options = [
            option(
                item["example"],
                True,
                f'Richtig, weil der Fall die Merkmale von {item["term"]} zeigt: {bare(item["definition"])}.',
            )
        ] + [
            option(
                peer["example"],
                False,
                f'Falsch, weil der Fall eher {peer["term"]} zeigt. Für {item["term"]} wären Merkmale wie {bare(item["definition"])} entscheidend.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_example',
                item["id"],
                f'{item["id"]}_example_v1',
                "single",
                "beispiel_erkennen",
                example_prompt,
                with_option_ids(example_options, index + 2),
            )
        )

        counter_prompt = choose_by_key(counter_prompt_templates, f'{item["id"]}:counter').format(term=pretty_term)
        counter_options = [
            option(
                item["non_example"],
                True,
                f'Richtig, weil hier die Merkmale von {item["term"]} gerade fehlen: {bare(item["definition"])}.',
            )
        ] + [
            option(
                peer["example"],
                False,
                f'Nicht die beste Wahl, weil der Fall eher {peer["term"]} zeigt. Das gesuchte Gegenbeispiel muss die Merkmale von {item["term"]} deutlicher verfehlen.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_counter',
                item["id"],
                f'{item["id"]}_counter_v1',
                "single",
                "gegenbeispiel_erkennen",
                counter_prompt,
                with_option_ids(counter_options, index + 3),
            )
        )

        truthful = index % 2 == 0
        truth_statement = f'Gemeint ist {item["definition"]}.'
        misconception_statement = f'Es ist im Kern dasselbe wie {item["contrast_term"]}.'
        binary_statement = truth_statement if truthful else misconception_statement
        if truthful:
            binary_options = [
                option("Ja", True, f'Richtig, weil die Aussage {item["term"]} zutreffend beschreibt: {bare(item["definition"])}.'),
                option("Nein", False, f'Falsch, weil die Aussage {item["term"]} korrekt beschreibt: {bare(item["definition"])}.'),
            ]
        else:
            binary_options = [
                option("Ja", False, f'Falsch, weil {item["term"]} nicht mit {item["contrast_term"]} gleichgesetzt werden darf. {bare(item["contrast_diff"])}.'),
                option("Nein", True, f'Richtig, weil hier eine Verwechslung mit {item["contrast_term"]} vorliegt. {bare(item["contrast_diff"])}.'),
            ]
        binary_prompt = choose_by_key(binary_prompt_templates, f'{item["id"]}:binary').format(
            term=pretty_term, statement=binary_statement
        )
        questions.append(
            question(
                f'{item["id"]}_binary',
                item["id"],
                f'{item["id"]}_binary_v1',
                "binary",
                "aussage_bewerten",
                binary_prompt,
                with_option_ids(binary_options, index + 4),
            )
        )

        action_prompt = choose_by_key(action_prompt_templates, f'{item["id"]}:action').format(
            scenario=scenario, term=pretty_term
        )
        action_options = [
            option(
                item["best_practice"],
                True,
                f'Richtig, weil diese Maßnahme genau das stärkt, worauf es bei {item["term"]} ankommt: {bare(item["best_practice"])}.',
            )
        ] + [
            option(
                peer["best_practice"],
                False,
                f'Falsch, weil die Maßnahme vor allem zu {peer["term"]} passt. Für {item["term"]} wäre hier wichtiger: {bare(item["best_practice"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_action',
                item["id"],
                f'{item["id"]}_action_v1',
                "best",
                "passende_massnahme_auswaehlen",
                action_prompt,
                with_option_ids(action_options, index + 5),
            )
        )

        consequence_prompt = choose_by_key(consequence_prompt_templates, f'{item["id"]}:consequence').format(
            scenario=scenario, term=pretty_term
        )
        consequence_options = [
            option(
                item["risk"],
                True,
                f'Richtig, weil bei unsauberer Umsetzung von {item["term"]} genau dieses Problem droht: {bare(item["risk"])}.',
            )
        ] + [
            option(
                peer["risk"],
                False,
                f'Falsch, weil diese Folge eher bei {peer["term"]} typisch ist. Bei {item["term"]} droht eher: {bare(item["risk"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_consequence',
                item["id"],
                f'{item["id"]}_consequence_v1',
                "single",
                "ursache_folge_erkennen",
                consequence_prompt,
                with_option_ids(consequence_options, index + 6),
            )
        )

        comparison_prompt_templates = [
            "Worin liegt der wichtigste Unterschied zwischen {term} und {contrast}?",
            "Welche Aussage grenzt {term} am besten von {contrast} ab?",
            "Was trennt {term} fachlich am klarsten von {contrast}?",
            "Woran erkennst du am ehesten den Unterschied zwischen {term} und {contrast}?",
            "Welche Abgrenzung passt sauber zwischen {term} und {contrast}?",
        ]
        comparison_prompt = choose_by_key(comparison_prompt_templates, f'{item["id"]}:compare').format(
            term=item["term"], contrast=item["contrast_term"]
        )
        comparison_options = [
            option(
                item["contrast_diff"],
                True,
                f'Richtig, weil genau daran sich {item["term"]} von {item["contrast_term"]} trennt: {bare(item["contrast_diff"])}.',
            )
        ] + [
            option(
                peer["contrast_diff"],
                False,
                f'Falsch, weil diese Unterscheidung zu {peer["term"]} und {peer["contrast_term"]} gehört. Gefragt war aber der Unterschied zwischen {item["term"]} und {item["contrast_term"]}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_compare',
                item["id"],
                f'{item["id"]}_compare_v1',
                "single",
                "vergleich_treffen",
                comparison_prompt,
                with_option_ids(comparison_options, index + 7),
            )
        )

        missing_prompt = choose_by_key(missing_prompt_templates, f'{item["id"]}:missing').format(
            scenario=scenario, example=item["example"], term=pretty_term
        )
        missing_options = [
            option(
                item["best_practice"],
                True,
                f'Richtig, weil zum bisherigen Stand noch genau dieser Schritt fehlt: {bare(item["best_practice"])}.',
            )
        ] + [
            option(
                peer["best_practice"],
                False,
                f'Falsch, weil der Punkt eher {peer["term"]} betrifft. Für {item["term"]} fehlt hier stattdessen: {bare(item["best_practice"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_missing',
                item["id"],
                f'{item["id"]}_missing_v1',
                "single",
                "was_fehlt",
                missing_prompt,
                with_option_ids(missing_options, index + 8),
            )
        )

        multi_prompt = choose_by_key(multi_prompt_templates, f'{item["id"]}:multi').format(term=pretty_term)
        multi_options = [
            option(
                f'Gemeint ist {item["definition"]}.',
                True,
                f'Richtig, weil das die Definition von {item["term"]} ist: {bare(item["definition"])}.',
            ),
            option(
                f'Im passenden Einsatz hilft besonders: {bare(item["best_practice"])}.',
                True,
                f'Richtig, weil diese Maßnahme {item["term"]} sauber umsetzbar macht: {bare(item["best_practice"])}.',
            ),
            option(
                f'Es ist im Kern dasselbe wie {item["contrast_term"]}.',
                False,
                f'Falsch, weil {item["term"]} nicht dasselbe ist wie {item["contrast_term"]}. {bare(item["contrast_diff"])}.',
            ),
            option(
                f'Es braucht dafür keine saubere Abgrenzung gegenüber {item["contrast_term"]}.',
                False,
                f'Falsch, weil die Abgrenzung zu {item["contrast_term"]} nötig ist. Sonst wird {item["term"]} falsch eingeordnet.',
            ),
        ]
        questions.append(
            question(
                f'{item["id"]}_multi',
                item["id"],
                f'{item["id"]}_multi_v1',
                "multi",
                "mehrere_richtige_antworten_waehlen",
                multi_prompt,
                with_option_ids(multi_options, index + 9),
                max_selections=2,
            )
        )

        error_prompt = choose_by_key(error_prompt_templates, f'{item["id"]}:error').format(term=pretty_term)
        error_options = [
            option(
                f'Es ist im Kern dasselbe wie {item["contrast_term"]}.',
                True,
                f'Richtig gewählt, weil genau hier die Verwechslung steckt: {item["term"]} ist nicht dasselbe wie {item["contrast_term"]}. {bare(item["contrast_diff"])}.',
            ),
            option(
                f'Gemeint ist {item["definition"]}.',
                False,
                f'Falsch gewählt, weil der Satz {item["term"]} korrekt beschreibt: {bare(item["definition"])}.',
            ),
            option(
                item["example"],
                False,
                f'Falsch gewählt, weil der beschriebene Fall die Merkmale von {item["term"]} zeigt: {bare(item["definition"])}.',
            ),
            option(
                item["best_practice"],
                False,
                f'Falsch gewählt, weil die Maßnahme sinnvoll ist, wenn {item["term"]} sauber umgesetzt werden soll: {bare(item["best_practice"])}.',
            ),
        ]
        questions.append(
            question(
                f'{item["id"]}_error',
                item["id"],
                f'{item["id"]}_error_v1',
                "single",
                "fehler_finden",
                error_prompt,
                with_option_ids(error_options, index + 10),
            )
        )

        goal_prompt = choose_by_key(goal_prompt_templates, f'{item["id"]}:goal').format(
            scenario=scenario, term=pretty_term
        )
        goal_options = [
            option(
                item["best_practice"],
                True,
                f'Richtig, weil diese Maßnahme das Ziel direkt unterstützt: {bare(item["best_practice"])}.',
            )
        ] + [
            option(
                peer["best_practice"],
                False,
                f'Falsch, weil die Maßnahme eher {peer["term"]} verbessert. Für {item["term"]} wäre zielführender: {bare(item["best_practice"])}.',
            )
            for peer in peers[:3]
        ]
        questions.append(
            question(
                f'{item["id"]}_goal',
                item["id"],
                f'{item["id"]}_goal_v1',
                "single",
                "ziel_mittel_zuordnung",
                goal_prompt,
                with_option_ids(goal_options, index + 11),
            )
        )

        if index < BONUS_QUESTION_COUNT:
            bonus_prompt = choose_by_key(bonus_prompt_templates, f'{item["id"]}:bonus').format(
                scenario=scenario, term=pretty_term
            )
            bonus_options = [
                option(
                    emphasized_line(item["best_practice"]),
                    True,
                    f'Richtig, weil diese Linie {item["term"]} in {scenario} fachlich sauber trägt: {bare(item["best_practice"])}.',
                )
            ] + [
                option(
                    emphasized_line(peer["best_practice"]),
                    False,
                    f'Falsch, weil die Linie eher zu {peer["term"]} passt. Für {item["term"]} wäre tragfähiger: {bare(item["best_practice"])}.',
                )
                for peer in peers[:3]
            ]
            questions.append(
                question(
                    f'{item["id"]}_bonus',
                    item["id"],
                    f'{item["id"]}_bonus_v1',
                    "best",
                    "beste_option_im_mini_szenario",
                    bonus_prompt,
                    with_option_ids(bonus_options, index + 12),
                )
            )

            bonus_risk_prompt = choose_by_key(bonus_risk_prompt_templates, f'{item["id"]}:bonus_risk').format(
                scenario=scenario, term=pretty_term
            )
            bonus_risk_options = [
                option(
                    risk_line(item["risk"]),
                    True,
                    f'Richtig, weil dieses Problem bei unsauberem {item["term"]} in {scenario} am ehesten entsteht: {bare(item["risk"])}.',
                )
            ] + [
                option(
                    risk_line(peer["risk"]),
                    False,
                    f'Falsch, weil dieses Risiko eher zu {peer["term"]} passt. Für {item["term"]} wäre typischer: {bare(item["risk"])}.',
                )
                for peer in peers[:3]
            ]
            questions.append(
                question(
                    f'{item["id"]}_bonus_risk',
                    item["id"],
                    f'{item["id"]}_bonus_risk_v1',
                    "single",
                    "ursache_folge_erkennen",
                    bonus_risk_prompt,
                    with_option_ids(bonus_risk_options, index + 13),
                )
            )

            bonus_prevent_prompt = choose_by_key(
                bonus_prevent_prompt_templates, f'{item["id"]}:bonus_prevent'
            ).format(scenario=scenario, term=pretty_term)
            bonus_prevent_options = [
                option(
                    emphasized_line(item["best_practice"]),
                    True,
                    f'Richtig, weil diese Maßnahme das Risiko bei {item["term"]} in {scenario} am besten klein hält: {bare(item["best_practice"])}.',
                )
            ] + [
                option(
                    emphasized_line(peer["best_practice"]),
                    False,
                    f'Falsch, weil die Maßnahme eher {peer["term"]} stabilisiert. Für {item["term"]} wäre wirksamer: {bare(item["best_practice"])}.',
                )
                for peer in peers[:3]
            ]
            questions.append(
                question(
                    f'{item["id"]}_bonus_prevent',
                    item["id"],
                    f'{item["id"]}_bonus_prevent_v1',
                    "best",
                    "passende_massnahme_auswaehlen",
                    bonus_prevent_prompt,
                    with_option_ids(bonus_prevent_options, index + 14),
                )
            )

    return questions


def cleanup_existing_quizzes() -> None:
    QUIZ_SUBDIR.mkdir(parents=True, exist_ok=True)
    MIRROR_QUIZ_SUBDIR.mkdir(parents=True, exist_ok=True)
    for path in QUIZ_DIR.rglob("quiz*.json"):
        if path in {QUIZ_FILE, MANIFEST_FILE}:
            continue
        path.unlink()
    for directory in sorted((path for path in QUIZ_DIR.rglob("*") if path.is_dir()), reverse=True):
        if directory in {QUIZ_DIR, QUIZ_SUBDIR}:
            continue
        try:
            directory.rmdir()
        except OSError:
            pass


def write_quiz_package(quiz: dict[str, object], manifest: dict[str, object]) -> None:
    payload = json.dumps(quiz, indent=2, ensure_ascii=False) + "\n"
    manifest_payload = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    QUIZ_FILE.write_text(payload, encoding="utf-8")
    MANIFEST_FILE.write_text(manifest_payload, encoding="utf-8")
    MIRROR_QUIZ_FILE.write_text(payload, encoding="utf-8")
    MIRROR_MANIFEST_FILE.write_text(manifest_payload, encoding="utf-8")


def main() -> None:
    questions = build_questions()
    cleanup_existing_quizzes()

    quiz = {
        "scenarioFolder": "Pruefungsvorbereitung-2-FIAE-Scenarien",
        "quizFolder": "Pruefungsvorbereitung-2-FIAE-Quiz",
        "ticketId": "pv2_fiae_gesamtpool.json",
        "versionId": "V01",
        "title": human_text("AP2 FIAE Gesamtpool"),
        "description": human_text("Breiter Wiederholungspool zu Algorithmen, Modellierung, SQL, Testen, Sicherheit, Architektur und weiteren AP2-FIAE-Themen."),
        "topics": [human_text(topic) for topic in ROOT_TOPICS],
        "defaultInteractionType": "single",
        "defaultQuestionKind": "eine_richtige_antwort_waehlen",
        "defaultBadgeLabel": human_text("Lernkarte"),
        "quizFile": "quiz_ap2_fiae_gesamtpool/quiz01_V01_ap2_fiae_gesamtpool.json",
        "questions": questions,
    }

    interaction_types = sorted({item["interactionType"] for item in questions})
    question_kinds = sorted({item["questionKind"] for item in questions})

    manifest = {
        "scenarioFolder": "Pruefungsvorbereitung-2-FIAE-Scenarien",
        "quizFolder": "Pruefungsvorbereitung-2-FIAE-Quiz",
        "items": [
            {
                "file": "quiz_ap2_fiae_gesamtpool/quiz01_V01_ap2_fiae_gesamtpool.json",
                "label": human_text("AP2 FIAE Gesamtpool"),
                "ticketId": "pv2_fiae_gesamtpool.json",
                "versionId": "V01",
                "questionCount": len(questions),
                "topics": [human_text(topic) for topic in ROOT_TOPICS],
                "interactionTypes": interaction_types,
                "questionKinds": question_kinds,
                "dominantBadge": human_text("Lernkarte"),
            }
        ],
    }

    write_quiz_package(quiz, manifest)

    print(f"Wrote {len(questions)} questions to {QUIZ_FILE}")


if __name__ == "__main__":
    main()
