# Synchrone Verschluesselung in 3 Minuten

Status: Laufende Vollplanung nach `create-babylon-presentation`. Dieses Dokument fuehrt die eigentliche Szenenarbeit. Das globale Wahrheitsmodell liegt in `frontend/presenter/symmetric_encryption_3min_truth_model.md`.

Wichtig: Gesamtfortschritt fuer die Praesentation ist erst 100%, wenn alle 8 Szenen nach Skill-Protokoll durchlaufen wurden und der Gesamtabgleich ohne offene Widersprueche steht.

## Current Work Package Framing

- current package name: `Szene 1 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `2`
- total package count: `10`
- current package goal:
  Szene 1 so praezise durchplanen, dass die offene Uebertragung, der Mitlese-Schock, der Rueckspul-Moment und die spaete Schutzaktivierung logisch und visuell unangreifbar werden.
- current known risks:
  Die Szene kann zu frueh Verschluesselungsobjekte andeuten.
  Der Angreifer kann zu technisch statt zu offensichtlich wirken.
  Der Rueckspulmoment kann wie Effektspielerei statt didaktischer Umschaltpunkt wirken.
  Die Schluesseleinblendung kann wieder wie zentrale Erzeugung wirken, wenn ihre Position oder Bruecken falsch gesetzt werden.

## Round 1: Coarse Whole-Presentation Plan

### Scene 1 - Das Grundproblem

- teaching point:
  Ohne Schutz ist lesbarer Klartext im offenen Netz sichtbar; genau daraus entsteht der Bedarf nach Verschluesselung.
- estimated duration:
  20 Sekunden
- visible actors or objects:
  Sender links, Empfaenger rechts, offenes Netz in der Mitte, lesbare Nachricht, Angreifer / Mitleser, danach gemeinsamer Schluessel
- message state:
  erst Klartext im Netz, danach dieselbe Nachricht als Geheimtext
- attacker or observer knowledge:
  vor Schutz voll lesbar, nach Schutz nur noch Datenmuell
- key ownership or other critical state:
  anfangs kein Schutz, spaeter gemeinsamer geheimer Schluessel auf beiden Seiten
- own cue or beat:
  eigener Cue mit vier internen Beats

### Scene 2 - Die Grundidee

- teaching point:
  Ein und derselbe Schluessel dient beiden Seiten.

### Scene 3 - Sender

- teaching point:
  Der Sender erzeugt aus Klartext plus Schluessel Geheimtext.

### Scene 4 - Transport

- teaching point:
  Im Netz sieht man nur noch Geheimtext.

### Scene 5 - Empfaenger

- teaching point:
  Derselbe Schluessel macht den Geheimtext wieder lesbar.

### Scene 6 - Schluesseldiebstahl

- teaching point:
  Nicht der Algorithmus, sondern der verlorene Schluessel kippt alles.

### Scene 7 - Austauschproblem

- teaching point:
  Der sichere Schluesselaustausch bleibt die groesste Schwaeche.

### Scene 8 - Fazit

- teaching point:
  Nicht das Netz muss geheim sein, sondern der Schluessel.

## Scene 1 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem einzigen Standbild verstehen:

- hier wird gerade eine lesbare Nachricht offen transportiert
- das Netz ist nicht vertrauenswuerdig
- ein Dritter kann mitlesen
- der spaetere Schutz ist hier noch nicht aktiv

### Silhouette requirements

Folgende Formen muessen ohne Lesen funktionieren:

- Sender als urspruengliche Arbeitsstation
- Empfaenger als Zielstation
- zentrale Transportstrecke als offener Kanal
- Angreifer als zapfender oder blickender Dritter
- Nachrichtenobjekt als lesbares Dokument oder Nachrichtenkarte

### Must still be hidden

Diese Konzepte duerfen in Pass 1 von Szene 1 noch nicht als aktiv erscheinen:

- aktive Verschluesselungsbox
- aktive Entschluesselungsbox
- laufender Geheimtexttransport
- Tresor / Schluesseldiebstahl
- gruen/rot codierter Austauschpfad
- falscher Schluessel

### Necessary labels

- `Offene Uebertragung` oder gleichwertig
- `Klartext`
- `Angreifer liest mit`

### Labels that should stay out for now

- `Verschluesselung`
- `Entschluesselung`
- `Geheimtext`
- `gemeinsamer Schluessel` im fruehen offenen Teil

### Single most important visual sentence

`Lesbarer Inhalt ist im offenen Netz fuer Dritte sichtbar.`

## Scene 1 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Offener Start

- duration target:
  ca. 0s bis 7s
- state:
  offene Nachricht verlaesst den Sender lesbar
- required feeling:
  ungeschuetzt, beinahe naiv offen
- forbidden visual:
  kein Schloss, keine aktive Crypto-Station

#### Beat 2 - Mitlese-Schock

- duration target:
  ca. 7s bis 12s
- state:
  Angreifer zapft an oder blickt in die Leitung und liest denselben Klartext
- required feeling:
  sofortige Verstaendlichkeit des Problems
- forbidden visual:
  Angreifer darf nicht aussehen, als haette er einen Schluessel oder muessige Zusatztechnik gebraucht

#### Beat 3 - Rueckspulen

- duration target:
  ca. 12s bis 16s
- state:
  dieselbe offene Nachricht zieht sichtbar zurueck
- required feeling:
  `So nicht -> wir machen es richtig`
- forbidden visual:
  Rueckspulen darf nicht wie Zeitreise-Gag wirken; es ist eine didaktische Korrektur

#### Beat 4 - Schutz wird eingeschaltet

- duration target:
  ca. 16s bis 20s
- state:
  gemeinsamer geheimer Schluessel erscheint logisch zwischen den Enden verankert; dieselbe Nachricht kippt noch vor dem Netz in Geheimtext
- required feeling:
  jetzt ist das Problem nicht weggezaubert, sondern fachlich geloest
- forbidden visual:
  Schluessel darf nicht zentral ueber dem Netz materialisieren wie aus einer neutralen Wolke

### Object-state truth table

#### Sender

- beat 1:
  aktiv, besitzt lesbaren Klartext
- beat 2:
  weiterhin Ursprung des offenen Klartexts
- beat 3:
  nimmt die offene Nachricht logisch zurueck
- beat 4:
  wird Startpunkt fuer spaeteren geschuetzten Versand

#### Empfaenger

- beat 1:
  passives Ziel der offenen Nachricht
- beat 2:
  bleibt Ziel, weiss aber noch nichts vom Schutz
- beat 3:
  Zielbezug bleibt, offene Uebertragung verschwindet
- beat 4:
  wird zweite Seite des gemeinsamen Schluessels

#### Nachricht

- beat 1:
  Klartext
- beat 2:
  Klartext
- beat 3:
  Klartext rueckwaerts
- beat 4:
  wird kurz vor dem Netz zu Geheimtext

#### Angreifer

- beat 1:
  dormant
- beat 2:
  aktiv erfolgreich
- beat 3:
  verliert Zugriff mit dem Rueckspulen
- beat 4:
  bleibt vorhanden, aber ohne Lesbarkeit

#### Verschluesselung / Entschluesselung

- beat 1:
  hidden
- beat 2:
  hidden
- beat 3:
  hidden
- beat 4:
  nur als beginnende Logik andeuten, nicht als volle Prozessszene

#### Gemeinsamer Schluessel

- beat 1:
  hidden
- beat 2:
  hidden
- beat 3:
  hidden
- beat 4:
  active introduction

### Path logic

- Open path:
  von Sender ueber offenes Netz zu Empfaenger
- Attack tap:
  greift denselben offenen Pfad in Beat 2 ab
- Rewind path:
  exakt derselbe offene Pfad rueckwaerts
- Protected path:
  entsteht erst nach dem Rueckspulmoment

### Caption / TTS beat mapping

- Beat 1:
  `Wenn Daten offen ueber ein Netzwerk uebertragen werden, koennen andere sie mitlesen.`
- Beat 2:
  `Genau das ist das Problem.`
- Beat 3:
  `Deshalb spulen wir zurueck.`
- Beat 4:
  `Bei der synchronen beziehungsweise fachlich symmetrischen Verschluesselung nutzen Sender und Empfaenger denselben geheimen Schluessel.`

## Scene 1 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 1 darf das Schluesselproblem nur einfuehren, aber noch nicht voll analysieren.
- Die offene Lesbarkeit muss spaeter in Szene 4 kontrastiert werden, wo derselbe Angreifer nur noch Geheimtext sieht.
- Der in Szene 1 eingefuehrte gemeinsame Schluessel muss spaeter exakt in Szene 2 wieder aufgenommen werden.
- Der Rueckspulmoment ist fuer die ganze Praesentation die Geburtsstelle des Schutznarrativs. Er darf nicht optisch schwach sein.

### Forced revisions for later scenes

1. Szene 2 muss die gleiche Sender-/Empfaenger-Achse beibehalten, sonst wirkt Szene 1 wie ein fremdes Intro.
2. Szene 3 darf dieselbe Nachricht `Treffen um 15 Uhr` nutzen, damit die Rueckspul-Korrektur aus Szene 1 fortlebt.
3. Szene 4 muss den Angreifer wieder zeigen, aber jetzt als klar erfolglose Lesesituation.
4. Szene 8 muss den offenen-vs-geschuetzten Gegensatz nochmal kondensieren, ohne Szene 1 zu wiederholen.

### Derived sub-work-packages from Scene 1

1. `Rewind readability`
   Rueckspulen muss als didaktischer Reset klarer werden als ein normaler Bewegungsumkehr-Effekt.

2. `Attacker simplicity`
   Der Angreifer braucht eine brutal einfache visuelle Grammatik, damit das Problem in weniger als einer Sekunde klar ist.

3. `Late activation discipline`
   Verschluesselungs- und Entschluesselungsobjekte duerfen vor Beat 4 nicht visuell dominant sein.

## Package 2 Result

Szene 1 ist jetzt fuer die spaetere Runtime- und Script-Arbeit so weit vorstrukturiert, dass jedes weitere Detail gegen explizite Wahrheitsregeln geprueft werden kann.

## Current Work Package Framing

- current package name: `Szene 2 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `3`
- total package count: `10`
- current package goal:
  Das Kapitel zur Grundidee so scharf zu planen, dass niemand nach der Szene noch glauben kann, es gaebe zwei verschiedene geheime Schluessel oder `synchron` meine zeitgleich statt gemeinsam.
