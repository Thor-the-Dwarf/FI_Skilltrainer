#!/usr/bin/env python3

from __future__ import annotations


def spec(
    title: str,
    prompt: str,
    correct_text: str,
    wrong_texts: list[str],
    correct_explanation: str,
) -> dict[str, object]:
    return {
        "title": title,
        "prompt": prompt,
        "correct_text": correct_text,
        "wrong_texts": wrong_texts,
        "correct_explanation": correct_explanation,
    }


SHORT_TEXT_DERIVED_SPECS: dict[str, list[dict[str, object]]] = {
    "ticket_ausbildungsbetrieb_reservierung_erechnung_datenmodell/ticket01_V01_ausbildungsbetrieb_reservierung_erechnung_datenmodell.json#q07": [
        spec(
            "eRechnung: Kernziel",
            "Welche Aussage beschreibt das Hauptziel einer eRechnung in diesem Projektkontext am besten?",
            "Sie stellt strukturierte Rechnungsdaten bereit, die in IT-Systemen vor allem automatisch weiterverarbeitet werden sollen.",
            [
                "Sie soll vor allem wie ein dekoratives PDF für Menschen gestaltet sein.",
                "Sie ersetzt fachliche Prüfungen durch beliebige Freitextnotizen ohne Struktur.",
            ],
            "Richtig, weil die eRechnung vor allem maschinell verarbeitet werden soll; die bloße Lesbarkeit für Menschen ist nicht der Hauptzweck.",
        ),
        spec(
            "eRechnung: Erwarteter Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zur eRechnung am ehesten hinein?",
            "Maschinelle Weiterverarbeitung der Rechnungsdaten in IT-Systemen",
            [
                "Papierformat, Seitenrand und Farbgestaltung der Rechnung",
                "Ausschließlich handschriftliche Freigaben ohne Systemverarbeitung",
            ],
            "Richtig, weil eine starke Antwort den Nutzen strukturierter Daten für die automatische Verarbeitung herausstellen muss.",
        ),
        spec(
            "eRechnung: Passende Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Die Rechnung bleibt zwar lesbar, ihr eigentlicher Mehrwert liegt aber in der automatisierten Verarbeitung.",
            [
                "Je weniger Struktur eine Rechnung hat, desto leichter lässt sie sich digital automatisieren.",
                "Automatisierung ist bei eRechnungen erst nach dem Ausdrucken sinnvoll.",
            ],
            "Richtig, weil die strukturierte elektronische Form gerade dafür gedacht ist, Daten ohne zusätzliche manuelle Erfassung weiterzuverarbeiten.",
        ),
    ],
    "ticket_ausbildungsbetrieb_reservierung_erechnung_datenmodell/ticket01_V01_ausbildungsbetrieb_reservierung_erechnung_datenmodell.json#q10": [
        spec(
            "Schlüsselidee: Kernvorteil",
            "Welche Aussage beschreibt den Vorteil der hybriden oder asymmetrischen Schlüsselidee hier am besten?",
            "Es muss kein gemeinsames Geheimnis vorab an alle Beteiligten verteilt werden, weil mit dem öffentlichen Schlüssel gearbeitet werden kann.",
            [
                "Alle Beteiligten nutzen dauerhaft dasselbe geheime Kennwort und erhalten dadurch mehr Sicherheit.",
                "Der private Schlüssel des Empfängers wird offen an alle Kommunikationspartner verteilt.",
            ],
            "Richtig, weil der öffentliche Schlüssel verteilt werden darf, während der private Schlüssel geheim bleibt und kein gemeinsames Geheimnis unsicher vorab ausgetauscht werden muss.",
        ),
        spec(
            "Schlüsselidee: Fachlicher Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Begründung dieses Vorteils?",
            "Öffentlicher Schlüssel für die Verschlüsselung, privater Schlüssel bleibt geheim",
            [
                "Ein gemeinsamer Klartextschlüssel für alle Clients",
                "Öffentlicher und privater Schlüssel werden gemeinsam veröffentlicht",
            ],
            "Richtig, weil genau diese Trennung den unsicheren Vorabaustausch eines gemeinsamen Geheimnisses vermeidet.",
        ),
        spec(
            "Schlüsselidee: Passende Begründung",
            "Welche Begründung passt in diesem Kontext fachlich am besten?",
            "Dadurch sinkt das Risiko, ein gemeinsames Geheimnis vorab unsicher verteilen zu müssen.",
            [
                "Der Vorteil entsteht vor allem, weil private Schlüssel leichter weitergegeben werden können.",
                "Asymmetrische Verfahren sind nur nützlich, wenn überhaupt keine Schlüssel existieren.",
            ],
            "Richtig, weil hier gerade der problematische Austausch eines identischen Geheimnisses für alle Beteiligten vermieden wird.",
        ),
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q01": [
        spec(
            "Vorgehensmodelle: Grundkategorien",
            "Welche zwei Grundkategorien von Vorgehensmodellen werden in diesem Projekt gegenübergestellt?",
            "Klassisches Projektmanagement und agiles Projektmanagement",
            [
                "Statisches und dynamisches Datenbankmanagement",
                "Analoge und digitale Netzwerktechnik",
            ],
            "Richtig, weil genau diese beiden Organisationsansätze für Projekte fachlich gegenübergestellt werden.",
        ),
        spec(
            "Vorgehensmodelle: Gemeinsamer Nenner",
            "Welcher Gedanke gehört in eine gute Kurzantwort zu dieser Frage?",
            "Es geht um zwei grundlegende Arten, Projekte zu planen und auf Änderungen zu reagieren.",
            [
                "Es geht um zwei Programmiersprachen für die Serveranbindung.",
                "Es geht um zwei Sicherheitsstufen für Quellcode-Repositories.",
            ],
            "Richtig, weil klassisch und agil Organisations- und Planungsansätze für Projekte benennen, nicht technische Einzelwerkzeuge.",
        ),
        spec(
            "Vorgehensmodelle: Begründung",
            "Welche Begründung passt fachlich am besten dazu?",
            "Die Kategorien werden verglichen, um Planungslogik und Änderungsfähigkeit im Projekt sauber einzuordnen.",
            [
                "Die Kategorien beschreiben nur zwei Rollen im Scrum-Team.",
                "Die Kategorien bezeichnen zwei Arten von UML-Diagrammen.",
            ],
            "Richtig, weil der Vergleich gerade zeigt, wie unterschiedlich Anforderungen geplant und Änderungen verarbeitet werden.",
        ),
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q12": [
        spec(
            "Aggregation: Grundverständnis",
            "Welche Aussage erklärt die Aggregation zwischen `Personalverwaltung` und `Fahrer` am treffendsten?",
            "Die Personalverwaltung führt Fahrer als Teile einer Liste, ohne mit ihnen identisch zu sein.",
            [
                "Fahrer können nur gemeinsam mit der Personalverwaltung existieren und gehen mit ihr unter.",
                "Personalverwaltung und Fahrer sind dieselbe Klasse mit zwei verschiedenen Namen.",
            ],
            "Richtig, weil die Verwaltung Fahrer organisatorisch bündelt, die Fahrer aber eigenständige Objekte bleiben.",
        ),
        spec(
            "Aggregation: Passender Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Erklärung dieser Aggregation?",
            "Übergeordnete Einheit mit geführten Fahrern in einer Sammlung",
            [
                "Zwingende Lebenszyklusabhängigkeit wie bei einer Komposition",
                "Reine Vererbung von `Fahrer` auf `Personalverwaltung`",
            ],
            "Richtig, weil Aggregation hier eine Ganzes-Teil-Beziehung mit eigenständigen Teilen beschreibt.",
        ),
        spec(
            "Aggregation: Begründung",
            "Welche Begründung passt in diesem Klassendiagramm am besten?",
            "Die Verwaltung bündelt Fahrer organisatorisch, ohne dass die Fahrer dadurch ihre eigene Identität verlieren.",
            [
                "Aggregation bedeutet hier, dass Fahrer keine eigenen Eigenschaften mehr haben dürfen.",
                "Die Liste zeigt, dass jeder Fahrer automatisch die Personalverwaltung erbt.",
            ],
            "Richtig, weil eine Aggregation gerade keine Identität von Teil und Ganzem gleichsetzt.",
        ),
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q19": [
        spec(
            "Observer-Pattern: Mehrere Anzeigen",
            "Welche Aussage begründet am besten, warum das Observer-Pattern für App, Haltestellenanzeige und Verwaltungssoftware passt?",
            "Ein Subjekt kann mehrere Anzeigen als Beobachter führen und sie bei Zustandsänderungen informieren.",
            [
                "Jede Anzeige muss den Zustand selbst erraten, damit keine Kopplung entsteht.",
                "Nur genau eine Anzeige darf den Zustand eines Objekts sehen.",
            ],
            "Richtig, weil mehrere abhängige Anzeigen bei Änderungen zentral benachrichtigt werden können.",
        ),
        spec(
            "Observer-Pattern: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzbegründung dieses Entwurfsmusters?",
            "Mehrere abhängige Anzeigen reagieren auf Änderungen einer gemeinsamen Quelle",
            [
                "Eine Anzeige ersetzt das beobachtete Objekt vollständig",
                "Beobachter dürfen grundsätzlich nie benachrichtigt werden",
            ],
            "Richtig, weil die Stärke des Musters in der koordinierten Aktualisierung mehrerer Beobachter liegt.",
        ),
        spec(
            "Observer-Pattern: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "So bleiben App, Haltestellenanzeige und Verwaltungssoftware synchron, ohne jeweils eigene Polling-Logik aufzubauen.",
            [
                "Das Pattern ist passend, weil dann überhaupt keine Zustandsänderungen mehr auftreten.",
                "Es passt nur, wenn jede Anzeige ihren eigenen völlig unabhängigen Datenbestand führt.",
            ],
            "Richtig, weil der gemeinsame Zustandswechsel an einer Stelle erkannt und an mehrere Anzeigekanäle weitergegeben wird.",
        ),
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q03": [
        spec(
            "Green IT: Kernverständnis",
            "Welche Aussage ordnet Green IT in diesem Projektkontext fachlich am besten ein?",
            "Green IT bedeutet, IT-Systeme über ihren Lebenszyklus energie- und ressourcenschonend zu planen, zu nutzen und zu betreiben.",
            [
                "Green IT bedeutet vor allem, Geräte grün zu lackieren und Logos anzupassen.",
                "Green IT verlangt, möglichst viele neue Server unabhängig vom Bedarf anzuschaffen.",
            ],
            "Richtig, weil Green IT den sparsamen Umgang mit Energie und Ressourcen über den gesamten Lebenszyklus von IT-Systemen meint.",
        ),
        spec(
            "Green IT: Fachlicher Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu Green IT?",
            "Energie- und Ressourcenschonung im gesamten IT-Lebenszyklus",
            [
                "Maximaler Stromverbrauch für möglichst hohe Leistung",
                "Ausschließlich die Farbe des User Interface",
            ],
            "Richtig, weil Green IT nicht auf Optik, sondern auf nachhaltigen Ressourceneinsatz zielt.",
        ),
        spec(
            "Green IT: Passende Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Nicht nur der Betrieb, sondern auch Beschaffung, Nutzung und Entsorgung sollen möglichst ressourcenschonend sein.",
            [
                "Green IT bezieht sich nur auf gedruckte Umweltberichte eines Unternehmens.",
                "Nachhaltigkeit spielt erst nach der Produktivsetzung eines Systems eine Rolle.",
            ],
            "Richtig, weil Green IT den gesamten Lebenszyklus betrachtet und nicht nur einen einzelnen Betriebsabschnitt.",
        ),
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q14": [
        spec(
            "Verkaufsstellen: Einbettung begründen",
            "Welche Aussage begründet am besten, warum die Verkaufsstellen hier in das Weingut-Dokument eingebettet werden können?",
            "Die Verkaufsstellen werden oft gemeinsam mit dem Weingut gelesen, und ihre Anzahl pro Weingut bleibt überschaubar.",
            [
                "Verkaufsstellen müssen grundsätzlich immer in separaten Dokumenten gespeichert werden.",
                "Einbettung ist vor allem dann sinnvoll, wenn Weingut und Verkaufsstellen nie gemeinsam gelesen werden.",
            ],
            "Richtig, weil Einbettung besonders dann sinnvoll ist, wenn zusammengehörige Daten häufig gemeinsam gebraucht werden und die Menge beherrschbar bleibt.",
        ),
        spec(
            "Verkaufsstellen: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzbegründung dieser Modellierungsentscheidung?",
            "Häufiger gemeinsamer Lesezugriff bei überschaubarer Anzahl",
            [
                "Beliebig große Listen ohne Rücksicht auf Zugriffsmuster",
                "Zwingende relationale Aufspaltung in möglichst viele Tabellen",
            ],
            "Richtig, weil gerade das gemeinsame Lesen und die begrenzte Anzahl die Einbettung stützen.",
        ),
        spec(
            "Verkaufsstellen: Fachliche Begründung",
            "Welche Begründung passt im Dokumentkontext am besten?",
            "Wenn Weingut und Verkaufsstellen meist zusammen gebraucht werden, spart die Einbettung zusätzliche Nachschläge.",
            [
                "Der Hauptgrund ist, dass eingebettete Dokumente niemals geändert werden dürfen.",
                "Einbettung ist nur nötig, weil Arrays in JSON grundsätzlich jede andere Struktur überflüssig machen.",
            ],
            "Richtig, weil das Zugriffsverhalten im Alltag ein zentrales Kriterium für Einbettung oder Referenzierung ist.",
        ),
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q18": [
        spec(
            "Sektoren: Passende Anzeigeform",
            "Welche Aussage begründet am besten, warum bei lagebezogenen Sektoren eine Karte die stärkste Anzeigeform ist?",
            "Eine Kartendarstellung ist am stärksten, weil die Lagebezüge der Sektoren unmittelbar sichtbar werden.",
            [
                "Eine reine Textliste ist immer besser als jede räumliche Darstellung.",
                "Ein Balkendiagramm zeigt geografische Lage automatisch am klarsten.",
            ],
            "Richtig, weil die Fachfrage ausdrücklich auf räumliche Lage abzielt und diese in einer Karte direkt wahrnehmbar wird.",
        ),
        spec(
            "Sektoren: Erwarteter Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzbegründung dieser Anzeigeform?",
            "Geografische Einordnung der Sektoren",
            [
                "Nur alphabetische Sortierung der Namen",
                "Ausschließlich Farbharmonie der Oberfläche",
            ],
            "Richtig, weil die Anzeigeform gerade die Lagebeziehungen der Sektoren verständlich machen soll.",
        ),
        spec(
            "Sektoren: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "Weil die Lage der Sektoren fachlich wichtig ist, hilft eine räumliche Visualisierung mehr als eine abstrakte Liste.",
            [
                "Eine Karte wäre nur sinnvoll, wenn Lageinformationen bewusst verborgen werden sollen.",
                "Die Anzeigeform ist egal, weil Lage in diesem Fall fachlich keine Rolle spielt.",
            ],
            "Richtig, weil die Visualisierung direkt zur eigentlichen Fachfrage passen muss und hier räumliche Orientierung gefragt ist.",
        ),
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q12": [
        spec(
            "Barrierefreiheit: Kernverständnis",
            "Welche Aussage beschreibt Barrierefreiheit für diese Webanwendung am treffendsten?",
            "Menschen mit unterschiedlichen Einschränkungen sollen die Anwendung möglichst ohne fremde Hilfe und ohne unnötige Hürden nutzen können.",
            [
                "Barrierefreiheit heißt vor allem, dass nur Fachpersonal auf die Anwendung zugreifen darf.",
                "Barrierefreiheit beschränkt sich hier auf besonders kleine Schriftgrößen.",
            ],
            "Richtig, weil Barrierefreiheit die möglichst zugängliche Nutzung für unterschiedliche Nutzergruppen meint.",
        ),
        spec(
            "Barrierefreiheit: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zur Barrierefreiheit?",
            "Nutzbarkeit trotz unterschiedlicher Einschränkungen",
            [
                "Möglichst viele Pflichtklicks pro Aufgabe",
                "Nur auffällige Animationen auf allen Seiten",
            ],
            "Richtig, weil Barrierefreiheit auf Zugänglichkeit und Nutzbarkeit abzielt, nicht auf künstliche Hürden oder reine Optik.",
        ),
        spec(
            "Barrierefreiheit: Fachliche Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Barrierefreiheit zielt auf zugängliche Bedienung, nicht nur auf eine optisch moderne Oberfläche.",
            [
                "Sie ist erst relevant, wenn sicher keine Nutzer mit Einschränkungen vorhanden sind.",
                "Sie bedeutet, dass Hilfstechnologien grundsätzlich vermieden werden sollen.",
            ],
            "Richtig, weil Barrierefreiheit praktische Zugänglichkeit schaffen soll und dafür Hilfsmittel oft ausdrücklich unterstützen muss.",
        ),
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q15": [
        spec(
            "HTTP 404: Kernbedeutung",
            "Welche Aussage erklärt einen HTTP Error 404 im Browsertest fachlich am besten?",
            "Der Server findet die angeforderte URL beziehungsweise Ressource unter dem erwarteten Pfad nicht.",
            [
                "Der Browser hat automatisch eine erfolgreiche Antwort aus dem Cache bestätigt.",
                "Der Server lehnt nur wegen eines abgelaufenen Passworts jede Anfrage ab.",
            ],
            "Richtig, weil der 404-Status typischerweise signalisiert, dass der angefragte Pfad zu keiner vorhandenen Ressource führt.",
        ),
        spec(
            "HTTP 404: Erwarteter Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu HTTP 404?",
            "Ressource oder Pfad nicht gefunden",
            [
                "Korrekte Anfrage mit erfolgreicher Antwort",
                "Ausschließlich ein lokaler Bildschirmfehler",
            ],
            "Richtig, weil der 404-Status gerade die Nichterreichbarkeit einer erwarteten Ressource kennzeichnet.",
        ),
        spec(
            "HTTP 404: Fachliche Begründung",
            "Welche Begründung passt in diesem Projektkontext am besten?",
            "Der 404-Status zeigt, dass die angeforderte Ressource unter dem erwarteten Serverpfad nicht vorhanden ist.",
            [
                "404 bedeutet, dass die Ressource zwar gefunden, aber absichtlich ungeprüft geladen wurde.",
                "404 zeigt vor allem, dass das TLS-Zertifikat erfolgreich geprüft wurde.",
            ],
            "Richtig, weil der Statuscode auf fehlende Ressourcen verweist und nicht auf Zertifikatsprüfung oder erfolgreiche Antworten.",
        ),
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q17": [
        spec(
            "Transportverschlüsselung: Bessere Alternative",
            "Welche Aussage beschreibt die geeignetere Alternative zur Weitergabe eines gemeinsamen Schlüssels am besten?",
            "Geeignet ist eine asymmetrische oder hybride Transportverschlüsselung mit Zertifikat, weil kein identisches gemeinsames Geheimnis an alle Clients verteilt werden muss.",
            [
                "Geeignet ist weiterhin derselbe gemeinsame Lizenzschlüssel für alle Clients.",
                "Am besten wird ganz auf Verschlüsselung verzichtet, solange die Anwendung intern bleibt.",
            ],
            "Richtig, weil Zertifikate und Public-Key-Verfahren das Problem der unsicheren Weitergabe eines gemeinsamen Geheimnisses entschärfen.",
        ),
        spec(
            "Transportverschlüsselung: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzbegründung dieser Alternative?",
            "Zertifikat- oder Public-Key-Verfahren statt gemeinsam verteiltem Geheimnis",
            [
                "Ein einziges offenes Passwort für alle Teilnehmer",
                "Nur Base64-Kodierung der Nutzdaten",
            ],
            "Richtig, weil gerade die Trennung zwischen öffentlichem und geheimem Schlüssel das Verteilproblem löst.",
        ),
        spec(
            "Transportverschlüsselung: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "Der öffentliche Schlüssel darf verteilt werden, während der private Schlüssel geheim bleibt und so kein identisches Geheimnis offen an alle Clients muss.",
            [
                "Der Vorteil liegt darin, dass alle Clients denselben privaten Schlüssel erhalten.",
                "Die Methode funktioniert nur dann, wenn überhaupt kein Zertifikat existiert.",
            ],
            "Richtig, weil genau die unterschiedliche Behandelbarkeit von öffentlichem und privatem Schlüssel den Sicherheitsgewinn erklärt.",
        ),
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q19": [
        spec(
            "Nicht vertrauenswürdige Quelle: Bedeutung",
            "Welche Aussage erklärt die Meldung `Das Programm stammt aus einer nicht vertrauenswürdigen Quelle` fachlich am besten?",
            "Die Anwendung ist nicht oder nicht mit einem vertrauenswürdigen Zertifikat signiert, sodass Herausgeber und Integrität nicht ausreichend verifiziert werden können.",
            [
                "Die Anwendung wurde bereits vollständig als sicher bestätigt und startet deshalb mit Warnhinweis.",
                "Die Meldung bedeutet nur, dass gerade keine Internetverbindung besteht.",
            ],
            "Richtig, weil ohne vertrauenswürdige Signatur Herkunft und Unverändertheit aus Systemsicht nicht ausreichend abgesichert sind.",
        ),
        spec(
            "Nicht vertrauenswürdige Quelle: Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu dieser Meldung?",
            "Fehlende oder nicht vertrauenswürdige Signatur beziehungsweise Zertifikatskette",
            [
                "Nur ein Layoutproblem beim Installer",
                "Ausschließlich ein Fehler in der Browserhistorie",
            ],
            "Richtig, weil die Warnung sich auf Vertrauen in Herausgeber und Integrität bezieht, nicht auf Oberflächenfehler.",
        ),
        spec(
            "Nicht vertrauenswürdige Quelle: Fachliche Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Ohne vertrauenswürdige Signatur kann das System Herkunft und Unverändertheit der Anwendung nicht sicher ableiten.",
            [
                "Die Meldung erscheint vor allem dann, wenn die Anwendung besonders gut signiert wurde.",
                "Sie sagt aus, dass das Zertifikat erfolgreich geprüft und bestätigt wurde.",
            ],
            "Richtig, weil die fehlende Vertrauenskette gerade der Grund für die Warnung ist.",
        ),
    ],
    "ticket_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method/ticket05_V01_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method.json#q07": [
        spec(
            "Passwortspeicherung: Sichere Lösung",
            "Welche Aussage beschreibt die sichere Passwortspeicherung für diese Anwendung am besten?",
            "Passwörter sollten gehasht und möglichst zusätzlich mit Salt gespeichert werden, nicht im Klartext oder nur kodiert.",
            [
                "Passwörter sollten zur leichteren Fehlersuche im Klartext in der Datenbank liegen.",
                "Eine bloße Umbenennung der Datenbankspalte ersetzt sichere Speicherung vollständig.",
            ],
            "Richtig, weil Hashing mit zusätzlichem Salt das direkte Auslesen und einfache Vergleichen von Passwörtern erschwert.",
        ),
        spec(
            "Passwortspeicherung: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu dieser Sicherheitsfrage?",
            "Hash plus Salt statt Klartext oder bloßer Kodierung",
            [
                "Nur optische Maskierung im Eingabeformular",
                "Ausschließlich Base64-Kodierung ohne echte Schutzwirkung",
            ],
            "Richtig, weil sichere Speicherung gerade nicht bei der Anzeige im Formular, sondern bei der serverseitigen Ablage beginnt.",
        ),
        spec(
            "Passwortspeicherung: Fachliche Begründung",
            "Welche Begründung passt im Anwendungskontext am besten?",
            "Hashing mit Salt erschwert das direkte Auslesen und reduziert Angriffe auf gleich gespeicherte Passwörter.",
            [
                "Die Sicherheit steigt vor allem dadurch, dass alle Nutzer denselben Salt-Wert offen kennen.",
                "Klartext ist sicherer, weil Administratoren Kennwörter dann leichter lesen können.",
            ],
            "Richtig, weil Salt Wiederverwendung gleicher Hashwerte erschwert und Hashing das Klartextgeheimnis nicht speichert.",
        ),
    ],
    "ticket_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method/ticket05_V01_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method.json#q15": [
        spec(
            "Observer-Pattern: Muster benennen",
            "Welche Aussage beschreibt das gesuchte Entwurfsmuster am besten?",
            "Gesucht ist das Observer-Pattern, bei dem abhängige Beobachter bei Zustandsänderungen eines Objekts informiert werden.",
            [
                "Gesucht ist das Singleton-Pattern, das vor allem ein globales Einzelexemplar erzwingt.",
                "Gesucht ist das Factory-Method-Pattern, das nur die Objekterzeugung kapselt.",
            ],
            "Richtig, weil hier gerade das automatische Informieren abhängiger Komponenten bei Zustandsänderungen beschrieben wird.",
        ),
        spec(
            "Observer-Pattern: Kerngedanke",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu diesem Entwurfsmuster?",
            "Automatische Benachrichtigung abhängiger Beobachter bei Zustandsänderungen",
            [
                "Ein einziges globales Objekt ohne Abonnenten",
                "Nur die Auswahl einer konkreten Unterklasse beim Erzeugen",
            ],
            "Richtig, weil der Kern des Observer-Patterns in der Benachrichtigung von Beobachtern liegt.",
        ),
        spec(
            "Observer-Pattern: Fachliche Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Das Muster passt genau dann, wenn mehrere Komponenten auf Änderungen eines gemeinsamen Objekts reagieren sollen.",
            [
                "Es ist passend, weil überhaupt keine Benachrichtigung zwischen Objekten nötig ist.",
                "Es beschreibt vor allem eine feste Datenbanknormalform für relationale Tabellen.",
            ],
            "Richtig, weil das Observer-Pattern gerade für gekoppelte Reaktionen auf Zustandsänderungen gedacht ist.",
        ),
    ],
    "ticket_ausbildungsbetrieb_aktionaerservice_rest_versammlungsportal/ticket06_V01_ausbildungsbetrieb_aktionaerservice_rest_versammlungsportal.json#q05": [
        spec(
            "REST-API: Grundprinzip",
            "Welche Aussage beschreibt das Grundprinzip einer REST-API in diesem Projektkontext am besten?",
            "Ressourcen werden über eindeutige URLs adressiert und mit standardisierten HTTP-Methoden möglichst zustandslos gelesen, angelegt, geändert oder gelöscht.",
            [
                "REST bedeutet vor allem, dass jede Anfrage einen dauerhaften Sitzungszustand erzwingt.",
                "REST beschreibt ausschließlich den Aufbau relationaler Datenbanktabellen.",
            ],
            "Richtig, weil REST auf Ressourcen, standardisierte HTTP-Methoden und möglichst zustandslose Kommunikation setzt.",
        ),
        spec(
            "REST-API: Erwarteter Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu einer REST-API?",
            "Ressourcenorientierung, HTTP-Methoden und möglichst zustandslose Kommunikation",
            [
                "Nur HTML-Templates auf dem Server",
                "Dauerhaft geteilte UI-Zustände zwischen allen Clients",
            ],
            "Richtig, weil REST fachlich gerade nicht über UI-Templates oder geteilte Sitzungszustände definiert wird.",
        ),
        spec(
            "REST-API: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "Das Grundprinzip ist die Arbeit mit Ressourcen über standardisierte Weboperationen statt mit frei erfundenen Einzelaktionen.",
            [
                "Eine REST-API ist vor allem dann gegeben, wenn keine URL eine Ressource beschreibt.",
                "Zustandslosigkeit spielt nur bei lokalen Desktop-Programmen eine Rolle.",
            ],
            "Richtig, weil Ressourcenmodell und standardisierte Weboperationen den Kern einer REST-API bilden.",
        ),
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q07": [
        spec(
            "Polymorphie: Kernverständnis",
            "Welche Aussage erklärt Polymorphie in diesem Besuchermodell am treffendsten?",
            "Derselbe Methodenaufruf über die Basisklasse kann je nach konkreter Unterklasse unterschiedliches Verhalten auslösen.",
            [
                "Polymorphie bedeutet, dass jede Unterklasse identisches Verhalten ohne Unterschiede liefern muss.",
                "Polymorphie heißt, dass Methoden nur in der Basisklasse erlaubt sind.",
            ],
            "Richtig, weil Polymorphie gerade die unterschiedliche Ausführung bei gleichem Aufruf über eine gemeinsame Abstraktion beschreibt.",
        ),
        spec(
            "Polymorphie: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zur Polymorphie?",
            "Gleicher Aufruf, unterschiedliches Verhalten je Unterklasse",
            [
                "Nur gleiche Attributnamen ohne Methoden",
                "Ausschließlich statische Hilfsfunktionen ohne Objekte",
            ],
            "Richtig, weil der polymorphe Mehrwert in der variierenden Ausführung derselben Schnittstelle liegt.",
        ),
        spec(
            "Polymorphie: Fachliche Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Die gemeinsame Basisklasse erlaubt einheitliche Aufrufe, während Unterklassen die konkrete Ausführung prägen.",
            [
                "Das Konzept ist nur sinnvoll, wenn Unterklassen niemals eigenes Verhalten besitzen.",
                "Es beschreibt vor allem die Zahl der Datenfelder innerhalb einer Klasse.",
            ],
            "Richtig, weil Polymorphie gemeinsame Nutzung und zugleich spezialisiertes Verhalten zusammenführt.",
        ),
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q17": [
        spec(
            "Tabellenkalkulation: Typische Grenze",
            "Welche Aussage beschreibt eine typische Grenze von Tabellenkalkulationslösungen in komplexeren Situationen am besten?",
            "Bei großen Datenmengen und vielen abhängigen Berechnungen werden Tabellen schnell unübersichtlich und schwer wartbar.",
            [
                "Mit wachsender Komplexität werden Tabellen automatisch klarer und wartbarer.",
                "Tabellenkalkulation ist bei großen Datenmengen grundsätzlich immer die beste Architektur.",
            ],
            "Richtig, weil viele Formeln, Querverweise und Datenmengen die Übersicht und Pflege deutlich erschweren können.",
        ),
        spec(
            "Tabellenkalkulation: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu dieser Grenze?",
            "Übersicht und Wartbarkeit leiden bei wachsender Komplexität",
            [
                "Je mehr Abhängigkeiten, desto robuster jede Tabellenlösung",
                "Nur die Schriftart entscheidet über die Grenzen einer Tabelle",
            ],
            "Richtig, weil in komplexen Tabellen vor allem Transparenz, Änderbarkeit und Fehlersuche problematisch werden.",
        ),
        spec(
            "Tabellenkalkulation: Fachliche Begründung",
            "Welche Begründung passt hier fachlich am besten?",
            "Viele Formeln, Querverweise und Datenmengen machen Änderungen, Prüfung und Fehlersuche zunehmend schwierig.",
            [
                "Komplexe Tabellen bleiben vor allem deshalb gut wartbar, weil Abhängigkeiten nie verborgen sind.",
                "Die Grenze entsteht erst, wenn überhaupt keine Daten mehr eingegeben werden.",
            ],
            "Richtig, weil gerade die Vielzahl verknüpfter Berechnungen Tabellen in komplexen Lagen schwer beherrschbar macht.",
        ),
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q20": [
        spec(
            "Kleine Sensoren: Passendes Verfahren",
            "Welche Aussage beschreibt das passende Verschlüsselungsverfahren für die kleinen batteriebetriebenen Sensoren am besten?",
            "Symmetrische Verschlüsselung passt hier am besten, weil sie bei geringer Rechenleistung im lokalen Funknetz praktikabler ist.",
            [
                "Am besten passt ein besonders rechenintensives asymmetrisches Verfahren direkt auf jedem Sensor.",
                "Eine Signatur ohne Verschlüsselung reicht immer aus, wenn Batterien klein sind.",
            ],
            "Richtig, weil die begrenzte Rechenleistung der Sensoren ein leichtgewichtiges Verfahren nahelegt.",
        ),
        spec(
            "Kleine Sensoren: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzbegründung dieser Wahl?",
            "Geringe Rechenlast bei lokalem Funknetz und bekanntem Schlüssel",
            [
                "Maximal aufwendige Kryptographie auf jedem Gerät",
                "Vollständiger Verzicht auf jeden Schlüsselmechanismus",
            ],
            "Richtig, weil die praktische Umsetzbarkeit auf schwacher Hardware hier ein zentrales Kriterium ist.",
        ),
        spec(
            "Kleine Sensoren: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "Die Sensoren sind leistungsschwach; deshalb ist ein rechnerisch leichteres Verfahren im lokalen Funknetz sinnvoller.",
            [
                "Das beste Verfahren ist hier immer dasjenige mit den meisten Rechenschritten.",
                "Die geringe Rechenleistung spricht grundsätzlich gegen symmetrische Verfahren.",
            ],
            "Richtig, weil der Projektkontext gerade die Balance aus Schutzbedarf und verfügbarer Rechenleistung vorgibt.",
        ),
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q21": [
        spec(
            "Signatur und Verschlüsselung: Unterschied",
            "Welche Aussage erklärt am besten, warum eine reine Signatur die geforderte Verschlüsselung der Sensordaten nicht ersetzt?",
            "Eine Signatur kann Integrität und Authentizität stützen, ersetzt aber keine Verschlüsselung, weil sie keine Vertraulichkeit schafft.",
            [
                "Eine Signatur verschlüsselt den Inhalt automatisch vollständig mit.",
                "Vertraulichkeit entsteht bereits dadurch, dass eine Nachricht unterschrieben wurde.",
            ],
            "Richtig, weil die Signatur die Herkunft und Unverändertheit stützen kann, aber den Inhalt nicht geheim hält.",
        ),
        spec(
            "Signatur und Verschlüsselung: Wichtiger Schwerpunkt",
            "Welcher Schwerpunkt gehört in eine gute Kurzantwort zu dieser Abgrenzung?",
            "Integrität und Authentizität statt Vertraulichkeit",
            [
                "Nur Vertraulichkeit ohne jede Herkunftssicherung",
                "Ausschließlich die Farbe des eingesetzten Zertifikats",
            ],
            "Richtig, weil gerade die fehlende Vertraulichkeit erklärt, warum Signieren die Verschlüsselung nicht ersetzt.",
        ),
        spec(
            "Signatur und Verschlüsselung: Fachliche Begründung",
            "Welche Begründung passt im Projektkontext am besten?",
            "Die geforderte Verschlüsselung zielt auf Geheimhaltung; dafür reicht bloßes Signieren der Daten nicht aus.",
            [
                "Signaturen sind vor allem dafür da, Inhalte offen lesbar zu halten und deshalb Verschlüsselung zu vermeiden.",
                "Eine Signatur ersetzt Verschlüsselung genau dann, wenn Daten besonders vertraulich sind.",
            ],
            "Richtig, weil die Fachanforderung ausdrücklich Vertraulichkeit verlangt und diese nicht durch eine bloße Signatur entsteht.",
        ),
    ],
}


