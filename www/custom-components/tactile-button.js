class TactileButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { entity: "light.example", name: "Button", icon: "power", color: "#fb923c" }
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: { entity: {} }
        },
        {
          name: "name",
          selector: { text: {} }
        },
        {
          name: "icon",
          selector: {
            select: {
              options: [
                { value: "power", label: "Power" },
                { value: "lightbulb", label: "Lightbulb" },
                { value: "menu", label: "Menu" }
              ]
            }
          }
        },
        {
          name: "color",
          selector: { color_rgb: {} }
        }
      ]
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this.config = { ...config };
    // Normalize color
    if (this.config.color) {
      this.config.color = this._normalizeColor(this.config.color);
    } else {
      this.config.color = "#fb923c";
    }
    if (!this.config.icon) {
      this.config.icon = "power";
    }
  }

  _normalizeColor(color) {
    if (Array.isArray(color) && color.length >= 3) {
      const r = color[0].toString(16).padStart(2, '0');
      const g = color[1].toString(16).padStart(2, '0');
      const b = color[2].toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return color;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 2;
  }

  connectedCallback() {
    this.render();
  }

  handleClick() {
    if (this._hass && this.config.entity) {
      this._hass.callService('homeassistant', 'toggle', {
        entity_id: this.config.entity
      });
    }
  }

  _getIconPath(icon) {
    const icons = {
      power: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      lightbulb: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4",
      menu: "M4 5h16M4 12h16M4 19h16"
    };
    return icons[icon] || icons.power;
  }

  render() {
    const entity = this._hass?.states[this.config.entity];
    const isActive = entity?.state === "on";
    const label = (this.config.name || "Button").toUpperCase();
    const iconPath = this._getIconPath(this.config.icon);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .card-container {
          padding: 16px;
          display: flex;
          justify-content: center;
        }
        .button {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 24px;
          background: ${isActive ? this.config.color : 'rgba(30, 32, 36, 0.6)'};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${isActive ? this.config.color + '80' : 'rgba(255,255,255,0.05)'};
          box-shadow: ${isActive ? `0 0 20px ${this.config.color}40, ` : ''}0 10px 20px -5px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }
        .button:active {
          transform: scale(0.95);
        }
        .button:hover {
          transform: scale(1.02);
        }
        .icon {
          width: 48px;
          height: 48px;
          stroke: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          transition: all 0.3s ease;
        }
        .label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'};
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        .glow {
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          background: ${this.config.color};
          opacity: ${isActive ? 0.2 : 0};
          filter: blur(12px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }
      </style>
      <div class="card-container">
        <div class="button" id="button">
          <div class="glow"></div>
          <svg class="icon" viewBox="0 0 24 24">
            <path d="${iconPath}"/>
          </svg>
          <div class="label">${label}</div>
        </div>
      </div>
    `;

    const button = this.shadowRoot.querySelector('#button');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
    }
  }
}

// Define Editor
class TactileButtonCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    if (this.config.color) {
      this.config.color = this._normalizeColor(this.config.color);
    } else {
      this.config.color = "#fb923c";
    }
    if (this._hass) {
      if (!this.querySelector('ha-entity-picker')) {
        this.render();
      } else {
        this.updateValues();
      }
    }
  }

  _normalizeColor(color) {
    if (Array.isArray(color) && color.length >= 3) {
      const r = color[0].toString(16).padStart(2, '0');
      const g = color[1].toString(16).padStart(2, '0');
      const b = color[2].toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return color;
  }

  configChanged(newConfig) {
    const event = new CustomEvent("config-changed", {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: { config: newConfig }
    });
    this.dispatchEvent(event);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this.querySelector('ha-entity-picker')) {
      this.render();
    } else if (this._hass && this.querySelector('ha-entity-picker')) {
      const picker = this.querySelector('ha-entity-picker');
      if (picker) {
        picker.hass = this._hass;
      }
    }
  }

  connectedCallback() {
    if (!this._config) {
      this._config = {};
    }
    if (this._hass && !this.querySelector('ha-entity-picker')) {
      this.render();
    }
  }

  updateValues() {
    const picker = this.querySelector('ha-entity-picker');
    if (picker && picker.value !== (this._config?.entity || '')) {
      picker.value = this._config?.entity || '';
    }

    const nameField = this.querySelector('ha-textfield[label="Name (Optional)"]');
    if (nameField && nameField.value !== (this._config?.name || '')) {
      nameField.value = this._config?.name || '';
    }

    const iconField = this.querySelector('ha-select[label="Icon"]');
    if (iconField && iconField.value !== (this._config?.icon || 'power')) {
      iconField.value = this._config?.icon || 'power';
    }

    const colorField = this.querySelector('ha-textfield[label="Color (Hex, e.g. #fb923c)"]');
    const colorPicker = this.querySelector('input[type="color"]');
    if (colorField && colorPicker) {
      const currentColor = this._config?.color || '#fb923c';
      if (colorField.value !== currentColor) {
        colorField.value = currentColor;
      }
      if (colorPicker.value !== currentColor) {
        colorPicker.value = currentColor;
      }
    }
  }

  render() {
    if (!this._hass) {
      return;
    }

    const entity = this._hass.states[this._config?.entity];
    const isActive = entity?.state === "on";
    const label = (this._config?.name || "Button").toUpperCase();
    const iconPath = this._getIconPath(this._config?.icon || "power");
    const color = this._config?.color || "#fb923c";

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
        <div style="margin-bottom: 8px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 12px; color: var(--primary-text-color);">Preview:</div>
          <div style="display: flex; justify-content: center;">
            <div style="position: relative; width: 200px; height: 200px; border-radius: 24px; background: ${isActive ? color : 'rgba(30, 32, 36, 0.6)'}; border: 1px solid ${isActive ? color + '80' : 'rgba(255,255,255,0.05)'}; box-shadow: ${isActive ? `0 0 20px ${color}40, ` : ''}0 10px 20px -5px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
              <div style="position: absolute; inset: -2px; border-radius: 24px; background: ${color}; opacity: ${isActive ? 0.2 : 0}; filter: blur(12px);"></div>
              <svg style="width: 48px; height: 48px; stroke: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}; stroke-width: 2; fill: none;" viewBox="0 0 24 24">
                <path d="${iconPath}"/>
              </svg>
              <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}; text-transform: uppercase;">${label}</div>
            </div>
          </div>
        </div>
        <ha-entity-picker
          label="Entity"
          allow-custom-entity
          style="display: block; width: 100%;"
        ></ha-entity-picker>
        <ha-textfield
          label="Name (Optional)"
          style="display: block; width: 100%;"
        ></ha-textfield>
        <ha-select
          label="Icon"
          style="display: block; width: 100%;"
        ></ha-select>
        <div style="display: flex; align-items: center; gap: 12px;">
          <ha-textfield
            label="Color (Hex, e.g. #fb923c)"
            style="flex: 1; display: block;"
          ></ha-textfield>
          <input
            type="color"
            style="width: 60px; height: 56px; border-radius: 4px; border: 1px solid var(--divider-color); cursor: pointer; flex-shrink: 0;"
          />
        </div>
      </div>
    `;

    setTimeout(() => {
      const picker = this.querySelector('ha-entity-picker');
      if (picker) {
        picker.hass = this._hass;
        picker.value = this._config?.entity || '';
        picker.style.display = 'block';
        picker.style.width = '100%';
        
        if (this._pickerHandler) {
          picker.removeEventListener('value-changed', this._pickerHandler);
        }
        this._pickerHandler = (e) => {
          const newConfig = { ...this._config, entity: e.detail.value };
          this._config = newConfig;
          this.configChanged(newConfig);
        };
        picker.addEventListener('value-changed', this._pickerHandler);
      }

      const nameField = this.querySelector('ha-textfield[label="Name (Optional)"]');
      if (nameField) {
        nameField.value = this._config?.name || '';
        if (this._nameFieldHandler) {
          nameField.removeEventListener('input', this._nameFieldHandler);
        }
        this._nameFieldHandler = (e) => {
          const newConfig = { ...this._config, name: e.target.value };
          this._config = newConfig;
          this.configChanged(newConfig);
        };
        nameField.addEventListener('input', this._nameFieldHandler);
      }

      const iconField = this.querySelector('ha-select');
      if (iconField) {
        iconField.items = [
          { value: "power", label: "Power" },
          { value: "lightbulb", label: "Lightbulb" },
          { value: "menu", label: "Menu" }
        ];
        iconField.value = this._config?.icon || 'power';
        if (this._iconFieldHandler) {
          iconField.removeEventListener('value-changed', this._iconFieldHandler);
        }
        this._iconFieldHandler = (e) => {
          const newConfig = { ...this._config, icon: e.detail.value };
          this._config = newConfig;
          this.configChanged(newConfig);
        };
        iconField.addEventListener('value-changed', this._iconFieldHandler);
      }

      const colorField = this.querySelector('ha-textfield[label="Color (Hex, e.g. #fb923c)"]');
      const colorPicker = this.querySelector('input[type="color"]');
      if (colorField && colorPicker) {
        const currentColor = this._config?.color || '#fb923c';
        colorField.value = currentColor;
        colorPicker.value = currentColor;
        
        if (this._colorFieldHandler) {
          colorField.removeEventListener('input', this._colorFieldHandler);
        }
        this._colorFieldHandler = (e) => {
          const newColor = e.target.value;
          colorPicker.value = newColor;
          const newConfig = { ...this._config, color: newColor };
          this._config = newConfig;
          this.configChanged(newConfig);
        };
        colorField.addEventListener('input', this._colorFieldHandler);
        
        if (this._colorPickerHandler) {
          colorPicker.removeEventListener('input', this._colorPickerHandler);
        }
        this._colorPickerHandler = (e) => {
          const newColor = e.target.value;
          colorField.value = newColor;
          const newConfig = { ...this._config, color: newColor };
          this._config = newConfig;
          this.configChanged(newConfig);
        };
        colorPicker.addEventListener('input', this._colorPickerHandler);
      }
    }, 0);
  }

  _getIconPath(icon) {
    const icons = {
      power: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      lightbulb: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4",
      menu: "M4 5h16M4 12h16M4 19h16"
    };
    return icons[icon] || icons.power;
  }
}

// Register Editor first
customElements.define("tactile-button-editor", TactileButtonCardEditor);

// Then register the card
customElements.define('tactile-button-card', TactileButtonCard);

// Register with customCards
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tactile-button-card",
  name: "Tactile Button",
  preview: true,
  description: "A futuristic tactile button"
});
