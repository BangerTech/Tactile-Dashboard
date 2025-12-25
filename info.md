# Tactile Dashboard

Ein modernes, taktiles Dashboard für Home Assistant mit futuristischen Custom Cards.

## Features

- **Tactile Thermostat Card**: Ein interaktiver, drehbarer Thermostat mit haptischem Feedback
- Modernes, futuristisches Design
- Touch-optimiert für mobile Geräte
- Einfache Integration über HACS

## Installation

1. Installiere über HACS als "Lovelace"-Integration
2. Füge die Custom Cards in Home Assistant unter **Einstellungen → Dashboards → Ressourcen** hinzu
3. Starte Home Assistant neu

## Verfügbare Cards

- `tactile-thermostat-card` - Interaktiver Thermostat mit rotierbarem Bedienelement

## Verwendung

Füge die Cards in deiner Lovelace-Konfiguration hinzu:

```yaml
type: custom:tactile-thermostat-card
entity: climate.wohnzimmer
```

## Support

Bei Fragen oder Problemen öffne bitte ein Issue auf GitHub.

