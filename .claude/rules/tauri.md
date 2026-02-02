# Tauri Development Rules

Guidelines specific to the desktop application built with Tauri.

## Project Structure

```
src-tauri/
├── src/
│   ├── lib.rs          # Main library with Tauri commands
│   └── main.rs         # Entry point (minimal)
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
├── capabilities/       # Permission definitions
├── icons/              # App icons for all platforms
└── gen/                # Generated files (don't edit)
```

## Rust Code Conventions

### Naming
- Functions: `snake_case`
- Types/Structs: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Modules: `snake_case`

### Tauri Commands
```rust
#[tauri::command]
fn my_command(param: String) -> Result<String, String> {
    // Implementation
    Ok("result".to_string())
}
```

### Error Handling
- Use `Result<T, E>` for fallible operations
- Return meaningful error messages to frontend
- Log errors with `log` crate

### Example Pattern
```rust
use log::{info, error};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct MyData {
    field: String,
}

#[tauri::command]
fn process_data(data: MyData) -> Result<MyData, String> {
    info!("Processing data: {:?}", data.field);

    // Process...

    Ok(data)
}
```

## Configuration

### tauri.conf.json
- `productName`: App display name
- `identifier`: Unique app identifier (reverse domain)
- `build.devUrl`: Dev server URL (http://localhost:4321)
- `build.frontendDist`: Production build path (../dist)

### Capabilities
- Define minimal permissions in `capabilities/`
- Only request what's needed
- Document why each permission is required

## Development Workflow

### Commands
```bash
# Start dev server with hot reload
npm run dev:desktop

# Build production app
npm run build:desktop

# Run Tauri CLI directly
npm run tauri -- <command>
```

### Debugging
- Use `log` crate for Rust logging
- Enable `tauri-plugin-log` for log output
- Check DevTools console for frontend errors
- Check terminal for Rust panics/errors

## Cross-Platform Considerations

### File Paths
- Use Tauri's path API for cross-platform paths
- Never hardcode path separators
- Use `app_data_dir()` for persistent storage

### Icons
- Provide icons for all platforms in `src-tauri/icons/`
- Required formats: .ico (Windows), .icns (macOS), .png (Linux)

### Testing
- Test on macOS, Windows, and Linux when possible
- Test installation/uninstallation process
- Verify app updates work correctly

## Building for Release

### Prerequisites
- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools, WebView2
- Linux: Various dev packages (see Tauri docs)

### Release Process
1. Update version in `Cargo.toml` and `tauri.conf.json`
2. Run `npm run build:desktop`
3. Test the built app
4. Create GitHub release (triggers CI/CD)

## Communication Web <-> Rust

### From Web to Rust
```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('command_name', { arg: 'value' });
```

### From Rust to Web
```rust
// Emit event
app.emit("event-name", payload)?;
```

```typescript
// Listen in frontend
import { listen } from '@tauri-apps/api/event';

await listen('event-name', (event) => {
  console.log(event.payload);
});
```

## Best Practices
- Keep Rust code minimal - use for system operations only
- Business logic stays in TypeScript/Astro
- Use events for async operations
- Handle offline scenarios gracefully
