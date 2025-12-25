class TactileThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._dragging = false;
    this._targetTemp = 22;
    this._minTemp = 16;
    this._maxTemp = 32;
    this._lastInteraction = 0;
  }

  static getStubConfig() {
    return { entity: "climate.example" }
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: { entity: { domain: "climate" } }
        }
      ]
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this.config = { ...config };
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];
    if (!entity) return;

    this._entity = entity;
    const newTarget = entity.attributes.temperature || 22;

    // Only update target temp if we are not dragging AND we haven't interacted recently (2s debounce)
    const now = Date.now();
    const isInteracting = this._dragging || (now - this._lastInteraction < 2000);

    if (!isInteracting && this._targetTemp !== newTarget) {
      this._targetTemp = newTarget;
      this.render();
    }
  }

  getCardSize() {
    return 4;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  setupListeners() {
    const knob = this.shadowRoot.querySelector('#knob-container');
    if (!knob) return;

    knob.addEventListener('mousedown', this.startDrag.bind(this));
    knob.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
    
    document.addEventListener('mousemove', this.onDrag.bind(this));
    document.addEventListener('mouseup', this.stopDrag.bind(this));
    
    document.addEventListener('touchmove', this.onDrag.bind(this), { passive: false });
    document.addEventListener('touchend', this.stopDrag.bind(this));
  }

  startDrag(e) {
    this._dragging = true;
    this.onDrag(e);
  }

  stopDrag() {
    if (!this._dragging) return;
    this._dragging = false;
    this._lastInteraction = Date.now();
    
    // Send new temp to HA
    if (this._hass && this.config.entity) {
      this._hass.callService('climate', 'set_temperature', {
        entity_id: this.config.entity,
        temperature: this._targetTemp
      });
    }
  }

  onDrag(e) {
    if (!this._dragging) return;
    e.preventDefault();

    const knob = this.shadowRoot.querySelector('#knob-container');
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calculate angle (standard math)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Map to our system: Top (-90) -> 0
    let effectiveAngle = angle + 90;
    if (effectiveAngle > 180) effectiveAngle -= 360;

    // Clamp between -135 and 135
    effectiveAngle = Math.max(-135, Math.min(135, effectiveAngle));

    // Update temp
    const percentage = (effectiveAngle - (-135)) / (135 - (-135));
    const newTemp = this._minTemp + (percentage * (this._maxTemp - this._minTemp));
    this._targetTemp = Math.round(newTemp * 2) / 2;

    this.updateKnobVisuals(effectiveAngle);
  }

  updateKnobVisuals(rotation) {
    const handle = this.shadowRoot.querySelector('#knob-handle');
    const tempText = this.shadowRoot.querySelector('#temp-text');
    const tempVal = this.shadowRoot.querySelector('.temp-val');
    const scaleMarks = this.shadowRoot.querySelectorAll('.scale-mark');
    
    if(handle) handle.style.transform = `rotate(${rotation}deg)`;
    if(tempText) {
        tempText.style.transform = `rotate(${-rotation}deg)`;
    }
    if(tempVal) {
        tempVal.innerText = this._targetTemp.toFixed(1);
    }

    // Update scale marks
    scaleMarks.forEach((mark, index) => {
      const angle = index / 32 * 270 - 135;
      const isActive = angle <= rotation;
      if (isActive) {
        mark.classList.add('active');
      } else {
        mark.classList.remove('active');
      }
    });
  }

  render() {
    const percentage = Math.min(Math.max((this._targetTemp - this._minTemp) / (this._maxTemp - this._minTemp), 0), 1);
    const rotation = -135 + (percentage * 270);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .card-container {
          display: flex;
          justify-content: center;
          padding: 16px;
        }
        .knob-wrapper {
          position: relative;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(20, 20, 20, 0.9);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(0, 0, 0, 0.5);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: none;
        }
        .scale-ring {
          position: absolute;
          inset: 16px;
          border-radius: 50%;
          background: rgba(30, 30, 30, 0.95);
          box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.8), inset 0 -2px 4px rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .scale-mark {
          position: absolute;
          width: 2px;
          height: 10px;
          top: 1px;
          left: 50%;
          transform-origin: 50% 144px;
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
          border-radius: 1px;
          transition: all 0.3s;
        }
        .scale-mark.active {
          background: #fb923c;
          box-shadow: 0 0 6px rgba(251, 146, 60, 1);
          z-index: 10;
        }
        .knob-container {
          position: relative;
          width: 224px;
          height: 224px;
          border-radius: 50%;
          background: rgba(30, 30, 30, 0.95);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          overflow: hidden;
        }
        .knob-container:active {
          cursor: grabbing;
          transform: scale(0.98);
          transition: transform 0.1s;
        }
        .knob-gradient {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), transparent);
          pointer-events: none;
        }
        .knob-handle {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          transition: transform 0.3s ease-out;
        }
        .knob-indicator {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fb923c;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(251, 146, 60, 1);
          border: 1px solid rgba(0, 0, 0, 0.2);
          z-index: 1;
        }
        .knob-handle.dragging .knob-handle {
          transition: none;
        }
        .temp-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none;
        }
        .temp-label {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #6b7280;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .temp-val {
          font-family: 'Courier New', monospace;
          font-size: 60px;
          font-weight: bold;
          color: #e5e7eb;
          line-height: 1;
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          font-variant-numeric: tabular-nums;
        }
      </style>
      <div class="card-container">
        <div class="knob-wrapper">
          <div class="scale-ring" id="scale-ring">
            ${Array.from({ length: 33 }).map((_, index) => {
              const angle = index / 32 * 270 - 135;
              const isActive = angle <= rotation;
              return `<div class="scale-mark ${isActive ? 'active' : ''}" style="transform: translateX(-50%) rotate(${angle}deg)"></div>`;
            }).join('')}
          </div>
          <div class="knob-container" id="knob-container">
            <div class="knob-gradient"></div>
            <div class="knob-handle" id="knob-handle" style="transform: rotate(${rotation}deg)">
              <div class="knob-indicator"></div>
              <div class="temp-display" id="temp-text" style="transform: rotate(${-rotation}deg)">
                <span class="temp-label">SETPOINT</span>
                <span class="temp-val">${this._targetTemp.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Re-attach listeners after render because innerHTML wiped them
    this.setupListeners();
  }
}

