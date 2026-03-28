#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-3-WISO-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
QUIZ_DB_PATH = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-3-WISO-Quiz.db"

SUPPORTED_TYPES = {"single_choice", "multi_select"}
DEFAULT_SCENARIO_COUNT = 9
DEFAULT_QUESTION_LIMIT = 598
PREVIOUS_BATCH_START_INDEX = 5
STAGE2_BATCH_STAGE = 2
STAGE3_BATCH_STAGE = 3
STAGE4_BATCH_STAGE = 4
CURRENT_BATCH_STAGE = 5
STAGE6_BATCH_STAGE = 6
STAGE7_BATCH_STAGE = 7
STAGE8_BATCH_STAGE = 8
STAGE9_BATCH_STAGE = 9
STAGE10_BATCH_STAGE = 10
CURRENT_BATCH_TARGET = 100

QUESTION_META_BY_TYPE = {
    "single_choice": {
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "badge_label": "Welche Antwort trifft am besten zu?",
    },
    "multi_select": {
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "badge_label": "Welche Aussagen sind korrekt?",
    },
}

BADGE_VARIANTS_BY_INTERACTION = {
    "single": (
        "Welche Antwort trifft am besten zu?",
        "Welche Auswahl passt hier am besten?",
        "Welche Antwort ist fachlich am tragfähigsten?",
        "Welche Entscheidung ist hier richtig?",
    ),
    "multi": (
        "Welche Aussagen sind korrekt?",
        "Welche Aussagen treffen zu?",
        "Welche Punkte gehören fachlich dazu?",
        "Was ist hier zutreffend?",
    ),
}

BATCH2_YES_NO_SOURCE_REFS = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q15",
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q29",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q05",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q12",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q15",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q18",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q29",
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q01",
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q10",
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q17",
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q27",
}

BATCH2_CATEGORY_TABLE_FILL_EXCLUDED_SOURCE_REFS = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q23",
    "ticket_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit/ticket07_V01_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit.json#q28",
}

STAGE3_NEGATIVE_CATEGORY_SOURCE_REFS = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q09",
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q17",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q23",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q27",
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q24",
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q16",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung/ticket09_V01_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung.json#q13",
}

VISIBLE_REPLACEMENTS = [
    ("Dafuer", "Dafür"),
    ("dafuer", "dafür"),
    ("Wofuer", "Wofür"),
    ("wofuer", "wofür"),
    ("Darueber", "Darüber"),
    ("darueber", "darüber"),
    ("Gegenueber", "Gegenüber"),
    ("gegenueber", "gegenüber"),
    ("Fuer", "Für"),
    ("fuer", "für"),
    ("Ueber", "Über"),
    ("ueber", "über"),
    ("Jaehr", "Jähr"),
    ("jaehr", "jähr"),
    ("Waehr", "Währ"),
    ("waehr", "währ"),
    ("Spaet", "Spät"),
    ("spaet", "spät"),
    ("Frueh", "Früh"),
    ("frueh", "früh"),
    ("Moech", "Möch"),
    ("moech", "möch"),
    ("Moegl", "Mögl"),
    ("moegl", "mögl"),
    ("Kuenf", "Künf"),
    ("kuenf", "künf"),
    ("Kuend", "Künd"),
    ("kuend", "künd"),
    ("Zulaess", "Zuläss"),
    ("zulaess", "zuläss"),
    ("Unzulaess", "Unzuläss"),
    ("unzulaess", "unzuläss"),
    ("Waehl", "Wähl"),
    ("waehl", "wähl"),
    ("Auswaehl", "Auswähl"),
    ("auswaehl", "auswähl"),
    ("Gewaehl", "Gewähl"),
    ("gewaehl", "gewähl"),
    ("Gewaehr", "Gewähr"),
    ("gewaehr", "gewähr"),
    ("Anhoer", "Anhör"),
    ("anhoer", "anhör"),
    ("Gehoer", "Gehör"),
    ("gehoer", "gehör"),
    ("Zugehoer", "Zugehör"),
    ("zugehoer", "zugehör"),
    ("Betriebszugehoer", "Betriebszugehör"),
    ("betriebszugehoer", "betriebszugehör"),
    ("Verhaeltnis", "Verhältnis"),
    ("verhaeltnis", "verhältnis"),
    ("Ausbildungsverhaeltnis", "Ausbildungsverhältnis"),
    ("ausbildungsverhaeltnis", "ausbildungsverhältnis"),
    ("Arbeitsverhaeltnis", "Arbeitsverhältnis"),
    ("arbeitsverhaeltnis", "arbeitsverhältnis"),
    ("Beschaeft", "Beschäft"),
    ("beschaeft", "beschäft"),
    ("Geschaeft", "Geschäft"),
    ("geschaeft", "geschäft"),
    ("Buerger", "Bürger"),
    ("buerger", "bürger"),
    ("Behoerd", "Behörd"),
    ("behoerd", "behörd"),
    ("Zustaend", "Zuständ"),
    ("zustaend", "zuständ"),
    ("Zusaetz", "Zusätz"),
    ("zusaetz", "zusätz"),
    ("Ausdrueck", "Ausdrück"),
    ("ausdrueck", "ausdrück"),
    ("Unterstuetz", "Unterstütz"),
    ("unterstuetz", "unterstütz"),
    ("Durchzufuehr", "Durchzuführ"),
    ("durchzufuehr", "durchzuführ"),
    ("Fuehr", "Führ"),
    ("fuehr", "führ"),
    ("Duerf", "Dürf"),
    ("duerf", "dürf"),
    ("Muess", "Müss"),
    ("muess", "müss"),
    ("Muesst", "Müsst"),
    ("muesst", "müsst"),
    ("Grundsaetz", "Grundsätz"),
    ("grundsaetz", "grundsätz"),
    ("Europae", "Europä"),
    ("europae", "europä"),
    ("Boers", "Börs"),
    ("boers", "börs"),
    ("Oekolog", "Ökolog"),
    ("oekolog", "ökolog"),
    ("Oekonom", "Ökonom"),
    ("oekonom", "ökonom"),
    ("Oeffn", "Öffn"),
    ("oeffn", "öffn"),
    ("Geoeffn", "Geöffn"),
    ("geoeffn", "geöffn"),
    ("Loesch", "Lösch"),
    ("loesch", "lösch"),
    ("Erloes", "Erlös"),
    ("erloes", "erlös"),
    ("Eroef", "Eröf"),
    ("eroef", "eröf"),
    ("Guenst", "Günst"),
    ("guenst", "günst"),
    ("Guelt", "Gült"),
    ("guelt", "gült"),
    ("Hoechst", "Höchst"),
    ("hoechst", "höchst"),
    ("Hoehe", "Höhe"),
    ("hoehe", "höhe"),
    ("Hoeher", "Höher"),
    ("hoeher", "höher"),
    ("Beitrae", "Beiträ"),
    ("beitrae", "beiträ"),
    ("Kraeft", "Kräft"),
    ("kraeft", "kräft"),
    ("Faeh", "Fäh"),
    ("faeh", "fäh"),
    ("Taet", "Tät"),
    ("taet", "tät"),
    ("Verkuerz", "Verkürz"),
    ("verkuerz", "verkürz"),
    ("Unabhaeng", "Unabhäng"),
    ("unabhaeng", "unabhäng"),
    ("Aeuss", "Äuß"),
    ("aeuss", "äuß"),
    ("Aehnl", "Ähnl"),
    ("aehnl", "ähnl"),
    ("Haeufig", "Häufig"),
    ("haeufig", "häufig"),
    ("Koenn", "Könn"),
    ("koenn", "könn"),
    ("Waer", "Wär"),
    ("waer", "wär"),
    ("Vertraeg", "Verträg"),
    ("vertraeg", "verträg"),
    ("Tertiae", "Tertiä"),
    ("tertiae", "tertiä"),
    ("Primae", "Primä"),
    ("primae", "primä"),
    ("Sekundae", "Sekundä"),
    ("sekundae", "sekundä"),
    ("Regulae", "Regulä"),
    ("regulae", "regulä"),
    ("Ausschliess", "Ausschließ"),
    ("ausschliess", "ausschließ"),
    ("Haeng", "Häng"),
    ("haeng", "häng"),
    ("Haelt", "Hält"),
    ("haelt", "hält"),
    ("Enthaelt", "Enthält"),
    ("enthaelt", "enthält"),
    ("Verstoss", "Verstoß"),
    ("verstoss", "verstoß"),
    ("Traegt", "Trägt"),
    ("traegt", "trägt"),
    ("Naechst", "Nächst"),
    ("naechst", "nächst"),
    ("Muendlich", "Mündlich"),
    ("muendlich", "mündlich"),
    ("Erhaelt", "Erhält"),
    ("erhaelt", "erhält"),
    ("Berueck", "Berück"),
    ("berueck", "berück"),
    ("Schaed", "Schäd"),
    ("schaed", "schäd"),
    ("Erhoeh", "Erhöh"),
    ("erhoeh", "erhöh"),
    ("Engpaess", "Engpäss"),
    ("engpaess", "engpäss"),
    ("Betraeg", "Beträg"),
    ("betraeg", "beträg"),
    ("Beschraenk", "Beschränk"),
    ("beschraenk", "beschränk"),
    ("Benoet", "Benöt"),
    ("benoet", "benöt"),
    ("Zurueck", "Zurück"),
    ("zurueck", "zurück"),
    ("Vollstaend", "Vollständ"),
    ("vollstaend", "vollständ"),
    ("Voell", "Völl"),
    ("voell", "völl"),
    ("Verstaend", "Verständ"),
    ("verstaend", "verständ"),
    ("Ursprueng", "Ursprüng"),
    ("ursprueng", "ursprüng"),
    ("Selbststaend", "Selbstständig"),
    ("selbststaend", "selbstständig"),
    ("Regelmaess", "Regelmäß"),
    ("regelmaess", "regelmäß"),
    ("Persoen", "Persön"),
    ("persoen", "persön"),
    ("Oeffent", "Öffent"),
    ("oeffent", "öffent"),
    ("Noet", "Nöt"),
    ("noet", "nöt"),
    ("Laesst", "Lässt"),
    ("laesst", "lässt"),
    ("Gleichmaess", "Gleichmäß"),
    ("gleichmaess", "gleichmäß"),
    ("Geschuetz", "Geschütz"),
    ("geschuetz", "geschütz"),
    ("Erfuell", "Erfüll"),
    ("erfuell", "erfüll"),
    ("Zugaeng", "Zugäng"),
    ("zugaeng", "zugäng"),
    ("Verfueg", "Verfüg"),
    ("verfueg", "verfüg"),
    ("Praevent", "Prävent"),
    ("praevent", "prävent"),
    ("Loehn", "Löhn"),
    ("loehn", "löhn"),
    ("Kuerz", "Kürz"),
    ("kuerz", "kürz"),
    ("Komplementaer", "Komplementär"),
    ("komplementaer", "komplementär"),
    ("Auszueg", "Auszüg"),
    ("auszueg", "auszüg"),
    ("Arbeitskaemp", "Arbeitskämp"),
    ("arbeitskaemp", "arbeitskämp"),
    ("Ueberhoeh", "Überhöh"),
    ("ueberhoeh", "überhöh"),
    ("Zaehl", "Zähl"),
    ("zaehl", "zähl"),
    ("Wuerd", "Würd"),
    ("wuerd", "würd"),
    ("Woechent", "Wöchent"),
    ("woechent", "wöchent"),
    ("Stuerz", "Stürz"),
    ("stuerz", "stürz"),
    ("Entfaell", "Entfäll"),
    ("entfaell", "entfäll"),
    ("Beraet", "Berät"),
    ("beraet", "berät"),
    ("Muetter", "Mütter"),
    ("muetter", "mütter"),
    ("Taeg", "Täg"),
    ("taeg", "täg"),
    ("Stuetz", "Stütz"),
    ("stuetz", "stütz"),
    ("Staerk", "Stärk"),
    ("staerk", "stärk"),
    ("Serioes", "Seriös"),
    ("serioes", "seriös"),
    ("Serioeser", "Seriöser"),
    ("serioeser", "seriöser"),
    ("Ploetz", "Plötz"),
    ("ploetz", "plötz"),
    ("Loest", "Löst"),
    ("loest", "löst"),
    ("Genueg", "Genüg"),
    ("genueg", "genüg"),
    ("Erkaelt", "Erkält"),
    ("erkaelt", "erkält"),
    ("Erklaer", "Erklär"),
    ("erklaer", "erklär"),
    ("Aend", "Änd"),
    ("aend", "änd"),
    ("Ausueb", "Ausüb"),
    ("ausueb", "ausüb"),
    ("Auffaell", "Auffäll"),
    ("auffaell", "auffäll"),
    ("Anschliess", "Anschließ"),
    ("anschliess", "anschließ"),
    ("Verstoe", "Verstö"),
    ("verstoe", "verstö"),
    ("Verstösse", "Verstöße"),
    ("verstösse", "verstöße"),
    ("Verstösst", "Verstößt"),
    ("verstösst", "verstößt"),
    ("Unfallverhuet", "Unfallverhüt"),
    ("unfallverhuet", "unfallverhüt"),
    ("Rueck", "Rück"),
    ("rueck", "rück"),
    ("Eröf", "Eröff"),
    ("eröf", "eröff"),
    ("Sprueh", "Sprüh"),
    ("sprueh", "sprüh"),
    ("Spuel", "Spül"),
    ("spuel", "spül"),
    ("Tueren", "Türen"),
    ("tueren", "türen"),
    ("Umstaend", "Umständ"),
    ("umstaend", "umständ"),
    ("Gebaeud", "Gebäud"),
    ("gebaeud", "gebäud"),
    ("Ladegeraet", "Ladegerät"),
    ("ladegeraet", "ladegerät"),
    ("Geraet", "Gerät"),
    ("geraet", "gerät"),
    ("Preisnachlaess", "Preisnachläss"),
    ("preisnachlaess", "preisnachläss"),
    ("Abfaell", "Abfäll"),
    ("abfaell", "abfäll"),
    ("Vermoeg", "Vermög"),
    ("vermoeg", "vermög"),
    ("Reisepaess", "Reisepäss"),
    ("reisepaess", "reisepäss"),
    ("Restmuell", "Restmüll"),
    ("restmuell", "restmüll"),
    ("Koeln", "Köln"),
    ("koeln", "köln"),
    ("Naehe", "Nähe"),
    ("naehe", "nähe"),
    ("Plaen", "Plän"),
    ("plaen", "plän"),
    ("Laender", "Länder"),
    ("laender", "länder"),
    ("Gueter", "Güter"),
    ("gueter", "güter"),
    ("Groess", "Größ"),
    ("groess", "größ"),
    ("Arbeitnehmerfreizueg", "Arbeitnehmerfreizüg"),
    ("arbeitnehmerfreizueg", "arbeitnehmerfreizüg"),
    ("Verbaend", "Verbänd"),
    ("verbaend", "verbänd"),
    ("Aktionaer", "Aktionär"),
    ("aktionaer", "aktionär"),
    ("Kaeuf", "Käuf"),
    ("kaeuf", "käuf"),
    ("Beeintraecht", "Beeinträcht"),
    ("beeintraecht", "beeinträcht"),
    ("Buero", "Büro"),
    ("buero", "büro"),
    ("E-Bike-Zubehoer", "E-Bike-Zubehör"),
    ("e-bike-zubehoer", "e-bike-zubehör"),
    ("Einzelhaendl", "Einzelhändl"),
    ("einzelhaendl", "einzelhändl"),
    ("Foerder", "Förder"),
    ("foerder", "förder"),
    ("Einschaetz", "Einschätz"),
    ("einschaetz", "einschätz"),
    ("Bevoelker", "Bevölker"),
    ("bevoelker", "bevölker"),
    ("Abstaend", "Abständ"),
    ("abstaend", "abständ"),
    ("Faell", "Fäll"),
    ("faell", "fäll"),
    ("Spielraeum", "Spielräum"),
    ("spielraeum", "spielräum"),
    ("Aufsichtsaemt", "Aufsichtsämt"),
    ("aufsichtsaemt", "aufsichtsämt"),
    ("Traeger", "Träger"),
    ("traeger", "träger"),
    ("Schraenk", "Schränk"),
    ("schraenk", "schränk"),
    ("Verdaecht", "Verdächt"),
    ("verdaecht", "verdächt"),
    ("Verschluess", "Verschlüss"),
    ("verschluess", "verschlüss"),
    ("Verguet", "Vergüt"),
    ("verguet", "vergüt"),
    ("Einschlaeg", "Einschläg"),
    ("einschlaeg", "einschläg"),
    ("Eigenstaend", "Eigenständig"),
    ("eigenstaend", "eigenständig"),
    ("Laeuft", "Läuft"),
    ("laeuft", "läuft"),
    ("Laedt", "Lädt"),
    ("laedt", "lädt"),
    ("Knuepf", "Knüpf"),
    ("knuepf", "knüpf"),
    ("Losgeloest", "Losgelöst"),
    ("losgeloest", "losgelöst"),
    ("Nachtraeg", "Nachträg"),
    ("nachtraeg", "nachträg"),
    ("Maenn", "Männ"),
    ("maenn", "männ"),
    ("Eintaeg", "Eintäg"),
    ("eintaeg", "eintäg"),
    ("Eintaeig", "Eintägig"),
    ("eintaeig", "eintägig"),
    ("Massig", "Mäßig"),
    ("massig", "mäßig"),
    ("Gaebe", "Gäbe"),
    ("gaebe", "gäbe"),
    ("Gruend", "Gründ"),
    ("gruend", "gründ"),
    ("Gruen", "Grün"),
    ("gruen", "grün"),
    ("Pruef", "Prüf"),
    ("pruef", "prüf"),
    ("Fuenf", "Fünf"),
    ("fuenf", "fünf"),
    ("Abschliessen", "Abschließen"),
    ("abschliessen", "abschließen"),
    ("Schliesst", "Schließt"),
    ("schliesst", "schließt"),
    ("Ausserdem", "Außerdem"),
    ("ausserdem", "außerdem"),
    ("Ausserhalb", "Außerhalb"),
    ("ausserhalb", "außerhalb"),
    ("selbstständigige", "selbstständige"),
    ("Selbstständigige", "Selbstständige"),
    ("Höchstlohngrünzen", "Höchstlohngrenzen"),
    ("höchstlohngrünzen", "höchstlohngrenzen"),
    ("Gruesse", "Grüße"),
    ("gruesse", "grüße"),
    ("Massnah", "Maßnah"),
    ("massnah", "maßnah"),
    ("Massgeb", "Maßgeb"),
    ("massgeb", "maßgeb"),
    ("Bloss", "Bloß"),
    ("bloss", "bloß"),
    ("Fuss", "Fuß"),
    ("fuss", "fuß"),
    ("weissem", "weißem"),
    ("Weissem", "Weißem"),
    ("geniessen", "genießen"),
    ("Geniessen", "Genießen"),
    ("geniesst", "genießt"),
    ("Geniesst", "Genießt"),
    ("Bewerbungsgespraech", "Bewerbungsgespräch"),
    ("bewerbungsgespraech", "bewerbungsgespräch"),
    ("Vorstellungsgespraech", "Vorstellungsgespräch"),
    ("vorstellungsgespraech", "vorstellungsgespräch"),
    ("Natuerlich", "Natürlich"),
    ("natuerlich", "natürlich"),
    ("Guetesiegel", "Gütesiegel"),
    ("guetesiegel", "gütesiegel"),
    ("Wuenschen", "Wünschen"),
    ("wuenschen", "wünschen"),
    ("Baecker", "Bäcker"),
    ("baecker", "bäcker"),
    ("Gaertner", "Gärtner"),
    ("gaertner", "gärtner"),
    ("Toedlich", "Tödlich"),
    ("toedlich", "tödlich"),
    ("Arbeitsplaetze", "Arbeitsplätze"),
    ("arbeitsplaetze", "arbeitsplätze"),
    ("Wiederentzuendung", "Wiederentzündung"),
    ("wiederentzuendung", "wiederentzündung"),
    ("Flaechen", "Flächen"),
    ("flaechen", "flächen"),
    ("Raeumlichkeiten", "Räumlichkeiten"),
    ("raeumlichkeiten", "räumlichkeiten"),
    ("Haelfte", "Hälfte"),
    ("haelfte", "hälfte"),
    ("Saemtlich", "Sämtlich"),
    ("saemtlich", "sämtlich"),
    ("Ansprueche", "Ansprüche"),
    ("ansprueche", "ansprüche"),
    ("Zwoelf", "Zwölf"),
    ("zwoelf", "zwölf"),
    ("Gewoehnt", "Gewöhnt"),
    ("gewoehnt", "gewöhnt"),
    ("Arbeitsatmosphaere", "Arbeitsatmosphäre"),
    ("arbeitsatmosphaere", "arbeitsatmosphäre"),
    ("Juenger", "Jünger"),
    ("juenger", "jünger"),
    ("Koerperschaft", "Körperschaft"),
    ("koerperschaft", "körperschaft"),
    ("Bloesstellung", "Blößstellung"),
    ("bloesstellung", "blößstellung"),
    ("Bemueht", "Bemüht"),
    ("bemueht", "bemüht"),
    ("Schueler", "Schüler"),
    ("schueler", "schüler"),
    ("Maerkte", "Märkte"),
    ("maerkte", "märkte"),
    ("Grundstuecken", "Grundstücken"),
    ("grundstuecken", "grundstücken"),
    ("Erwaehnt", "Erwähnt"),
    ("erwaehnt", "erwähnt"),
    ("Unverzueglich", "Unverzüglich"),
    ("unverzueglich", "unverzüglich"),
    ("Empfaenger", "Empfänger"),
    ("empfaenger", "empfänger"),
    ("Oel", "Öl"),
    ("oel", "öl"),
    ("Loesung", "Lösung"),
    ("loesung", "lösung"),
    ("Geringfuegig", "Geringfügig"),
    ("geringfuegig", "geringfügig"),
    ("Muenchen", "München"),
    ("muenchen", "münchen"),
    ("Verlaenger", "Verlänger"),
    ("verlaenger", "verlänger"),
    ("Laenger", "Länger"),
    ("laenger", "länger"),
]