- current known risks:
  Die Szene kann zu abstrakt und schulbuchhaft wirken.
  Der gleiche Schluessel kann visuell trotzdem wie zwei Schluessel gelesen werden.
  Der Begriff `synchron` kann den Fachkern weiter vernebeln, wenn die Szene ihn nicht sauber uebersetzt.

## Scene 2 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem Standbild verstehen:

- links wird verschluesselt
- rechts wird entschluesselt
- derselbe Schluessel steckt in beiden Prozessen
- dazwischen liegt kein zweiter Schluessel, sondern derselbe logische Besitzgegenstand auf beiden Seiten

### Silhouette requirements

Folgende Formen muessen ohne viel Text lesbar sein:

- zwei Prozessstationen mit klar unterschiedlicher Richtung
- ein identischer Schluesseltyp links und rechts
- Klartext-Objekt links und rechts
- Geheimtext-Objekt in der Mitte

### Must still be hidden

- konkreter Angreifererfolg oder Schluesseldiebstahl
- Tresor als Hauptmotiv
- roter/gruener Austauschpfad
- falscher Schluessel als Kontrast

### Necessary labels

- `Klartext`
- `Geheimtext`
- `Derselbe geheime Schluessel`
- eine kurze Klarstellung gegen das Zeitgleich-Missverstaendnis

### Labels that should stay out for now

- `groesste Schwaeche`
- `Schluesseldiebstahl`
- `unsicherer Austausch`

### Single most important visual sentence

`Ein und derselbe geheime Schluessel arbeitet auf beiden Seiten derselben Umwandlungskette.`

## Scene 2 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Begriff aufraeumen

- duration target:
  ca. 20s bis 27s
- state:
  Szene uebersetzt `synchron` in `derselbe Schluessel auf beiden Seiten`
- required feeling:
  Missverstaendnis wird ruhig beseitigt
- forbidden visual:
  keine simultanen Prozessshows ohne didaktische Klarstellung

#### Beat 2 - Linke Richtung aufbauen

- duration target:
  ca. 27s bis 34s
- state:
  `Klartext -> Verschluesselung -> Geheimtext`
- required feeling:
  saubere Hinrichtung
- forbidden visual:
  rechter Prozess darf noch nicht die Aufmerksamkeit stehlen

#### Beat 3 - Rechte Richtung aufbauen

- duration target:
  ca. 34s bis 40s
- state:
  `Geheimtext -> Entschluesselung -> Klartext`
- required feeling:
  Spiegelung der linken Logik
- forbidden visual:
  neuer oder anderer Schluesseltyp

#### Beat 4 - Identitaet des Schluessels fixieren

- duration target:
  ca. 40s bis 45s
- state:
  identischer Schluessel dockt links und rechts sichtbar ein
- required feeling:
  derselbe Schluessel, nicht zwei verschiedene
- forbidden visual:
  Schluessel aus Netzmitte oder anonymer Generator ueber der Buehne

### Object-state truth table

#### Shared key

- beat 1:
  sichtbar, aber noch nicht in voller Prozessaktion
- beat 2:
  aktiv an der linken Station
- beat 3:
  aktiv an der rechten Station
- beat 4:
  als identische Instanz auf beiden Seiten logisch fixiert

#### Encryption station

- beat 1:
  dormant
- beat 2:
  active
- beat 3:
  secondary
- beat 4:
  active but stabilized

#### Decryption station

- beat 1:
  dormant
- beat 2:
  background
- beat 3:
  active
- beat 4:
  active but stabilized

#### Message state

- beat 1:
  noch als Schemaelemente getrennt
- beat 2:
  links Klartext, Mitte Geheimtext
- beat 3:
  Mitte Geheimtext, rechts Klartext
- beat 4:
  kompletter Endfluss lesbar

#### Angreifer

- beat 1 bis 4:
  hidden or dormant only

### Path logic

- linker Pfad:
  klarer Transformationspfeil von lesbar zu unlesbar
- rechter Pfad:
  klarer Transformationspfeil von unlesbar zu lesbar
- Schluesselpfad:
  kein zentraler Erzeugungspfad, sondern zwei Besitzorte mit identischem Typ

### Caption / TTS beat mapping

- Beat 1:
  `Hier bedeutet synchron nicht gleichzeitig.`
- Beat 2:
  `Gemeint ist: derselbe geheime Schluessel arbeitet links beim Verschluesseln.`
- Beat 3:
  `Und derselbe geheime Schluessel arbeitet rechts beim Entschluesseln.`