// Define Editor
class TactileThermostatCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    if (this._hass) {
      if (!this.querySelector('ha-entity-picker')) {
        this.render();
      } else {
        this.updateValues();
      }
    }
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
  }

  render() {
    if (!this._hass) {
      return;
    }

    const entity = this._hass.states[this._config?.entity];
    const temperature = entity ? parseFloat(entity.attributes.temperature || entity.state) : 22;
    const percentage = Math.min(Math.max((temperature - 16) / (32 - 16), 0), 1);
    const rotation = -135 + (percentage * 270);

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
        <div style="margin-bottom: 8px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 12px; color: var(--primary-text-color);">Preview:</div>
          <div style="display: flex; justify-content: center;">
            <div style="position: relative; width: 320px; height: 320px; border-radius: 50%; background: rgba(20, 20, 20, 0.9); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); padding: 8px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: 16px; border-radius: 50%; background: rgba(30, 30, 30, 0.95); display: flex; align-items: center; justify-content: center;">
                ${Array.from({ length: 33 }).map((_, index) => {
                  const angle = index / 32 * 270 - 135;
                  const isActive = angle <= rotation;
                  return `<div style="position: absolute; width: 2px; height: 10px; top: 1px; left: 50%; transform-origin: 50% 144px; transform: translateX(-50%) rotate(${angle}deg); background: ${isActive ? '#fb923c' : 'rgba(0, 0, 0, 0.8)'}; box-shadow: ${isActive ? '0 0 6px rgba(251, 146, 60, 1)' : '0 1px 0 rgba(255,255,255,0.08)'}; border-radius: 1px;"></div>`;
                }).join('')}
              </div>
              <div style="position: relative; width: 224px; height: 224px; border-radius: 50%; background: rgba(30, 30, 30, 0.95); display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: 0; border-radius: 50%; transform: rotate(${rotation}deg);">
                  <div style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; border-radius: 50%; background: #fb923c; box-shadow: 0 0 8px rgba(251, 146, 60, 1);"></div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(${-rotation}deg);">
                  <span style="font-family: 'Courier New', monospace; font-size: 10px; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">SETPOINT</span>
                  <span style="font-family: 'Courier New', monospace; font-size: 60px; font-weight: bold; color: #e5e7eb; line-height: 1; text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);">${temperature.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ha-entity-picker
          label="Entity (Climate)"
          allow-custom-entity
          style="display: block; width: 100%;"
        ></ha-entity-picker>
      </div>
    `;

    setTimeout(() => {
      const picker = this.querySelector('ha-entity-picker');
      if (picker) {
        picker.hass = this._hass;
        picker.includeDomains = ['climate'];
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
    }, 0);
  }
}

// Register Editor first
customElements.define("tactile-thermostat-editor", TactileThermostatCardEditor);

// Then register the card
customElements.define('tactile-thermostat-card', TactileThermostatCard);

// Register with customCards
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tactile-thermostat-card",
  name: "Tactile Thermostat",
  preview: true,
  description: "A futuristic tactile thermostat knob"
});