FORBIDDEN_VISIBLE_PATTERNS = (
    "Ticket ",
    ".json",
    "V01",
    "V02",
    "V03",
    "quiz_",
    "ticket_",
)

CONTEXT_TARGETS = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#ctx03": {"q03", "q04"},
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#ctx08": {"q08", "q09"},
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#ctx21": {"q21"},
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#ctx17": {"q17a", "q17b"},
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#ctx18": {"q18"},
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#ctx15": {"q15", "q16", "q17"},
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#ctx20": {"q20"},
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#ctx04": {"q04", "q05", "q06"},
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#ctx18": {"q18"},
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#ctx21": {"q21", "q22", "q23"},
}

QUESTION_CONTEXT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q03": (
        "Robin Winter ist 17 Jahre alt. Sein geänderter Donnerstag endet um 20:00 Uhr. "
        "Jugendliche dürfen grundsätzlich nur zwischen 06:00 Uhr und 20:00 Uhr beschäftigt "
        "werden und müssen nach dem Arbeitsende mindestens 12 Stunden Freizeit haben."
    ),
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q04": "",
}

DERIVED_PROMPT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q29::table_fill_yes_no": "Welche Merkmale gehören zu den klassischen Dimensionen der Charta der Vielfalt?",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q12::table_fill_yes_no": "In welchen Fällen hat der Betriebsrat ein Mitbestimmungsrecht?",
    "ticket_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit/ticket06_V01_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit.json#q01::table_fill_yes_no": "Welche Aussagen zu den Voraussetzungen für eine Ausbildertätigkeit treffen zu?",
    "ticket_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit/ticket06_V01_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit.json#q25::table_fill_yes_no": "Welche Handlungen sind im beschriebenen Brandfall fachlich angemessen?",
    "ticket_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit/ticket06_V01_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit.json#q28::table_fill_yes_no": "Welche Formulierung in der Stellenanzeige ist AGG-widrig?",
    "ticket_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit/ticket07_V01_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit.json#q12::table_fill_yes_no": "Welche Aussagen zu den Voraussetzungen für eine Ausbildertätigkeit treffen zu?",
    "ticket_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit/ticket07_V01_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit.json#q19::table_fill_yes_no": "Welche Aussagen beschreiben typische Merkmale einer GmbH?",
    "ticket_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit/ticket07_V01_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit.json#q22::table_fill_yes_no": "Welche Aussagen beschreiben die Funktion eines Businessplans zutreffend?",
    "ticket_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit/ticket07_V01_ausbildungsbetrieb_wiso_bewerbung_mitbestimmung_gruendung_nachhaltigkeit.json#q30::table_fill_yes_no": "Welche Maßnahmen dienen der Vermeidung oder Verringerung von Umweltbelastungen?",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_mitbestimmung_markt_nachhaltigkeit/ticket08_V01_ausbildungsbetrieb_wiso_ausbildung_mitbestimmung_markt_nachhaltigkeit.json#q02::table_fill_yes_no": "Welche Angaben müssen in einem Berufsausbildungsvertrag zwingend festgehalten werden?",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_mitbestimmung_markt_nachhaltigkeit/ticket08_V01_ausbildungsbetrieb_wiso_ausbildung_mitbestimmung_markt_nachhaltigkeit.json#q30::table_fill_yes_no": "Welche Formulierungen in einer Stellenanzeige sind AGG-konform?",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung/ticket09_V01_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung.json#q01::table_fill_yes_no": "Welche Aussagen zur gesetzlich geforderten Eignung von Ausbildern treffen zu?",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung/ticket09_V01_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung.json#q11::table_fill_yes_no": "Welche Aussage zu den Regelungen des Jugendarbeitsschutzgesetzes für noch nicht volljährige Auszubildende trifft zu?",
    "ticket_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung/ticket09_V01_ausbildungsbetrieb_wiso_ausbildung_konjunktur_gmbh_globalisierung.json#q18::table_fill_yes_no": "Welche Aussagen zur Gründung einer GmbH treffen zu?",
}

