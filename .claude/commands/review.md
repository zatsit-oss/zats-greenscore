# Code Review

Perform a comprehensive code review of recent changes.

## Review Checklist

### TypeScript & Code Quality
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Clear naming conventions
- [ ] Functions are small and focused
- [ ] No unused variables or imports

### Astro & Components
- [ ] Props have TypeScript interfaces
- [ ] Components follow single responsibility
- [ ] Correct use of `client:*` directives (minimal JS)
- [ ] Data structures extracted from templates

### Accessibility
- [ ] Semantic HTML elements used
- [ ] Interactive elements have labels
- [ ] Form inputs have associated labels
- [ ] Color contrast is sufficient
- [ ] Keyboard navigation works

### Performance & Eco-design
- [ ] Minimal client-side JavaScript
- [ ] No unnecessary dependencies
- [ ] Images optimized
- [ ] Bundle size reasonable

### Tauri (if applicable)
- [ ] Rust code follows conventions
- [ ] Minimal permissions in capabilities
- [ ] IPC data validated
- [ ] Errors handled gracefully

### Security
- [ ] No secrets in code
- [ ] User inputs validated
- [ ] LocalStorage data validated on read

### Testing
- [ ] Build passes: `npm run build`
- [ ] Desktop build passes: `npm run build:desktop`
- [ ] Manual testing on key flows

## Commands to Run

```bash
# Type check
npx astro check

# Build web
npm run build

# Build desktop (optional)
npm run build:desktop
```
