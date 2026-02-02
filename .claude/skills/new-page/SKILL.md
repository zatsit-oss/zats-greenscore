---
name: new-page
description: Create a new Astro page with the standard layout
argument-hint: "<page-path>"
---

Create a new page at path `$ARGUMENTS`.

## Instructions

1. Create the page file at `src/pages/$ARGUMENTS.astro`

2. Use this template:

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
- Meaningful title and description for SEO
- Proper heading hierarchy (h1 > h2 > h3)
- Navigation links updated if needed
- Responsive layout
- Accessible structure