- Beat 4:
  `Es gibt also nicht zwei verschiedene Schluessel, sondern genau einen gemeinsamen geheimen Schluessel.`

## Scene 2 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 2 muss das semantische Rueckgrat fuer die ganze Demo werden.
- Wenn hier der gleiche Schluessel nicht komplett klar wird, brechen Szene 5 und Szene 7 spaeter didaktisch ein.
- Diese Szene darf kein Nebenproblem aufmachen; sie ist reine Prinzipklaerung.

### Forced revisions for later scenes

1. Szene 3 muss den Schluessel als denselben Besitzgegenstand weiterfuehren, nicht als neuen Input.
2. Szene 5 muss das `derselbe Schluessel`-Versprechen exakt einloesen.
3. Szene 7 muss das Austauschproblem genau deshalb betonen, weil Szene 2 den gemeinsamen Schluessel so klar gemacht hat.

### Forced revisions for earlier scene

1. Szene 1 muss die Schluesseleinblendung so vorbereiten, dass Szene 2 sie ohne Bruch weiterfuehren kann.
2. Wenn Szene 1 noch zu sehr auf Netzproblem statt auf Schluesselprinzip fokussiert, muss der Rewind-Abschluss nachgeschaerft werden.

### Derived sub-work-packages from Scene 2

1. `Same-key identity cueing`
   Visuelle Mittel definieren, mit denen derselbe Schluesseltyp links und rechts sofort als identisch gelesen wird.

2. `Synchron wording control`
   Jede Textstelle pruefen, damit `synchron` nie als `gleichzeitig` missverstanden wird.

3. `Principle compression`
   Sicherstellen, dass die Szene das Prinzip stark genug verdichtet, ohne trocken oder rein schulbuchhaft zu wirken.

## Package 3 Result

Szene 2 ist jetzt als Prinzip-Szene festgezogen. Damit steht das semantische Rueckgrat fuer Sender, Empfaenger, gemeinsamen Schluessel und Umwandlungskette.

Aktueller PaketName: Szene 2 nach Skill-Protokoll intensiv durchlaufen
Paket: 3/10
PaketFortschritt: 100%
GesamtFortschritt: 44%

## Current Work Package Framing

