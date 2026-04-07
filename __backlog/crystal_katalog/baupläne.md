1–3 → nicht möglich als normales geschlossenes Polyeder
4 → Tetraeder → 4 Dreiecke
5 → quadratische Pyramide → 1 Quadrat + 4 Dreiecke
6 → Würfel → 6 Quadrate
7 → Fünfeckprisma → 2 Fünfecke + 5 Rechtecke
8 → Oktaeder → 8 Dreiecke
9 → Siebeneckprisma → 2 Siebenecke + 7 Rechtecke
10 → Achteckprisma → 2 Achtecke + 8 Rechtecke
11 → Neuneckprisma → 2 Neunecke + 9 Rechtecke
12 → Dodekaeder → 12 Fünfecke
13 → 11-Eck-Prisma → 2 11-Ecke + 11 Rechtecke
14 → 12-Eck-Prisma → 2 12-Ecke + 12 Rechtecke
15 → 13-Eck-Prisma → 2 13-Ecke + 13 Rechtecke
16 → 14-Eck-Prisma → 2 14-Ecke + 14 Rechtecke
17 → 15-Eck-Prisma → 2 15-Ecke + 15 Rechtecke
18 → 16-Eck-Prisma → 2 16-Ecke + 16 Rechtecke
19 → 17-Eck-Prisma → 2 17-Ecke + 17 Rechtecke
20 → Ikosaeder → 20 Dreiecke


Crack-System / naechste Ausbaustufe:

- Jede Flaeche muss einzeln crackbar sein.
- Trigger: Rechtsklick auf die aktuell selektierte Flaeche.
- Pro Rechtsklick erhoeht sich die Teilflaechenzahl dieser einen Ursprungsflaeche um genau 1.
- Gemeinte Lesart: 1 Flaeche -> 2 Crack-Flaechen -> 3 Crack-Flaechen -> 4 Crack-Flaechen usw.
- Das Cracking soll mehrfach auf derselben Flaeche moeglich sein, nicht nur einmalig.
- Jede Ursprungsflaeche braucht dafuer einen eigenen Crack-Algorithmus oder ein eigenes Crack-Muster.
- Die Crack-Muster sollen nicht rein zufaellig sein, sondern wiederholbar und stabil zu derselben Flaeche passen.
- Jede Crack-Flaeche braucht eine eigene Identitaet und Herkunft:
- `rootFaceId` der Ursprungsflaeche
- `crackGeneration`
- `crackFaceIndex`
- optional `crackPatternId`
- Gekrackte Flaechen sollen etwas groesser sein, als sie geometrisch streng sein duerften.
- Ziel davon: Der Gesamtkoerper soll dadurch runder wirken.
- Gemeinte Wirkung: Auf der Ursprungsflaeche entstehen leichte nach aussen gewoelbte Huegel oder kuppelfoermige Ausbeulungen.
- Die Ausbeulung soll entlang der Flaechennormale nach aussen gehen, nicht in den Kristall hinein.
- Trotz Cracking muss der Kristall weiterhin als zusammenhaengender Koerper lesbar bleiben.
- Die Crack-Flaechen muessen weiter selektierbar bleiben.
- Exportierbarkeit bleibt Pflicht, damit dieselben Kristalle spaeter in `cristal_IPv4` importiert werden koennen.
- Jedes Mal, wenn eine Flaeche gekrackt wird, erscheint an dieser Crack-Flaeche eine Bubble/Markierung.
- Diese Bubble repraesentiert den neu entstandenen Crack-Knoten.
- Linksklick auf eine Ursprungsflaeche oder allgemein auf einen Flaechenknoten soll alle zugehoerigen Bubbles gesammelt sichtbar machen.
- Die Bubbles sollen dann in einer Art List-View angeordnet werden.
- Gemeinte Darstellung: eher wie ein Folder-Tree als wie lose Marker.
- Die Hauptflaeche ist der Oberordner / Root-Knoten.
- Crack-Flaechen sind Unterordner oder Dateien dieses Knotens.
- Diese Unterknoten koennen selbst wieder Unterknoten haben.
- Das gesamte System muss also rekursiv funktionieren.
- Auch bereits gekrackte Flaechen muessen erneut crackbar bleiben.
- Jeder Crack-Knoten braucht deshalb neben der sichtbaren Flaeche auch eine Hierarchie-Identitaet:
- `parentFaceId`
- `rootFaceId`
- `nodeDepth`
- `childIndex`
- Bubble-Darstellung und Geometrie-Hierarchie muessen dieselbe Baumstruktur verwenden.
- Wenn eine Flaeche selektiert ist, soll die UI diese Crack-Hierarchie klar wie einen Dateibaum lesbar machen.
- Die Bubble-Ansicht ist also keine reine Dekoration, sondern die sichtbare Navigation durch den Crack-Tree.
- Rechtsklick auf eine Bubble oeffnet die naechste Arbeitsebene / Detailansicht.
- Dann wechselt der Body in einen Splitscreen.
- Links liegen ca. 20 Prozent der Breite.
- In diesem linken Bereich ist oben weiter der Kristall sichtbar.
- Unter dem Kristall liegt dort zusaetzlich eine normale Nicht-Babylon-UI.
- Diese Nicht-Babylon-UI ist ein Listview / Inhaltsverzeichnis.
- Mit diesem Inhaltsverzeichnis soll durch den rechten grossen Bereich navigiert werden.
- Der rechte grosse Bereich zeigt eine Art PDF- oder dokumentartige Detailansicht.
- Die genaue technische Umsetzung dieser PDF-/Dokumentansicht ist noch offen und muss spaeter entschieden werden.
- Wichtig ist aber schon jetzt: Bubble-Rechtsklick fuehrt in diese hierarchische Detailansicht hinein.