DERIVED_NEGATIVE_PROMPT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q29::table_fill_yes_no::negative": "Welche Merkmale gehören nicht zu den klassischen Dimensionen der Charta der Vielfalt?",
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q12::table_fill_yes_no::negative": "In welchen Fällen hat der Betriebsrat kein Mitbestimmungsrecht?",
}

QUESTION_PROMPT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q03": (
        "Robin Winter ist 17 und beendet den Donnerstag um 20:00 Uhr. Jugendliche müssen nach "
        "Arbeitsende mindestens 12 Stunden Freizeit haben. Welche Uhrzeit ist am Freitag der "
        "früheste zulässige Dienstbeginn?"
    ),
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q08": (
        "Pamela Bornberg ist 17 und kündigt schriftlich zum 15.04.2022 wegen eines Berufswechsels; "
        "eine gesetzliche Vertretung unterschreibt nicht mit. Welche Beurteilung passt am besten?"
    ),
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q21": (
        "Unter der Unternehmensleitung stehen die Funktionsbereiche Einkauf, Produktion und Absatz. "
        "Parallel dazu verlaufen die Produktlinien PC, Netz und Software quer über alle drei Bereiche. "
        "Welches Leitungssystem beschreibt diese Struktur am treffendsten?"
    ),
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q15": (
        "Aus den Registerdaten zur Mainbogen Digital GmbH ergeben sich unter anderem: Sitz in Hamburg, "
        "Stammkapital 330.000 EUR, Gesellschafter Jonas Kramer und Lea Berger, keine Prokura. "
        "Aus welcher Informationsquelle stammen solche Angaben am ehesten?"
    ),
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q04": (
        "EU-Kennzahlen im Überblick: Bruttoinlandsprodukt -0,5 / -1,0 / -2,0 %, Inflationsrate "
        "2,2 / 2,2 / 2,0 %, Arbeitslosenquote 6,0 / 6,5 / 7,5 % (Vorjahr / aktuelles Jahr / Folgejahr). "
        "In welcher Konjunkturphase befindet sich die EU im aktuellen Jahr?"
    ),
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q06": (
        "EU-Kennzahlen aktuell: Bruttoinlandsprodukt -1,0 %, Inflationsrate 2,2 %, "
        "Arbeitslosenquote 6,5 %, Folgejahr-Prognose weiter rückläufig. Welche Maßnahme könnte "
        "die Konjunktur beleben und die Auftragslage verbessern?"
    ),
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q21": (
        "Die Auenwerk Digital GmbH will den Bereich Allgemeine Dienstleistungen in eine Tochter-GmbH "
        "auslagern. Nils Berger bringt 80.000 EUR ein und Lea Vogt 40.000 EUR. Welcher Sachverhalt "
        "ist im Zusammenhang mit dieser GmbH-Gründung zutreffend?"
    ),
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q02": (
        "Eine Steuer-App wurde bisher nur von einem Wettbewerber angeboten. Jetzt kommt die "
        "Auenwerk Digital GmbH als zweiter Anbieter hinzu, während viele Kaufinteressenten "
        "vorhanden sind. Welche Marktform liegt vor?"
    ),
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q02": (
        "Mia Lorenz begann im September 2023 ihre Ausbildung zur Fachinformatikerin und möchte "
        "diese ab Mai 2024 beenden, weil sie an eine Hochschule wechseln will. Welche Aussage trifft zu?"
    ),
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q11": (
        "Luca Hansen möchte während seiner Arbeitszeit an einer Betriebsversammlung teilnehmen. "
        "Welche Folge ist richtig?"
    ),
    "ticket_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit/ticket06_V01_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit.json#q03": (
        "Eine Gesellschafterin hat 375.000,00 EUR Stammkapital eingebracht. "
        "Davon verbleiben 28.125,00 EUR Gewinnanteil im Unternehmen. "
        "Wie hoch ist die Eigenkapitalrentabilität dieser Beteiligung in Prozent? "
        "Runden Sie auf eine Nachkommastelle."
    ),
}

PROMPT_SHORT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q16::number_choice": (
        "Jonas Kramer hält 198.000 EUR Stammkapital, Lea Berger den Rest. "
        "Der Gewinn nach Steuern beträgt 87.450 EUR. Wie hoch ist Lea Bergers Gewinnanteil in EUR?"
    ),
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q17a::number_choice": (
        "2021 arbeiteten 40 Mitarbeitende bei 98.000 EUR Umsatz pro Kopf. "
        "2022 sind es 45 Mitarbeitende und 4.590.000 EUR Gesamtumsatz. "
        "Wie hoch ist der Umsatz pro Mitarbeitendem im Jahr 2022?"
    ),
    "ticket_ausbildungsbetrieb_wiso_betrieb_recht_markt/ticket02_V01_ausbildungsbetrieb_wiso_betrieb_recht_markt.json#q17b::number_choice": (
        "2021 arbeiteten 40 Mitarbeitende bei 98.000 EUR Umsatz pro Kopf. "
        "2022 sind es 45 Mitarbeitende und 4.590.000 EUR Gesamtumsatz. "
        "Um wie viel Prozent verändert sich der Umsatz pro Mitarbeitendem?"
    ),
    "ticket_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt/ticket04_V01_ausbildungsbetrieb_wiso_markt_bildung_kuendigung_umwelt.json#q23::number_choice": (
        "Nils Berger bringt 80.000 EUR ein und Lea Vogt 40.000 EUR. "
        "Die neue GmbH erzielt 60.000 EUR Gewinn. "
        "Welcher Gewinnanteil entfällt auf Lea Vogt?"
    ),
    "ticket_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit/ticket06_V01_ausbildungsbetrieb_wiso_vertrag_mitbestimmung_gruendung_sicherheit.json#q03::number_choice": (
        "Eine Gesellschafterin hat 375.000,00 EUR Stammkapital eingebracht. "
        "Davon verbleiben 28.125,00 EUR Gewinnanteil im Unternehmen. "
        "Wie hoch ist die Eigenkapitalrentabilität dieser Beteiligung in Prozent? "
        "Runden Sie auf eine Nachkommastelle."
    ),
    "ticket_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit/ticket03_V01_ausbildungsbetrieb_wiso_sicherheit_gmbh_nachhaltigkeit.json#q20::number_choice": (
        "Vier Aufträge werden auf ihre Wirtschaftlichkeit geprüft. "
        "Welche Auftragsnummer weist die höchste Wirtschaftlichkeit auf?"
    ),
}

OPTION_OVERRIDES = {
    "ticket_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis/ticket01_V01_ausbildungsbetrieb_wiso_arbeitsrecht_unternehmenspraxis.json#q13::3": {
        "text": "Günstigere einzelvertragliche Regelungen können im Einzelfall neben einem Tarifvertrag bestehen bleiben.",
        "explanation": "Das Günstigkeitsprinzip kann dazu führen, dass für Beschäftigte vorteilhaftere einzelvertragliche Regelungen wirksam bleiben.",
    }
}


def stable_id(namespace: str, value: str) -> str:
    digest = hashlib.blake2s(f"{namespace}::{value}".encode("utf-8"), digest_size=16).hexdigest()
    return digest[:12]


def normalize_visible_text(value: Any) -> str:
    text = str(value or "")
    text = text.replace("\u00a0", " ")
    text = text.replace("`", "")
    text = text.replace(": hiermit ", ": Hiermit ")
    text = text.replace(". hiermit ", ". Hiermit ")
    for source, target in VISIBLE_REPLACEMENTS:
        text = text.replace(source, target)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s*\n\s*", " ", text)
    return text.strip()


def normalize_slug(value: str) -> str:
    slug = re.sub(r"^ticket_ausbildungsbetrieb_wiso_", "", value.strip())
    slug = slug.replace("_", "-").strip("-")
    return f"pv3wiso-{slug}"


def slugify_visible_text(value: str) -> str:
    normalized = normalize_visible_text(value).lower()
    normalized = normalized.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    normalized = re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")
    return normalized or "frage"


def strip_ticket_prefix(label: str) -> str:
    return re.sub(r"^Ticket\s+\d+\s*-\s*", "", label).strip()


def render_document_card(block: dict[str, Any]) -> str:
    parts: list[str] = []
    document_title = normalize_visible_text(block.get("documentTitle", ""))
    if document_title:
        parts.append(document_title + ":")

    for section in block.get("rightSections", []):
        label = normalize_visible_text(section.get("label", ""))
        value = normalize_visible_text(section.get("value", ""))
        lines = [normalize_visible_text(line) for line in section.get("lines", [])]
        section_values = [value] if value else []
        section_values.extend(line for line in lines if line)
        if label and section_values:
            parts.append(f"{label} {' / '.join(section_values)}.")

    body_lead = normalize_visible_text(block.get("bodyLead", ""))
    if body_lead:
        parts.append(body_lead)

    entries = [normalize_visible_text(entry) for entry in block.get("entries", []) if normalize_visible_text(entry)]
    if entries:
        parts.append(" ".join(entries))

    return " ".join(parts).strip()


def render_table_block(block: dict[str, Any]) -> str:
    columns = [normalize_visible_text(column) for column in block.get("columns", []) if normalize_visible_text(column)]
    rows: list[str] = []
    for row in block.get("rows", []):
        if not isinstance(row, list):
            continue
        cells = [normalize_visible_text(cell) for cell in row if normalize_visible_text(cell)]
        if cells:
            rows.append(" / ".join(cells))
    parts: list[str] = []
    if columns:
        parts.append(f"Tabelle mit den Spalten {', '.join(columns)}.")
    if rows:
        parts.append("Daten: " + "; ".join(rows) + ".")
    return " ".join(parts).strip()


def render_context_card(question: dict[str, Any]) -> str:
    parts: list[str] = []
    title = normalize_visible_text(question.get("title", ""))
    if title:
        parts.append(title + ":")

    for block in question.get("contentBlocks", []):
        block_type = str(block.get("type", "")).strip()
        if block_type == "text":
            text = normalize_visible_text(block.get("text", ""))
            if text:
                parts.append(text)
        elif block_type == "table":
            rendered = render_table_block(block)
            if rendered:
                parts.append(rendered)
        elif block_type == "document_card":
            rendered = render_document_card(block)
            if rendered:
                parts.append(rendered)

    return " ".join(parts).strip()


def merge_prompt(context_text: str, prompt: str) -> str:
    base_prompt = normalize_visible_text(prompt)
    if not context_text:
        return base_prompt
    return normalize_visible_text(f"{context_text} {base_prompt}")


def get_correct_flags(question: dict[str, Any]) -> list[bool]:
    options = question.get("options", [])
    if not isinstance(options, list):
        raise ValueError(f"Frage {question.get('id', '')} hat keine gueltige Optionsliste.")

    raw_correct_index = question.get("correctIndex", None)
    correct_index = None
    if isinstance(raw_correct_index, int):
        correct_index = raw_correct_index

    flags: list[bool] = []
    for index, option in enumerate(options):
        if not isinstance(option, dict):
            flags.append(False)
            continue
        if "correct" in option:
            flags.append(bool(option.get("correct")))
        else:
            flags.append(correct_index == index)
    return flags


def build_pool_description(data: dict[str, Any]) -> str:
    station_profile = normalize_visible_text(data.get("scenario", {}).get("station", {}).get("profile", ""))
    mission = normalize_visible_text(data.get("scenario", {}).get("mission", ""))
    if station_profile and mission:
        return f"{station_profile}. {mission}"
    return station_profile or mission


def validate_visible_texts(texts: list[str]) -> None:
    for text in texts:
        for forbidden in FORBIDDEN_VISIBLE_PATTERNS:
            if forbidden in text:
                raise ValueError(f"Unzulaessiger sichtbarer Verweis gefunden: {forbidden!r} in {text!r}")


def strip_title_suffix(title: str) -> str:
    stripped = normalize_visible_text(title)
    for suffix in (" einordnen", " pruefen", " auswaehlen", " bestimmen", " erkennen", " bewerten"):
        if stripped.endswith(suffix):
            return stripped[: -len(suffix)].strip()
    return stripped


def build_explanation_subject(title: str) -> str:
    subject = strip_title_suffix(title)
    return subject or "dieses Themenfeld"


def choose_template(templates: list[str], key: str) -> str:
    return templates[int(stable_id("template", key), 16) % len(templates)]


LOWERCASE_FRAGMENT_STARTERS = {
    "dass",
    "ob",
    "wann",
    "warum",
    "was",
    "welche",
    "welchem",
    "welchen",
    "welcher",
    "welches",
    "wer",
    "wie",
    "wieso",
    "wo",
    "wodurch",
    "womit",
    "woran",
    "worauf",
    "worum",
}


def should_lowercase_prompt_fragment(text: str) -> bool:
    normalized = normalize_visible_text(text).strip()
    if not normalized:
        return False
    match = re.match(r"[A-Za-zÄÖÜäöüß]+", normalized)
    if not match:
        return False
    return match.group(0).lower() in LOWERCASE_FRAGMENT_STARTERS


def lowercase_first(text: str) -> str:
    normalized = normalize_visible_text(text).strip()
    if not normalized:
        return ""
    if not should_lowercase_prompt_fragment(normalized):
        return normalized
    return normalized[:1].lower() + normalized[1:]


