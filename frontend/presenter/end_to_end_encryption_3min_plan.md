# Ende-zu-Ende-Verschluesselung in 3 Minuten

Status: Vollplanung nach `create-babylon-presentation` vor finaler Runtime-Festschreibung.

Wichtig: Die bereits angelegte Presenter-Implementierung ist bis zur Abarbeitung dieser Planung nur vorlaeufig. Gesamtfortschritt ist erst nach Nutzerabnahme 100%.

## Topic Cluster

- `topicClusterId`: `verschluesselung`
- `topicClusterTitle`: `Verschluesselung`
- Warum dieser Cluster passt:
  Das Skript erklaert keinen allgemeinen Datenschutzprozess und keine einzelne App, sondern eine konkrete Form von Nachrichtenverschluesselung mit Fokus auf Transportweg, Lesbarkeit, Serverrolle und Schutzgrenze.
- Abgeleiteter Subtopic-Slice:
  `ende_zu_ende_verschluesselung`
- Coverage-Modus:
  `partial`
- Warum `partial`:
  Das breite Thema `Verschluesselung` bleibt groesser als nur E2E. Symmetrische, asymmetrische, hybride und TLS/HTTPS-nahe Leitungsmodelle bleiben eigenstaendige Presenter-Slices.

## Global Presentation Type

- `presentationType`: `sender_receiver_flow`
- Warum dieser Typ passt:
  Das gesamte Skript lebt davon, dass Klartext, Geheimtext und Sichtbarkeit entlang eines klaren Pfades zwischen zwei Endgeraeten verfolgt werden.
- Visuelle Verpflichtungen:
  Die Enden muessen als eigenstaendige Vertrauenszonen lesbar sein.
  Die Mitte muss als Transportstrecke lesbar sein.
  Metadaten muessen klar von Nachrichteninhalt getrennt dargestellt werden.
  Die Grenze darf nicht wie ein Detail wirken, sondern als echter Gegenpol zur Staerke.

## Local Reference Presentations

- Referenz: `frontend/presenter/data.js` -> `symmetric_encryption_3min`
  - Typ: Problem-to-solution innerhalb eines Sender-Empfaenger-Flusses
  - Darf uebernommen werden:
    grundlegende Buehnenlogik mit Sender links, Transport in der Mitte und Empfaenger rechts; cue-basierte Kameraspruenge; Text-Boards fuer didaktische Verdichtung
  - Darf nicht blind kopiert werden:
    Shared-Key-Logik, Tresorbild als zentrales Sicherheitsnarrativ, Fokus auf geheimen Schluessel statt Endgeraete

- Referenz: `frontend/presenter/data.js` -> `asymmetric_encryption_3min`
  - Typ: Vergleich/Loesungsweg mit Schluesselpaar
  - Darf uebernommen werden:
    klare Trennung von sichtbaren Rollen, ruhige Mitte, lesbare Transportpfade
  - Darf nicht blind kopiert werden:
    Public/Private-Key-Symbolik, Austauschlogik, Leistungsargument zugunsten asymmetrischer Konzepte

- Referenz: `frontend/presenter/data.js` -> `tls_https_real_example_3min`
  - Typ: Praxisbeispiel fuer geschuetzte Verbindung
  - Darf uebernommen werden:
    Metadaten-vs-Inhalt-Denken, reale Zwischenrollen
  - Darf nicht blind kopiert werden:
    Browser/Server-Vertrauensmodell, Zertifikatslogik, Leitungsschutz statt Ende-zu-Ende-Schutz

## Current Work Package Framing

- current package name: `Round 1: Coarse Whole-Presentation Plan`
- current package index: `1`
- total package count: `25`
- current package goal:
  Die sieben Szenen so strukturieren, dass der spaetere Runtime-Bau keine didaktischen Widersprueche mehr erzeugt.
- current known risks:
  Das Wort `Server` kann in den Szenen zu aktiv und zu maechtig wirken, obwohl die Mitte nur transportieren soll.
  Die Metadaten-Szene kann versehentlich wie ein Inhaltsleck aussehen.
  Die Grenze-Szene kann den vorherigen Schutzgedanken unterminieren, wenn sie zu frueh oder zu dominant gesetzt wird.
  Die Schlussbotschaft darf stark sein, aber nicht die Metadaten- oder Endgeraeterisiken unsichtbar machen.

## Round 1: Coarse Whole-Presentation Plan

