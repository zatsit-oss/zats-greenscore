# Quality Principles

These principles must be applied to every change on this project.

**Important**: This project evaluates eco-design for others. We must lead by example.

## Performance
- Minimize JavaScript usage (static HTML preferred)
- Optimize images and assets
- Lazy load non-critical resources
- Keep bundle size minimal
- Use Astro's partial hydration (`client:*` directives) sparingly

## Accessibility (a11y)
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- Provide `aria-label` for interactive elements
- Ensure sufficient color contrast (WCAG AA minimum)
- Support keyboard navigation
- Add `alt` text for images
- Form labels must be associated with inputs
- Focus states must be visible
- Test with screen readers when possible

## Responsive Design
- Mobile-first approach
- Test on multiple breakpoints (mobile, tablet, desktop)
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- Ensure touch targets are at least 44x44px on mobile
- Avoid horizontal scroll on any viewport
- Test questionnaire navigation on mobile

## Eco-design (Lead by Example)

### Core Principles
- Prefer static generation over client-side rendering
- Minimize HTTP requests
- Use SVG icons instead of icon fonts
- Avoid heavy libraries and frameworks
- Optimize and compress all assets
- Cache aggressively

### Targets
- Keep pages lightweight (target: < 500KB per page)
- Target EcoIndex grade A
- Minimize DOM complexity (< 50 elements per section)
- Total page weight < 1MB

### Fonts
- **Never** use Google Fonts or external font CDNs
- Self-host fonts via `@fontsource/*` packages if needed
- Limit font weights (max 3: 400, 600, 700)
- Prefer system fonts when possible

### External Resources
- Avoid external scripts and stylesheets
- No tracking scripts or analytics
- Self-host all critical assets

### Astro Specific
- Use `compressHTML: true` in config
- Minimize client-side JavaScript
- Use `client:visible` for components below the fold
- Test performance on production build (`npm run preview`)

## Data Integrity
- Validate all user inputs before storage
- Handle LocalStorage quota errors gracefully
- Provide clear feedback for save/load operations
- Support data export for user ownership

## Testing Checklist
- [ ] Build passes without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Dark/light theme works
- [ ] Desktop app works (`npm run dev:desktop`)
