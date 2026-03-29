# Synchrone Verschluesselung in 3 Minuten

Status: Paket 1 von 10. Globales Wahrheitsmodell und Gesamtkonzept vor den intensiven Szenen-Durchlaeufen.

Wichtig: Diese Datei ist kein grober Ideenzettel, sondern die harte Referenz fuer alle folgenden Szenen-Paesse. Jede Szene muss spaeter gegen diese Invarianten geprueft werden. Wenn eine Szene dieses Wahrheitsmodell verletzt, wird die Szene oder das Script angepasst.

## Scope

- Presentation ID: `symmetric_encryption_3min`
- User-facing Titel aktuell:
  `Synchrone Verschluesselung in 3 Minuten`
- Fachlicher Kern:
  `symmetrische Verschluesselung`
- Warum beide Begriffe aktuell koexistieren:
  Im Projekt wurde der User-facing Begriff auf `synchron` gezogen, um den gemeinsamen Schluessel auf beiden Seiten leichter verbal einzufangen. Fachlich bleibt die Demo aber ein Slice von `symmetrischer Verschluesselung`.
- Nicht verhandelbar:
  Die Bildlogik und das Sprecherdenken muessen fachlich symmetrische Verschluesselung zeigen, auch wenn der User-facing Titel `synchron` sagt.

## Topic and Type

- `topicClusterId`: `verschluesselung`
- `topicClusterTitle`: `Verschluesselung`
- `presentationType`: `sender_receiver_flow`
- `presentationTypeNotes`:
  Die Praesentation lebt von einem durchgehenden Sender-Empfaenger-Fluss mit einem klar sichtbaren Zustandswechsel von Klartext zu Geheimtext und wieder zu Klartext.

## Non-Negotiable Global Truths

Diese Aussagen muessen in jeder Szene wahr bleiben.

1. Es gibt genau einen gemeinsamen geheimen Schluessel.
2. Dieser eine Schluessel wird zum Verschluesseln und zum Entschluesseln verwendet.
3. Klartext darf nur vor der Verschluesselung und nach der korrekten Entschluesselung lesbar sein.
4. Im unsicheren Netz darf nur Geheimtext transportiert werden, sobald Schutz aktiv ist.
5. Der Angreifer darf Daten abfangen, aber ohne Schluessel keinen Klartext gewinnen.
6. Der Algorithmus darf sichtbar und bekannt sein; der Schluessel ist der eigentliche Schutzgegenstand.
7. Die groesste Schwaeche ist der sichere Austausch dieses gemeinsamen Schluessels.
8. Spaetere Szenen duerfen nie implizit frueher aktiviert sein.

## Stage Vocabulary

Jedes Kernelement bekommt eine feste Bedeutung. Diese Bedeutung darf spaeter nicht pro Szene wechseln.

### Sender

- Bedeutung:
  Quelle des Klartexts
- muss im Standbild sagen:
  `Hier startet lesbare Information`
- darf nicht implizieren:
  dass der Empfaenger oder das Netz den Klartext bereits kennt

### Empfaenger

- Bedeutung:
  Ziel des Rueckgewinnens von Klartext
- muss im Standbild sagen:
  `Hier endet die Wiederlesbarkeit`
- darf nicht implizieren:
  dass der Klartext schon im Netz oder in der Mitte auftaucht

### Verschluesselungsbox

- Bedeutung:
  Prozess, der aus Klartext plus gemeinsamem Schluessel Geheimtext macht
- muss im Standbild sagen:
  `Hier wird gerade unleserlich gemacht`
- darf nicht frueher aktiv sein:
  wenn Szene 1 noch offene Uebertragung zeigt

### Entschluesselungsbox

- Bedeutung:
  Prozess, der aus Geheimtext plus demselben Schluessel wieder Klartext macht
- muss im Standbild sagen:
  `Hier wird nur mit dem richtigen Schluessel wieder lesbar`
- darf nicht frueher aktiv sein:
  solange das Konzept noch nicht eingefuehrt wurde

### Gemeinsamer geheimer Schluessel

- Bedeutung:
  derselbe Schluessel auf beiden Seiten
- muss im Standbild sagen:
  `identischer Besitzgegenstand auf Sender- und Empfaengerseite`
- darf nicht implizieren:
  dass er zentral im Netz erzeugt wird
- muss spaeter koennen:
  kompromittiert, gestohlen, sicher ausgetauscht oder unsicher abgefangen werden

### Offenes Netz

- Bedeutung:
  unsicherer Transportweg
- muss im Standbild sagen:
  `hier kann abgefangen werden`
- darf nicht implizieren:
  dass das Netz selbst geheim oder vertrauenswuerdig ist

### Angreifer

- Bedeutung:
  Mitleser oder Abgreifer auf dem Transportweg
- muss im Standbild sagen:
  `ich sehe, was auf dem angezapften Weg sichtbar ist`
- darf nicht koennen:
  Dinge sehen, die nur in Endgeraeten oder Boxen passieren, wenn die Szene das nicht ausdruecklich freigibt

### Tresor

- Bedeutung:
  Schutz des geheimen Schluessels
