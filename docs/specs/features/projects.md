# Feature: Project management

## Description

Project management allows users to create, edit and track multiple eco-design evaluations.

## Data model

### Project interface

```typescript
interface Project {
  id: string              // Unique UUID
  name: string            // Project/API name
  description: string     // Optional description
  createdAt: string       // Creation date (ISO 8601)
  updatedAt: string       // Last modification date
  status: ProjectStatus   // Evaluation status
  score?: number          // Computed score (0-100)
  ranking?: Ranking       // Ranking (A-E)
  answers?: Record<string, boolean | string | number>  // Survey answers
}

type ProjectStatus = "InProgress" | "Completed"
type Ranking = "A" | "B" | "C" | "D" | "E"
```

## Storage

### Web version
- Browser **LocalStorage**
- Key: `greenscore_projects`
- Format: JSON array of projects

### Desktop version (Tauri)
- Same mechanism via LocalStorage
- Persistence handled by the WebView

### Current limitations
- No synchronization across devices
- No cloud backup
- Data tied to the browser/profile

## Features

### Project creation

1. Click on "New project"
2. Enter the name (required)
3. Enter the description (optional)
4. Automatic generation of the ID and dates
5. Initial status: `InProgress`

### Project list

- Display of all projects
- Sorted by modification date (most recent first)
- Display of status, score and ranking
- Actions: Open, Delete

### Editing a project

- Editing the name and description
- Survey answers automatically update:
  - `updatedAt`
  - `score`
  - `ranking`
  - `answers`

### Completing a project

- Switches to `Completed` status when all questions are answered
- Or by manual action from the user

### Deleting a project

- Confirmation required
- Permanent deletion (no trash bin)

## User journey

### First launch
```
Home → No project → "Create my first project" button
```

### User with projects
```
Home → Project list → Selection → Survey
```

### Navigation
```
/                     → Home (project list or landing)
/projects             → Project list
/projects/new         → Project creation
/projects/[id]        → Project detail and survey
/projects/[id]/edit   → Metadata editing
```

## Business rules

1. **Name uniqueness**: Not enforced (several projects can have the same name)
2. **Deletion**: Always possible, even for a completed project
3. **Score**: Recomputed on every answer change
4. **Status**: Can revert from `Completed` to `InProgress` if an answer is modified

## User interface

### Project card (list)
```
┌─────────────────────────────────────┐
│ [Ranking]  Project name             │
│            Short description...     │
│                                     │
│ Status: In progress  Score: 65/100  │
│ Modified on 02/02/2026              │
└─────────────────────────────────────┘
```

### Available actions
- **Open**: Access the survey
- **Edit**: Modify name/description
- **Delete**: With confirmation

## Future improvements

- [ ] Project duplication (template)
- [ ] Export/Import of projects (JSON)
- [ ] Tags and categorization
- [ ] Search and filters
- [ ] Archiving (soft delete)
- [ ] Cloud storage backend
- [ ] Project sharing (read-only)
- [ ] Evaluation versioning