def embedded_prompt_fragment(text: str) -> tuple[str, str]:
    normalized = normalize_visible_text(text).strip()
    if not normalized:
        return "", ", "
    if should_lowercase_prompt_fragment(normalized):
        return normalized[:1].lower() + normalized[1:], ", "
    return normalized, ": "


def variant_prompt_qualifier(source_ref: str, index: int) -> str:
    if source_ref.endswith("::alt8"):
        variants = ("im Zielschritt", "im Abschlusslauf", "im Endabgleich")
    elif source_ref.endswith("::alt7"):
        variants = ("im Abschlussfall", "im letzten Abgleich", "im Endschritt")
    elif source_ref.endswith("::alt6"):
        variants = ("im Folgedurchgang", "im Vertiefungsabschluss", "im Prüfschritt danach")
    elif source_ref.endswith("::alt5"):
        variants = ("im Abschlusscheck", "im Konsolidierungsschritt", "im letzten Zugriff")
    elif source_ref.endswith("::alt3"):
        variants = ("im Transferfall", "im Folgeschritt", "im Anschlussfall")
    elif source_ref.endswith("::alt2"):
        variants = ("im Vertiefungsschritt", "im zweiten Zugriff", "im Folgecheck")
    elif source_ref.endswith("::alt1"):
        variants = ("im Erstvergleich", "im Zusatzblick", "im Folgefall")
    else:
        variants = ("im Grundfall", "im Ausgangsfall", "im Basisfall")
    return choose_template(list(variants), f"qualifier::{source_ref}::{index}")


def badge_label_for_interaction(interaction_type: str, source_ref: str) -> str:
    variants = BADGE_VARIANTS_BY_INTERACTION.get(interaction_type, ())
    if not variants:
        return ""
    return choose_template(list(variants), f"badge::{source_ref}")


def assign_badge_labels(questions: list[dict[str, Any]]) -> None:
    for question in questions:
        question["badge_label"] = badge_label_for_interaction(question["interaction_type"], question["source_ref"])


def reorder_options(options: list[dict[str, Any]], source_ref: str) -> list[dict[str, Any]]:
    cloned = [{**option} for option in options]
    if len(cloned) < 2:
        return cloned
    shift = int(stable_id("option_shift", source_ref), 16) % len(cloned)
    if shift == 0:
        shift = 1
    rotated = cloned[shift:] + cloned[:shift]
    reordered: list[dict[str, Any]] = []
    for option_index, option in enumerate(rotated, start=1):
        reordered.append(
            {
                **option,
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
            }
        )
    return reordered


def derive_statement_explanation(title: str, is_correct: bool, option_text: str, source_ref: str) -> str:
    subject = build_explanation_subject(title)
    positive_templates = [
        "Das gehört bei {subject} zu den zutreffenden Punkten.",
        "Für {subject} ist diese Aussage fachlich richtig eingeordnet.",
        "Im Themenfeld {subject} passt diese Aussage.",
    ]
    negative_templates = [
        "Das gehört bei {subject} nicht zu den zutreffenden Punkten.",
        "Für {subject} ist diese Aussage fachlich nicht richtig eingeordnet.",
        "Im Themenfeld {subject} passt diese Aussage gerade nicht.",
    ]
    templates = positive_templates if is_correct else negative_templates
    template = choose_template(templates, f"{source_ref}::{option_text}")
    return template.format(subject=subject)


def is_yes_no_table_fill(question: dict[str, Any]) -> bool:
    rows = question.get("rows", [])
    if not isinstance(rows, list) or len(rows) < 2:
        return False

    normalized_options: set[tuple[str, ...]] = set()
    for row in rows:
        if not isinstance(row, list) or len(row) < 2 or not isinstance(row[1], dict):
            return False
        cell = row[1]
        expected = normalize_visible_text(cell.get("expected", ""))
        if expected not in {"Ja", "Nein"}:
            return False
        options = tuple(normalize_visible_text(option) for option in cell.get("options", []))
        if options != ("Ja", "Nein"):
            return False
        normalized_options.add(options)

    return normalized_options == {("Ja", "Nein")}


def is_select_table_fill(question: dict[str, Any]) -> bool:
    rows = question.get("rows", [])
    if not isinstance(rows, list) or len(rows) < 2:
        return False

    for row in rows:
        if not isinstance(row, list) or len(row) < 2 or not isinstance(row[1], dict):
            return False
        cell = row[1]
        if normalize_visible_text(cell.get("inputType", "")) != "select":
            return False
        options = [normalize_visible_text(option) for option in cell.get("options", []) if normalize_visible_text(option)]
        if len(options) < 2:
            return False

    return True


def map_select_category_label(raw_question: dict[str, Any], category: str) -> str:
    normalized_category = normalize_visible_text(category)
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    title = normalize_visible_text(raw_question.get("title", ""))
    combined = f"{prompt} {title}"

    if "Wirtschaftssektor" in combined and normalized_category in {"1", "2", "3"}:
        return {
            "1": "primären Wirtschaftssektor",
            "2": "sekundären Wirtschaftssektor",
            "3": "tertiären Wirtschaftssektor",
        }[normalized_category]

    return normalized_category


def build_select_category_prompt(raw_question: dict[str, Any], category_label: str, correct_count: int) -> str:
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    prompt_key = slugify_visible_text(prompt)
    plural = correct_count != 1
    noun = "Welche Aussagen" if plural else "Welche Aussage"

    if "bestandteil_des_zeugnisses" in prompt_key:
        starter = "Welche Formulierungen" if plural else "Welche Formulierung"
        verb = "gehören" if plural else "gehört"
        return f'{starter} {verb} zum Bestandteil "{category_label}"?'

    if "wirtschaftssektor" in prompt_key:
        starter = "Welche Tätigkeiten" if plural else "Welche Tätigkeit"
        verb = "gehören" if plural else "gehört"
        return f"{starter} {verb} zum {category_label}?"

    if "umgang_mit_feuerloeschern" in prompt_key:
        starter = "Welche Regeln" if plural else "Welche Regel"
        verb = "sind" if plural else "ist"
        return f"{starter} im Umgang mit Feuerlöschern {verb} fachlich {category_label.lower()}?"

    if "fragen_im_bewerbungsgespraech" in prompt_key:
        starter = "Welche Fragen" if plural else "Welche Frage"
        verb = "sind" if plural else "ist"
        return f"{starter} im Bewerbungsgespräch {verb} typischerweise {category_label.lower()}?"

    if "passende_unternehmen" in prompt_key:
        return f'{noun} beschreiben "{category_label}"?'

    if "sicherheitszeichen" in prompt_key and "bedeutung" in prompt_key:
        starter = "Welche beschriebenen Sicherheitszeichen" if plural else "Welches beschriebene Sicherheitszeichen"
        verb = "stehen" if plural else "steht"
        return f'{starter} {verb} für "{category_label}"?'

    if "tarifvertragstyp" in prompt_key:
        starter = "Welche Inhalte" if plural else "Welcher Inhalt"
        verb = "gehören" if plural else "gehört"
        return f'{starter} {verb} typischerweise in einen "{category_label}"?'

    if "unternehmensziele_der_passenden_zielart" in prompt_key:
        starter = "Welche Unternehmensziele" if plural else "Welches Unternehmensziel"
        verb = "gehören" if plural else "gehört"
        return f'{starter} {verb} zur Zielart "{category_label}"?'

    if "passende_rechtsquelle" in prompt_key or "zutreffende_rechtsquelle" in prompt_key:
        starter = "Welche Sachverhalte" if plural else "Welcher Sachverhalt"
        verb = "lassen sich" if plural else "lässt sich"
        return f'{starter} {verb} der Rechtsquelle "{category_label}" zuordnen?'

    if "zeichenart" in prompt_key:
        starter = "Welche beschriebenen Zeichen" if plural else "Welches beschriebene Zeichen"
        verb = "gehören" if plural else "gehört"
        return f'{starter} {verb} zur Zeichenart "{category_label}"?'

    if "kuendigungsgrund" in prompt_key:
        starter = "Welche Beispiele" if plural else "Welches Beispiel"
        verb = "sprechen" if plural else "spricht"
        return f'{starter} {verb} für eine "{category_label}"?'

    if "kuendigungsart" in prompt_key:
        starter = "Welche Fälle" if plural else "Welcher Fall"
        verb = "sprechen" if plural else "spricht"
        return f'{starter} {verb} für eine "{category_label}"?'

    if "organisationsform" in prompt_key:
        starter = "Welche Beschreibungen" if plural else "Welche Beschreibung"
        verb = "passen" if plural else "passt"
        return f'{starter} {verb} zur Organisationsform "{category_label}"?'

    if "schutzgesetz" in prompt_key or "arbeits_oder_schutzgesetz" in prompt_key:
        starter = "Welche Sachverhalte" if plural else "Welcher Sachverhalt"
        verb = "regeln" if plural else "regelt"
        return f"{starter} {verb} das {category_label}?"

    if "handelsregister" in prompt_key:
        if category_label in {"Abteilung A", "Abteilung B"}:
            starter = "Welche Aussagen" if plural else "Welche Aussage"
            verb = "gehören" if plural else "gehört"
            return f"{starter} zum Handelsregister {verb} zur {category_label}?"
        if category_label == "Allgemein richtig":
            starter = "Welche Aussagen" if plural else "Welche Aussage"
            verb = "sind" if plural else "ist"
            return f"{starter} zum Handelsregister {verb} allgemein richtig?"
        starter = "Welche Aussagen" if plural else "Welche Aussage"
        verb = "sind" if plural else "ist"
        return f"{starter} zum Handelsregister {verb} falsch?"

    if "passende_rechtsgrundlage" in prompt_key:
        starter = "Welche Anliegen" if plural else "Welches Anliegen"
        verb = "lassen sich" if plural else "lässt sich"
        return f'{starter} {verb} der Rechtsgrundlage "{category_label}" zuordnen?'

    if "zielsetzungspaaren" in prompt_key:
        starter = "Welche Zielsetzungspaare" if plural else "Welches Zielsetzungspaar"
        verb = "sind" if plural else "ist"
        return f'{starter} {verb} "{category_label}"?'

    starter = "Welche Aussagen" if plural else "Welche Aussage"
    verb = "lassen sich" if plural else "lässt sich"
    return f'{starter} {verb} der Kategorie "{category_label}" zuordnen?'


def build_select_category_explanation(category_label: str, is_correct: bool, source_ref: str) -> str:
    positive_templates = [
        'Dieser Punkt gehört in dieser Zuordnung zur Kategorie "{category_label}".',
        'Bei dieser Zuordnung passt der Punkt zur Kategorie "{category_label}".',
        'Hier ist die Kategorie "{category_label}" fachlich richtig getroffen.',
    ]
    negative_templates = [
        'Dieser Punkt gehört in dieser Zuordnung nicht zur Kategorie "{category_label}".',
        'Bei dieser Zuordnung passt der Punkt gerade nicht zur Kategorie "{category_label}".',
        'Hier ist die Kategorie "{category_label}" fachlich nicht richtig getroffen.',
    ]
    templates = positive_templates if is_correct else negative_templates
    template = choose_template(templates, source_ref)
    return template.format(category_label=category_label)


def build_select_table_fill_category_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_section_title: str,
) -> list[dict[str, Any]]:
    if not is_select_table_fill(raw_question):
        return []

    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Table-Fill-Frage ohne ID in {scenario_rel_path}.")

    source_ref_base = f"{scenario_rel_path}#{question_id}"
    if source_ref_base in BATCH2_CATEGORY_TABLE_FILL_EXCLUDED_SOURCE_REFS or is_yes_no_table_fill(raw_question):
        return []

    instructions = normalize_visible_text(raw_question.get("title", ""))
    progress_links = raw_question.get("progressLinks", [])
    concept_group = str(progress_links[0]).strip() if isinstance(progress_links, list) and progress_links else ""

    categories_in_order: list[str] = []
    rows = raw_question.get("rows", [])
    for row in rows:
        cell = row[1] if isinstance(row, list) and len(row) > 1 and isinstance(row[1], dict) else {}
        expected = normalize_visible_text(cell.get("expected", ""))
        if expected and expected not in categories_in_order:
            categories_in_order.append(expected)

    derived_questions: list[dict[str, Any]] = []
    for category in categories_in_order:
        category_label = map_select_category_label(raw_question, category)
        category_slug = slugify_visible_text(category_label)
        options: list[dict[str, Any]] = []
        correct_count = 0

        for option_index, row in enumerate(rows, start=1):
            statement = normalize_visible_text(row[0] if isinstance(row, list) and row else "")
            cell = row[1] if isinstance(row, list) and len(row) > 1 and isinstance(row[1], dict) else {}
            is_correct = 1 if normalize_visible_text(cell.get("expected", "")) == category else 0
            correct_count += is_correct
            explanation = build_select_category_explanation(
                category_label,
                bool(is_correct),
                f"{source_ref_base}::category::{category_slug}::{option_index}",
            )
            validate_visible_texts([statement, explanation])
            options.append(
                {
                    "source_option_id": f"{cell.get('key') or option_index}::{category_slug}",
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": statement,
                    "explanation": explanation,
                    "is_correct": is_correct,
                }
            )

        if correct_count < 1:
            continue

        meta_key = "multi_select" if correct_count > 1 else "single_choice"
        question_meta = QUESTION_META_BY_TYPE[meta_key]
        prompt = build_select_category_prompt(raw_question, category_label, correct_count)
        validate_visible_texts([prompt, instructions, ""])
        derived_questions.append(
            {
                "source_question_id": f"{question_id}__table_fill_category__{category_slug}",
                "source_ref": f"{source_ref_base}::table_fill_category::{category_slug}",
                "prompt": prompt,
                "instructions": instructions,
                "context": "",
                "badge_label": question_meta["badge_label"],
                "interaction_type": question_meta["interaction_type"],
                "question_kind": question_meta["question_kind"],
                "concept_group": concept_group,
                "section_title": active_section_title,
                "max_selections": correct_count,
                "options": options,
                "variant_suffix": f"table_fill_category_{category_slug}",
                "batch_stage": STAGE2_BATCH_STAGE,
                "batch_rank": 1,
            }
        )

    return derived_questions