- muss im Standbild sagen:
  `das eigentliche Sicherheitsobjekt ist der Schluessel`
- darf nicht die Hauptrolle uebernehmen:
  bevor Szene 6 erreicht ist

## Cross-Scene Continuity Anchors

Diese Kontinuitaeten muessen ueber alle Szenen hinweg gleich bleiben.

### Anchors for message continuity

- Klartext bleibt:
  `Treffen um 15 Uhr`
- Geheimtext bleibt:
  dieselbe kryptische Familie `8A F2 91 C4 ...`
- Der Zuschauer darf verstehen:
  es ist immer dieselbe Nachricht, nur in unterschiedlichen Zustaenden

### Anchors for key continuity

- Es gibt genau einen logisch identischen gemeinsamen Schluessel
- Linke und rechte Darstellung sind zwei Besitzorte desselben Schluesseltyps, nicht zwei verschiedene Schluessel
- Der gestohlene Schluessel in Szene 6 muss logisch derselbe Schluessel sein, der vorher eingefuehrt wurde

### Anchors for attacker continuity

- Der Angreifer aus Szene 1 ist logisch derselbe Gegenspieler in Szene 4, 6 und 7
- In Szene 4 abgefangener Geheimtext speist Szene 6
- In Szene 7 abgefangener Schluessel erklaert, warum das gesamte Verfahren kippt

### Anchors for cause-effect continuity

- Szene 1 motiviert den Schutz
- Szene 2 definiert das Prinzip
- Szene 3 zeigt die Umwandlung
- Szene 4 zeigt den begrenzten Angreifer
- Szene 5 zeigt korrekte Rueckgewinnung
- Szene 6 zeigt den eigentlichen Sicherheitsbruch
- Szene 7 erklaert, wo dieser Bruch in der Praxis entsteht
- Szene 8 verdichtet alles ohne neue Information

## Global Knowledge Matrix

Das ist die zentrale Wahrheitsachse fuer alle 8 Szenen.

| Cue | Schutzstatus | Sender weiss | Empfaenger weiss | Angreifer weiss | Netz transportiert | Muss verborgen bleiben |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Problem | erst offen, dann Schutz startet | Klartext | Zielinhalt | offenen Klartext vor Schutz | erst Klartext, spaeter Geheimtext | aktive Entschluesselung vor ihrer Einfuehrung |
| 2 Grundidee | Schutzprinzip erklaert | gleicher Schluessel | gleicher Schluessel | nur das Prinzip, nicht den Schluessel | Schema, kein offener Klartext im Netz | zwei verschiedene Schluessel |
| 3 Sender | Schutz aktiv | Klartext + Schluessel | noch kein Inhalt | hoechstens ausgehenden Geheimtext | Geheimtext | Klartext in der Mitte |
| 4 Transport | Schutz aktiv | Klartextursprung | erwartet spaetere Entschluesselung | nur Geheimtext | Geheimtext | lesbarer Inhalt im Netz |
| 5 Empfaenger | Schutz aktiv | hat gesendet | kann mit demselben Schluessel lesen | weiterhin kein Klartext | ankommender Geheimtext | funktionierende Entschluesselung mit falschem Schluessel |
| 6 Schluesseldiebstahl | Schutz kippt durch Key-Verlust | Verfahren bekannt | Verfahren bekannt | mit gestohlenem Schluessel wird alter Geheimtext lesbar | bereits abgefangener Geheimtext + gestohlener Key | Idee, dass der Algorithmus selbst das Problem ist |
| 7 Austauschproblem | Verfahren prinzipiell gefaehrdet | braucht denselben Key | braucht denselben Key | kann den Key auf rotem Pfad direkt bekommen | hier steht der Schluesseltransport im Fokus | Behauptung, das Netz selbst sei das Hauptproblem |
| 8 Finale | verdichtete Endform | Prinzip verstanden | Prinzip verstanden | Rolle verstanden | Geheimtext in der Mitte | neue Nebenprobleme oder neue Ausnahmefaelle |

## Hidden / Dormant / Active Model

Diese Trennung ist fuer die visuelle Logik entscheidend.

### Shared key

- Cue 1 offen:
  `hidden`
- Cue 1 nach Rewind:
  `dormant -> active`
- Cue 2 bis 5:
  `active`
- Cue 6:
  `active, then compromised`
- Cue 7:
  `active as transfer object`
- Cue 8:
  `active as core principle`

### Encryption process

- Cue 1 offener Transport:
  `hidden`
- Cue 1 nach Rewind:
  `dormant`
- Cue 2:
  `active as abstract principle`
- Cue 3:
  `active as concrete sender action`
- Cue 4:
  `completed, not main focus`
- Cue 5:
  `not main focus`
- Cue 6 bis 8:
  `background principle only`

### Decryption process

- Cue 1:
  `hidden`
- Cue 2:
  `active as abstract principle`
- Cue 3:
  `hidden`
- Cue 4:
  `hidden`
- Cue 5:
  `active as concrete receiver action`
- Cue 6:
  `active for attacker only after key theft`
- Cue 7:
  `not active`
