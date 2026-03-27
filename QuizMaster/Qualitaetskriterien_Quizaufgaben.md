# Qualitätskriterien für Quizaufgaben

Diese Kriterien gelten für sichtbare Quizinhalte in JSON- und DB-Form gleichermaßen.

## Sichtbarkeit

- Keine sichtbaren Ticket-, Versions-, Datei- oder Pfadverweise in `title`, `description`, `label`, `badgeLabel`, `prompt`, Antworttexten oder Erklärungen.
- Keine internen Arbeitsbegriffe oder Generator-Spuren in der Oberfläche.

## Sprache

- Natürliches, idiomatisches Deutsch.
- Korrekte Grammatik, Fälle, Artikel und Bezüge.
- Echte Umlaute und `ß` in sichtbaren Texten statt ASCII-Ersatz oder verstümmelter Schreibweisen.
- Keine holprigen Templatesätze wie `Für einer ...`, `zu dem Thema X` oder ähnliche Schablonenreste.

## Aufgabenformulierung

- Keine leicht erkennbaren Wiederholungsmuster in Badge und Prompt.
- Badge und Aufgabenstellung dürfen nicht dieselbe Formulierung doppeln.
- Satzanfänge und Fragelogik sollen im Pool abwechslungsreich wirken.
- Aufgaben sollen fachlich konkret sein, nicht generisch austauschbar.

## Antwortoptionen

- Falsche Antworten müssen plausibel sein, aber fachlich klar scheitern.
- Richtige und falsche Optionen dürfen sich nicht nur durch einzelne Signalwörter verraten.
- Antworttexte sollen sprachlich auf gleichem Niveau formuliert sein.

## Erklärungen

- Erklärungen müssen den fachlichen Grund nennen, warum eine Option richtig oder falsch ist.
- Erklärungen müssen sich auf die konkrete Aufgabe beziehen.
- Leere Floskeln wie `Diese Maßnahme ist für das Thema sinnvoll.` sind unzulässig.
- Lernwert vor Formularsprache: Die lernende Person soll nach der Erklärung mehr verstehen als vorher.

## Qualitätsgates vor Import

- Keine sichtbaren Treffer auf `Ticket`, `V01`, `V02`, `V03`, Dateinamen oder Pfadteile.
- Keine sichtbaren Restformen wie `Ergaenzung`, `boersenweise`, `reprasentativen`, `Ausmass` oder vergleichbare ASCII-/Schreibfehler.
- Keine systematischen Promptfehler bei Artikeln oder Fällen.
- Stichprobe auf Wiederholungsmuster in Promptstarts und Badges.