### Scene 1 - Das Grundproblem

- teaching point:
  Ohne E2E kann lesbarer Inhalt unterwegs auf Zwischenstationen sichtbar sein.
- estimated duration:
  20 Sekunden
- visible actors or objects:
  Anna-Handy, Ben-Handy, Server, Netzwerkknoten, Internetwolke, offene Nachricht, mehrere Beobachter in der Mitte
- message state:
  erst Klartext im Transport
- attacker or observer knowledge:
  Zwischenstationen sehen den Inhalt offen
- key ownership or other critical state:
  noch kein Schutz aktiv, keine Endgeraete-Logik sichtbar
- own cue or beat:
  eigener Cue

### Scene 2 - Die Grundidee

- teaching point:
  Verschluesseln startet am Sendergeraet, Entschluesseln endet am Empfaengergeraet, die Mitte bleibt Transport.
- estimated duration:
  25 Sekunden
- visible actors or objects:
  Anna-Handy, Verschluesselungsbox, Geheimtextstrecke, Server/Netz, Entschluesselungsbox, Ben-Handy
- message state:
  Klartext am Sender, Geheimtext in der Mitte, Klartext erst am Ende
- attacker or observer knowledge:
  Mitte sieht nur Geheimtext
- key ownership or other critical state:
  Schutz ist an die Endpunkte gebunden, nicht an den Server
- own cue or beat:
  eigener Cue

### Scene 3 - Was der Server noch sieht

- teaching point:
  Metadaten sind nicht dasselbe wie Nachrichteninhalt.
- estimated duration:
  30 Sekunden
- visible actors or objects:
  Server-Dashboard, Felder fuer Absender, Empfaenger, Uhrzeit, Datenmenge, gesperrter Inhaltsblock
- message state:
  Inhalt bleibt Geheimtext, Metadaten sind lesbar
- attacker or observer knowledge:
  Server kennt Kommunikationsrahmen, aber nicht den Inhalt
- key ownership or other critical state:
  keine neue Schluesselaktion; Fokus ist Sichtbarkeit
- own cue or beat:
  eigener Cue

### Scene 4 - Praktischer Ablauf

- teaching point:
  Klartext verlaesst Annas Geraet nicht lesbar und wird erst auf Bens Geraet wieder lesbar.
- estimated duration:
  35 Sekunden
- visible actors or objects:
  Anna-Handy, eingetippte Nachricht, E2E-Schloss, Geheimtextpaket, Server, Ben-Handy
- message state:
  Klartext -> Geheimtext -> Klartext
- attacker or observer knowledge:
  Server und Mitte sehen nur `7F 91 C2 ...`
- key ownership or other critical state:
  der passende Schluessel ist als Endgeraete-Eigenschaft impliziert, nicht als zentrale Austauscherklaerung
- own cue or beat:
  eigener Cue

### Scene 5 - Der grosse Vorteil

- teaching point:
  Ein Angriff auf die Mitte fuehrt nicht automatisch zu lesbarem Inhalt.
- estimated duration:
  25 Sekunden
- visible actors or objects:
  kompromittierter Server, Admin-/Angreiferpanel, Geheimtextbloecke, Endgeraete mit Klartextmarkierung
- message state:
  Geheimtext bleibt in der Mitte unlesbar
- attacker or observer knowledge:
  Angreifer sieht Daten, aber nicht den Inhalt
- key ownership or other critical state:
  Lesbarkeit bleibt an den Enden
- own cue or beat:
  eigener Cue

### Scene 6 - Die Grenze

- teaching point:
  E2E schuetzt die Strecke, nicht automatisch das kompromittierte Endgeraet oder unsichere Backups.
- estimated duration:
  30 Sekunden
- visible actors or objects:
  Ben-Handy, Malware-Symbol, abgegriffene Nachricht am Geraet, Cloud-Backup, weiterhin starke Schutzmitte
- message state:
  in der Mitte weiter Geheimtext; am kompromittierten Ende oder im Backup kann Klartext wieder offen werden
- attacker or observer knowledge:
  Angreifer sieht Klartext erst am kompromittierten Ende, nicht wegen der Transportmitte
- key ownership or other critical state:
  Endgeraet wird zur Schwachstelle
- own cue or beat:
  eigener Cue

### Scene 7 - Fazit

- teaching point:
  Die Kernsynthese lautet: lesbar nur an den Enden, nicht in der Mitte.
- estimated duration:
  15 Sekunden