- current package name: `Szene 3 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `4`
- total package count: `10`
- current package goal:
  Die Sender-Szene so tief zu planen, dass der Zuschauer sofort erkennt: lesbarer Klartext wird lokal beim Sender zusammen mit demselben gemeinsamen Schluessel in unleserlichen Geheimtext verwandelt.
- current known risks:
  Der Schluessel kann visuell wieder wie ein zentrales oder neutrales Objekt wirken statt wie senderseitiger Besitz.
  Der Angreifer kann zu frueh wie ein Beobachter des internen Verschluesselungsvorgangs wirken.
  Die Aussage `waehrend gleichzeitig` im aktuellen TTS kann das falsche mentale Modell `parallel` statt `gemeinsam in denselben Algorithmus` ausloesen.
  Der Uebergang von lesbarem Klartext zu kryptischem Datenmuell kann zu weich ausfallen, wenn Blockbildung, Box-Eingang und Ausgang nicht hart genug getrennt werden.

## Scene 3 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem einzigen Standbild verstehen:

- links liegt eine lesbare Nachricht noch beim Sender
- diese Nachricht geht in eine klar erkennbare Verschluesselungsstation
- derselbe gemeinsame geheime Schluessel wird dort eingesetzt
- aus genau dieser Station kommt unleserlicher Geheimtext heraus
- der Angreifer sieht noch nicht den internen Umbau, sondern hoechstens spaeter das, was die Station verlaesst

### Silhouette requirements

Folgende Formen muessen ohne grossen Text funktionieren:

- Sender-Arbeitsstation mit lesbarer Nachricht als Ausgangsmaterial
- aktive Crypto-Box direkt sendernah, nicht zentral im Netz
- klar getrennte Schluessel-Zufuehrung von oben oder seitlich in die Box
- eigener Ausgangspfad fuer Geheimtext aus der Box heraus
- noch passiver Empfaenger in der Distanz

### Must still be hidden

- erfolgreicher Angreiferzugriff auf Klartext
- Entschluesselung als aktiver Rueckprozess
- Tresor und Schluesseldiebstahl als Hauptmotiv
- gruener/roter Schluesselaustauschpfad
- fertige Endbotschaft beim Empfaenger

### Necessary labels

- `Klartext`
- `Verschluesselung`
- `Gemeinsamer geheimer Schluessel`
- `Geheimtext`

### Labels that should stay out for now

- `Entschluesselung`
- `Sicherer Weg`
- `Offener Weg`
- `Schluesseldiebstahl`
- `Falscher Schluessel`

### Single most important visual sentence

`Beim Sender wird lesbarer Klartext zusammen mit dem gemeinsamen geheimen Schluessel lokal in Geheimtext verwandelt.`

## Scene 3 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Lesbarer Ausgangspunkt

- duration target:
  ca. 45s bis 52s
- state:
  der Sender zeigt klar lesbaren Klartext `Treffen um 15 Uhr`
- required feeling:
  konkret, alltagsnah, noch voll verstaendlich
- forbidden visual:
  der Geheimtext darf noch nicht dominieren; der Klartext muss zuerst als eigentlicher Inhalt wahrgenommen werden

#### Beat 2 - Nachricht geht in die Box

- duration target:
  ca. 52s bis 60s
- state:
  der Klartext wird blockweise oder segmentweise in die Verschluesselungsbox gezogen
- required feeling:
  Umwandlung beginnt sichtbar lokal beim Sender
- forbidden visual:
  die Box darf nicht wie ein abstrakter Effektgenerator im Netz aussehen; der Weg muss klar `Sender -> Box` bleiben

#### Beat 3 - Schluessel dockt an

- duration target:
  ca. 60s bis 68s
- state:
  derselbe gemeinsame Schluessel wird als zweiter Input in genau dieselbe Box eingespeist
- required feeling:
  ohne diesen Schluessel laeuft die Umwandlung nicht korrekt
- forbidden visual:
  kein neuer Schluesseltyp, kein neutraler Key-Generator, keine zentrale Schluesselwolke ueber dem Netz

#### Beat 4 - Geheimtext kommt heraus

- duration target:
  ca. 68s bis 80s
- state:
  aus der Box tritt kryptischer Datenmuell `8A F2 91 C4 7B 11 0D EE` aus und bildet den kuenftigen Netzverkehr
- required feeling:
  harte qualitative Kippbewegung von lesbar zu unlesbar
- forbidden visual:
  der Angreifer darf daraus in dieser Szene noch keinen Klartext lesen; der Empfaenger darf den Endtext noch nicht wieder anzeigen

### Object-state truth table

#### Sender

- beat 1:
  aktiv, besitzt und zeigt Klartext
- beat 2:
  fuehrt Klartext in die lokale Verschluesselungsbox
- beat 3:
  bleibt Eigentuemer des gerade eingesetzten gemeinsamen Schluessels
- beat 4:
  gibt nur noch Geheimtext aus der Box heraus

#### Verschluesselungsbox

- beat 1:
  sichtbar und bereit, aber noch nicht im Vollprozess
- beat 2:
  verarbeitet Klartext-Eingang
- beat 3:
  verarbeitet Klartext plus Schluessel gemeinsam
- beat 4:
  liefert unleserlichen Geheimtext

#### Gemeinsamer geheimer Schluessel

- beat 1:
  sichtbar als bereits eingefuehrter Besitzgegenstand aus Szene 2
- beat 2:
  noch nicht der dominante Blickpunkt
- beat 3:
  aktiver zweiter Input fuer die Box
- beat 4:
  bleibt logisch beteiligt, aber nicht als neu erzeugtes Objekt

#### Geheimtext

- beat 1:
  hidden
- beat 2:
  hidden
- beat 3:
  entsteht gerade in der Box
- beat 4:
  active als unleserliches Ergebnis

#### Empfaenger

- beat 1 bis 4:
  sichtbar als spaeteres Ziel, aber noch ohne aktive Rueckgewinnung

#### Angreifer

- beat 1:
  dormant oder nur schwach als spaeterer Beobachter
- beat 2:
  darf den internen Senderprozess nicht lesen
- beat 3:
  darf den Schluessel nicht besitzen
- beat 4:
  kann hoechstens den ausgehenden Geheimtext bemerken, aber nicht entschluesseln

### Path logic

- Klartextpfad:
  vom Sender direkt in die Verschluesselungsbox
- Schluesselpfad:
  vom senderseitigen Besitzort in dieselbe Box
- Geheimtextpfad:
  aus der Box hinaus in Richtung Netz, aber noch nicht als voller Transport-Cue
- Blicklogik des Angreifers:
  nur auf den ausgehenden Kanal, nicht in den Innenraum der Box

### Caption / TTS beat mapping

- Beat 1:
  `Der Sender hat einen lesbaren Klartext.`
- Beat 2:
  `Zum Beispiel: Treffen um 15 Uhr. Diese Nachricht geht in die Verschluesselungsbox.`
- Beat 3:
  `Dazu kommt derselbe gemeinsame geheime Schluessel. Erst zusammen verarbeitet der Algorithmus beides.`
- Beat 4:
  `Das Ergebnis ist Geheimtext, also unleserlicher Datenmuell.`

## Scene 3 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 3 ist die erste wirklich konkrete Prozessszene. Sie muss die abstrakte Prinzipklaerung aus Szene 2 in eine raeumlich eindeutige Handlung uebersetzen.
- Der Schluessel darf hier nicht neu erfunden werden. Er ist derselbe Gegenstand, der in Szene 1 eingefuehrt und in Szene 2 als identisch auf beiden Seiten geklaert wurde.
- Der Klartext `Treffen um 15 Uhr` ist derselbe Kontinuitaetsanker, der spaeter in Szene 5 wieder lesbar werden muss.
- Die Box ist lokal beim Sender. Sobald sie optisch in die Mitte oder zu nah ans Netz rutscht, kippt die didaktische Aussage in Richtung `Verschluesselung passiert irgendwo unterwegs`.

### Forced revisions for later scenes

1. Szene 4 muss genau den in Szene 3 erzeugten Geheimtext weitertransportieren, nicht irgendeinen generischen neuen Cipher-Strom.
2. Szene 5 muss denselben Klartext am Ende wieder sichtbar machen, damit die Kontinuitaet nicht bricht.
3. Szene 6 muss denselben Schluessel als spaeter kompromittierten Gegenstand wieder aufgreifen, nicht ein neues Key-Objekt.

### Forced revisions for earlier scenes

1. Szene 2 muss die senderseitige Verankerung des Schluessels stark genug vorbereiten, damit Szene 3 nicht wie ein neuer Besitzwechsel wirkt.
2. Falls Szene 1 den Rewind-Abschluss zu weit Richtung Netzmitte zieht, muss die Schluesseleinfuehrung dort raeumlich weiter zum Sender hingezogen werden.

### Runtime / script mismatches discovered during alignment

1. Das aktuelle TTS in `tts_sender_2` benutzt `waehrend gleichzeitig`. Das ist fachlich nicht falsch, aber didaktisch schlechter als `zusammen mit dem geheimen Schluessel`, weil `gleichzeitig` wieder Richtung Zeitgleichheit statt gemeinsamer Verarbeitung schiebt.
2. Im aktuellen Runtime-Cue `cue_sender_encrypt` ist der Angreifer bereits sichtbar. Das kann funktionieren, solange seine Blicklogik klar am ausgehenden Kanal haengt; wenn er wie ein Beobachter des Box-Innenraums wirkt, muss das spaeter korrigiert werden.
3. Der Empfaenger darf in diesem Cue nur als fernes Ziel lesbar sein. Sobald seine Station zu stark leuchtet, konkurriert sie mit dem lokalen Senderprozess.

### Derived sub-work-packages from Scene 3

1. `Sender locality discipline`
   Alle Elemente der Verschluesselung so pruefen, dass die Umwandlung eindeutig auf der Sender-Seite passiert.

2. `Key-input identity wording`
   Sprechertext und Captions auf `zusammen mit dem gemeinsamen geheimen Schluessel` umstellen, damit kein Zeitgleichheits-Missverstaendnis entsteht.

3. `Attacker visibility fence`
   Im spaeteren Runtime-Abgleich sauber trennen, was der Angreifer in Szene 3 sehen darf und was erst in Szene 4 sein Thema wird.

4. `Cipher continuity`
   Geheimtext-Optik und Textfolge so fixieren, dass Szene 4 denselben Strom logisch uebernimmt.

## Package 4 Result

Szene 3 ist jetzt als konkrete Sender-Umwandlung festgezogen. Damit steht die erste harte Prozessszene, aus der direkt technische Folgearbeit fuer Angreiferlogik, Sprechertext und Geheimtext-Kontinuitaet abgeleitet werden kann.

Aktueller PaketName: Szene 3 nach Skill-Protokoll intensiv durchlaufen
Paket: 4/10
PaketFortschritt: 100%
GesamtFortschritt: 56%

## Current Work Package Framing

- current package name: `Szene 4 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `5`
- total package count: `10`
- current package goal:
  Die Transport-Szene so tief zu planen, dass der Zuschauer unmissverstaendlich sieht: durchs unsichere Netz laeuft nur Geheimtext, der Angreifer kann abfangen, aber ohne Schluessel nichts Sinnvolles lesen.
- current known risks:
  Die Szene kann optisch wieder zu sehr nach allgemeinem Netzwerkverkehr statt nach abgefangenem Geheimtext aussehen.
  Der Angreifer kann zu kompetent oder zu erfolgreich wirken, wenn seine Sicht nicht klar auf Datenmuell begrenzt wird.
  Wenn der in Szene 3 erzeugte Geheimtextstil nicht exakt weitergefuehrt wird, bricht die Ursache-Wirkung-Kette.
  Eine zu dominante Empfaengerseite kann faelschlich suggerieren, Klartext sei schon vor der Entschluesselung wieder sichtbar.

## Scene 4 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem einzigen Standbild verstehen:

- im Netz fliesst jetzt nur noch unleserlicher Geheimtext
- der Angreifer zapft genau diesen Strom ab
- seine Sicht bleibt kryptisch und nicht sinnvoll lesbar
- die eigentliche Nachricht existiert noch, aber sie ist waehrend des Transports verborgen

### Silhouette requirements

Folgende Formen muessen ohne viel Text funktionieren:

- klar markierter Netzkanal in der Buehnenmitte
- Geheimtext-Pakete oder Cipher-Tokens auf diesem Kanal
- Angreiferstation mit separater Abzweigung oder Tap-Leitung
- Angreiferfenster mit deutlich unleserlichen Zeichenfolgen
- Sender und Empfaenger nur als Randanker, nicht als Hauptdarsteller

