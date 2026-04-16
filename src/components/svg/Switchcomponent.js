class CustomSwitchElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._active = false;
    this._disabled = false;
    this._onClick = () => this.toggle();
  }

  static get observedAttributes() {
    return ['disabled', 'active'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled') {
      this._disabled = newValue != null && newValue !== 'false';
      this.update();
    }
    if (name === 'active') {
      this._active = newValue != null && newValue !== 'false';
      this.update();
    }
  }

  connectedCallback() {
    this.render();
  }
 
  disconnectedCallback() {
    const svg = this.shadowRoot && this.shadowRoot.querySelector('svg');
    if (svg) svg.removeEventListener('click', this._onClick);
  }

  toggle() {
    if (this._disabled) return;
    this._active = !this._active;
    this.update();
    this.dispatchEvent(new CustomEvent('change', { detail: { active: this._active } }));
  }

  set disabled(v) {
    this._disabled = !!v;
    if (this._disabled) this.setAttribute('disabled', ''); else this.removeAttribute('disabled');
    this.update();
  }
  get disabled() { return this._disabled; }

  set active(v) {
    this._active = !!v;
    if (this._active) this.setAttribute('active', ''); else this.removeAttribute('active');
    this.update();
  }
  get active() { return this._active; }

  static get styles() {
    return `
      :host { display: inline-block; cursor: pointer; user-select: none; }
      .switch-container { display: flex; align-items: center; }
      svg { transition: all 0.3s ease; }
      circle { transition: cx 0.2s ease, fill 0.2s ease; }
      :host([disabled]) { opacity: 0.6; pointer-events: none; }
    `;
  }

  update() {
    const bg = this.shadowRoot.querySelector('rect');
    const circle = this.shadowRoot.querySelector('circle');
    if (!bg || !circle) return;
    if (this._active) {
      bg.setAttribute('fill', '#088d4f');
      circle.setAttribute('cx', '38');
    } else {
      bg.setAttribute('fill', '#919191');
      circle.setAttribute('cx', '12');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${CustomSwitchElement.styles}</style>
      <div class="switch-container">
        <svg width="50" height="24" viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="24" rx="12" fill="#D1D1D1"/>
          <circle cx="12" cy="12" r="9" fill="white"/>
        </svg>
      </div>
    `;
    const svg = this.shadowRoot.querySelector('svg');
    svg.addEventListener('click', this._onClick);
    this.update();
  }
}

if (!customElements.get('custom-switch')) {
  customElements.define('custom-switch', CustomSwitchElement);
}

// React wrapper export: render the custom element and wire events
import React, { useRef, useEffect } from 'react';

function ReactSwitch({ disabled = false, value = false, onChange, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e) => onChange && onChange(Boolean(e.detail?.active));
    el.addEventListener('change', handler);
    // initial sync
    el.active = !!value;
    el.disabled = !!disabled;
    return () => el.removeEventListener('change', handler);
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.active !== !!value) el.active = !!value;
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.disabled = !!disabled;
  }, [disabled]);

  return React.createElement('custom-switch', { ref, className, style });
}

export default ReactSwitch;