- visible actors or objects:
  Endschema Anna -> verschluesseln -> Geheimtext -> Server/Netz -> entschluesseln -> Ben, Schlusszitat
- message state:
  Gesamtschema in stabiler Endform
- attacker or observer knowledge:
  Mitte bleibt auf Geheimtext beschraenkt
- key ownership or other critical state:
  keine neue Logik, nur Verdichtung
- own cue or beat:
  eigener Cue

## Scene 1 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Die Mitte ist voller Technik, und ohne E2E kann dort lesbarer Inhalt sichtbar sein.
- Which objects must be recognizable by silhouette alone?
  Zwei Smartphones, ein zentraler Server, kleine Zwischenknoten, eine durchlaufende Nachrichtenkarte, Beobachter-/Lesesymbole in der Mitte
- Which concepts must still be hidden?
  Metadaten-Differenzierung, Endgeraete-Grenze als spaetere Pointe, Backup-Risiko
- Which labels are necessary?
  `Anna`, `Ben`, eventuell einmal `Zwischenstationen`; keine Detailbegriffe fuer Schluessel
- Which labels are redundant if the object design is good enough?
  `Server`, `Netz`, `Internetwolke` muessen nicht alle gleichzeitig als grosse Labels erklaert werden, wenn die Mitte klar als Infrastruktur gelesen wird
- Single most important visual sentence:
  Lesbarer Inhalt wandert offen durch die Mitte

## Scene 1 - Detailing Expansion Pass 2

- object states:
  Anna-Handy aktiv, Ben-Handy passiv empfangsbereit, Mitte aktiv und neugierig, keine Schlosslogik am Start
- token paths:
  offene Nachrichtenkarte von Anna ueber Mitte zu Ben; kurze Blickstrahlen von Server und Knoten auf die Karte
- transitions:
  offener Lauf -> mehrere Mitte-Leser aktiv -> Rueckspulen -> offene Karte zieht zurueck -> Schlosssymbole erscheinen an den Enden
- visibility timing:
  0-9s offener Transport
  9-14s Mitlesen in der Mitte
  14-17s Rueckspulen
  17-20s Schloss-Einblendung direkt an den Endgeraeten
- cue boundaries:
  ein Cue, aber intern vier klare Beats
- camera intention:
  breite Totale, damit die Mitte als Problemraum lesbar ist
- caption or TTS beats:
  `Nachricht ueber viele Zwischenstationen`
  `Wer kann unterwegs lesen?`
  `Genau das loest Ende-zu-Ende-Verschluesselung`
- logic truth table:
  - who knows what:
    Anna kennt Inhalt
    Ben soll Inhalt bekommen
    Mitte sieht Inhalt offen
  - who owns what:
    Nachricht gehoert der Kommunikation zwischen Anna und Ben; Schutz ist noch nicht aktiviert
  - plaintext vs ciphertext vs hidden:
    Klartext sichtbar, kein Geheimtext aktiv
  - what the attacker can see:
    komplette offene Nachricht
  - what must not yet be visible:
    Metadaten-Board, Backup, kompromittiertes Endgeraet, Server-als-nur-Transport-These

## Scene 1 - Extensive Alignment Pass

- Scene 1 darf die Mitte nicht schon als neutralen Transport darstellen; sonst verliert Scene 2 ihre Pointe.
- Das Rueckspulen ist didaktisch zentral und muss als echter Vorher/Nachher-Schnitt funktionieren.
- Die Schloss-Symbole duerfen in Scene 1 nur als Start des Konzepts auftauchen, nicht schon als detaillierte Funktionslogik.
- Speaker-Script bleibt passend, aber visuell muss das Mitlesen eindeutig auf `vor E2E` begrenzt werden.

## Scene 2 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Nur die Enden leuchten aktiv; die Mitte ist nur Durchgang.
- Which objects must be recognizable by silhouette alone?
  Zwei Smartphones, zwei Schloss-/Crypto-Stationen, eine neutrale Transportmitte
- Which concepts must still be hidden?
  Metadaten-Board, Endgeraete-Kompromittierung, Admin-Angriff
- Which labels are necessary?
  `verschluesseln`, `entschluesseln`, `Geheimtext`
- Which labels are redundant if the object design is good enough?
  `Sendergeraet` und `Empfaengeraet` koennen ueber die Anna-/Ben-Titel impliziert werden