### Must still be hidden

- lesbarer Klartext im Netz
- erfolgreiche Entschluesselung beim Angreifer
- Tresor oder physischer Schluesseldiebstahl
- falscher Schluessel-Test
- Schluesselaustauschpfade als neues Thema

### Necessary labels

- `Geheimtext`
- `Unsicheres Netz`
- `Angreifer sieht nur Datenmuell`

### Labels that should stay out for now

- `Klartext`
- `Entschluesselung erfolgreich`
- `Schluesseldiebstahl`
- `Sicherer Weg`
- `Offener Weg`

### Single most important visual sentence

`Der Angreifer kann den Transport sehen, aber ohne den gemeinsamen Schluessel bleibt der Inhalt waehrend des Netzwegs unlesbar.`

## Scene 4 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Cipher-Strom etabliert sich

- duration target:
  ca. 80s bis 87s
- state:
  derselbe in Szene 3 erzeugte Geheimtext stroemt sichtbar durchs unsichere Netz
- required feeling:
  die Umwandlung aus Szene 3 hat jetzt eine direkte Folge im Transport
- forbidden visual:
  kein Rest-Klartext zwischen Sender und Empfaenger

#### Beat 2 - Angreifer zapft an

- duration target:
  ca. 87s bis 94s
- state:
  der Angreifer greift die Leitung an und kopiert denselben Geheimtext in seine eigene Sicht
- required feeling:
  technisch moeglich zu sehen, aber inhaltlich frustrierend
- forbidden visual:
  der Angreifer darf dabei keinen Schluessel besitzen oder aus dem Nichts ableiten

#### Beat 3 - Nur Datenmuell in der Angreifer-Sicht

- duration target:
  ca. 94s bis 100s
- state:
  im Angreiferfenster stehen nur kryptische Folgen wie `8A F2 91 C4 ...`
- required feeling:
  Abfangen ist moeglich, Verstehen aber noch nicht
- forbidden visual:
  keine halb lesbaren Worte, keine Teilentschluesselung, kein verstecktes Preview des Klartexts

#### Beat 4 - Begrenzung festziehen

- duration target:
  ca. 100s bis 105s
- state:
  die Szene fixiert den Zustand: ohne gemeinsamen Schluessel bleibt der Angreifer beim Datenmuell stecken
- required feeling:
  klares didaktisches Zwischenfazit vor der Empfaenger-Szene
- forbidden visual:
  die Szene darf das spaetere Schluesseldiebstahlproblem nicht schon vorwegnehmen

### Object-state truth table

#### Geheimtextstrom

- beat 1:
  active auf dem Netzkanal
- beat 2:
  active auf Netzkanal und Angreiferabzweig
- beat 3:
  active als identische Cipher-Familie in beiden Sichten
- beat 4:
  stabilized als transportierter Geheimtext

#### Angreifer

- beat 1:
  sichtbar als drohender Beobachter
- beat 2:
  aktiv beim Abgreifen
- beat 3:
  aktiv, aber erfolglos beim Verstehen
- beat 4:
  bleibt in Besitz abgefangener Cipher-Daten, nicht in Besitz des Schluessels

#### Sender

- beat 1:
  tritt visuell zurueck; seine Arbeit ist bereits getan
- beat 2:
  kein neuer Klartextfluss
- beat 3:
  bleibt nur Ursprung des Cipher-Stroms
- beat 4:
  kein weiterer Eingriff

#### Empfaenger

- beat 1:
  wartet als spaeteres Ziel
- beat 2:
  sieht noch keinen Klartext
- beat 3:
  bleibt vorbereiteter Endpunkt, nicht aktive Hauptaktion
- beat 4:
  darf die spaetere Entschluesselung nur andeuten, nicht ausfuehren

#### Gemeinsamer geheimer Schluessel

- beat 1 bis 4:
  logisch existent, aber nicht als neuer Handlungsgegenstand im Vordergrund

### Path logic

- Hauptpfad:
  Geheimtext bewegt sich von der Sender-Seite durchs unsichere Netz zur Empfaenger-Seite
- Tap-Pfad:
  der Angreifer kopiert denselben Geheimtext aus dem Netz in seine eigene Ansicht
- Sichtlogik:
  Angreifer sieht nur den abgegriffenen Cipher-Strom, nicht die Innenraeume von Sender, Verschluesselungsbox oder Empfaenger

### Caption / TTS beat mapping

- Beat 1:
  `Jetzt wird nur noch der Geheimtext uebertragen.`
- Beat 2:
  `Ein Angreifer kann die Daten zwar abfangen.`
- Beat 3:
  `Aber ohne den Schluessel sieht er nur unleserliche Zeichenfolgen.`
- Beat 4:
  `Der urspruengliche Inhalt laesst sich daraus noch nicht sinnvoll zurueckgewinnen.`

## Scene 4 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 4 ist die Bewaehrungsprobe fuer das Versprechen aus Szene 3: Wenn dort wirklich sauber verschluesselt wurde, darf hier waehrend des Transports kein lesbarer Inhalt mehr auftauchen.
- Diese Szene bereitet direkt Szene 6 vor. Der hier abgefangene Geheimtext muss logisch derselbe Beutestrom sein, der spaeter nach einem Schluesseldiebstahl lesbar gemacht werden kann.
- Die Rolle des Angreifers muss hier klar begrenzt bleiben: Er ist erfolgreich beim Abfangen, aber erfolglos beim Verstehen.

### Forced revisions for later scenes

1. Szene 6 muss sichtbar mit bereits abgefangenem Geheimtext arbeiten, nicht mit neu erzeugten Beispieldaten.
2. Szene 5 muss sich bewusst davon absetzen: Dort wird aus genau diesem Cipher-Strom mit dem richtigen Schluessel wieder Klartext.
3. Szene 8 darf den Netzteil nur noch stark verdichten, ohne erneut eine Angreifer-Split-Screen-Nebenhandlung zu oeffnen.

### Forced revisions for earlier scenes

1. Szene 3 muss den Geheimtextstil `8A F2 91 C4 7B 11 0D EE` konsistent genug etablieren, damit Szene 4 ihn einfach uebernehmen kann.
2. Szene 2 darf keine Mehrdeutigkeit darueber lassen, dass nicht zwei verschiedene Schluessel im Spiel sind; sonst erscheint Szene 4 zu magisch statt logisch.

### Runtime / script mismatches discovered during alignment

1. Die aktuelle Runtime zeigt im Angreifer-Panel bereits den langen Cipher-Text. Das ist gut, solange wirklich nur Kryptomuell sichtbar bleibt; falls dort spaeter zu viel Struktur oder Lesbarkeit entsteht, muss das Panel haerter auf `nur Datenmuell` reduziert werden.
2. Der aktuelle Cue-Text `Ein Angreifer kann die Daten zwar abfangen, aber ohne den Schluessel kann er mit dem Inhalt nichts Sinnvolles anfangen.` ist didaktisch stark und sollte die dominante Aussage bleiben.
3. Wenn `plainFlowLabel` im Runtime-Block zu spaet ausgeblendet wird, wuerde das der Szene sofort schaden. Diese Label-Disziplin bleibt fuer die technische Nacharbeit ein P1-Punkt.

### Derived sub-work-packages from Scene 4

1. `Transport purity`
   Technisch pruefen, dass im Netz-Cue wirklich nur Cipher-Tokens und keine Klartextreste sichtbar bleiben.