def infer_numeric_precision(raw_question: dict[str, Any], expected_value: float) -> int:
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    title = normalize_visible_text(raw_question.get("title", ""))
    formula = normalize_visible_text(raw_question.get("showExpectedFormula", ""))
    combined = f"{prompt} {title} {formula}"

    if "EUR" in combined:
        return 2
    if "%" in combined or "Prozent" in combined or "Rentabilität" in combined:
        expected_text = str(expected_value)
        if "." in expected_text:
            return max(1, len(expected_text.split(".", 1)[1].rstrip("0")))
        return 1
    if abs(expected_value - round(expected_value)) < 1e-9:
        return 0
    expected_text = str(expected_value)
    if "." in expected_text:
        return max(1, len(expected_text.split(".", 1)[1].rstrip("0")))
    return 0


def format_number_de(value: float, decimals: int) -> str:
    if decimals <= 0:
        return f"{int(round(value)):,}".replace(",", ".")
    rendered = f"{value:,.{decimals}f}"
    return rendered.replace(",", "§").replace(".", ",").replace("§", ".")


def format_numeric_option_text(raw_question: dict[str, Any], value: float) -> str:
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    title = normalize_visible_text(raw_question.get("title", ""))
    formula = normalize_visible_text(raw_question.get("showExpectedFormula", ""))
    combined = f"{prompt} {title} {formula}"
    decimals = infer_numeric_precision(raw_question, value)
    rendered_value = format_number_de(value, decimals)

    if "EUR" in combined:
        return f"{rendered_value} EUR"
    if "%" in combined or "Prozent" in combined or "Rentabilität" in combined:
        return f"{rendered_value} %"
    return rendered_value


def build_number_explanation(raw_question: dict[str, Any], is_correct: bool, source_ref: str) -> str:
    if is_correct:
        formula = normalize_visible_text(raw_question.get("showExpectedFormula", ""))
        if formula:
            return formula
        return "Das ist der korrekt berechnete Wert."

    subject = build_explanation_subject(normalize_visible_text(raw_question.get("title", "")))
    negative_templates = [
        "Dieser Wert ergibt sich bei {subject} nicht aus den gegebenen Angaben.",
        "So fällt das Ergebnis für {subject} rechnerisch nicht aus.",
        "Für {subject} passt dieser Zahlenwert nicht zur korrekten Berechnung.",
    ]
    template = choose_template(negative_templates, source_ref)
    return template.format(subject=subject)


def build_number_distractors(expected_value: float, decimals: int) -> list[float]:
    rounded_expected = round(expected_value, decimals)
    is_integer = decimals == 0 and abs(rounded_expected - round(rounded_expected)) < 1e-9
    raw_candidates: list[float] = []

    if is_integer:
        base = int(round(rounded_expected))
        if base <= 5:
            raw_candidates.extend([base - 1, base + 1, base + 2, base * 2])
        elif base <= 20:
            raw_candidates.extend([base - 2, base - 1, base + 1, base + 2, base * 2])
        elif base <= 100:
            raw_candidates.extend([base - 5, base + 5, round(base * 0.9), round(base * 1.1), round(base / 2)])
        else:
            raw_candidates.extend([round(base * 0.9), round(base * 0.95), round(base * 1.05), round(base * 1.1), round(base / 2)])
    else:
        raw_candidates.extend(
            [
                expected_value * 0.9,
                expected_value * 0.95,
                expected_value * 1.05,
                expected_value * 1.1,
                expected_value - 1,
                expected_value + 1,
            ]
        )

    normalized_candidates: list[float] = []
    seen: set[float] = set()
    for candidate in raw_candidates:
        rounded_candidate = round(candidate, decimals)
        if rounded_candidate <= 0 or abs(rounded_candidate - rounded_expected) < 10 ** (-(decimals + 2)):
            continue
        if rounded_candidate in seen:
            continue
        seen.add(rounded_candidate)
        normalized_candidates.append(rounded_candidate)

    lower = [candidate for candidate in normalized_candidates if candidate < rounded_expected]
    higher = [candidate for candidate in normalized_candidates if candidate > rounded_expected]

    chosen: list[float] = []
    if lower:
        chosen.append(lower[-1])
    if higher:
        chosen.append(higher[0])

    extras = list(lower[:-1]) + list(reversed(higher[1:]))
    for candidate in extras:
        if candidate not in chosen:
            chosen.append(candidate)
        if len(chosen) == 3:
            break

    while len(chosen) < 3:
        step = 10 ** max(decimals, 0)
        fallback = round(rounded_expected + step * (len(chosen) + 1), decimals)
        if fallback not in chosen and abs(fallback - rounded_expected) > 10 ** (-(decimals + 2)):
            chosen.append(fallback)

    return chosen[:3]


def build_number_single_choice_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_section_title: str,
    question_context: str,
) -> dict[str, Any]:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Zahlenfrage ohne ID in {scenario_rel_path}.")

    expected_value = float(raw_question.get("expected"))
    decimals = infer_numeric_precision(raw_question, expected_value)
    distractors = build_number_distractors(expected_value, decimals)
    correct_value = round(expected_value, decimals)
    correct_position = int(stable_id("number-position", f"{scenario_rel_path}#{question_id}"), 16) % 4

    ordered_values: list[float] = []
    distractor_index = 0
    for option_index in range(4):
        if option_index == correct_position:
            ordered_values.append(correct_value)
        else:
            ordered_values.append(distractors[distractor_index])
            distractor_index += 1

    instructions = normalize_visible_text(raw_question.get("title", ""))
    source_ref = f"{scenario_rel_path}#{question_id}"
    prompt = normalize_visible_text(QUESTION_PROMPT_OVERRIDES.get(source_ref, raw_question.get("prompt", "")))
    context_text = "" if source_ref in QUESTION_PROMPT_OVERRIDES else normalize_visible_text(question_context)
    progress_links = raw_question.get("progressLinks", [])
    concept_group = str(progress_links[0]).strip() if isinstance(progress_links, list) and progress_links else ""

    options: list[dict[str, Any]] = []
    for option_index, value in enumerate(ordered_values, start=1):
        is_correct = 1 if abs(value - correct_value) < 10 ** (-(decimals + 2)) else 0
        option_text = format_numeric_option_text(raw_question, value)
        explanation = build_number_explanation(
            raw_question,
            bool(is_correct),
            f"{scenario_rel_path}#{question_id}::number_choice::{option_index}",
        )
        validate_visible_texts([option_text, explanation])
        options.append(
            {
                "source_option_id": f"number_choice_{option_index}",
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": option_text,
                "explanation": explanation,
                "is_correct": is_correct,
            }
        )

    validate_visible_texts([prompt, instructions, context_text])
    return {
        "source_question_id": f"{question_id}__number_choice",
        "source_ref": f"{scenario_rel_path}#{question_id}::number_choice",
        "prompt": prompt,
        "instructions": instructions,
        "context": context_text,
        "badge_label": QUESTION_META_BY_TYPE["single_choice"]["badge_label"],
        "interaction_type": QUESTION_META_BY_TYPE["single_choice"]["interaction_type"],
        "question_kind": QUESTION_META_BY_TYPE["single_choice"]["question_kind"],
        "concept_group": concept_group,
        "section_title": active_section_title,
        "max_selections": 1,
        "options": options,
        "variant_suffix": "number_choice",
        "batch_stage": STAGE2_BATCH_STAGE,
        "batch_rank": 0,
    }


def derive_yes_no_prompt(raw_question: dict[str, Any], correct_count: int) -> str:
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    if prompt:
        normalized = prompt.rstrip(".")
        patterns: list[tuple[str, str, str]] = [
            (
                r"^Ordnen Sie zu, welche Aussagen (.+) zutreffen$",
                "Welche Aussagen {body} treffen zu?",
                "Welche Aussage {body} trifft zu?",
            ),
            (
                r"^Ordnen Sie zu, welche Sachverhalte (.+) zutreffen$",
                "Welche Sachverhalte {body} treffen zu?",
                "Welcher Sachverhalt {body} trifft zu?",
            ),
            (
                r"^Ordnen Sie zu, welche Aussagen (.+) passend beschreiben$",
                "Welche Aussagen beschreiben {body} passend?",
                "Welche Aussage beschreibt {body} passend?",
            ),
            (
                r"^Ordnen Sie zu, welche Aussagen (.+) korrekt beschreiben$",
                "Welche Aussagen beschreiben {body} korrekt?",
                "Welche Aussage beschreibt {body} korrekt?",
            ),
            (
                r"^Ordnen Sie zu, welche Aussagen (.+) entsprechen$",
                "Welche Aussagen entsprechen {body}?",
                "Welche Aussage entspricht {body}?",
            ),
            (
                r"^Ordnen Sie zu, welche Fragen (.+) zulässig sind$",
                "Welche Fragen {body} sind zulässig?",
                "Welche Frage {body} ist zulässig?",
            ),
            (
                r"^Ordnen Sie zu, welche Formulierungen (.+) sind$",
                "Welche Formulierungen {body} sind?",
                "Welche Formulierung {body} ist?",
            ),
            (
                r"^Ordnen Sie zu, welche Angaben (.+) festgehalten werden müssen$",
                "Welche Angaben {body} müssen festgehalten werden?",
                "Welche Angabe {body} muss festgehalten werden?",
            ),
            (
                r"^Ordnen Sie zu, welche Handlungen (.+) sind$",
                "Welche Handlungen {body} sind?",
                "Welche Handlung {body} ist?",
            ),
            (
                r"^Ordnen Sie zu, welche Schritte (.+) gehoeren$",
                "Welche Schritte gehören {body}?",
                "Welcher Schritt gehört {body}?",
            ),
            (
                r"^Ordnen Sie zu, welche Massnahmen (.+) dienen$",
                "Welche Maßnahmen dienen {body}?",
                "Welche Maßnahme dient {body}?",
            ),
            (
                r"^Ordnen Sie zu, welche Akteurspaare (.+) abschließen$",
                "Welche Akteurspaare schließen {body} ab?",
                "Welches Akteurspaar schließt {body} ab?",
            ),
            (
                r"^Ordnen Sie zu, in welchen Angelegenheiten (.+) hat$",
                "In welchen Angelegenheiten hat {body}?",
                "In welcher Angelegenheit hat {body}?",
            ),
            (
                r"^Ordnen Sie zu, in welchen Faellen (.+) hat$",
                "In welchen Fällen hat {body}?",
                "In welchem Fall hat {body}?",
            ),
            (
                r"^Ordnen Sie zu, ob die jeweilige Versicherung (.+) ist$",
                "Welche Versicherungen sind {body}?",
                "Welche Versicherung ist {body}?",
            ),
            (
                r"^Ordnen Sie zu, ob das jeweilige Merkmal (.+) gehoert$",
                "Welche Merkmale gehören {body}?",
                "Welches Merkmal gehört {body}?",
            ),
        ]

        for pattern, plural_template, singular_template in patterns:
            match = re.match(pattern, normalized)
            if not match:
                continue
            body = normalize_visible_text(match.group(1))
            template = singular_template if correct_count == 1 else plural_template
            rendered = template.format(body=body)
            return normalize_visible_text(rendered)

        fallback = re.sub(r"^Ordnen Sie zu,\s*", "", normalized)
        fallback = fallback[:1].upper() + fallback[1:] if fallback else fallback
        if not fallback.endswith("?"):
            fallback += "?"
        return normalize_visible_text(fallback)

    base_title = strip_title_suffix(str(raw_question.get("title", "")))
    if correct_count == 1:
        return f"Welche Aussage zu {base_title} trifft zu?"
    return f"Welche Aussagen zu {base_title} treffen zu?"