SHORT_TEXT_KEYWORD_DISTRACTORS: dict[str, list[str]] = {
    "ticket_ausbildungsbetrieb_reservierung_erechnung_datenmodell/ticket01_V01_ausbildungsbetrieb_reservierung_erechnung_datenmodell.json#q07": [
        "pdf / drucken",
        "layout / unterschrift",
    ],
    "ticket_ausbildungsbetrieb_reservierung_erechnung_datenmodell/ticket01_V01_ausbildungsbetrieb_reservierung_erechnung_datenmodell.json#q10": [
        "passwort / kopie / teilen",
        "privatschlüssel / veröffentlichen / verteilen",
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q01": [
        "frontend / backend",
        "uml / erd",
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q12": [
        "komposition / lebenszyklus",
        "vererbung / oberklasse / methode",
    ],
    "ticket_ausbildungsbetrieb_stadtbahn_netzlogik_uml/ticket02_V01_ausbildungsbetrieb_stadtbahn_netzlogik_uml.json#q19": [
        "singleton / globalobjekt",
        "datenbank / normalform",
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q03": [
        "design / farbe",
        "maximalleistung / stromverbrauch",
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q14": [
        "trennen / joins / lookup",
        "unbegrenzt / archiv / historisierung",
    ],
    "ticket_ausbildungsbetrieb_weinbau_userstory_json_erd/ticket03_V01_ausbildungsbetrieb_weinbau_userstory_json_erd.json#q18": [
        "liste / alphabet",
        "balken / summe",
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q12": [
        "animation / farbschema",
        "admin / fachzugriff",
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q15": [
        "cache / offline",
        "zertifikat / signatur",
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q17": [
        "base64 / kodierung",
        "gemeinschlüssel / client / verteilen",
    ],
    "ticket_ausbildungsbetrieb_praxissoftware_usability_sicherheit/ticket04_V01_ausbildungsbetrieb_praxissoftware_usability_sicherheit.json#q19": [
        "internet / offline",
        "layout / installer",
    ],
    "ticket_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method/ticket05_V01_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method.json#q07": [
        "klartext / lesbar",
        "base64 / umwandlung",
    ],
    "ticket_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method/ticket05_V01_ausbildungsbetrieb_klinikakte_prozesslogik_factory_method.json#q15": [
        "singleton / instanz",
        "factory / erzeugung",
    ],
    "ticket_ausbildungsbetrieb_aktionaerservice_rest_versammlungsportal/ticket06_V01_ausbildungsbetrieb_aktionaerservice_rest_versammlungsportal.json#q05": [
        "session / zustand / dauerhaft",
        "html / template / server",
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q07": [
        "attribute / felder",
        "statisch / hilfsmethode",
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q17": [
        "schriftart / layout",
        "mehr tabs / mehr klarheit",
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q20": [
        "asymmetrisch / zertifikat / hochlast",
        "signatur / geheimhaltung",
    ],
    "ticket_ausbildungsbetrieb_besucherapp_polymorphie_sensorik/ticket07_V01_ausbildungsbetrieb_besucherapp_polymorphie_sensorik.json#q21": [
        "vertraulichkeit / signatur",
        "lesen / freigeben / offen",
    ],
}