2. `Attacker panel discipline`
   Sicherstellen, dass das Angreiferfenster lesbar als gescheiterter Erkenntnisversuch wirkt, nicht als halbe Entschluesselung.

3. `Captured-cipher continuity`
   Den abgefangenen Geheimtext als expliziten Kontinuitaetsanker fuer Szene 6 vorbereiten.

4. `Receiver restraint`
   Empfaengerseite im Transport-Cue so weit zuruecknehmen, dass die spaetere Entschluesselung ihre eigene Buehne behaelt.

## Package 5 Result

Szene 4 ist jetzt als reine Transport- und Angreifergrenzen-Szene festgezogen. Damit ist die Kette `Verschluesselung erzeugt Geheimtext -> Geheimtext reist durchs unsichere Netz -> Angreifer sieht nur Datenmuell` explizit geschlossen.

Aktueller PaketName: Szene 4 nach Skill-Protokoll intensiv durchlaufen
Paket: 5/10
PaketFortschritt: 100%
GesamtFortschritt: 66%

## Current Work Package Framing

- current package name: `Szene 5 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `6`
- total package count: `10`
- current package goal:
  Die Empfaenger-Szene so tief zu planen, dass der Zuschauer glasklar sieht: genau derselbe gemeinsame geheime Schluessel macht aus dem angekommenen Geheimtext wieder den urspruenglichen Klartext.
- current known risks:
  Der falsche-Schluessel-Moment kann die Szene unnoetig dominieren und die Hauptaussage verwischen.
  Die Rueckverwandlung kann zu magisch wirken, wenn der Zusammenhang mit dem konkreten Geheimtextstrom aus Szene 4 nicht hart genug bleibt.
  Der Schluessel kann visuell wieder wie ein neues Objekt am Empfaenger statt wie derselbe gemeinsame Besitzgegenstand wirken.
  Wenn Klartext zu frueh im Empfaenger-Panel auftaucht, verliert die Szene ihre Prozesslogik.

## Scene 5 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem einzigen Standbild verstehen:

- rechts arbeitet jetzt die Entschluesselungsstation des Empfaengers
- derselbe gemeinsame geheime Schluessel wird dort eingesetzt
- hinein kommt Geheimtext
- heraus kommt wieder lesbarer Klartext
- nur der richtige Schluessel fuehrt zu einem korrekten Ergebnis

### Silhouette requirements

Folgende Formen muessen ohne viel Text funktionieren:

- Empfaenger-Arbeitsstation als neuer Hauptfokus
- aktive Entschluesselungsbox direkt empfaengerseitig
- klarer Eingangspfad fuer Geheimtext in die Box
- klarer Schluesselpfad in dieselbe Box
- ausgehender lesbarer Klartext als Rueckgewinnung des bekannten Beispiels

### Must still be hidden

- Tresorbruch und gestohlener Schluessel als Hauptmotiv
- Schluesselaustauschpfade
- offene Klartextuebertragung im Netz
- erfolgreicher Angreiferzugriff auf den wiedergewonnenen Klartext

### Necessary labels

- `Geheimtext`
- `Entschluesselung`
- `Derselbe gemeinsame geheime Schluessel`
- `Klartext`

### Labels that should stay out for now

- `Schluesseldiebstahl`
- `Sicherer Weg`
- `Offener Weg`
- `Algorithmus ist offen`

### Single most important visual sentence

`Beim Empfaenger macht derselbe gemeinsame geheime Schluessel aus dem angekommenen Geheimtext wieder den urspruenglichen Klartext.`

## Scene 5 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Geheimtext kommt an

- duration target:
  ca. 105s bis 112s
- state:
  derselbe Geheimtextstrom aus Szene 4 erreicht den Empfaenger und laeuft in die Entschluesselungsbox
- required feeling:
  direkte Fortsetzung des Netztransports
- forbidden visual:
  noch kein lesbarer Klartext im Empfaengerfenster

#### Beat 2 - Derselbe Schluessel wird eingesetzt

- duration target:
  ca. 112s bis 119s
- state:
  derselbe gemeinsame geheime Schluessel dockt auf der Empfaengerseite sichtbar an
- required feeling:
  das Versprechen aus Szene 2 wird jetzt konkret eingeloest
- forbidden visual:
  kein neuer Schluesseltyp, kein Schluessel aus der Netzmitte, keine anonyme Box-Magie

#### Beat 3 - Klartext erscheint korrekt

- duration target:
  ca. 119s bis 128s
- state:
  aus dem Geheimtext wird wieder `Treffen um 15 Uhr`
- required feeling:
  Wiedererkennung und Aufloesung
- forbidden visual:
  kein anderer Beispieltext, keine verallgemeinerte Platzhalterbotschaft

#### Beat 4 - Kurzer Fehlversuch mit falschem Schluessel

- duration target:
  ca. 128s bis 132s
- state:
  fuer einen sehr kurzen Moment fuehrt ein falscher Schluessel nur zu `FEHLER / DATENMUELL`
- required feeling:
  Beweis der Regel, nicht neues Hauptthema
- forbidden visual:
  dieser Moment darf nicht laenger oder dramatischer wirken als die korrekte Entschluesselung

#### Beat 5 - Rueckkehr zum richtigen Ergebnis

- duration target:
  ca. 132s bis 140s
- state:
  die Szene kehrt sofort zum korrekten gemeinsamen Schluessel und zum richtigen Klartext zurueck
- required feeling:
  Stabilisierung und didaktische Klarheit
- forbidden visual:
  kein offenes Ende, kein Zweifel daran, welcher Schluessel der richtige ist

### Object-state truth table

#### Empfaenger

- beat 1:
  wird zum Hauptfokus und nimmt Geheimtext entgegen
- beat 2:
  aktiviert dieselbe Schluessel-Logik wie der Sender zuvor
- beat 3:
  zeigt wieder den urspruenglichen Klartext
- beat 4:
  zeigt kurz den Fehlzustand
- beat 5:
  stabilisiert den korrekten Klartext

#### Entschluesselungsbox

- beat 1:
  aktiv mit Cipher-Eingang
- beat 2:
  aktiv mit Cipher plus Schluessel
- beat 3:
  liefert lesbaren Klartext
- beat 4:
  liefert Muell bei falschem Schluessel
- beat 5:
  liefert wieder den korrekten Klartext

#### Gemeinsamer geheimer Schluessel

- beat 1:
  logisch vorhanden, aber noch nicht der Blickmittelpunkt
- beat 2:
  aktiver zweiter Input fuer die Entschluesselung
- beat 3:
  als richtiger Schluessel bestaetigt
- beat 4:
  kurz kontrastiert gegen einen falschen Schluessel
- beat 5:
  als einzig korrekter Schluessel wieder fixiert

#### Geheimtext

- beat 1:
  active als ankommender Cipher-Strom
- beat 2:
  active als Input der Entschluesselungsbox
- beat 3:
  kippt in Klartext um
- beat 4:
  bleibt bei falschem Schluessel unaufgeloest
- beat 5:
  wird korrekt aufgeloest

#### Angreifer

- beat 1 bis 5:
  bleibt Randfigur; seine Perspektive ist in dieser Szene nicht der Schwerpunkt

### Path logic

- Eingangsweg:
  derselbe Geheimtext kommt aus dem Netz in die Entschluesselungsbox
- Schluesselweg:
  derselbe gemeinsame Schluessel geht empfaengerseitig in dieselbe Box
- Ausgangsweg:
  erst nach korrekter Entschluesselung erscheint wieder lesbarer Klartext
- Fehlerweg:
  der falsche Schluessel erzeugt nur einen kurzen Fehlzustand und kein alternatives korrektes Ergebnis

### Caption / TTS beat mapping

- Beat 1:
  `Der Empfaenger bekommt den Geheimtext.`
- Beat 2:
  `Jetzt nutzt er denselben gemeinsamen geheimen Schluessel.`
- Beat 3:
  `Nur so entsteht wieder die urspruengliche Nachricht: Treffen um 15 Uhr.`
- Beat 4:
  `Mit einem falschen Schluessel entsteht nur Muell.`
- Beat 5:
  `Nur der richtige gemeinsame Schluessel fuehrt wieder zum korrekten Klartext.`

## Scene 5 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 5 ist die Einloesung des zentralen Versprechens aus Szene 2. Wenn hier nicht eindeutig derselbe Schluessel wieder auftaucht, faellt das Rueckgrat der gesamten Demo zusammen.
- Die Rueckgewinnung muss denselben Klartext `Treffen um 15 Uhr` zeigen, sonst zerbricht die Szenenkontinuitaet von Szene 1 und 3.
- Der falsche-Schluessel-Moment ist legitim, aber nur als kurzer Regelbeweis. Die globale Wahrheit bleibt: mit dem richtigen gemeinsamen Schluessel funktioniert die Rueckgewinnung korrekt.

### Forced revisions for later scenes

1. Szene 6 muss den Satz `nur mit dem richtigen Schluessel funktioniert es korrekt` umdrehen: Sobald der Angreifer genau diesen Schluessel bekommt, kippt die Sicherheit.
2. Szene 8 muss die wiederhergestellte Links-nach-Rechts-Kette stark verdichten und dabei denselben Schluessel als gemeinsames Zentrum zeigen.

### Forced revisions for earlier scenes

1. Szene 4 muss den ankommenden Cipher-Strom so klar halten, dass Szene 5 ihn ohne Medienbruch uebernehmen kann.
2. Szene 2 muss den Begriff `derselbe Schluessel` stark genug vorbereitet haben, damit Szene 5 nicht wie eine neue Information statt wie eine Einloesung wirkt.

### Runtime / script mismatches discovered during alignment

1. Im aktuellen Runtime-Block liegt der `wrongKeyPhase` bei `progress >= 0.72 && progress <= 0.84`. Das ist grundsaetzlich passend, aber dieser Fehlmoment darf technisch weder laenger gezogen noch visuell dominanter werden als die korrekte Rueckgewinnung.
2. Das aktuelle TTS `Jetzt nutzt er denselben geheimen Schluessel.` ist gut, sollte aber sprachlich an die neue Stringenz `derselben gemeinsamen geheimer Schluessel` angepasst werden, damit es exakt auf Szene 2 und 3 einzahlt.
3. Das Receiver-Panel springt aktuell zwischen `Geheimtext wird entschluesselt`, `FEHLER / DATENMUELL` und `plainText`. Diese Logik ist brauchbar, muss spaeter aber darauf geprueft werden, dass der korrekte Klartext laenger und ruhiger steht als der Fehlzustand.

### Derived sub-work-packages from Scene 5

1. `Receiver payoff discipline`
   Sicherstellen, dass die korrekte Entschluesselung das emotionale und didaktische Hauptgewicht der Szene traegt.

2. `Wrong-key brevity`
   Den falschen-Schluessel-Moment streng kurz halten und optisch klar als Negativbeispiel markieren.

3. `Plaintext restoration continuity`
   Das wieder erscheinende `Treffen um 15 Uhr` exakt als Rueckgewinnung desselben frueheren Inhalts kennzeichnen.

4. `Shared-key wording harmonization`
   Sprechertext, Captions und Labels auf eine einheitliche Formel fuer den gemeinsamen Schluessel bringen.

## Package 6 Result

Szene 5 ist jetzt als klare Einloesung des gemeinsamen-Schluessel-Prinzips festgezogen. Damit steht nicht nur, wie korrekt entschluesselt wird, sondern auch, wie der kurze falscher-Schluessel-Kontrast untergeordnet und didaktisch sauber bleibt.

Aktueller PaketName: Szene 5 nach Skill-Protokoll intensiv durchlaufen
Paket: 6/10
PaketFortschritt: 100%
GesamtFortschritt: 76%

## Current Work Package Framing

- current package name: `Szene 6 nach Skill-Protokoll intensiv durchlaufen`
- current package index: `7`
- total package count: `10`
- current package goal:
  Die Sicherheits-Szene so tief zu planen, dass der Zuschauer auf einen Blick versteht: nicht der bekannte Algorithmus ist das Problem, sondern der kompromittierte gemeinsame geheime Schluessel.
- current known risks:
  Der Tresor kann zu spaet oder zu dominant eingefuehrt werden und die Kontinuitaet zur restlichen Buehne verlieren.
  Der Algorithmus kann visuell immer noch wie ein verdachtiger Geheimkasten wirken, obwohl er hier explizit als bekannt markiert werden soll.
  Der Umschlag von abgefangenem Geheimtext zu lesbarem Klartext beim Angreifer kann zu abrupt oder zu magisch wirken, wenn die Beute aus Szene 4 nicht klar mitgedacht wird.
  Die Szene kann zu sehr wie ein neues Einzelproblem wirken statt wie die Aufloesung der bisherigen Ursache-Wirkung-Kette.

## Scene 6 - Detailing Expansion Pass 1

### One-glance comprehension

Der Zuschauer muss in einem einzigen Standbild verstehen:

- der Algorithmus ist offen sichtbar und nicht das geheime Objekt
- der Schluessel ist separat als eigentliches Schutzgut gesichert
- der Angreifer besitzt bereits abgefangenen Geheimtext
- sobald er den Schluessel bekommt, wird aus diesem Geheimtext wieder lesbarer Klartext

### Silhouette requirements

Folgende Formen muessen ohne viel Text funktionieren:

- neutrale, offen sichtbare Algorithmus-Stationen
- klar erkennbarer Tresor oder Safe fuer den Schluessel
- Schluessel als physisch oder logisch abziehbarer Schutzgegenstand
- Angreiferstation mit abgefangenem Cipher-Material
- sichtbarer Kipppunkt von Cipher zu Klartext beim Angreifer

### Must still be hidden

- sicherer versus unsicherer Austauschpfad als eigenes Hauptmotiv
- neuer normaler Sender-Empfaenger-Transport
- falscher Schluessel als Kontrastbeispiel
- Finale-Verdichtung

### Necessary labels

- `Algorithmus bekannt`
- `Geheimer Schluessel`
- `Abgefangener Geheimtext`
- `Nach Schluesseldiebstahl wieder lesbar`

### Labels that should stay out for now

- `Sicherer Weg`
- `Offener Weg`
- `Groesste Schwaeche ist der Austausch`
- `Fazit`

### Single most important visual sentence

`Sobald der gemeinsame geheime Schluessel in falsche Haende geraet, wird der zuvor nutzlose abgefangene Geheimtext fuer den Angreifer lesbar.`

## Scene 6 - Detailing Expansion Pass 2

### Internal beat structure

#### Beat 1 - Algorithmus wird entlastet

- duration target:
  ca. 140s bis 147s
- state:
  Verschluesselungs- und Entschluesselungsstation bleiben sichtbar, aber neutral mit der Aussage `Algorithmus bekannt`
- required feeling:
  das Problem liegt nicht in geheimer Maschinenmagie
- forbidden visual:
  keine dramatische Geheimbox-Inszenierung des Algorithmus

#### Beat 2 - Der Schluessel als Schutzgut

- duration target:
  ca. 147s bis 153s
- state:
  der gemeinsame Schluessel liegt separat im Tresor; der Angreifer besitzt weiterhin nur abgefangenen Geheimtext
- required feeling:
  der eigentliche Schutzpunkt wird lokalisiert
- forbidden visual:
  der Angreifer darf an diesem Punkt noch keinen Klartext haben

#### Beat 3 - Der Schluessel wird gestohlen

- duration target:
  ca. 153s bis 158s
- state:
  der Schluessel verlaesst den Tresor und wandert sichtbar zum Angreifer
- required feeling:
  konkreter Sicherheitsbruch, nicht abstraktes Risiko
- forbidden visual:
  der Schluessel darf nicht einfach verschwinden und magisch beim Angreifer auftauchen

#### Beat 4 - Abgefangener Geheimtext kippt in Klartext

- duration target:
  ca. 158s bis 165s
- state:
  derselbe frueher abgefangene Geheimtext wird beim Angreifer jetzt lesbar zu `Treffen um 15 Uhr`
- required feeling:
  spaeter, aber logisch zwingender Schaden
- forbidden visual:
  kein Eindruck, dass der Angreifer den Klartext ohne Schluessel haette rekonstruieren koennen

### Object-state truth table

#### Algorithmus

- beat 1:
  active as visible but neutral
- beat 2:
  sichtbar, aber nicht Hauptkonflikt
- beat 3:
  unveraendert bekannt
- beat 4:
  bleibt fachlich derselbe bekannte Prozess

#### Tresor

- beat 1:
  sichtbar, aber noch nicht Hauptaktion
- beat 2:
  active als Schutzort des gemeinsamen Schluessels
- beat 3:
  wird Ort des Sicherheitsbruchs
- beat 4:
  ist als versagter Schutz markiert

#### Gemeinsamer geheimer Schluessel

- beat 1:
  logisch derselbe Schluessel wie in Szenen 1 bis 5
- beat 2:
  sichtbar als zu schuetzender Gegenstand
- beat 3:
  active as stolen object
- beat 4:
  active as compromise enabler

#### Angreifer

- beat 1:
  besitzt bereits abgefangenen Cipher, aber keinen Schluessel
- beat 2:
  wartet noch am Cipher ohne Verstehen
- beat 3:
  bekommt den Schluessel
- beat 4:
  kann den frueher unlesbaren Cipher nun lesbar machen

#### Abgefangener Geheimtext

- beat 1:
  vorhanden als Beute aus Szene 4
- beat 2:
  weiter unlesbar
- beat 3:
  bleibt noch unlesbar bis der Schluessel ankommt
- beat 4:
  kippt in lesbaren Klartext

### Path logic

- Algorithmuspfad:
  bleibt statisch und bekannt, ohne Geheimnishaftigkeit
- Tresorpfad:
  zeigt, wo der Schluessel geschuetzt sein sollte
- Diebstahlpfad:
  fuehrt den Schluessel sichtbar vom Tresor zum Angreifer
- Beutepfad:
  derselbe abgefangene Cipher bleibt beim Angreifer liegen und wird erst nach dem Schluesseldiebstahl lesbar

### Caption / TTS beat mapping

- Beat 1:
  `Die Sicherheit haengt nicht daran, dass der Algorithmus geheim ist.`
- Beat 2:
  `Der Algorithmus darf sichtbar sein. Entscheidend ist, dass der gemeinsame Schluessel geheim bleibt.`
- Beat 3:
  `Wird dieser Schluessel gestohlen, kippt die Sicherheit.`
- Beat 4:
  `Dann kann ein Angreifer abgefangene Daten wieder lesbar machen.`

## Scene 6 - Extensive Alignment Pass

### Alignment with global truth model

- Szene 6 ist die Umkehrung von Szene 5. Dort lautete die Wahrheit: nur mit dem richtigen gemeinsamen Schluessel entsteht korrekter Klartext. Hier wird daraus die Bedrohungswahrheit: bekommt der Angreifer genau diesen Schluessel, entsteht auch bei ihm korrekter Klartext.
- Die Szene darf niemals so wirken, als sei der Algorithmus selbst kompromittiert. Das globale Modell sagt explizit: der Algorithmus darf bekannt sein.
- Der Schaden muss als spaete Konsequenz von Szene 4 lesbar sein. Deshalb ist der abgefangene Geheimtext kein neues Objekt, sondern dieselbe fruehere Beute.

### Forced revisions for later scenes

1. Szene 7 muss die Frage beantworten, wo dieser Schluesselverlust in der Praxis oft entsteht: beim unsicheren Austausch.
2. Szene 8 muss den Merksatz genau daraus verdichten: Nicht das Netz muss geheim sein, sondern der Schluessel.

### Forced revisions for earlier scenes

1. Szene 4 muss den abgefangenen Geheimtext sichtbar genug etablieren, damit Szene 6 sofort als Rueckwirkung verstanden wird.
2. Szene 5 muss den richtigen Schluessel so klar als Bedingung des Erfolgs markieren, dass Szene 6 als logische Spiegelung und nicht als neuer Trick wirkt.
3. Szene 2 muss den bekannten Algorithmus semantisch schon so neutral vorbereitet haben, dass Szene 6 ihn glaubhaft entlasten kann.

### Runtime / script mismatches discovered during alignment

1. Der aktuelle Runtime-Block schaltet `attackerPanel.contentLabel` spaet von `cipherShort` auf `plainText`. Das ist genau die richtige Richtung, muss spaeter aber visuell noch staerker als Folge des gestohlenen Schluessels gekoppelt werden.
2. `plainFlowLabel` geht im gestohlenen Zustand auf `0.66`. Das kann funktionieren, darf aber nicht so aussehen, als sei wieder normaler Klartexttransport durchs Netz im Gang; der Klartext entsteht hier nur lokal beim Angreifer nach dem Bruch.
3. Das Board `Algorithmus bekannt` ist bereits gut gesetzt. Diese Entlastung des Algorithmus muss eine der dominanten Lesesignale der Szene bleiben.

### Derived sub-work-packages from Scene 6

1. `Known-algorithm emphasis`
   Technisch und textlich sicherstellen, dass der Algorithmus nicht wie das geheime Objekt gelesen wird.

2. `Stolen-key causality`
   Die visuelle Kopplung `Schluessel gestohlen -> Cipher wird lesbar` noch haerter herausarbeiten.

3. `Cipher-loot continuity`
   Den abgefangenen Geheimtext aus Szene 4 als identische Angreiferbeute in Szene 6 sichern.

4. `Plaintext-locality after breach`
   Klartext nach dem Bruch eindeutig lokal beim Angreifer entstehen lassen, nicht im Netz.

## Package 7 Result

Szene 6 ist jetzt als eigentliche Sicherheitsbruch-Szene festgezogen. Damit ist klar, dass nicht der bekannte Algorithmus das Verfahren gefaehrlich macht, sondern allein der Verlust des gemeinsamen geheimen Schluessels.

Aktueller PaketName: Szene 6 nach Skill-Protokoll intensiv durchlaufen
Paket: 7/10
PaketFortschritt: 100%
GesamtFortschritt: 86%