def build_yes_no_table_fill_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_section_title: str,
    *,
    batch_stage: int,
    batch_rank: int,
) -> dict[str, Any] | None:
    if not is_yes_no_table_fill(raw_question):
        return None

    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Table-Fill-Frage ohne ID in {scenario_rel_path}.")

    instructions = normalize_visible_text(raw_question.get("title", ""))
    progress_links = raw_question.get("progressLinks", [])
    concept_group = str(progress_links[0]).strip() if isinstance(progress_links, list) and progress_links else ""

    options: list[dict[str, Any]] = []
    correct_count = 0
    for option_index, row in enumerate(raw_question.get("rows", []), start=1):
        statement = normalize_visible_text(row[0] if isinstance(row, list) and row else "")
        cell = row[1] if isinstance(row, list) and len(row) > 1 and isinstance(row[1], dict) else {}
        is_correct = 1 if normalize_visible_text(cell.get("expected", "")) == "Ja" else 0
        correct_count += is_correct
        explanation = derive_statement_explanation(
            instructions,
            bool(is_correct),
            statement,
            f"{scenario_rel_path}#{question_id}::{option_index}",
        )
        validate_visible_texts([statement, explanation])
        options.append(
            {
                "source_option_id": str(cell.get("key") or option_index),
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": statement,
                "explanation": explanation,
                "is_correct": is_correct,
            }
        )

    if correct_count < 1:
        return None

    source_ref = f"{scenario_rel_path}#{question_id}::table_fill_yes_no"
    meta_key = "multi_select" if correct_count > 1 else "single_choice"
    question_meta = QUESTION_META_BY_TYPE[meta_key]
    prompt = normalize_visible_text(DERIVED_PROMPT_OVERRIDES.get(source_ref, derive_yes_no_prompt(raw_question, correct_count)))
    context_text = ""
    validate_visible_texts([prompt, instructions, context_text])

    return {
        "source_question_id": f"{question_id}__table_fill_yes_no",
        "source_ref": source_ref,
        "prompt": prompt,
        "instructions": instructions,
        "context": context_text,
        "badge_label": question_meta["badge_label"],
        "interaction_type": question_meta["interaction_type"],
        "question_kind": question_meta["question_kind"],
        "concept_group": concept_group,
        "section_title": active_section_title,
        "max_selections": correct_count,
        "options": options,
        "variant_suffix": "table_fill_yes_no",
        "batch_stage": batch_stage,
        "batch_rank": batch_rank,
    }


def build_ordering_single_choice_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_section_title: str,
    *,
    batch_stage: int,
    batch_rank: int,
) -> dict[str, Any] | None:
    question_id = str(raw_question.get("id", "")).strip()
    correct_order = [
        normalize_visible_text(item)
        for item in raw_question.get("correctOrder", [])
        if normalize_visible_text(item)
    ]
    if not question_id or len(correct_order) < 4:
        return None

    instructions = normalize_visible_text(raw_question.get("title", ""))
    progress_links = raw_question.get("progressLinks", [])
    concept_group = str(progress_links[0]).strip() if isinstance(progress_links, list) and progress_links else ""

    lower_title = instructions.casefold()
    if "tarif" in lower_title:
        anchor = correct_order[2]
        correct_answer = correct_order[3]
        prompt = normalize_visible_text(
            "Nachdem eine Tarifpartei die Verhandlungen für gescheitert erklärt hat, welcher Schritt folgt als Nächstes?"
        )
        candidate_texts = [correct_order[1], correct_answer, correct_order[4], correct_order[-1]]
    else:
        correct_answer = correct_order[0]
        prompt = normalize_visible_text("Welcher Schritt steht im Einstellungsprozess ganz am Anfang?")
        candidate_texts = [correct_answer, correct_order[1], correct_order[2], correct_order[-1]]

    unique_candidates: list[str] = []
    for text in candidate_texts:
        if text not in unique_candidates:
            unique_candidates.append(text)

    options: list[dict[str, Any]] = []
    for option_index, text in enumerate(unique_candidates, start=1):
        position = correct_order.index(text)
        if text == correct_answer:
            explanation = "Dieser Schritt steht an der gesuchten Stelle im Ablauf."
        elif position < correct_order.index(correct_answer):
            explanation = "Dieser Schritt liegt im Ablauf noch davor."
        else:
            explanation = "Dieser Schritt kommt im Ablauf erst später."
        validate_visible_texts([text, explanation])
        options.append(
            {
                "source_option_id": f"ordering_opt_{option_index}",
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": text,
                "explanation": explanation,
                "is_correct": 1 if text == correct_answer else 0,
            }
        )

    validate_visible_texts([prompt, instructions, ""])
    return {
        "source_question_id": f"{question_id}__ordering_choice",
        "source_ref": f"{scenario_rel_path}#{question_id}::ordering_choice",
        "prompt": prompt,
        "instructions": instructions,
        "context": "",
        "badge_label": QUESTION_META_BY_TYPE["single_choice"]["badge_label"],
        "interaction_type": QUESTION_META_BY_TYPE["single_choice"]["interaction_type"],
        "question_kind": QUESTION_META_BY_TYPE["single_choice"]["question_kind"],
        "concept_group": concept_group,
        "section_title": active_section_title,
        "max_selections": 1,
        "options": options,
        "variant_suffix": "ordering_choice",
        "batch_stage": batch_stage,
        "batch_rank": batch_rank,
    }


def collect_questions_for_scenario(
    scenario_rel_path: str,
    scenario_data: dict[str, Any],
    *,
    scenario_index: int,
) -> list[dict[str, Any]]:
    collected: list[dict[str, Any]] = []
    active_context = ""
    active_context_targets: set[str] = set()
    active_section_title = ""

    for raw_question in scenario_data.get("questions", []):
        question_type = str(raw_question.get("type", "")).strip()
        if question_type == "followup_divider":
            active_context = ""
            active_context_targets = set()
            active_section_title = normalize_visible_text(raw_question.get("title", ""))
            continue
        if question_type == "context_card":
            context_id = str(raw_question.get("id", "")).strip()
            context_key = f"{scenario_rel_path}#{context_id}"
            active_context = render_context_card(raw_question)
            active_context_targets = set(CONTEXT_TARGETS.get(context_key, set()))
            continue

        question_id = str(raw_question.get("id", "")).strip()
        question_context = active_context if question_id in active_context_targets else ""
        override_key = f"{scenario_rel_path}#{question_id}"
        if override_key in QUESTION_CONTEXT_OVERRIDES:
            question_context = normalize_visible_text(QUESTION_CONTEXT_OVERRIDES[override_key])
        if question_id in active_context_targets:
            active_context_targets.remove(question_id)
            if not active_context_targets:
                active_context = ""
        elif not active_context_targets:
            active_context = ""

        if not question_id:
            raise ValueError(f"Frage ohne ID in {scenario_rel_path}.")

        source_ref_base = f"{scenario_rel_path}#{question_id}"

        if question_type == "table_fill":
            if scenario_index >= PREVIOUS_BATCH_START_INDEX:
                derived = build_yes_no_table_fill_question(
                    scenario_rel_path,
                    raw_question,
                    active_section_title,
                    batch_stage=1,
                    batch_rank=1,
                )
                if derived:
                    collected.append(derived)

            if source_ref_base in BATCH2_YES_NO_SOURCE_REFS:
                derived = build_yes_no_table_fill_question(
                    scenario_rel_path,
                    raw_question,
                    active_section_title,
                    batch_stage=STAGE2_BATCH_STAGE,
                    batch_rank=2,
                )
                if derived:
                    collected.append(derived)

            collected.extend(
                build_select_table_fill_category_questions(
                    scenario_rel_path,
                    raw_question,
                    active_section_title,
                )
            )
            continue

        if scenario_index >= PREVIOUS_BATCH_START_INDEX and question_type == "ordering":
            derived = build_ordering_single_choice_question(
                scenario_rel_path,
                raw_question,
                active_section_title,
                batch_stage=1,
                batch_rank=2,
            )
            if derived:
                collected.append(derived)
            continue

        if question_type == "number":
            collected.append(
                build_number_single_choice_question(
                    scenario_rel_path,
                    raw_question,
                    active_section_title,
                    question_context,
                )
            )
            continue

        if question_type not in SUPPORTED_TYPES:
            continue

        question_meta = QUESTION_META_BY_TYPE[question_type]

        if override_key in QUESTION_PROMPT_OVERRIDES:
            prompt = normalize_visible_text(QUESTION_PROMPT_OVERRIDES[override_key])
            context_text = ""
        else:
            prompt = normalize_visible_text(raw_question.get("prompt", ""))
            context_text = normalize_visible_text(question_context)
        instructions = normalize_visible_text(raw_question.get("title", ""))
        progress_links = raw_question.get("progressLinks", [])
        concept_group = str(progress_links[0]).strip() if isinstance(progress_links, list) and progress_links else ""

        correct_flags = get_correct_flags(raw_question)
        correct_count = sum(1 for is_correct in correct_flags if is_correct)
        if question_type == "single_choice" and correct_count != 1:
            raise ValueError(f"Single-Choice-Frage {question_id} in {scenario_rel_path} hat {correct_count} richtige Antworten.")
        if question_type == "multi_select" and correct_count < 2:
            raise ValueError(f"Multi-Select-Frage {question_id} in {scenario_rel_path} hat zu wenige richtige Antworten.")

        options: list[dict[str, Any]] = []
        for option_index, raw_option in enumerate(raw_question.get("options", []), start=1):
            override_key = f"{scenario_rel_path}#{question_id}::{option_index}"
            option_override = OPTION_OVERRIDES.get(override_key, {})
            option_text = normalize_visible_text(option_override.get("text", raw_option.get("text", "")))
            explanation = normalize_visible_text(
                option_override.get("explanation", raw_option.get("rationale") or raw_option.get("explanation", ""))
            )
            validate_visible_texts([option_text, explanation])
            source_option_id = str(raw_option.get("id") or option_index)
            options.append(
                {
                    "source_option_id": source_option_id,
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": option_text,
                    "explanation": explanation,
                    "is_correct": 1 if correct_flags[option_index - 1] else 0,
                }
            )

        validate_visible_texts([prompt, instructions, context_text])
        collected.append(
            {
                "source_question_id": question_id,
                "source_ref": f"{scenario_rel_path}#{question_id}",
                "prompt": prompt,
                "instructions": instructions,
                "context": context_text,
                "badge_label": question_meta["badge_label"],
                "interaction_type": question_meta["interaction_type"],
                "question_kind": question_meta["question_kind"],
                "concept_group": concept_group,
                "section_title": active_section_title,
                "max_selections": correct_count,
                "options": options,
                "variant_suffix": "direct",
                "batch_stage": 0 if scenario_index < PREVIOUS_BATCH_START_INDEX else 1,
                "batch_rank": 0,
            }
        )

    return collected


