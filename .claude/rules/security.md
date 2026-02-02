# Security

## Secrets & Configuration
- Never commit secrets (API keys, passwords, tokens, .env files)
- Use environment variables for sensitive configuration
- Add sensitive files to `.gitignore`

## Input Validation
- Validate all user inputs before processing
- Sanitize data before storage (LocalStorage)
- Validate JSON structure when parsing stored data

## LocalStorage Security
- Don't store sensitive information in LocalStorage
- Validate data integrity when reading from storage
- Handle corrupted data gracefully (reset to defaults)

## Tauri Security
- Use Tauri's capability system to limit permissions
- Don't expose unnecessary Rust commands to frontend
- Validate all IPC (Inter-Process Communication) data
- Keep `tauri.conf.json` permissions minimal

## Dependencies
- Keep dependencies up to date
- Audit dependencies regularly (`npm audit`, `cargo audit`)
- Prefer well-maintained packages with security track records
- Minimize dependency count

## Content Security
- Avoid `dangerouslySetInnerHTML` or equivalent
- Sanitize any user-provided content before display
- Use CSP headers in production (configured in nginx.conf)
