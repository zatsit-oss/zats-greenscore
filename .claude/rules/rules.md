# Project Rules

## Language
- **Everything in English** for now (code, UI, messages, tooltips)
- Git commits and code comments: **English**
- **Future i18n planned**: Structure code to allow easy FR/EN translation later
  - Keep user-facing strings extractable (avoid inline concatenation)
  - Consider using constants or simple objects for text that will be translated

## Git Commits (Angular Convention)

Format: `type(scope): description`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or fixing tests
- `chore`: Build process, dependencies, or tooling changes
- `ci`: CI/CD changes

### Scope (optional)
The component or area affected: `audit`, `scoring`, `projects`, `tauri`, `ui`, etc.

### Examples
```
feat(audit): add progress indicator to questionnaire
fix(scoring): correct ranking calculation for edge cases
style(css): extract button styles to utility class
refactor(projects): simplify project storage logic
chore: update dependencies
ci(desktop): add release workflow for tauri
```

### Rules
- Use imperative mood: "add" not "added" or "adds"
- No capital letter at start of description
- No period at end
- Keep description under 72 characters

## Components

### Astro Components
- Keep components small and focused (single responsibility)
- Use TypeScript interfaces for props
- Extract data structures to frontmatter section
- Name files in PascalCase: `AuditQuestion.astro`, `ScoreBadge.astro`

### Component Organization
```
src/components/
├── audit/              # Audit-specific components
│   ├── AuditStepper.astro
│   ├── AuditSection.astro
│   └── AuditQuestion.astro
├── ProjectCard.astro   # Shared components
├── ScoreBadge.astro
└── ThemeToggle.astro
```

## Styles
- Use Tailwind CSS utility classes
- Extract repeated patterns to `@apply` directives when beneficial
- Use semantic class names for complex styles
- Support dark/light themes via CSS variables or Tailwind dark mode

## TypeScript

### Types Location
- Shared types: `src/types/`
- Component-specific types: in the component file

### Naming Conventions
- Interfaces: PascalCase with descriptive names (`Project`, `AuditQuestion`)
- Types: PascalCase (`ProjectStatus`, `ScoreRanking`)
- Enums: PascalCase with PascalCase values

### Example
```typescript
// src/types/project.ts
export interface Project {
  id: string
  name: string
  status: ProjectStatus
}

export type ProjectStatus = "InProgress" | "Completed"
export type ScoreRanking = "A" | "B" | "C" | "D" | "E"
```

## File Structure

### Pages
- `src/pages/index.astro` - Home page
- `src/pages/audit.astro` - Audit questionnaire
- `src/pages/projects/new.astro` - Create project
- `src/pages/projects/view.astro` - View project details

### Data
- Static data: `src/data/`
- Questions JSON: `src/data/apigreenscore-survey-questions.json`, `src/data/eroom-data-model-1-1.json`

### Utils
- Scoring logic: `src/utils/scoring.ts`
- UI helpers: `src/utils/ui.ts`
- Notifications: `src/utils/toast.ts`

## Code Quality
- No `any` types - use proper typing
- Handle errors gracefully with user feedback
- Use early returns to reduce nesting
- Keep functions small and focused