def build_concise_prompt(question: dict[str, Any], *, variant: str = "base") -> str:
    instructions = normalize_visible_text(question.get("instructions", "diesem Punkt"))
    interaction_type = question["interaction_type"]
    key = f"{question['source_ref']}::{variant}"
    current_prompt = normalize_visible_text(question.get("base_prompt") or question.get("prompt", ""))
    prompt_fragment, prompt_fragment_separator = embedded_prompt_fragment(current_prompt.rstrip(" ?.!"))
    source_ref = question["source_ref"]

    if ("::table_fill_category::" in source_ref or "::table_fill_yes_no" in source_ref) and prompt_fragment:
        if interaction_type == "multi":
            if variant == "alt2":
                templates = [
                    f"Für „{instructions}“ kommt es darauf an{prompt_fragment_separator}{prompt_fragment}.",
                    f"Bei „{instructions}“ soll sauber herausgearbeitet werden{prompt_fragment_separator}{prompt_fragment}.",
                    f"Im Kontext von „{instructions}“ ist zu klären{prompt_fragment_separator}{prompt_fragment}.",
                ]
            elif variant == "alt3":
                templates = [
                    f"Rund um „{instructions}“ ist herauszufinden{prompt_fragment_separator}{prompt_fragment}.",
                    f"Bei „{instructions}“ stehen die passenden Punkte im Fokus: {prompt_fragment}.",
                    f"Im Fall „{instructions}“ soll geprüft werden{prompt_fragment_separator}{prompt_fragment}.",
                ]
            elif variant in {"alt5", "alt6", "alt7", "alt8"}:
                templates = [
                    f"Im Gesamtbild von „{instructions}“ ist abzugrenzen{prompt_fragment_separator}{prompt_fragment}.",
                    f"Für „{instructions}“ soll belastbar eingeordnet werden{prompt_fragment_separator}{prompt_fragment}.",
                    f"Bei „{instructions}“ ist abschließend zu klären{prompt_fragment_separator}{prompt_fragment}.",
                ]
            else:
                templates = [
                    f"Markieren Sie bei „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
                    f"Prüfen Sie für „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
                    f"Arbeiten Sie bei „{instructions}“ heraus{prompt_fragment_separator}{prompt_fragment}.",
                ]
            return choose_template(templates, key)
        if variant == "alt2":
            templates = [
                f"Für „{instructions}“ ist zu klären{prompt_fragment_separator}{prompt_fragment}.",
                f"Im Kontext von „{instructions}“ stellt sich die Frage{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ ist fachlich zu entscheiden{prompt_fragment_separator}{prompt_fragment}.",
            ]
        elif variant == "alt3":
            templates = [
                f"Im Mittelpunkt von „{instructions}“ steht die Frage{prompt_fragment_separator}{prompt_fragment}.",
                f"Für „{instructions}“ soll entschieden werden{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ ist fachlich zu prüfen{prompt_fragment_separator}{prompt_fragment}.",
            ]
        elif variant in {"alt5", "alt6", "alt7", "alt8"}:
            templates = [
                f"Im Gesamtbild von „{instructions}“ ist einzuordnen{prompt_fragment_separator}{prompt_fragment}.",
                f"Für „{instructions}“ soll abschließend geklärt werden{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ ist belastbar zu entscheiden{prompt_fragment_separator}{prompt_fragment}.",
            ]
        else:
            templates = [
                f"Prüfen Sie für „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
                f"Bestimmen Sie bei „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
                f"Arbeiten Sie bei „{instructions}“ heraus{prompt_fragment_separator}{prompt_fragment}.",
            ]
        return choose_template(templates, key)

    if interaction_type == "multi":
        if variant == "alt" and prompt_fragment:
            templates = [
                f"Prüfen Sie für „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
                f"Arbeiten Sie bei „{instructions}“ heraus{prompt_fragment_separator}{prompt_fragment}.",
                f"Markieren Sie bei „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
            ]
            return choose_template(templates, key)
        if variant == "alt2" and prompt_fragment:
            templates = [
                f"Für „{instructions}“ kommt es darauf an{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ soll sauber herausgearbeitet werden{prompt_fragment_separator}{prompt_fragment}.",
                f"Im Kontext von „{instructions}“ ist zu klären{prompt_fragment_separator}{prompt_fragment}.",
            ]
            return choose_template(templates, key)
        if variant == "alt3" and prompt_fragment:
            templates = [
                f"Rund um „{instructions}“ ist herauszufinden{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ stehen die passenden Punkte im Fokus: {prompt_fragment}.",
                f"Im Fall „{instructions}“ soll geprüft werden{prompt_fragment_separator}{prompt_fragment}.",
            ]
            return choose_template(templates, key)
        if variant == "alt4" and prompt_fragment:
            templates = [
                f"Für „{instructions}“ ist fachlich einzuordnen{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ soll entschieden werden{prompt_fragment_separator}{prompt_fragment}.",
                f"Im Kontext von „{instructions}“ ist zu beurteilen{prompt_fragment_separator}{prompt_fragment}.",
            ]
            return choose_template(templates, key)
        if variant in {"alt5", "alt6", "alt7", "alt8"} and prompt_fragment:
            templates = [
                f"Im Gesamtbild von „{instructions}“ ist abzugrenzen{prompt_fragment_separator}{prompt_fragment}.",
                f"Für „{instructions}“ soll fachlich eingeordnet werden{prompt_fragment_separator}{prompt_fragment}.",
                f"Bei „{instructions}“ ist abschließend zu klären{prompt_fragment_separator}{prompt_fragment}.",
            ]
            return choose_template(templates, key)
        templates = [
            f"Welche Aussagen treffen bei „{instructions}“ zu?",
            f"Was gehört bei „{instructions}“ fachlich dazu?",
            f"Welche Punkte sind bei „{instructions}“ zutreffend?",
        ]
        return choose_template(templates, key)

    if variant == "alt" and prompt_fragment:
        templates = [
            f"Bestimmen Sie für „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
            f"Leiten Sie bei „{instructions}“ her{prompt_fragment_separator}{prompt_fragment}.",
            f"Klären Sie für „{instructions}“{prompt_fragment_separator}{prompt_fragment}.",
        ]
        return choose_template(templates, key)
    if variant == "alt2" and prompt_fragment:
        templates = [
            f"Für „{instructions}“ ist zu entscheiden{prompt_fragment_separator}{prompt_fragment}.",
            f"Bei „{instructions}“ stellt sich die Frage{prompt_fragment_separator}{prompt_fragment}.",
            f"Im Kontext von „{instructions}“ muss geklärt werden{prompt_fragment_separator}{prompt_fragment}.",
        ]
        return choose_template(templates, key)
    if variant == "alt3" and prompt_fragment:
        templates = [
            f"Im Mittelpunkt von „{instructions}“ steht die Frage{prompt_fragment_separator}{prompt_fragment}.",
            f"Für „{instructions}“ soll entschieden werden{prompt_fragment_separator}{prompt_fragment}.",
            f"Bei „{instructions}“ ist fachlich zu prüfen{prompt_fragment_separator}{prompt_fragment}.",
        ]
        return choose_template(templates, key)
    if variant == "alt4" and prompt_fragment:
        templates = [
            f"Für „{instructions}“ ist fachlich einzuordnen{prompt_fragment_separator}{prompt_fragment}.",
            f"Bei „{instructions}“ soll beurteilt werden{prompt_fragment_separator}{prompt_fragment}.",
            f"Im Kontext von „{instructions}“ ist zu entscheiden{prompt_fragment_separator}{prompt_fragment}.",
        ]
        return choose_template(templates, key)
    if variant in {"alt5", "alt6", "alt7", "alt8"} and prompt_fragment:
        templates = [
            f"Im Gesamtbild von „{instructions}“ ist einzuordnen{prompt_fragment_separator}{prompt_fragment}.",
            f"Für „{instructions}“ soll abschließend geklärt werden{prompt_fragment_separator}{prompt_fragment}.",
            f"Bei „{instructions}“ ist belastbar zu entscheiden{prompt_fragment_separator}{prompt_fragment}.",
        ]
        return choose_template(templates, key)

    templates = [
        f"Welche Antwort passt bei „{instructions}“ am besten?",
        f"Welche Auswahl trägt „{instructions}“ fachlich?",
        f"Welche Entscheidung ist für „{instructions}“ richtig?",
    ]
    return choose_template(templates, key)


ALT_VARIANT_SUFFIXES = ("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7", "::alt8")
DERIVED_CONCEPT_SUFFIXES = (
    "::number_choice",
    "::ordering_choice",
    "::table_fill_yes_no",
)


def concept_parent_ref(source_ref: str) -> str:
    parent_ref = source_ref
    trimmed = True
    while trimmed:
        trimmed = False
        for suffix in ALT_VARIANT_SUFFIXES:
            if parent_ref.endswith(suffix):
                parent_ref = parent_ref[: -len(suffix)]
                trimmed = True
                break
    if "::table_fill_category::" in parent_ref:
        parent_ref = parent_ref.split("::table_fill_category::", 1)[0]
    else:
        for suffix in DERIVED_CONCEPT_SUFFIXES:
            if parent_ref.endswith(suffix):
                parent_ref = parent_ref[: -len(suffix)]
                break
    return parent_ref


def clone_stage3_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt1"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt1",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt1",
        "batch_stage": STAGE3_BATCH_STAGE,
        "batch_rank": 1,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage3_single_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    per_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        singles = [
            question
            for question in pool["questions"]
            if question["interaction_type"] == "single" and not question["source_ref"].endswith("::alt1")
        ]
        per_pool.append((pool, singles))

    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
    while len(selected) < limit:
        progressed = False
        for pool, singles in per_pool:
            if len(selected) >= limit:
                break
            if not singles:
                continue
            selected.append((pool, singles.pop(0)))
            progressed = True
        if not progressed:
            break
    return selected


def add_stage3_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    for pool in pools:
        for question in pool["questions"]:
            if question["interaction_type"] == "multi" and not question["source_ref"].endswith("::alt1"):
                selected.append((pool, question))

    remaining = max(0, target - len(selected))
    selected.extend(select_stage3_single_questions(pools, remaining))
    selected = selected[:target]

    for pool, question in selected:
        pool["questions"].append(clone_stage3_variant(question))

    return len(selected)


def clone_stage4_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt2"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt2",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt2"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt2",
        "batch_stage": STAGE4_BATCH_STAGE,
        "batch_rank": 2,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage4_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage3_bases = {
        question["source_ref"][: -len("::alt1")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt1")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2"))
            and question["source_ref"] not in stage3_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    half = limit // 2
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), half))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), half - len(selected)))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    single_target = half
    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage4_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage4_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage4_variant(question))
    return len(selected)


def clone_stage5_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt3"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt3",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt3"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt3",
        "batch_stage": CURRENT_BATCH_STAGE,
        "batch_rank": 3,
        "is_new": 1,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage5_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage3_bases = {
        question["source_ref"][: -len("::alt1")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt1")
    }
    stage4_bases = {
        question["source_ref"][: -len("::alt2")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt2")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3"))
            and question["source_ref"] not in stage3_bases
            and question["source_ref"] not in stage4_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    multi_target = 60
    single_target = limit - multi_target
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), multi_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_multi_count = sum(1 for _, question in selected if question["interaction_type"] == "multi")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), multi_target - current_multi_count))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage5_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage5_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage5_variant(question))
    return len(selected)


def clone_stage6_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt4"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt4",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt4"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt4",
        "batch_stage": STAGE6_BATCH_STAGE,
        "batch_rank": 4,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage6_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage5_bases = {
        question["source_ref"][: -len("::alt3")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt3")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4"))
            and question["source_ref"] not in stage5_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    multi_target = 60
    single_target = limit - multi_target
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), multi_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_multi_count = sum(1 for _, question in selected if question["interaction_type"] == "multi")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), multi_target - current_multi_count))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage6_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage6_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage6_variant(question))
    return len(selected)


def clone_stage7_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt5"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt5",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt5"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt5",
        "batch_stage": STAGE7_BATCH_STAGE,
        "batch_rank": 5,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage7_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage6_bases = {
        question["source_ref"][: -len("::alt4")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt4")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5"))
            and question["source_ref"] not in stage6_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    multi_target = 60
    single_target = limit - multi_target
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), multi_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_multi_count = sum(1 for _, question in selected if question["interaction_type"] == "multi")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), multi_target - current_multi_count))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage7_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage7_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage7_variant(question))
    return len(selected)


def clone_stage8_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt6"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt6",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt6"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt6",
        "batch_stage": STAGE8_BATCH_STAGE,
        "batch_rank": 6,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage8_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage7_bases = {
        question["source_ref"][: -len("::alt5")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt5")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7"))
            and question["source_ref"] not in stage7_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    multi_target = 60
    single_target = limit - multi_target
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), multi_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_multi_count = sum(1 for _, question in selected if question["interaction_type"] == "multi")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), multi_target - current_multi_count))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage8_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage8_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage8_variant(question))
    return len(selected)


def clone_stage9_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt7"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt7",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt7"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt7",
        "batch_stage": STAGE9_BATCH_STAGE,
        "batch_rank": 7,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage9_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage8_bases = {
        question["source_ref"][: -len("::alt6")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt6")
    }

    preferred_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    fallback_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        preferred = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7"))
            and question["source_ref"] not in stage8_bases
        ]
        fallback = [
            question
            for question in pool["questions"]
            if not question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7"))
        ]
        preferred_pool.append((pool, preferred))
        fallback_pool.append((pool, fallback))

    def round_robin(source: list[tuple[dict[str, Any], list[dict[str, Any]]]], remaining: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
        selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
        while len(selected) < remaining:
            progressed = False
            for pool, questions in source:
                if len(selected) >= remaining:
                    break
                if not questions:
                    continue
                selected.append((pool, questions.pop(0)))
                progressed = True
            if not progressed:
                break
        return selected

    def filter_by_interaction(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        interaction_type: str,
    ) -> list[tuple[dict[str, Any], list[dict[str, Any]]]]:
        return [
            (pool, [question for question in questions if question["interaction_type"] == interaction_type])
            for pool, questions in source
        ]

    def remove_selected(
        source: list[tuple[dict[str, Any], list[dict[str, Any]]]],
        selected_refs: set[str],
    ) -> None:
        for _, questions in source:
            questions[:] = [question for question in questions if question["source_ref"] not in selected_refs]

    multi_target = 60
    single_target = limit - multi_target
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "multi"), multi_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_multi_count = sum(1 for _, question in selected if question["interaction_type"] == "multi")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "multi"), multi_target - current_multi_count))

    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(preferred_pool, selected_refs)
    remove_selected(fallback_pool, selected_refs)

    selected.extend(round_robin(filter_by_interaction(preferred_pool, "single"), single_target))
    selected_refs = {question["source_ref"] for _, question in selected}
    remove_selected(fallback_pool, selected_refs)
    current_single_count = sum(1 for _, question in selected if question["interaction_type"] == "single")
    selected.extend(round_robin(filter_by_interaction(fallback_pool, "single"), single_target - current_single_count))

    if len(selected) < limit:
        selected_refs = {question["source_ref"] for _, question in selected}
        remove_selected(fallback_pool, selected_refs)
        selected.extend(round_robin(fallback_pool, limit - len(selected)))

    return selected[:limit]


def add_stage9_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage9_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage9_variant(question))
    return len(selected)


def clone_stage10_variant(question: dict[str, Any]) -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::alt8"
    cloned = {
        **question,
        "source_question_id": f"{question['source_question_id']}::alt8",
        "source_ref": source_ref,
        "base_prompt": question.get("base_prompt", question["prompt"]),
        "prompt": build_concise_prompt(question, variant="alt8"),
        "options": reorder_options(question["options"], source_ref),
        "variant_suffix": "alt8",
        "batch_stage": STAGE10_BATCH_STAGE,
        "batch_rank": 8,
        "is_new": 0,
    }
    validate_visible_texts([cloned["prompt"], cloned["instructions"], cloned["context"]])
    return cloned