- Single most important visual sentence:
  Klartext wird am linken Ende geschlossen und am rechten Ende erst wieder geoeffnet

## Scene 2 - Detailing Expansion Pass 2

- object states:
  beide Endgeraete betont, Encrypt-/Decrypt-Boxen aktiv, Mitte ausgegraut
- token paths:
  Klartext kurz von Anna in die Encrypt-Box; danach Geheimtext durch die Mitte; am Ende Wiederoeffnung bei Ben
- transitions:
  Endgeraete glimmen auf -> Mitte wird grau -> Schema-Board blendet ein -> Geheimtext bewegt sich ruhig durch die Mitte
- visibility timing:
  20-27s Endgeraete aktivieren
  27-35s Mitte visuell neutralisieren
  35-45s Schema stabilisieren
- cue boundaries:
  ein Cue
- camera intention:
  leicht naehere Halbtotalen, damit linkes Ende, Mitte und rechtes Ende gleichzeitig lesbar bleiben
- caption or TTS beats:
  `Direkt beim Sender verschluesseln`
  `Mitte transportiert nur`
  `Erst beim Empfaenger wieder lesbar`
- logic truth table:
  - who knows what:
    Anna kennt Klartext vor der Verschluesselung
    Ben kennt Klartext erst nach der Entschluesselung
    Mitte sieht nur Geheimtext
  - who owns what:
    Endgeraete halten die Lesbarkeitshoheit
  - plaintext vs ciphertext vs hidden:
    Klartext nur links und rechts, Geheimtext in der Mitte
  - what the attacker can see:
    nur Datenstrom ohne Lesbarkeit
  - what must not yet be visible:
    Metadatenzeilen, Malware, Backup

## Scene 2 - Extensive Alignment Pass

- Scene 2 muss die Kernthese etablieren, die spaeter in Scene 3 und 5 nicht verwischt werden darf.
- Die Mitte darf visuell nicht so dunkel oder schwach werden, dass sie wie `irrelevant` wirkt; sie bleibt wichtig, aber nicht lesefaehig.
- Die Board-Aussage muss spaeter exakt zur Finale-Szene kompatibel bleiben.

## Scene 3 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Der Server liest Metadaten, aber nicht den Nachrichteninhalt.
- Which objects must be recognizable by silhouette alone?
  Server-Konsole oder Dashboard, tabellarische Informationsfelder, ein gesperrter oder verschleierter Inhaltsblock
- Which concepts must still be hidden?
  Malware auf Endgeraeten, Backup-Pfad
- Which labels are necessary?
  `Absender`, `Empfaenger`, `Uhrzeit`, `Datenmenge`, `Inhalt`
- Which labels are redundant if the object design is good enough?
  Zusatzerklaerungen wie `Metadaten sind sichtbar` koennen auf einem Board zusammengezogen werden
- Single most important visual sentence:
  Der Server kennt den Rahmen, nicht den Text

## Scene 3 - Detailing Expansion Pass 2

- object states:
  Server gross und fokussiert, Endgeraete an den Rand gedrueckt, Inhaltsslot gesperrt/kryptisch
- token paths:
  Geheimtext bleibt im Serverfenster als unleserlicher Block stehen, kein Klartexttoken
- transitions:
  Dashboard klappt auf -> Felder fuellen sich nacheinander -> Inhaltsfeld bleibt gesperrt
- visibility timing:
  45-52s Dashboard erscheint
  52-65s Metadatenzeilen werden lesbar
  65-75s Inhaltsblock bleibt sichtbar kryptisch und gesperrt
- cue boundaries:
  ein Cue
- camera intention:
  nah an die Serverebene, aber noch genug Breite fuer Rand-Endgeraete
- caption or TTS beats:
  `Wer mit wem`
  `Wann`
  `Wie viel`
  `Nicht der eigentliche Inhalt`
- logic truth table:
  - who knows what:
    Server kennt Kommunikationsrahmen
    Server kennt nicht den Inhalt
  - who owns what:
    Lesbarkeitshoheit bleibt bei Endgeraeten
  - plaintext vs ciphertext vs hidden:
    Metadaten offen, Inhalt als Geheimtext, Klartext verborgen
  - what the attacker can see:
    dass Daten laufen und welche Rahmendaten anfallen
  - what must not yet be visible:
    konkrete Endgeraete-Schwachstelle, Backup-Abfluss

## Scene 3 - Extensive Alignment Pass

