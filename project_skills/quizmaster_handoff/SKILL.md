---
name: quizmaster-handoff
description: Verwenden, wenn ein Quiz-Arbeitspaket in diesem Projekt abgeschlossen wird. Bevor irgendeine Abschlussmeldung an den Nutzer geht, immer zuerst den QuizMaster 019d2ae2-8525-7792-a341-161adc031e73 informieren, sein Feedback umsetzen, danach den direkten Folgeauftrag holen und ohne Leerlauf weiterarbeiten.
---

# QuizMaster Handoff

Nutze diesen Ablauf für jedes abgeschlossene Quiz-Arbeitspaket in diesem Projekt:

1. Arbeitspaket fachlich fertigstellen.
2. Relevante DB und Importskripte lokal prüfen.
3. Bevor eine Abschlussmeldung an den Nutzer rausgeht, den QuizMaster `019d2ae2-8525-7792-a341-161adc031e73` direkt informieren, dass das Paket fertig ist.
   Nutze dafuer `/Users/thor/JetBrains/WebstormProjects/easyPV/databases/entwicklung/project_tickets_v01/QuizMaster/scripts/notify_quizmaster_handoff.py`, damit ein gescheiterter Direktversand nicht still verloren geht.
4. Konkretes Feedback des QuizMasters vollständig umsetzen.
5. Falls nötig erneut beim QuizMaster nachfassen, bis der Stand `passt` oder kein blockierender Punkt mehr offen ist.
6. Erst danach den Nutzer über den Paketstand informieren.
7. Wenn die aktuelle DB noch unter `1000` Fragen liegt, direkt beim QuizMaster den nächsten konkreten `100`-Fragen-Auftrag für dieselbe DB holen.
8. Ohne Nutzer-Rückfrage sofort mit diesem Folgeauftrag weiterarbeiten.
9. Erst wenn die aktuelle DB `1000` Fragen erreicht, beim QuizMaster eine neue DB-Zuteilung holen und dann dort direkt weitermachen.

Pflichten:

- Kein Abschluss an den Nutzer ohne vorherige Meldung an den QuizMaster.
- QuizMaster-Feedback hat Vorrang vor kosmetischen Eigenideen.
- Die Meldung an den QuizMaster soll immer die betroffene DB, den neuen Zählstand und die wichtigsten Qualitätsprüfungen enthalten.
- Falls der direkte `codex exec resume`-Weg scheitert, bleibt die Meldung nachvollziehbar in `QuizMaster/output/quizmaster_handoffs.ndjson` und `QuizMaster/output/handoffs/` liegen.
- Projektziel mitdenken: Jede Quiz-Datenbank dieses Projekts soll am Ende `1000` Aufgaben enthalten.
- Wenn der QuizMaster Nachbesserungen verlangt, wird nicht diskutiert, sondern zuerst nachgebessert und danach erneut gemeldet.
- Zwischenmeldungen anderer Agenten ändern den eigenen Auftrag nicht. Die aktuell zugewiesene DB bleibt in Bearbeitung, bis sie `1000` Fragen erreicht oder der QuizMaster ausdrücklich umverteilt.
- Nach jedem erfolgreich abgeschlossenen Paket ist sofort der nächste Batch anzufordern. Stilles Warten gilt als Fehler.
