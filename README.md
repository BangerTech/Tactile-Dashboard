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
- 🎛️ **3 Custom Cards**: Thermostat, Button und Shutter-Steuerung
- 👁️ **Editor mit Vorschau**: Live-Vorschau beim Konfigurieren
- 🎨 **Anpassbar**: Farben, Icons und Namen konfigurierbar

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

Nach der Installation über HACS werden die Custom Cards automatisch unter `/hacsfiles/Tactile-Dashboard/custom-components/` bereitgestellt.

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
   - **URL:** `/local/custom-components/tactile-button.js`  
     **Typ:** `JavaScript-Modul`
   - **URL:** `/local/custom-components/tactile-shutter.js`  
     **Typ:** `JavaScript-Modul`
5. Home Assistant neu starten, damit die Custom Cards geladen werden

> **Hinweis:** Du musst nur die Karten hinzufügen, die du auch tatsächlich verwenden möchtest.

---

## Verwendung

### Tactile Thermostat Card

Ein interaktiver Thermostat mit rotierbarem Bedienelement. Perfekt für die Steuerung von Klimageräten.

![Tactile Thermostat Card](images/cards/tactile-thermostat.png)

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

### Tactile Button Card

Ein futuristischer Button mit Icon-Auswahl und Farbanpassung. Perfekt für Lichter, Schalter und andere binäre Entities.

![Tactile Button Card](images/cards/tactile-button.png)

**Beispiel-Konfiguration:**

```yaml
type: custom:tactile-button-card
entity: light.wohnzimmer
```

**Erweiterte Konfiguration:**

```yaml
type: custom:tactile-button-card
entity: light.wohnzimmer
name: Wohnzimmer Licht
icon: lightbulb
color: "#ffd700"
```

**Verfügbare Parameter:**

- `entity` (erforderlich): Die Entity-ID (z.B. `light.wohnzimmer`, `switch.example`)
- `name` (optional): Ein benutzerdefinierter Name für die Card
- `icon` (optional): Icon-Typ (`power`, `lightbulb`, `menu`) - Standard: `power`
- `color` (optional): Farbe als Hex-Code (z.B. `#fb923c`) - Standard: `#fb923c`

**Unterstützte Entities:**

- `light.*` - Alle Light-Entities
- `switch.*` - Alle Switch-Entities
- `fan.*` - Alle Fan-Entities
- Und alle anderen binären Entities

---

### Tactile Shutter Card

Eine taktile Steuerung für Jalousien, Rollläden und andere Cover-Entities mit Slider und Steuerungsbuttons.

![Tactile Shutter Card](images/cards/tactile-shutter.png)

**Beispiel-Konfiguration:**

```yaml
type: custom:tactile-shutter-card
entity: cover.wohnzimmer
```

**Erweiterte Konfiguration:**

```yaml
type: custom:tactile-shutter-card
entity: cover.wohnzimmer
name: Wohnzimmer Jalousie
color: "#fb923c"
```

**Verfügbare Parameter:**

- `entity` (erforderlich): Die Entity-ID des Cover-Geräts (z.B. `cover.wohnzimmer`)
- `name` (optional): Ein benutzerdefinierter Name für die Card
- `color` (optional): Farbe als Hex-Code (z.B. `#fb923c`) - Standard: `#fb923c`

**Unterstützte Entities:**

- `cover.*` - Alle Home Assistant Cover-Entities

**Funktionen:**

- **Slider**: Direkte Positionseinstellung durch Ziehen
- **Up-Button**: Öffnet vollständig (100%)
- **Stop-Button**: Stoppt die Bewegung
- **Down-Button**: Schließt vollständig (0%)

---

## Projektstruktur

```
Tactile-Dashboard/
├── www/                         # Statische Dateien für Home Assistant
│   └── custom-components/        # Kompilierte Custom Cards
│       ├── tactile-thermostat.js # Tactile Thermostat Card
│       ├── tactile-button.js     # Tactile Button Card
│       └── tactile-shutter.js    # Tactile Shutter Card
├── images/                       # Bilder für die Dokumentation
│   └── cards/                    # Screenshots der einzelnen Cards
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

