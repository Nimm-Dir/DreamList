<img width="400" alt="Screenshot 2026-04-21 005611" src="https://github.com/user-attachments/assets/a68c4154-7352-407a-a6b9-fb8224cb3a23" /> <img width="400" alt="Screenshot 2026-04-21 005656" src="https://github.com/user-attachments/assets/5d9561ed-9488-4980-802b-1951a380705f" />



# DreamList

Eine schlanke, lokale ToDo-App als Desktop-Anwendung (Electron + React + TypeScript + Vite) erstellt mir Cursor-AI.
Aufgaben und Listen werden ausschliesslich lokal in einer JSON-Datei gespeichert — keine Cloud, keine Anmeldung.

---

## Features

- **Mehrere Listen** in der Sidebar, per Drag & Drop sortierbar, Doppelklick zum Umbenennen.
- **Offene Aufgaben** und nach Datum erledigte Aufgaben.
- **Aufgaben per Drag & Drop** verschieben, auf einen Tag legen oder zurueck zu "offen".
- **Kalender-/Baumansicht** fuer geplante Aufgaben, gruppiert nach Jahr / Monat / Tag.
- **Eigene Farb-Templates** inkl. mitgelieferter Vorlagen *Dream Dark* und *Dream Light*. Bis zu fuenf eigene Themes anlegbar, Farben per Farbrad und Helligkeits-Slider.
- **Schriftgroessen** S / M / L direkt in der Titelleiste.
- **Always-on-Top**-Modus per Klick auf das Pin-Icon.
- **Auto-Bulletpoints**: Tippe `- ` am Zeilenanfang und es wird zu `• `.
- **Keyboard-first**: Enter sendet eine Aufgabe ab, Shift+Enter fuer Zeilenumbruch, Escape schliesst Dialoge.
- **Portable**: eine einzelne `.exe`, keine Installation noetig.

---

## Schnellstart (Endanwender)

1. `release/DreamList-1.0.0-portable.exe` herunterladen.
2. Datei starten — keine Installation, keine Admin-Rechte noetig.
3. Deine Daten liegen unter:
   ```
   %APPDATA%\DreamList\data.json
   ```
   Zum Zuruecksetzen einfach diese Datei loeschen.

---

## Tastenkuerzel

| Bereich              | Taste              | Aktion                                 |
| -------------------- | ------------------ | -------------------------------------- |
| Aufgaben-Eingabe     | `Enter`            | Aufgabe speichern                      |
| Aufgaben-Eingabe     | `Shift + Enter`    | Zeilenumbruch                          |
| Sidebar (Liste)      | Doppelklick        | Liste umbenennen                       |
| Sidebar (Liste)      | Ziehen             | Reihenfolge aendern                    |
| Modale Dialoge       | `Enter` / `Escape` | Bestaetigen / Abbrechen                |
| Sidebar              |                    | Per Pfeil ein- / ausklappen            |

---

## Versionshinweise

### 1.0.0

- Erste vollstaendige Version.
- Listen, Aufgaben, Drag & Drop.
- Eigene Farb-Templates.
- Portable Windows-EXE via `electron-builder`.
- Erstellt auf Windows 11 und auch nur da getestet

---

## Lizenz

Privatprojekt. Keine freie Lizenz vergeben.
