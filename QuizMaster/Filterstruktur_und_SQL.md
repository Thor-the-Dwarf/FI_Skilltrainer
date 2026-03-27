# Filterstruktur und SQL-Beispiele

Die Datenbank kann jetzt über drei Ebenen gefiltert werden:

- `areas`: Ausbildungsjahre und Prüfungsteile
- `curriculum_nodes`: Lernfelder, offizielle Teile des Ausbildungsrahmenplans und Modulgliederungen
- `oberthemen`: fachliche Hauptblöcke

## Relevante Tabellen

- `areas`
- `area_thema_objekt`
- `oberthemen`
- `thema_objekte`
- `curriculum_nodes`
- `curriculum_node_thema_objekt`

## Vorhandene Curriculum-Frameworks

- `ausbildungsjahr`: 3 Knoten
- `ausbildungsrahmenplan_official`: 34 Knoten
- `lernfeld`: 12 Knoten
- `modulplan_seed`: 33 Knoten

## Beispiel: nach Ausbildungsjahr filtern

```sql
SELECT DISTINCT t.thema_objekt_id, t.label
FROM thema_objekte t
JOIN area_thema_objekt ato ON ato.thema_objekt_id = t.thema_objekt_id
WHERE ato.area_id = 'ausbildungsjahr_2'
ORDER BY t.label;
```

## Beispiel: nach Lernfeld filtern

```sql
SELECT DISTINCT t.thema_objekt_id, t.label
FROM curriculum_nodes n
JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = n.node_id
JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id
WHERE n.node_id = 'lf05'
ORDER BY t.label;
```

## Beispiel: nach Fachspezifisches Modul II filtern

```sql
SELECT DISTINCT t.thema_objekt_id, t.label
FROM curriculum_nodes root
JOIN curriculum_nodes child ON child.parent_node_id = root.node_id OR child.node_id = root.node_id
JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = child.node_id
JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id
WHERE root.node_id = 'modul_fs_ii_ae'
ORDER BY t.label;
```

## Beispiel: nach offiziellem Ausbildungsrahmenplan-Teil filtern

```sql
SELECT DISTINCT t.thema_objekt_id, t.label
FROM curriculum_node_thema_objekt cnt
JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id
WHERE cnt.node_id = 'fiausbv_d_3'
ORDER BY t.label;
```

## Beispiel: nach offiziellem Abschnitt und Fachrichtung filtern

```sql
SELECT DISTINCT t.thema_objekt_id, t.label
FROM curriculum_nodes n
JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = n.node_id
JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id
WHERE n.parent_node_id = 'fiausbv_c' OR n.node_id = 'fiausbv_c'
ORDER BY t.label;
```
