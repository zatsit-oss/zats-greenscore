# ADR-001: Desktop application with Tauri

## Status

**Accepted** - January 2025

## Context

The zats-greenscore application is initially a static web app generated with
Astro. To extend the project's reach and enable native offline usage, a desktop
version was considered.

### Options considered

1. **Electron** - Popular framework based on Chromium
2. **Tauri** - Lightweight framework based on the native WebView + Rust
3. **PWA** - Progressive Web App without a native application

## Decision

We chose **Tauri 2.x** to build the desktop application.

## Rationale

### Consistency with the project's philosophy

The application evaluates the eco-design of APIs. Using a lightweight, efficient
framework is consistent with our values:

| Criterion | Electron | Tauri |
|-----------|----------|-------|
| Bundle size | ~150 MB | ~3-10 MB |
| RAM usage | ~100-300 MB | ~30-50 MB |
| Carbon footprint | High | Low |

### Technical advantages

- **Lightweight**: uses the OS's native WebView
- **Performance**: Rust backend
- **Security**: sandboxing and granular permissions
- **Cross-platform**: macOS, Windows, Linux

### "Integrated Repo" pattern

The Tauri code lives in the same repository:

```
zats-greenscore/
├── src/           # Astro code (shared web/desktop)
├── src-tauri/     # Tauri-specific code
│   ├── src/       # Rust backend
│   ├── icons/     # Cross-platform icons
│   └── tauri.conf.json
└── package.json
```

**Advantages**:
- A single source of truth for the UI
- Unified web/desktop versioning
- Simplified CI/CD

## Consequences

### Positive

- Lightweight native application (~5 MB)
- Full offline operation
- No dependency on an external browser
- Distribution via DMG/EXE/DEB

### Negative

- Requires the Rust toolchain for development
- Learning curve for native features
- More complex end-to-end testing

### Neutral

- Storage stays in LocalStorage (via the WebView)
- No specific native feature for now

## Implementation

### npm scripts

```bash
npm run dev:desktop      # Dev with hot reload
npm run build:desktop    # Production build
npm run tauri            # Direct Tauri CLI
```

### Configuration

- `src-tauri/tauri.conf.json`: main configuration
- `src-tauri/capabilities/`: app permissions

## References

- [Tauri Documentation](https://tauri.app/)
- [Tauri vs Electron](https://tauri.app/v1/references/benchmarks/)
- [PR #32 - feat: add a desktop Tauri app](https://github.com/zatsit-oss/zats-greenscore/pull/32)