- Diese Szene ist die wichtigste semantische Trennlinie der Praesentation.
- Sie muss spaeter Scene 7 vorbereiten, ohne den Satz `Nur die Endgeraete koennen den Inhalt lesen` zu ueberdehnen.
- Visuals muessen deshalb klar zeigen: `nicht lesbar` ist etwas anderes als `unsichtbar`.

## Scene 4 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Der konkrete Satz `Treffen um 15 Uhr` bleibt auf Annas Geraet lesbar und taucht erst bei Ben wieder lesbar auf.
- Which objects must be recognizable by silhouette alone?
  Anna-Handy mit Chatfeld, Encrypt-Station, Geheimtextkachel, Server, Ben-Handy
- Which concepts must still be hidden?
  Angreifer in der Mitte als explizite Bedrohung, Backup-Abfluss
- Which labels are necessary?
  `Treffen um 15 Uhr`, `7F 91 C2 ...`
- Which labels are redundant if the object design is good enough?
  lange Zusatzsaetze im Serverbereich
- Single most important visual sentence:
  Der Klartext springt nicht offen ueber die Mitte

## Scene 4 - Detailing Expansion Pass 2

- object states:
  Anna tippt aktiv, Encrypt-Box arbeitet, Server bleibt neutral, Ben wird am Ende aktiv
- token paths:
  Klartexttoken bleibt kurz links; danach Cipher-Token durch Mitte; am Ende Klartexttoken bei Ben
- transitions:
  Chattext tippt ein -> wird verschlossen -> Geheimtext reist -> Ben oeffnet
- visibility timing:
  75-85s Eingabe auf Anna
  85-95s Verschluesselung links
  95-103s Transport als Geheimtext
  103-110s Entschluesselung bei Ben
- cue boundaries:
  ein Cue
- camera intention:
  links beginnen, dann sanfter Schwenk ueber Mitte, rechts enden
- caption or TTS beats:
  `Treffen um 15 Uhr`
  `Noch auf dem Geraet verschluesselt`
  `Server sieht nur 7F 91 C2`
  `Erst bei Ben wieder lesbar`
- logic truth table:
  - who knows what:
    Anna kennt Klartext vor der Verschluesselung
    Server kennt nur Ciphertext
    Ben kennt Klartext erst nach dem rechten Ende
  - who owns what:
    Endgeraete tragen die eigentliche Lesbarkeit
  - plaintext vs ciphertext vs hidden:
    Klartext links und am Ende rechts, Ciphertext in der Mitte
  - what the attacker can see:
    nur den verschluesselten Block
  - what must not yet be visible:
    kompromittierter Serverangriff als aktive Attacke; das kommt erst in Scene 5

## Scene 4 - Extensive Alignment Pass

- Scene 4 darf nicht wie ein zweites Erklaerschema wirken; sie ist das konkrete Beispiel.
- Die konkrete Nachricht aus Scene 4 muss spaeter in Scene 5 und 6 als Wiedererkennungsanker dienen.
- Der Server darf hier nicht schon wie kompromittiert aussehen.

## Scene 5 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Selbst ein geoeffneter Server liefert ohne Endgeraetezugriff keinen lesbaren Inhalt.
- Which objects must be recognizable by silhouette alone?
  geoeffneter Server / Adminfenster / Angreiferpanel / Ciphertextblock / stabile Endgeraete
- Which concepts must still be hidden?
  konkrete Malware am Endgeraet; das gehoert erst zur Grenze
- Which labels are necessary?
  `Nur Geheimtext`
- Which labels are redundant if the object design is good enough?
  erneute Definition von E2E
- Single most important visual sentence:
  Angriff in der Mitte bedeutet nicht automatisch Klartext

## Scene 5 - Detailing Expansion Pass 2

- object states:
  Mitte rot oder kompromittiert markiert, Endgeraete weiterhin stabil, Ciphertext auch im Angreiferpanel unlesbar
- token paths:
  Ciphertext wird in Angreifer-/Adminpanel abgezweigt, bleibt aber Ciphertext
- transitions:
  Server oeffnet sich -> Angreifer greift zu -> nur Geheimtext erscheint
- visibility timing:
  110-118s Mitte kompromittieren
  118-129s Abzweig in Angreiferpanel
  129-135s Zustand einfrieren: nur Geheimtext
- cue boundaries:
  ein Cue
- camera intention:
  auf die Mitte heranzoomen, Endgeraete aber weiterhin im Bild halten
