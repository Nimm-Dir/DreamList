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

## Entwicklung

### Voraussetzungen

- Node.js 20 oder neuer
- npm

### Setup

```bash
npm install
```

### Dev-Modus starten

```bash
npm run dev
```

Startet Vite + Electron mit Hot-Module-Reload.

### Build / Packaging

| Befehl              | Ergebnis                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run build`     | TypeScript-Check + Vite-Produktions-Build nach `dist/` und `dist-electron/` |
| `npm run pack`      | Unpacked-App unter `release/win-unpacked/` (zum Testen)                  |
| `npm run dist`      | Vollstaendiger Electron-Builder-Lauf gemaess `build`-Sektion in `package.json` |
| `npm run dist:win`  | Portable Windows-EXE unter `release/DreamList-<version>-portable.exe`    |

---

## Projektstruktur

```
DreamList/
├── electron/              Electron-Hauptprozess, Preload, Storage (IPC)
│   ├── main.ts
│   ├── preload.ts
│   └── storage.ts
├── src/
│   ├── components/        React-Komponenten (Sidebar, TaskInput, ScheduledTree, ThemeModal, ConfirmDialog, …)
│   ├── store/useStore.ts  Zustand-Store: Projekte, Aufgaben, Settings, Themes, Hydration, Persistenz
│   ├── theme/             Theme-Presets und CSS-Variablen-Applikation
│   ├── styles/globals.css Basis-Styles und CSS-Variablen
│   ├── types.ts           Gemeinsame Typen
│   └── App.tsx            Root-Layout mit DnD-Context und Split-Pane
├── Logo.ico / Logo.png    App-Icon
├── package.json           Scripts + Electron-Builder-Konfiguration
└── vite.config.ts         Vite-Konfiguration mit Electron-Plugins
```

---

## Datenhaltung

- Alles laeuft lokal. Die App schreibt ueber IPC (`dreamlist.save`) in eine einzelne JSON-Datei im User-Data-Verzeichnis.
- Schreibvorgaenge sind leicht throttled (150 ms), damit schnelle Aenderungen nicht zu vielen Disk-Writes fuehren.
- Beim Start wird das File geladen; fehlt es, wird eine Standardliste `Allgemein` erzeugt.

---

## Tastenkuerzel

| Bereich              | Taste              | Aktion                                 |
| -------------------- | ------------------ | -------------------------------------- |
| Aufgaben-Eingabe     | `Enter`            | Aufgabe speichern                      |
| Aufgaben-Eingabe     | `Shift + Enter`    | Zeilenumbruch                          |
| Sidebar (Liste)      | Doppelklick        | Liste umbenennen                       |
| Sidebar (Liste)      | Ziehen             | Reihenfolge aendern                    |
| Modale Dialoge       | `Enter` / `Escape` | Bestaetigen / Abbrechen                |

---

## Versionshinweise

### 1.0.0

- Erste vollstaendige Version.
- Listen, Aufgaben, Drag & Drop.
- Eigene Farb-Templates.
- In-App-Bestaetigungsdialog statt nativem `confirm()` (behebt Fokus-Probleme in Electron).
- Portable Windows-EXE via `electron-builder`.

---

## Lizenz

Privatprojekt. Keine freie Lizenz vergeben.
