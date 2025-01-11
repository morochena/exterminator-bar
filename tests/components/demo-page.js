class DemoPage extends HTMLElement {
  static get observedAttributes() {
    return ['theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this.updateTheme();
    }
  }

  updateTheme() {
    const isDark = this.getAttribute('theme') === 'dark';
    const root = this.shadowRoot.host;
    
    if (isDark) {
      root.style.backgroundColor = '#1a1a1a';
      root.style.color = '#e0e0e0';
    } else {
      root.style.backgroundColor = '';
      root.style.color = '';
    }
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        :host([theme="dark"]) {
          background: #1a1a1a;
          color: #e0e0e0;
        }

        .card {
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: var(--card-bg, #fff);
        }

        :host([theme="dark"]) .card {
          --border-color: #333;
          --card-bg: #242424;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .button {
          background: var(--button-bg, #007bff);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        :host([theme="dark"]) .button {
          --button-bg: #0066cc;
        }

        .button:hover {
          background: var(--button-hover-bg, #0056b3);
        }

        :host([theme="dark"]) .button:hover {
          --button-hover-bg: #0052a3;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--input-border, #ddd);
          border-radius: 4px;
          background: var(--input-bg, #fff);
          color: var(--input-color, inherit);
        }

        :host([theme="dark"]) .form-group input,
        :host([theme="dark"]) .form-group textarea {
          --input-border: #444;
          --input-bg: #333;
          --input-color: #e0e0e0;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--focus-color, #007bff);
        }

        :host([theme="dark"]) .form-group input:focus,
        :host([theme="dark"]) .form-group textarea:focus {
          --focus-color: #0066cc;
        }

        .alert {
          background: var(--alert-bg, #f8d7da);
          color: var(--alert-color, #721c24);
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        :host([theme="dark"]) .alert {
          --alert-bg: #442326;
          --alert-color: #ffb3b8;
        }
      </style>

      <h1>Exterminator Bar Demo Page</h1>

      <div class="card">
        <h2>Sample Form</h2>
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" placeholder="Enter your name">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" rows="4" placeholder="Enter your message"></textarea>
        </div>
        <button class="button" id="submit-btn">Submit</button>
      </div>

      <div class="card">
        <h2>Interactive Elements</h2>
        <p>Click the buttons below to test different states:</p>
        <button class="button" id="toggle-btn">Toggle Alert</button>
        <button class="button" id="add-btn" style="background: var(--feature-bg, #28a745)">Add Element</button>
        <div id="dynamic-content"></div>
      </div>

      <div id="alert-container"></div>
    `;

    this.setupEventListeners();
    this.updateTheme();
  }

  setupEventListeners() {
    const submitBtn = this.shadowRoot.getElementById('submit-btn');
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    const addBtn = this.shadowRoot.getElementById('add-btn');

    submitBtn.addEventListener('click', () => this.showAlert());
    toggleBtn.addEventListener('click', () => this.toggleAlert());
    addBtn.addEventListener('click', () => this.addElement());
  }

  showAlert() {
    const alertContainer = this.shadowRoot.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = 'Form submitted successfully!';
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  toggleAlert() {
    const container = this.shadowRoot.getElementById('dynamic-content');
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = 'This is a toggleable alert!';
    container.innerHTML = '';
    container.appendChild(alert);
  }

  addElement() {
    const container = this.shadowRoot.getElementById('dynamic-content');
    const element = document.createElement('p');
    element.textContent = 'New element added at: ' + new Date().toLocaleTimeString();
    container.appendChild(element);
  }
}

customElements.define('demo-page', DemoPage); 