Priorisierung / Muss- und Kann-Kriterien:

Muss:

- Jede Flaeche ist einzeln crackbar.
- Rechtsklick auf eine selektierte Flaeche erhoeht ihre Teilflaechenzahl schrittweise.
- Die Crack-Logik ist rekursiv, also auch bereits gekrackte Flaechen sind wieder crackbar.
- Jede Ursprungsflaeche braucht ein stabiles, wiederholbares Crack-Muster.
- Jede Crack-Flaeche braucht eine eigene Identitaet mit Hierarchie-Bezug.
- Jede neu entstandene Crack-Flaeche erzeugt eine Bubble oder Markierung.
- Linksklick auf eine Flaeche zeigt alle zugehoerigen Bubbles gesammelt an.
- Diese Bubbles ordnen sich wie ein Folder-Tree oder Listview an.
- Die Hauptflaeche ist der Root-Knoten, Crack-Flaechen sind Unterknoten.
- Bubble-Hierarchie und Geometrie-Hierarchie muessen dieselbe Baumstruktur nutzen.
- Rechtsklick auf eine Bubble oeffnet eine Detail- oder Arbeitsebene.
- Diese Detailansicht schaltet den Body in einen Splitscreen.
- Links auf ca. 20 Prozent bleibt oben der Kristall sichtbar.
- Unter dem Kristall gibt es links eine normale Nicht-Babylon-UI.
- Diese linke UI ist ein Listview oder Inhaltsverzeichnis.
- Mit diesem Inhaltsverzeichnis navigiert man den rechten grossen Bereich.
- Rechts erscheint eine PDF- oder dokumentartige Detailansicht.
- Die genaue technische Umsetzung der Dokumentansicht ist noch offen.
- Das gesamte System muss exportierbar bleiben, damit es in `cristal_IPv4` importiert werden kann.
- Die Kristalle leben in einer Crystal World, aehnlich einem Obsidian-Graphen oder Obsidian-Wall.
- Deshalb braucht es Verbindungslinien zwischen den einzelnen Flaechen der Kristalle.
- Flaechen sollen spaeter Runen oder eine Art Icons tragen koennen, die zum Gesamtkonzept passen.

Kann:

- Gekrackte Flaechen sollen leicht ueberhoeht und etwas groesser als streng geometrisch korrekt sein.
- Diese ueberhoehten Crack-Flaechen sollen den Gesamtkristall runder wirken lassen.

Grundflaechen-Inventar / aktuell im Katalog verfuegbare Flaechentypen:

Exakte aktuell vorkommende Flaechentypen:

- sphaerische Segmentflaeche / Kugelflaeche
- Kreisscheibe
- Kegelmantelflaeche
- Zylindermantelflaeche
- Dreieck
- Quadrat
- allgemeines Viereck
- Fuenfeck
- Sechseck
- Siebeneck
- Achteck
- Neuneck

Sinnvolle Crack-Algorithmus-Klassen:

- gekruemmte Flaechen:
- Kugelflaeche
- Kegelmantel
- Zylindermantel
- runde plane Flaechen:
- Kreisscheibe
- plane Polygonflaechen:
- Dreieck
- Viereck
- n-Eck ab 5 Seiten

Konkrete Crack-Regel fuer Kugelflaechen:

- Bei Kugelflaechen machen wir es uns bewusst leicht.
- Eine Kugelflaeche mit 1 Teilflaeche wird beim ersten Crack zu 2 Teilflaechen.
- 2 Teilflaechen werden beim naechsten Crack zu 3 Teilflaechen.
- 3 Teilflaechen werden beim naechsten Crack zu 4 Teilflaechen.
- Allgemeine Regel dafuer: bei jeder weiteren Crack-Stufe steigt die Teilflaechenzahl um genau 1.
- Das Crack-Limit liegt global bei 10.
- Eine Flaeche darf also hoechstens 10-mal gekrackt werden.
- Spaetestens auf Crack-Stufe 10 ist Schluss, auch wenn theoretisch weitere Unterteilungen moeglich waeren.

Rune-/Icon-Hinweis:

- Jede Flaeche soll spaeter eine Rune oder ein Icon tragen koennen.
- Dafuer braucht jede Flaeche langfristig einen stabilen lokalen 2D-Bezugsraum.
- Bei planen Flaechen kann das ueber eine lokale Flaechenebene passieren.
- Bei gekruemmten Flaechen braucht es spaeter eine eigene Projektion oder UV-Logik.

Bertungsfarben:

< 10% Rot
< 20% Rotorange
< 30% Orange
< 40% Gelborange
< 50% Gelb
< 60% Gelbgrün
< 70% Grün
< 80% Blaugrün
< 90% Blau
  100% Violett