- caption or TTS beats:
  `Server kompromittiert`
  `Nur Daten sichtbar`
  `Inhalt bleibt unlesbar`
- logic truth table:
  - who knows what:
    Angreifer weiss, dass Daten laufen
    Angreifer kennt den Inhalt nicht
  - who owns what:
    Endgeraete behalten die Lesbarkeit
  - plaintext vs ciphertext vs hidden:
    Ciphertext sichtbar, Klartext verborgen
  - what the attacker can see:
    abgegriffene Ciphertextbloecke
  - what must not yet be visible:
    Malware direkt auf dem Endgeraet, Backup-Pfad

## Scene 5 - Extensive Alignment Pass

- Diese Szene muss staerker sein als Scene 3, aber semantisch kompatibel bleiben.
- Scene 3 zeigt `Server sieht Rahmen`; Scene 5 zeigt `selbst Angriff auf die Mitte liest noch nicht den Inhalt`.
- Kein visuelles Detail darf hier so aussehen, als haette der Angreifer ploetzlich doch Klartext.

## Scene 6 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Die Schwachstelle sitzt jetzt direkt am Endgeraet oder ausserhalb des geschuetzten Kanals im Backup.
- Which objects must be recognizable by silhouette alone?
  Smartphone, Malware-Symbol, Datenabfluss direkt am Smartphone, Cloud-Backup-Speicher
- Which concepts must still be hidden?
  keine neuen Konzepte; dies ist die Gegenfolie
- Which labels are necessary?
  `Endgeraet kompromittiert`, `Backup`
- Which labels are redundant if the object design is good enough?
  erneute Erklaerung des Serververhaltens
- Single most important visual sentence:
  Die starke Mitte schuetzt nicht vor einem schwachen Ende

## Scene 6 - Detailing Expansion Pass 2

- object states:
  Mitte bleibt gesund und geschuetzt, rechtes Endgeraet wird kompromittiert, Backup liegt seitlich ausserhalb des Schutzpfads
- token paths:
  kleiner Leak-Pfad direkt vom Endgeraet zum Angreifer; separater Backup-Pfad zur Cloud
- transitions:
  Malware setzt sich aufs Geraet -> Klartext wird lokal abgegriffen -> Cloud-Backup blendet als zweiter Grenzfall ein
- visibility timing:
  135-147s kompromittiertes Geraet
  147-157s lokaler Abgriff
  157-165s unsicheres Backup als Zusatzfall
- cue boundaries:
  ein Cue
- camera intention:
  Fokus nach rechts unten, damit Geraet und Backup gemeinsam lesbar werden
- caption or TTS beats:
  `Die Leitung ist geschuetzt`
  `Das Endgeraet vielleicht nicht`
  `Backup kann den Schutz ebenfalls umgehen`
- logic truth table:
  - who knows what:
    Angreifer lernt Klartext erst am kompromittierten Ende
    Mitte bleibt weiterhin blind fuer den Inhalt
  - who owns what:
    das Endgeraet kontrolliert den letzten offenen Moment
  - plaintext vs ciphertext vs hidden:
    in der Mitte weiter Geheimtext; lokal oder im Backup kann Klartext wieder offen sein
  - what the attacker can see:
    Klartext am kompromittierten Ende oder in schlechtem Backup
  - what must not yet be visible:
    keine neue Netzwerkbedrohung; sonst verwischt die Grenze

## Scene 6 - Extensive Alignment Pass

- Diese Szene darf nicht als Widerlegung von E2E wirken, sondern als saubere Begrenzung.
- Deshalb muss die Mitte sichtbar weiter stark bleiben.
- Der Leak darf nur direkt am Ende oder am Backup stattfinden, niemals wieder in der Mitte.

## Scene 7 - Detailing Expansion Pass 1

- What should the viewer understand in one glance?
  Das Endschema ist einfach: lesbar nur an den Enden, nicht in der Mitte.
- Which objects must be recognizable by silhouette alone?
  Anna-Endgeraet, Verschluesselung links, Geheimtextstrecke, Server/Netz in der Mitte, Entschluesselung rechts, Ben-Endgeraet
- Which concepts must still be hidden?
  keine neuen
- Which labels are necessary?
  Schlusssatz plus kompaktes Schema
- Which labels are redundant if the object design is good enough?
  lange Zusatzboards
- Single most important visual sentence:
  Lesbarkeit beginnt links und endet rechts, nicht in der Mitte

