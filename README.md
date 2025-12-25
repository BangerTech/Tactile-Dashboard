# Tactile Dashboard

🎛️ Ein modernes, taktiles Dashboard für Home Assistant mit futuristischen Custom Cards.

---

## Inhaltsverzeichnis

- [Was ist Tactile Dashboard?](#was-ist-tactile-dashboard)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
  - [Option 1: Installation über HACS](#option-1-installation-über-hacs)
  - [Option 2: Manuelle Installation](#option-2-manuelle-installation)
- [Custom Cards registrieren](#custom-cards-registrieren)
- [Verwendung](#verwendung)
- [Support / Feedback](#support--feedback)
- [Contributing](#contributing)
- [License](#license)

---

## Was ist Tactile Dashboard?

Tactile Dashboard ist eine Sammlung von Custom Cards für Home Assistant, die ein modernes, taktiles und interaktives Bedienungserlebnis bieten. Die Cards sind speziell für Touch-Geräte optimiert und bieten haptisches Feedback durch visuelle Animationen.

---

## Features

- 🎨 **Modernes Design**: Futuristisches, taktiles UI-Design
- 📱 **Touch-optimiert**: Perfekt für Tablets und Smartphones
- ⚡ **Interaktiv**: Direkte Bedienung durch Rotation und Gesten
- 🎯 **Einfach zu verwenden**: Einfache YAML-Konfiguration
- 🔧 **HACS-kompatibel**: Einfache Installation über HACS

---

## Requirements

- Home Assistant 2023.1 oder höher
- HACS (Home Assistant Community Store) - empfohlen
- Lovelace im YAML-Modus (für manuelle Konfiguration)

---

## Installation

### Option 1: Installation über HACS

1. Stelle sicher, dass [HACS](https://hacs.xyz) installiert ist
2. Gehe zu **HACS** → **Frontend**
3. Klicke auf **"Explorer öffnen"** (oben rechts)
4. Suche nach **"Tactile Dashboard"**
5. Klicke auf **"Installieren"**
6. Wähle die Version aus und klicke auf **"Installieren"**
7. Starte Home Assistant neu

Nach der Installation über HACS werden die Custom Cards automatisch unter `/hacsfiles/Tactile-Dashboard/` bereitgestellt.

### Option 2: Manuelle Installation

1. Dieses Repository herunterladen oder clonen
2. Den Inhalt des Ordners `www` in deinen Home Assistant Konfigurationsordner unter `/config/www/` kopieren
3. **Hinweis:** Starte Home Assistant neu, falls der `www`-Ordner neu erstellt oder neu hinzugefügt wurde

---

## Custom Cards registrieren

### Bei Installation über HACS

Die Ressourcen werden automatisch registriert. Du musst sie nur in deinem Dashboard verwenden.

### Bei manueller Installation

1. In Home Assistant zu **Einstellungen → Dashboards** navigieren
2. Auf **"Ressourcen"** (oben rechts) klicken
3. Auf **"Ressource hinzufügen"** klicken
4. Folgende Ressourcen hinzufügen:
   - **URL:** `/local/custom-components/tactile-thermostat.js`  
     **Typ:** `JavaScript-Modul`
5. Home Assistant neu starten, damit die Custom Cards geladen werden

---

## Verwendung

### Tactile Thermostat Card

Ein interaktiver Thermostat mit rotierbarem Bedienelement. Perfekt für die Steuerung von Klimageräten.

**Beispiel-Konfiguration:**

```yaml
type: custom:tactile-thermostat-card
entity: climate.wohnzimmer
```

**Erweiterte Konfiguration:**

```yaml
type: custom:tactile-thermostat-card
entity: climate.wohnzimmer
name: Wohnzimmer
```

**Verfügbare Parameter:**

- `entity` (erforderlich): Die Entity-ID des Climate-Geräts (z.B. `climate.wohnzimmer`)
- `name` (optional): Ein benutzerdefinierter Name für die Card

**Unterstützte Entities:**

- `climate.*` - Alle Home Assistant Climate-Entities

---

## Projektstruktur

```
Tactile-Dashboard/
├── www/                         # Statische Dateien für Home Assistant
│   └── custom-components/        # Kompilierte Custom Cards
│       └── tactile-thermostat.js # Tactile Thermostat Card
├── .github/                      # GitHub Workflows und Templates
│   └── workflows/                # CI/CD Workflows
├── hacs.json                     # HACS-Konfiguration
├── info.md                       # HACS Info-Datei
├── LICENSE                       # Lizenz
└── README.md                     # Diese Datei
```

---

## Support / Feedback

Bei Bugs, Fragen oder Feature Requests:

- **GitHub Issues:** Bitte das „Issues"-Tab dieses Repositories verwenden
- **GitHub Discussions:** Für allgemeine Fragen und Diskussionen

Feedback, Vorschläge und Screenshots deiner eigenen Setups sind jederzeit willkommen!

---

## Contributing

Beiträge sind ausdrücklich erwünscht:

1. Repository forken
2. Eigenen Branch erstellen (`feature/...` oder `fix/...`)
3. Änderungen vornehmen und testen
4. Pull Request eröffnen und kurz beschreiben, was geändert wurde

---

## License

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

---

## Keywords

`home-assistant`, `dashboard`, `tactile`, `lovelace`, `custom-cards`, `yaml`, `smart-home`, `ui-design`, `hacs`, `futuristic`, `touch`, `interactive`

