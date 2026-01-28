# New Page

Create a new page for the application.

## Arguments
- `$ARGUMENTS` - The page path (e.g., "results", "projects/edit")

## Instructions

1. Create the page file at `src/pages/{path}.astro`

2. Use the standard page template:

```astro
---
import Layout from '../layouts/Layout.astro';
// Adjust import path based on page depth
---

<Layout title="Page Title" description="Page description for SEO">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Page Title</h1>

    <section>
      <!-- Page content -->
    </section>
  </main>
</Layout>
```

3. Add navigation link if needed (header or relevant navigation)

4. Run build to verify: `npm run build`

## Checklist
- [ ] Meaningful title and description for SEO
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Navigation links updated
- [ ] Responsive layout
- [ ] Accessible structure