## Scene 7 - Detailing Expansion Pass 2

- object states:
  stabile Endkonfiguration, alle Rollen ruhig, keine konkurrierenden Warnfarben
- token paths:
  ein Ciphertexttoken in der Mitte und Klartext-Referenzen an beiden Enden
- transitions:
  bestehende Buehne beruhigt sich -> Schema-Board erscheint -> Schlusssatz blendet ein
- visibility timing:
  165-172s Schema stabil
  172-180s Schlusssatz gross und ruhig
- cue boundaries:
  ein Cue
- camera intention:
  ruhige Gesamttotale
- caption or TTS beats:
  `Nur die Endgeraete lesen den Inhalt`
  `Die Mitte transportiert nur Geheimtext`
  `Darum ist E2E wichtig`
- logic truth table:
  - who knows what:
    Anna und Ben sind die Lesepunkte
    Mitte bleibt ausserhalb der Lesbarkeit
  - who owns what:
    Endgeraete tragen die Entschluesselungsfaehigkeit
  - plaintext vs ciphertext vs hidden:
    Klartext an den Enden, Geheimtext in der Mitte
  - what the attacker can see:
    nichts Neues gegenueber Scene 5; deshalb ruhig bleiben
  - what must not yet be visible:
    kein neuer Angriff, kein neues Objekt, kein Backupdrama

## Scene 7 - Extensive Alignment Pass

- Das Finale muss stark verdichten, aber darf Scene 3 und 6 nicht ungeschehen machen.
- Deshalb soll auf dem grossen Schlussboard die Kernaussage stehen, waehrend die Implementierung optional einen kleinen Resthinweis auf Metadaten/Endgeraete im Layout behalten kann.
- Sprechertext darf emotional schliessen, Bildlogik muss sachlich bleiben.

## Holistic Continuity Pass Across The Whole Presentation

- Premature reveals:
  Metadaten duerfen nicht schon in Scene 1 oder 2 als Tabellenboard auftauchen.
  Malware und Backup duerfen nicht vor Scene 6 sichtbar werden.

- Duplicated explanations:
  Scene 2 erklaert das Prinzip.
  Scene 4 zeigt das konkrete Beispiel.
  Scene 5 beweist den Vorteil unter Angriff.
  Diese drei Rollen muessen getrennt bleiben.

- Contradictory object placement:
  Der Server bleibt stets in der Mitte.
  Klartext darf nie als reisendes Token in Scene 2 bis 7 durch die Mitte laufen.
  Der Leak in Scene 6 muss sichtbar am Endgeraet oder am Backup starten.

- Labels that become false:
  `Mitte = Transport` nur in Scene 2.
  `Server sieht Metadaten` nur in Scene 3.
  `Kompromittierter Server` nur in Scene 5.

- Camera moves that weaken comprehension:
  Kein zu frueher Close-up auf einzelne Deko-Objekte.
  Scene 1 und 7 brauchen klare Totalen.
  Scene 3 und 6 duerfen naeher werden, muessen aber die Rahmendramaturgie erhalten.

- Scenes that are locally good but globally repetitive:
  Scene 3 und 5 beide mit Serverfokus, aber unterschiedliche Aussage.
  Scene 2 und 7 beide als Schema, aber Scene 2 aktivierend, Scene 7 verdichtend.

- Revisions forced by the whole:
  In der Runtime sollte E2E einen eigenen visuellen Modus behalten und nicht nur eine minimal umetikettierte Shared-Key-Story sein.
  Der Workspace-Slot sollte dieses Projekt klar benennen, bis die eigentliche Karte final freigeschaltet ist.

## Derived Implementation Obligations

- `data.js`:
  Die 7 Cues muessen exakt diese Semantik tragen.
  Caption und TTS muessen die Metadaten-vs-Inhalt-Trennung konsequent halten.

- `runtime.js`:
  E2E braucht eigene Endgeraete-Silhouetten, nicht nur terminalartige Sender-/Empfaenger-Panels.
  Server-Metadaten und Endgeraete-Leak muessen als unterschiedliche Visual-Familien erscheinen.

- Registry:
  `sec_verschluesselung` bleibt `partial`.
  Der Slice `ende_zu_ende_verschluesselung` ist fachlich sauber.

## Next Implementation Gate

Vor jeder weiteren Runtime-Aenderung muessen die obigen Scene-Paesse als massgebliche Referenz behandelt werden.