- Cue 8:
  `active as abstract endpoint`

### Attacker success

- Cue 1:
  `active success before protection`
- Cue 2:
  `dormant concept`
- Cue 3:
  `not yet successful`
- Cue 4:
  `active interception, unsuccessful reading`
- Cue 5:
  `inactive`
- Cue 6:
  `active success after key theft`
- Cue 7:
  `active success on insecure key exchange`
- Cue 8:
  `resolved as explanatory memory`

## Label Truth Rules

Keine Beschriftung darf ihrer Szene vorauslaufen.

### Allowed label families

- `Klartext`
- `Geheimtext`
- `Gemeinsamer geheimer Schluessel`
- `Verschluesselung`
- `Entschluesselung`
- `Unsicheres Netz`
- `Sicherer Weg`
- `Offener Weg`

### Forbidden label mistakes

- `Verschluesselung` sichtbar waehrend Szene 1 noch nur offene Uebertragung erklaert
- `Entschluesselung` schon aktiv, bevor sie begrifflich eingefuehrt ist
- `Geheimtext` auf einem Objekt, das noch Klartext zeigt
- `Gemeinsamer geheimer Schluessel` zentral im Netz, wenn dadurch zentrale Erzeugung suggeriert wird
- `Angreifer sieht nur Datenmuell`, solange Szene 1 bewusst den offenen Klartext zeigt

## Camera Truth Rules

- Die Kamera darf Verstaendnis fuehren, aber keine falsche Hauptsache erzeugen.
- Totale fuer Ursache-Raum:
  Szene 1, 2, 7, 8
- Sendernah fuer Umwandlung:
  Szene 3
- Netz-/Angreifernah fuer Interception:
  Szene 4
- Empfaengernah fuer Rueckgewinnung:
  Szene 5
- Rechtsunten / Tresor-Fokus fuer Schluesseldiebstahl:
  Szene 6

Wenn eine Kameraeinstellung den Schluessel wie eine zentrale Netzressource aussehen laesst, ist sie falsch.

## Speaker Script Safety Rules

- Script und Bild duerfen sich nicht widersprechen.
- Wenn der Sprecher `derselbe Schluessel` sagt, muss visuell genau derselbe Schluesseltyp auf beiden Seiten lesbar sein.
- Wenn der Sprecher `nur Geheimtext im Netz` sagt, darf kein lesbarer Klartext mehr im Netz sichtbar sein.
- Wenn der Sprecher `Algorithmus darf bekannt sein` sagt, muss die Maschine offen und neutral wirken, nicht mystisch oder heimlich.
- Wenn der Sprecher `groesste Schwaeche ist der Austausch` sagt, muss die Szene den Schluesseltransport zeigen, nicht erneut nur Datenverkehr.

## Derived Corrections Already Forced by the Truth Model

Diese Korrekturen sind nicht optional. Sie folgen direkt aus dem Modell.

1. Szene 1 darf keinerlei aktive Verschluesselung oder Entschluesselung zeigen, solange noch offene Uebertragung erklaert wird.
2. Der Schluessel darf nicht zentral ueber dem Netz entstehen; senderseitige oder zwischen beiden Seiten logisch gekoppelte Einfuehrung ist Pflicht.
3. Szene 4 muss Geheimtext abfangen, der in Szene 6 wiederverwendet wird.
4. Szene 5 darf den falschen Schluessel nur als kurzen Kontrast zeigen, nicht als zweites Hauptthema.
5. Szene 6 muss den Algorithmus sichtbar offenlassen und ausschliesslich den Schluessel als Kompromittierungsobjekt markieren.
6. Szene 7 muss den Schluesselweg fokussieren, nicht den Nachrichtentransport.
7. Szene 8 darf keine neuen Risiken mehr einfuehren.

## New Sub-Work-Packages Derived from Package 1

Diese Teilpakete sind aus dem globalen Wahrheitsmodell abgeleitet und muessen spaeter in Szenenarbeit oder Runtime-Arbeit landen.

1. `Message continuity lock`
   Dieselbe Klartext- und Geheimtextfamilie in allen Szenen konsequent halten.

2. `Shared-key ownership lock`
   Sicherstellen, dass jede Schluesseldarstellung wie derselbe Besitzgegenstand wirkt und nicht wie zwei verschiedene Schluessel.

3. `Attacker memory thread`
   Abgefangener Geheimtext aus Szene 4 muss in Szene 6 wieder auftauchen.

4. `Exchange-path truth`
   Szene 7 braucht einen klar getrennten gruenden und roten Schluesselpfad.

5. `Terminology hygiene`
   User-facing `synchron` darf die fachliche Symmetrie nicht vernebeln. Jede Szene muss fachlich korrekt bleiben.

## Package 1 Result

Paket 1 ist erst dann abgeschlossen, wenn alle folgenden Pakete die Inhalte dieser Datei als harte Referenz benutzen.

Aktueller PaketName: Globales Wahrheitsmodell und Gesamtkonzept fuer alle 8 Szenen festziehen
Paket: 1/10
PaketFortschritt: 100%
GesamtFortschritt: 28%
