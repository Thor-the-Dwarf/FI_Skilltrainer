# DoomScrollQuiz Contract

Diese Datei ist die Arbeitsgrundlage fuer Agents oder Personen, die `quiz*.json` fuer das DoomScrollQuiz erzeugen.

## Grundregel

- Die Wahrheit liegt pro Frage in der jeweiligen `quiz*.json`.
- Das `quiz-manifest.json` darf nur Zusammenfassungen und Defaults enthalten.
- Das Badge in der Fragekarte wird pro Frage bestimmt, nicht pro Deck.

## Wo kommt welche Information hin?

### In `quiz*.json`

Hierhin gehoeren die Felder, die Rendering und Auswertung direkt steuern:

- `interactionType`
- `questionKind`
- `badgeLabel`
- `prompt`
- `options`
- optional je nach Typ weitere Felder wie `acceptedAnswers`, `sequenceItems`, `expectedOrder`

### In `quiz-manifest.json`

Hierhin gehoeren nur Katalogdaten:

- `file`
- `label`
- `ticketId`
- `versionId`
- `questionCount`
- `topics`
- optional: `interactionTypes`
- optional: `questionKinds`
- optional: `dominantBadge`

## Aktueller Runtime-Stand

Bereits direkt in der UI nutzbar:

- `binary`
- `single`
- `multi`
- `best`
- `badgeLabel`
- `questionKind` als Badge-Fallback

Schon im Contract vorgesehen, aber noch ohne spezialisierten Renderer:

- `sequence`
- `gap_fill_choice`
- `gap_fill_text`

Wichtig:
- Diese drei Typen koennen schon in Daten beschrieben werden.
- Die aktuelle UI rendert dafuer aber noch keinen eigenen Spezial-Block.
- Fuer produktive Inhalte deshalb vorerst nur dann verwenden, wenn die passende UI danach implementiert wurde.

## Root-Felder einer `quiz*.json`

Empfohlen:

```json
{
  "scenarioFolder": "LF01-Scenarien",
  "quizFolder": "LF01-Quiz",
  "scenarioFile": "ticket_ausbildungsbetrieb_rolle_und_betrieb/ticket01_V01_ausbildungsbetrieb_rolle_und_betrieb.json",
  "quizFile": "quiz_ausbildungsbetrieb_rolle_und_betrieb/quiz01_V03_ausbildungsbetrieb_rolle_und_betrieb.json",
  "ticketId": "01_easy_ausbildungsbetrieb_rolle_und_betrieb.json",
  "versionId": "V03",
  "title": "Ticket 01 - Rolle und Betrieb",
  "description": "DoomScrollQuiz-Varianten zu Ticket 01.",
  "topics": ["Rolle und Betrieb"],
  "defaultInteractionType": "single",
  "defaultQuestionKind": "eine_richtige_antwort_waehlen",
  "defaultBadgeLabel": "Welche Antwort trifft am besten zu?",
  "questions": []
}
```

## Pflichtfelder pro Frage

- `id`
- `conceptId`
- `variantId`
- `prompt`

Bei Auswahlfragen zusaetzlich:

- `options`

Empfohlen pro Frage:

- `interactionType`
- `questionKind`
- `badgeLabel`
- `isNew`
- `maxSelections`

## Interaction Types

### `binary`

Fuer Ja/Nein oder stimmt/stimmt nicht.

### `single`

Genau eine Antwort ist richtig.

### `multi`

Mehrere Antworten sind richtig.

### `best`

Es gibt die beste Option unter mehreren plausiblen Optionen.

### `sequence`

Die Reihenfolge ist relevant. Nutze zusaetzlich:

- `sequenceItems`
- `expectedOrder`

### `gap_fill_choice`

Eine Luecke wird per Auswahl gefuellt. Nutze entweder normale `options` oder zusaetzlich:

- `sentenceTemplate`
- `gapKey`

### `gap_fill_text`

Eine Luecke wird per Freitext gefuellt. Nutze zusaetzlich:

- `sentenceTemplate`
- `gapKey`
- `acceptedAnswers`

## Didaktische `questionKind`-Werte

| questionKind | Standard-Badge | Empfohlener interactionType |
| --- | --- | --- |
| `aussage_bewerten` | `Stimmt diese Aussage?` | `binary` |
| `eine_richtige_antwort_waehlen` | `Welche Antwort trifft am besten zu?` | `single` |
| `mehrere_richtige_antworten_waehlen` | `Welche Aussagen sind korrekt?` | `multi` |
| `beste_option_im_mini_szenario` | `Was waere hier der beste naechste Schritt?` | `best` |
| `begriff_zu_definition` | `Welcher Begriff passt zu dieser Beschreibung?` | `single` |
| `definition_zu_begriff` | `Was bedeutet dieser Begriff?` | `single` |
| `beispiel_erkennen` | `Welches Beispiel passt zu X?` | `single` |
| `gegenbeispiel_erkennen` | `Welches Beispiel passt gerade nicht zu X?` | `single` |
| `kategorie_zuordnen` | `Wozu gehoert dieser Fall / Begriff / Schritt?` | `single` |
| `reihenfolge_bestimmen` | `Was kommt zuerst / danach / zuletzt?` | `sequence` |
| `fehler_finden` | `Welche Option enthaelt den Denkfehler / Regelverstoss / Bruch?` | `single` |
| `luecke_fuellen` | `Welche Antwort ergaenzt den Satz sinnvoll?` | `gap_fill_choice` |
| `vergleich_treffen` | `Worin liegt der wichtigste Unterschied?` | `single` |
| `prioritaet_setzen` | `Was ist hier am wichtigsten?` | `best` |
| `ursache_folge_erkennen` | `Welche Folge ergibt sich am ehesten daraus?` | `single` |
| `was_fehlt` | `Welcher Punkt fehlt noch, damit es vollstaendig ist?` | `single` |
| `passende_massnahme_auswaehlen` | `Welche Massnahme passt am besten zur Situation?` | `best` |
| `ziel_mittel_zuordnung` | `Welche Option hilft am ehesten, dieses Ziel zu erreichen?` | `single` |

