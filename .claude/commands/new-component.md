# New Component

Create a new Astro component.

## Arguments
- `$ARGUMENTS` - The component name in PascalCase (e.g., "ProgressBar", "ResultChart")

## Instructions

1. Determine the appropriate location:
   - General component: `src/components/{Name}.astro`
   - Audit-specific: `src/components/audit/{Name}.astro`

2. Use the standard component template:

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
    /* Component styles */
  }
</style>
```

3. Import and use in pages or other components:
```astro
import NewComponent from '../components/NewComponent.astro';

<NewComponent label="Score" value={85} />
```

4. Run build to verify: `npm run build`

## Checklist
- [ ] TypeScript interface for props
- [ ] Default values for optional props
- [ ] Semantic HTML elements
- [ ] Accessible (aria-labels, keyboard navigation if interactive)
- [ ] Responsive design
- [ ] Dark/light theme support
