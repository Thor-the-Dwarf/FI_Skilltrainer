Aktualisierter Plan fuer den `crystal_katalog`

## Verbindliches Wording

- `Kristall`:
Der Gesamtkörper.
Er trägt genau ein, das größte aller, Symbole im Zentrum.
Dieses Zentralsymbol darf alle anderen Körper visuell durchkreuzen.
Im Detail-Listview repräsentiert sie die `H1`.

- `Fragmente`:
Unterteilungen auf `Level 1`.
Sie teilen die Grundform des Kristalls.
Sie sollen derzeit etwa `25%` transparent sein.
Jedes Fragment trägt unabhängig von seinen inneren Fraktalen ein eigenes Symbol im Zentrum.
Dieses Fragmentsymbol ist doppelt so groß wie die Symbole der Fraktale.
Auch dieses Symbol darf andere innere Körper visuell kreuzen.
Im Detail-Listview repräsentieren Fragmente `H2`-Überschriften.

- `Fraktale`:
Unterteilungen auf `Level 2`.
Sie teilen die Fragmente.
Sie sollen derzeit etwa `50%` transparent sein.
Jedes Fraktal trägt ein Symbol in seinem Zentrum.
Im Detail-Listview repräsentieren sie laut aktueller Vorgabe ebenfalls `H2`-Überschriften.

- Offener Wording-Punkt:
Aktuell nennen die Vorgaben sowohl `Fragmente` als auch `Fraktale` als `H2`.
Falls für Fraktale eigentlich `H3` gemeint ist, muss nur diese eine Zuordnung angepasst werden.

## Leitidee

Die Flaechen des Grundkristalls werden nicht mehr geknackt.
Stattdessen ist jede Flaeche die Grundflaeche eines individuellen Pyramidenkristalls.

Dieser Pyramidenkristall kann aus der Gesamtstruktur herausgezogen werden.
Der herausgezogene Kristall wird nicht anstelle des Grundkristalls gezeigt, sondern zusaetzlich daneben.
Zwischen Grundkristall und herausgezogenem Kristall soll eine sichtbare Transition ablaufen.

## Kernmodell

- Der bestehende Kristall bleibt der `Grundkristall`.
- Jede Flaeche des Grundkristalls repraesentiert einen Hauptpunkt.
- Zu jeder Flaeche gehoert genau ein ausziehbarer `Pyramidenkristall`.
- Die Flaeche des Grundkristalls ist die Grundflaeche dieses Pyramidenkristalls.
- Der ausziehbare Kristall ist inhaltlich die vertiefte Ansicht dieser Flaeche.

## Symbole

- Cracks entfallen komplett.
- Statt Cracks tragen die herausziehbaren Kristalle `Symbole`.
- Jedes Symbol ist individuell und eindeutig.
- Es gibt:
- ein `Hauptpunkt-Symbol` auf der Grundflaeche / Hauptflaeche
- mehrere `Unter-Symbole` auf dem herausgezogenen Pyramidenkristall
- Jedes Symbol repraesentiert einen Punkt des Inhaltsverzeichnisses.
- Jedes Symbol ist mit genau einem `Detailpunkt` verbunden.

## Details und spaeteres Inhaltsverzeichnis

- `Bubble` wird nicht weiter als Begriff verwendet.
- Stattdessen heisst das Element jetzt `Detail` bzw. `Detailpunkt`.
- Detailpunkte erscheinen erst, wenn der zugehoerige Pyramidenkristall herausgezogen wurde.
- Jeder Detailpunkt repraesentiert einen Punkt des spaeteren Inhaltsverzeichnisses.
- Jeder Detailpunkt ist eindeutig einem Symbol zugeordnet.
- Detailpunkt und spaeterer Inhaltsverzeichnispunkt sind als dieselbe logische Einheit zu behandeln.
- Der herausgezogene Kristall zeigt nicht mehr mit der Spitze auf den Oberpunkt.
- Der herausgezogene Kristall wird stattdessen senkrecht zu seinem Detailpunkt angeordnet.
- In dieser senkrechten Anzeige ist der Kristall zusaetzlich etwa `45 Grad` zum User geneigt.
- Ziel dieser Neigung: das obere Symbol soll fuer den User gut sichtbar und lesbar sein.

## Interaktion

- Auswahl einer Flaeche des Grundkristalls aktiviert ihren Pyramidenkristall.
- Danach laeuft eine Transition:
- Pyramidenkristall loest sich aus der Flaeche
- Pyramidenkristall bewegt sich neben den Grundkristall
- Grundkristall bleibt sichtbar
- Nach abgeschlossener Transition erscheinen die Detailpunkte
- Der Pyramidenkristall richtet sich senkrecht zu seinem Detailpunkt aus
- Der Pyramidenkristall ist dabei etwa `45 Grad` zum User geneigt

## Muss-Kriterien

- Jede Flaeche des Grundkristalls besitzt einen zugeordneten Pyramidenkristall.
- Herausziehen ist als sichtbare Transition umgesetzt.
- Grundkristall und herausgezogener Kristall sind gleichzeitig sichtbar.
- Cracks werden nicht weiterverfolgt.
- Jede Hauptflaeche traegt ein Hauptpunkt-Symbol.
- Jeder herausgezogene Kristall traegt Unter-Symbole.
- Jedes Symbol ist einzigartig.
- Jedes Symbol ist genau einem Detailpunkt zugeordnet.
- Detailpunkte erscheinen erst nach dem Herausziehen des Kristalls.
- Der herausgezogene Kristall steht senkrecht zu seinem Detailpunkt.
- Der herausgezogene Kristall ist in dieser Ansicht etwa `45 Grad` zum User geneigt.
- Detailpunkt und spaeterer Inhaltsverzeichnispunkt sind logisch miteinander gekoppelt.

## Offene Punkte

- Wie viele Unter-Symbole ein Pyramidenkristall standardmaessig bekommt
- Wie die Detailpunkte visuell angeordnet werden
- Ob das Inhaltsverzeichnis direkt im Katalog sichtbar ist oder erst in einer spaeteren Detailansicht
- Wie genau die Symbole visuell gestaltet werden

## Ausgangspunkt fuer die naechste Umsetzung

Empfohlener erster Schritt:

- Datenmodell pro Flaeche umstellen von `crackbar` auf `expandierbarer Pyramidenkristall`
- Symbol-/Detailpunkt-Zuordnung pro Flaeche vorbereiten
- Noch keine finale Inhalts-UI bauen
