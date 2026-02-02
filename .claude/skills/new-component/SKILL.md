---
name: new-component
description: Create a new Astro component with TypeScript props
argument-hint: "<ComponentName>"
---

Create a new Astro component named `$ARGUMENTS`.

## Instructions

1. Determine the appropriate location:
   - General component: `src/components/$ARGUMENTS.astro`
   - Audit-specific: `src/components/audit/$ARGUMENTS.astro`

2. Use this template:

```astro
---
interface Props {
  // Define props with TypeScript
  label: string;
  value?: number;
}

const { label, value = 0 } = Astro.props;
---

<div class="component-wrapper">
  <span class="label">{label}</span>
  <span class="value">{value}</span>
</div>

<style>
  .component-wrapper {
    /* Component styles - use CSS variables from global.css */
  }
</style>
```

3. Run build to verify: `npm run build`

## Checklist
- TypeScript interface for props
- Default values for optional props
- Semantic HTML elements
- Accessible (aria-labels if interactive)
- Responsive design
- Dark/light theme support via CSS variables