## Auswahlfragen: Beispiel

```json
{
  "id": "q_rollen_01",
  "conceptId": "lf01_rollenverstaendnis",
  "variantId": "lf01_rollenverstaendnis_v3",
  "interactionType": "single",
  "questionKind": "begriff_zu_definition",
  "badgeLabel": "Welcher Begriff passt zu dieser Beschreibung?",
  "prompt": "Welcher Begriff passt zu einer klar benannten Verantwortung im Team?",
  "maxSelections": 1,
  "options": [
    { "id": "a", "text": "Ownership", "correct": true, "explanation": "Ownership meint hier klare Verantwortung." },
    { "id": "b", "text": "Zufall", "correct": false, "explanation": "Zufall beschreibt keine Verantwortung." }
  ]
}
```

## Mehrfachauswahl: Beispiel

```json
{
  "id": "q_rollen_02",
  "conceptId": "lf01_abstimmung",
  "variantId": "lf01_abstimmung_v2",
  "interactionType": "multi",
  "questionKind": "mehrere_richtige_antworten_waehlen",
  "badgeLabel": "Welche Aussagen sind korrekt?",
  "prompt": "Welche Schritte helfen bei einer sauberen Abstimmung?",
  "maxSelections": 2,
  "options": [
    { "id": "a", "text": "Zwischenstand offen teilen", "correct": true },
    { "id": "b", "text": "Rueckfragen sichtbar machen", "correct": true },
    { "id": "c", "text": "Informationsluecken verbergen", "correct": false }
  ]
}
```

## Reihenfolge: Beispiel fuer spaeteren Spezial-Renderer

```json
{
  "id": "q_rollen_03",
  "conceptId": "lf01_abfolge",
  "variantId": "lf01_abfolge_v1",
  "interactionType": "sequence",
  "questionKind": "reihenfolge_bestimmen",
  "badgeLabel": "Was kommt zuerst / danach / zuletzt?",
  "prompt": "Bringe die Schritte in eine sinnvolle Reihenfolge.",
  "sequenceItems": [
    { "id": "a", "text": "Ist-Zustand klaeren" },
    { "id": "b", "text": "Naechsten Schritt festlegen" },
    { "id": "c", "text": "Ergebnis dokumentieren" }
  ],
  "expectedOrder": ["a", "b", "c"]
}
```

## Luecke mit Freitext: Beispiel fuer spaeteren Spezial-Renderer

```json
{
  "id": "q_rollen_04",
  "conceptId": "lf01_begriff",
  "variantId": "lf01_begriff_v1",
  "interactionType": "gap_fill_text",
  "questionKind": "luecke_fuellen",
  "badgeLabel": "Welche Antwort ergaenzt den Satz sinnvoll?",
  "prompt": "Fuelle die Luecke sinnvoll.",
  "sentenceTemplate": "Klare ______ hilft dem Team, Verantwortung sichtbar zu machen.",
  "gapKey": "hauptbegriff",
  "acceptedAnswers": ["ownership", "verantwortung"]
}
```

## Manifest-Erweiterung

Ein `quiz-manifest.json` darf zusaetzlich je Eintrag enthalten:

```json
{
  "file": "quiz_ausbildungsbetrieb_rolle_und_betrieb/quiz01_V03_ausbildungsbetrieb_rolle_und_betrieb.json",
  "label": "Ticket 01 - Rolle und Betrieb (V03)",
  "ticketId": "01_easy_ausbildungsbetrieb_rolle_und_betrieb.json",
  "versionId": "V03",
  "questionCount": 12,
  "topics": ["Rolle und Betrieb"],
  "interactionTypes": ["single", "multi", "best"],
  "questionKinds": ["begriff_zu_definition", "beste_option_im_mini_szenario"],
  "dominantBadge": "Welche Antwort trifft am besten zu?"
}
```

## Kurzregel fuer den Agent

- Jede Frage bekommt `conceptId`, `variantId`, `interactionType`, `questionKind`.
- `badgeLabel` explizit setzen, wenn der Kartentext genau feststehen soll.
- Wenn mehrere Versionen derselben Lernidee existieren, bleibt `conceptId` gleich und nur `variantId` aendert sich.
- Neue Spezialtypen erst dann produktiv verwenden, wenn die passende UI dafuer live ist.
