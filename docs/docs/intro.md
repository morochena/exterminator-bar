---
sidebar_position: 1
---

# Introduction

Exterminator Bar is a lightweight, customizable widget for manual QA and bug reporting in web applications. It allows you to capture screenshots, record screen sessions, add annotations, and generate detailed bug reports without leaving the page.

## Features

- 📸 Screenshot capture with annotation tools (highlight, arrow, text)
- 🎥 Screen recording
- 📝 Customizable bug report forms
- 🔄 Multiple integration options (GitHub, Linear, Asana, Custom Webhook)
- 🎨 Simple, unobtrusive UI
- ⌨️ Error handling and callbacks

## Quick Start

```bash
# Install via your package manager
npm install exterminator-bar
# or yarn add exterminator-bar
# or pnpm add exterminator-bar
```

```typescript
import { init } from 'exterminator-bar';

// Initialize with basic configuration
init({
  callbacks: {
    onSubmit: async (report) => {
      console.log('Bug report submitted:', report);
    }
  }
});
```

## Browser Compatibility

Exterminator Bar uses modern browser APIs for screen capture and recording. Here are the minimum browser versions required:

- Chrome: 72+
- Firefox: 66+
- Edge: 79+ (Chromium-based)
- Safari: 13+
- Opera: 60+

The core functionality requires `navigator.mediaDevices.getDisplayMedia` API support.