def select_stage10_questions(pools: list[dict[str, Any]], limit: int) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stage9_bases = {
        question["source_ref"][: -len("::alt7")]
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith("::alt7")
    }

    preferred_multi: list[tuple[dict[str, Any], dict[str, Any]]] = []
    preferred_single: list[tuple[dict[str, Any], dict[str, Any]]] = []
    fallback: list[tuple[dict[str, Any], dict[str, Any]]] = []

    for pool in pools:
        for question in pool["questions"]:
            if question["source_ref"].endswith(("::alt1", "::alt2", "::alt3", "::alt4", "::alt5", "::alt6", "::alt7", "::alt8")):
                continue
            if question["source_ref"] not in stage9_bases:
                bucket = preferred_multi if question["interaction_type"] == "multi" else preferred_single
                bucket.append((pool, question))
            fallback.append((pool, question))

    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
    if limit >= 1 and preferred_multi:
        selected.append(preferred_multi[0])
    if len(selected) < limit and preferred_single:
        used_refs = {question["source_ref"] for _, question in selected}
        for entry in preferred_single:
            if entry[1]["source_ref"] not in used_refs:
                selected.append(entry)
                break

    if len(selected) < limit:
        used_refs = {question["source_ref"] for _, question in selected}
        for entry in fallback:
            if entry[1]["source_ref"] in used_refs:
                continue
            selected.append(entry)
            used_refs.add(entry[1]["source_ref"])
            if len(selected) == limit:
                break

    return selected[:limit]


def add_stage10_variants(pools: list[dict[str, Any]], target: int) -> int:
    selected = select_stage10_questions(pools, target)
    for pool, question in selected:
        pool["questions"].append(clone_stage10_variant(question))
    return len(selected)


def active_batch_stage(question_limit: int) -> int:
    if question_limit >= 1000:
        return STAGE10_BATCH_STAGE
    if question_limit >= 998:
        return STAGE9_BATCH_STAGE
    if question_limit >= 898:
        return STAGE8_BATCH_STAGE
    if question_limit >= 798:
        return STAGE7_BATCH_STAGE
    if question_limit >= 698:
        return STAGE6_BATCH_STAGE
    return CURRENT_BATCH_STAGE


def active_batch_target(question_limit: int) -> int:
    if question_limit > 998:
        return question_limit - 998
    return CURRENT_BATCH_TARGET


def enforce_prompt_length(question: dict[str, Any]) -> None:
    prompt = normalize_visible_text(question.get("prompt", ""))
    if len(prompt) <= 250:
        question["prompt"] = prompt
        return
    question["prompt"] = build_concise_prompt(question, variant="short")


def uniquify_prompts(pools: list[dict[str, Any]]) -> None:
    grouped: dict[str, list[tuple[str, dict[str, Any]]]] = {}
    for pool in pools:
        for question in pool["questions"]:
            prompt = normalize_visible_text(question["prompt"])
            question["prompt"] = prompt
            grouped.setdefault(prompt, []).append((pool["label"], question))

    for prompt, entries in grouped.items():
        if len(entries) < 2:
            continue
        for index, (pool_label, question) in enumerate(entries, start=1):
            qualifier = variant_prompt_qualifier(question["source_ref"], index)
            qualifier_prefix = qualifier[:1].upper() + qualifier[1:] if qualifier else ""
            adjusted = normalize_visible_text(f"Themenfeld „{pool_label}“ {qualifier}: {prompt}")
            if len(adjusted) > 250:
                adjusted = normalize_visible_text(
                    f"{qualifier_prefix}: {build_concise_prompt(question, variant=f'dedupe_{index}')}"
                )
            if len(adjusted) > 250:
                adjusted = normalize_visible_text(f"{question['instructions']} ({qualifier})")
            question["prompt"] = adjusted


def finalize_questions(pools: list[dict[str, Any]]) -> None:
    all_questions = [question for pool in pools for question in pool["questions"]]
    assign_badge_labels(all_questions)
    for question in all_questions:
        enforce_prompt_length(question)
    uniquify_prompts(pools)
    for pool in pools:
        for question in pool["questions"]:
            if len(question["prompt"]) > 250:
                question["prompt"] = normalize_visible_text(
                    f"Themenfeld „{pool['label']}“: {build_concise_prompt(question, variant='limit')}"
                )
            validate_visible_texts([question["prompt"], question["instructions"], question["context"], question["badge_label"]])


def load_manifest_entries(count: int) -> list[dict[str, Any]]:
    manifest_data = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    scenarios = manifest_data.get("scenarios", [])
    return scenarios[:count]


def rebuild_database(pools: list[dict[str, Any]]) -> tuple[int, int]:
    question_count = sum(len(pool["questions"]) for pool in pools)
    option_count = sum(len(question["options"]) for pool in pools for question in pool["questions"])

    with sqlite3.connect(QUIZ_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(
            """
            DELETE FROM quiz_accepted_answer;
            DELETE FROM quiz_sequence_item;
            DELETE FROM quiz_option;
            DELETE FROM quiz_question;
            DELETE FROM quiz_pool_topic;
            DELETE FROM quiz_pool;
            DELETE FROM quiz_db_meta;
            """
        )

        conn.execute(
            """
            INSERT INTO quiz_db_meta (
              id,
              schema_version,
              db_key,
              course_key,
              title,
              description,
              language_code,
              default_badge_label
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                1,
                1,
                "Pruefungsvorbereitung-3-WISO-Quiz",
                "PV3WISO",
                "Prüfungsvorbereitung 3 WISO",
                "Read-only Quizdatenbank für WISO-Prüfungsvorbereitung.",
                "de",
                "",
            ),
        )

        for pool_sort_order, pool in enumerate(pools, start=1):
            default_badge_label = next(
                (question["badge_label"] for question in pool["questions"] if question.get("badge_label")),
                "Aufgabe",
            )
            conn.execute(
                """
                INSERT INTO quiz_pool (
                  id,
                  slug,
                  label,
                  description,
                  sort_order,
                  default_interaction_type,
                  default_question_kind,
                  default_badge_label,
                  source_ref,
                  is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pool["id"],
                    pool["slug"],
                    pool["label"],
                    pool["description"],
                    pool_sort_order,
                    None,
                    None,
                    default_badge_label,
                    pool["source_ref"],
                    1,
                ),
            )

            for topic in pool["topics"]:
                conn.execute(
                    "INSERT INTO quiz_pool_topic (pool_id, topic) VALUES (?, ?)",
                    (pool["id"], topic),
                )

            for question_sort_order, question in enumerate(pool["questions"], start=1):
                question_id = stable_id("question", question["source_ref"])
                concept_id = stable_id("concept", question["concept_key"])
                variant_id = stable_id("variant", question["variant_key"])

                conn.execute(
                    """
                    INSERT INTO quiz_question (
                      id,
                      pool_id,
                      concept_id,
                      variant_id,
                      sort_order,
                      interaction_type,
                      question_kind,
                      badge_label,
                      prompt,
                      instructions,
                      context,
                      max_selections,
                      is_new,
                      sentence_template,
                      gap_key,
                      source_ref,
                      is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        question_id,
                        pool["id"],
                        concept_id,
                        variant_id,
                        question_sort_order,
                        question["interaction_type"],
                        question["question_kind"],
                        question["badge_label"],
                        question["prompt"],
                        question["instructions"],
                        "",
                        question["max_selections"],
                        0,
                        "",
                        "",
                        question["source_ref"],
                        1,
                    ),
                )

                for option in question["options"]:
                    option_id = stable_id(
                        "option",
                        f"{question['source_ref']}::{option['source_option_id']}::{option['sort_order']}",
                    )
                    conn.execute(
                        """
                        INSERT INTO quiz_option (
                          id,
                          question_id,
                          option_key,
                          sort_order,
                          short_label,
                          text,
                          explanation,
                          is_correct,
                          is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            option_id,
                            question_id,
                            option["option_key"],
                            option["sort_order"],
                            "",
                            option["text"],
                            option["explanation"],
                            option["is_correct"],
                            1,
                        ),
                    )

        conn.commit()

    return question_count, option_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importiert WISO-Trainingsfragen in die SQLite-Quizdatenbank.")
    parser.add_argument(
        "--scenario-count",
        type=int,
        default=DEFAULT_SCENARIO_COUNT,
        help="Wie viele Tickets aus dem Manifest importiert werden sollen.",
    )
    parser.add_argument(
        "--question-limit",
        type=int,
        default=DEFAULT_QUESTION_LIMIT,
        help="Maximale Anzahl importierter Fragen.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    current_batch_target = active_batch_target(args.question_limit)
    manifest_entries = load_manifest_entries(args.scenario_count)

    pools: list[dict[str, Any]] = []
    total_questions = 0

    for scenario_index, entry in enumerate(manifest_entries):
        scenario_rel_path = str(entry.get("file", "")).strip()
        if not scenario_rel_path:
            continue
        scenario_path = SCENARIO_ROOT / scenario_rel_path
        scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
        collected_questions = collect_questions_for_scenario(
            scenario_rel_path,
            scenario_data,
            scenario_index=scenario_index,
        )
        remaining = args.question_limit - total_questions
        if remaining <= 0:
            break
        if not collected_questions:
            continue
        selected_questions = collected_questions[:remaining]
        if not selected_questions:
            continue

        source_folder = scenario_path.parent.name
        pool_slug = normalize_slug(source_folder)
        label = normalize_visible_text(strip_ticket_prefix(str(entry.get("label", ""))))
        description = normalize_visible_text(build_pool_description(scenario_data))
        validate_visible_texts([label, description])

        pools.append(
            {
                "id": stable_id("pool", scenario_rel_path),
                "slug": pool_slug,
                "label": label,
                "description": description,
                "source_ref": scenario_rel_path,
                "topics": [label],
                "questions": selected_questions,
            }
        )
        total_questions += len(selected_questions)

    added_stage3 = add_stage3_variants(pools, CURRENT_BATCH_TARGET)
    if args.scenario_count >= 9 and args.question_limit >= 398 and added_stage3 != CURRENT_BATCH_TARGET:
        raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-3-Fragen, gefunden wurden {added_stage3}.")

    added_stage4 = 0
    if args.question_limit >= 498:
        added_stage4 = add_stage4_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_stage4 != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-4-Fragen, gefunden wurden {added_stage4}.")

    added_variants = 0
    if args.question_limit >= 598:
        added_variants = add_stage5_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_variants != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} neue Fragen, gefunden wurden {added_variants}.")

    added_stage6 = 0
    if args.question_limit >= 698:
        added_stage6 = add_stage6_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_stage6 != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-6-Fragen, gefunden wurden {added_stage6}.")

    added_stage7 = 0
    if args.question_limit >= 798:
        added_stage7 = add_stage7_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_stage7 != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-7-Fragen, gefunden wurden {added_stage7}.")

    added_stage8 = 0
    if args.question_limit >= 898:
        added_stage8 = add_stage8_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_stage8 != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-8-Fragen, gefunden wurden {added_stage8}.")

    added_stage9 = 0
    if args.question_limit >= 998:
        added_stage9 = add_stage9_variants(pools, CURRENT_BATCH_TARGET)
        if args.scenario_count >= 9 and added_stage9 != CURRENT_BATCH_TARGET:
            raise ValueError(f"Erwartet waren {CURRENT_BATCH_TARGET} Stage-9-Fragen, gefunden wurden {added_stage9}.")

    added_stage10 = 0
    if args.question_limit >= 1000:
        added_stage10 = add_stage10_variants(pools, current_batch_target)
        if args.scenario_count >= 9 and added_stage10 != current_batch_target:
            raise ValueError(f"Erwartet waren {current_batch_target} Stage-10-Fragen, gefunden wurden {added_stage10}.")

    finalize_questions(pools)

    current_stage = active_batch_stage(args.question_limit)
    total_questions = 0
    new_questions = 0
    for pool in pools:
        for question in pool["questions"]:
            concept_key = concept_parent_ref(question["source_ref"])
            variant_key = question["source_ref"]
            question["concept_key"] = concept_key
            question["variant_key"] = variant_key
            question["is_new"] = 1 if int(question.get("batch_stage", 0)) == current_stage else 0
        total_questions += len(pool["questions"])
        new_questions += sum(int(question.get("is_new", 0)) for question in pool["questions"])

    if total_questions > args.question_limit:
        raise ValueError(f"Question-Limit überschritten: {total_questions} > {args.question_limit}")
    if args.scenario_count >= 9 and args.question_limit >= 598 and new_questions != current_batch_target:
        raise ValueError(f"Erwartet waren {current_batch_target} neue Fragen, gefunden wurden {new_questions}.")

    question_count, option_count = rebuild_database(pools)

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pools={len(pools)}")
    print(f"questions={question_count}")
    print(f"options={option_count}")
    print(f"new_questions={new_questions}")
    if args.question_limit >= 698:
        print(f"stage6_questions={added_stage6}")
    if args.question_limit >= 798:
        print(f"stage7_questions={added_stage7}")
    if args.question_limit >= 898:
        print(f"stage8_questions={added_stage8}")
    if args.question_limit >= 998:
        print(f"stage9_questions={added_stage9}")
    if args.question_limit >= 1000:
        print(f"stage10_questions={added_stage10}")


if __name__ == "__main__":
    main()
