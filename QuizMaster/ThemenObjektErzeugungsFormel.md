# ThemenObjektErzeugungsFormel

## Kurzform

```text
ThemaObjektMenge(T, z) = Zerlegung eines Themas T in atomare fachliche Einheiten bei Tiefe z
```

## Bedeutung

- `T` = Welches Thema wird zerlegt?
- `z` = Wie fein wird dieses Thema zerlegt?
- `ThemaObjektMenge` = Welche Teilobjekte entstehen dabei?
- `atomare fachliche Einheiten` = kleinste sinnvolle Einheiten, zu denen man einzeln Aufgaben stellen kann

## Merksatz

- kleines `z` -> grobe Zerlegung -> wenige Thema-Objekte
- großes `z` -> feine Zerlegung -> viele Thema-Objekte

## Beispiel mit RAID

- `T = RAID`
- kleines `z` -> `RAID allgemein`, `RAID 0`, `RAID 1`, `RAID 5`
- größeres `z` -> zusätzlich `Parität`, `Rebuild`, `Hot Spare`, `degraded mode`, `Nutzkapazität`

## Noch kürzer

```text
Thema = Oberthema
z = Zerlegungstiefe
ThemaObjektMenge = Liste aller Teilobjekte des Themas
```

## Arbeitsregel

Ein Oberthema ist der Recherche-Anker.

Erst wird das Oberthema sauber bestimmt, danach wird es auf passender Tiefe in Thema-Objekte zerlegt.

Ein Thema-Objekt ist erreicht, wenn daraus direkt mehrere sinnvolle Aufgaben gebildet werden können, ohne dass noch ein weiteres Fachthema hineingemischt werden muss.
