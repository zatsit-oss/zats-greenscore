---
name: build-desktop
description: Build the Tauri desktop application for production
---

Build the desktop application using Tauri.

```bash
npm run build:desktop
```

This will:
1. Build the Astro frontend
2. Compile the Rust backend
3. Package the native app for the current platform

The output will be in `src-tauri/target/release/bundle/`.

## Platform-specific outputs
- **macOS**: `.dmg` and `.app`
- **Windows**: `.msi` and `.exe`
- **Linux**: `.deb`, `.AppImage`, `.rpm`
