class TactileShutterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._position = 0;
  }

  static getStubConfig() {
    return { entity: "cover.example", name: "Shutter", color: "#fb923c" }
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: { entity: { domain: "cover" } }
        },
        {
          name: "name",
          selector: { text: {} }
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
    const entity = hass.states[this.config.entity];
    if (entity) {
      const newPosition = entity.attributes?.current_position ?? (entity.state === "open" ? 100 : 0);
      if (this._position !== newPosition) {
        this._position = newPosition;
        this.render();
      }
    } else {
      this.render();
    }
  }

  getCardSize() {
    return 3;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  setupListeners() {
    const slider = this.shadowRoot.querySelector('#position-slider');
    const upBtn = this.shadowRoot.querySelector('#btn-up');
    const downBtn = this.shadowRoot.querySelector('#btn-down');
    const stopBtn = this.shadowRoot.querySelector('#btn-stop');

    if (slider) {
      slider.addEventListener('input', this.handleSliderChange.bind(this));
      slider.addEventListener('change', this.handleSliderChange.bind(this));
    }
    if (upBtn) {
      upBtn.addEventListener('click', () => this.setCoverPosition(100));
    }
    if (downBtn) {
      downBtn.addEventListener('click', () => this.setCoverPosition(0));
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopCover());
    }
  }

  handleSliderChange(e) {
    const position = parseInt(e.target.value);
    this._position = position;
    this.updateDisplay();
    this.setCoverPosition(position);
  }

  updateDisplay() {
    const percentText = this.shadowRoot.querySelector('#percent-text');
    const fillBar = this.shadowRoot.querySelector('#fill-bar');
    if (percentText) {
      percentText.textContent = `${this._position}% OPEN`;
    }
    if (fillBar) {
      fillBar.style.width = `${this._position}%`;
    }
  }

  setCoverPosition(position) {
    if (this._hass && this.config.entity) {
      this._hass.callService('cover', 'set_cover_position', {
        entity_id: this.config.entity,
        position: position
      });
    }
  }

  stopCover() {
    if (this._hass && this.config.entity) {
      this._hass.callService('cover', 'stop_cover', {
        entity_id: this.config.entity
      });
    }
  }

  render() {
    const entity = this._hass?.states[this.config.entity];
    const position = entity?.attributes?.current_position ?? (entity?.state === "open" ? 100 : 0);
    this._position = position;
    const label = (this.config.name || entity?.attributes?.friendly_name || "Shutter").toUpperCase();

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
        .card {
          width: 100%;
          max-width: 400px;
          padding: 24px;
          border-radius: 32px;
          background: rgba(20, 20, 20, 0.9);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .title {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .percent {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: ${this.config.color};
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .slider-container {
          position: relative;
          height: 16px;
          width: 100%;
          border-radius: 9999px;
          background: #0a0a0c;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .fill-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 9999px;
          background: ${this.config.color};
          box-shadow: 0 0 10px ${this.config.color};
          transition: width 0.1s ease-out;
          width: ${position}%;
        }
        .slider {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }
        .controls {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .control-btn {
          height: 64px;
          border-radius: 12px;
          background: rgba(30, 30, 30, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .control-btn:active {
          transform: scale(0.95);
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.8);
        }
        .control-btn:hover {
          background: rgba(40, 40, 40, 0.9);
        }
        .icon {
          width: 24px;
          height: 24px;
          stroke: rgba(255, 255, 255, 0.7);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }
      </style>
      <div class="card-container">
        <div class="card">
          <div class="header">
            <div>
              <div class="title">${label}</div>
              <div class="percent" id="percent-text">${position}% OPEN</div>
            </div>
          </div>
          <div class="slider-container">
            <div class="fill-bar" id="fill-bar"></div>
            <input
              type="range"
              id="position-slider"
              class="slider"
              min="0"
              max="100"
              value="${position}"
            />
          </div>
          <div class="controls">
            <div class="control-btn" id="btn-up">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </div>
            <div class="control-btn" id="btn-stop">
              <svg class="icon" viewBox="0 0 24 24">
                <rect x="14" y="3" width="5" height="18" rx="1"/>
                <rect x="5" y="3" width="5" height="18" rx="1"/>
              </svg>
            </div>
            <div class="control-btn" id="btn-down">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupListeners();
  }
}

// Define Editor
class TactileShutterCardEditor extends HTMLElement {
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
    const position = entity?.attributes?.current_position ?? (entity?.state === "open" ? 100 : 0);
    const label = (this._config?.name || entity?.attributes?.friendly_name || "Shutter").toUpperCase();
    const color = this._config?.color || "#fb923c";

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
        <div style="margin-bottom: 8px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 12px; color: var(--primary-text-color);">Preview:</div>
          <div style="display: flex; justify-content: center;">
            <div style="width: 100%; max-width: 400px; padding: 24px; border-radius: 32px; background: rgba(20, 20, 20, 0.9); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; gap: 24px;">
              <div>
                <div style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase;">${label}</div>
                <div style="font-family: 'Courier New', monospace; font-size: 10px; color: ${color}; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">${position}% OPEN</div>
              </div>
              <div style="position: relative; height: 16px; width: 100%; border-radius: 9999px; background: #0a0a0c; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8); overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; height: 100%; border-radius: 9999px; background: ${color}; box-shadow: 0 0 10px ${color}; width: ${position}%;"></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div style="height: 64px; border-radius: 12px; background: rgba(30, 30, 30, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 24px; height: 24px; stroke: rgba(255, 255, 255, 0.7); stroke-width: 2; fill: none;" viewBox="0 0 24 24">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </div>
                <div style="height: 64px; border-radius: 12px; background: rgba(30, 30, 30, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 24px; height: 24px; stroke: rgba(255, 255, 255, 0.7); stroke-width: 2; fill: none;" viewBox="0 0 24 24">
                    <rect x="14" y="3" width="5" height="18" rx="1"/>
                    <rect x="5" y="3" width="5" height="18" rx="1"/>
                  </svg>
                </div>
                <div style="height: 64px; border-radius: 12px; background: rgba(30, 30, 30, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 24px; height: 24px; stroke: rgba(255, 255, 255, 0.7); stroke-width: 2; fill: none;" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ha-entity-picker
          label="Entity (Cover)"
          allow-custom-entity
          style="display: block; width: 100%;"
        ></ha-entity-picker>
        <ha-textfield
          label="Name (Optional)"
          style="display: block; width: 100%;"
        ></ha-textfield>
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
        picker.includeDomains = ['cover'];
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
}

// Register Editor first
customElements.define("tactile-shutter-editor", TactileShutterCardEditor);

// Then register the card
customElements.define('tactile-shutter-card', TactileShutterCard);

// Register with customCards
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tactile-shutter-card",
  name: "Tactile Shutter",
  preview: true,
  description: "A futuristic tactile shutter control"
});

