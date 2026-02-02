# Fonctionnalité : Gestion des projets

## Description

La gestion des projets permet aux utilisateurs de créer, modifier et suivre plusieurs évaluations d'éco-conception.

## Modèle de données

### Interface Project

```typescript
interface Project {
  id: string              // UUID unique
  name: string            // Nom du projet/API
  description: string     // Description optionnelle
  createdAt: string       // Date de création (ISO 8601)
  updatedAt: string       // Date de dernière modification
  status: ProjectStatus   // État de l'évaluation
  score?: number          // Score calculé (0-100)
  ranking?: Ranking       // Classement (A-E)
  answers?: Record<string, boolean | string | number>  // Réponses au questionnaire
}

type ProjectStatus = "InProgress" | "Completed"
type Ranking = "A" | "B" | "C" | "D" | "E"
```

## Stockage

### Version web
- **LocalStorage** du navigateur
- Clé : `greenscore_projects`
- Format : JSON array de projets

### Version desktop (Tauri)
- Même mécanisme via LocalStorage
- Persistance assurée par le WebView

### Limitations actuelles
- Pas de synchronisation entre appareils
- Pas de sauvegarde cloud
- Données liées au navigateur/profil

## Fonctionnalités

### Création de projet

1. Clic sur "Nouveau projet"
2. Saisie du nom (obligatoire)
3. Saisie de la description (optionnel)
4. Génération automatique de l'ID et des dates
5. Status initial : `InProgress`

### Liste des projets

- Affichage de tous les projets
- Tri par date de modification (plus récent en premier)
- Affichage du statut, score et ranking
- Actions : Ouvrir, Supprimer

### Modification d'un projet

- Édition du nom et de la description
- Les réponses au questionnaire mettent à jour automatiquement :
  - `updatedAt`
  - `score`
  - `ranking`
  - `answers`

### Complétion d'un projet

- Passage en status `Completed` quand toutes les questions sont répondues
- Ou action manuelle de l'utilisateur

### Suppression d'un projet

- Confirmation demandée
- Suppression définitive (pas de corbeille)

## Parcours utilisateur

### Premier lancement
```
Accueil → Aucun projet → Bouton "Créer mon premier projet"
```

### Utilisateur avec projets
```
Accueil → Liste des projets → Sélection → Questionnaire
```

### Navigation
```
/                     → Accueil (liste projets ou landing)
/projects             → Liste des projets
/projects/new         → Création de projet
/projects/[id]        → Détail et questionnaire du projet
/projects/[id]/edit   → Édition des métadonnées
```

## Règles métier

1. **Unicité du nom** : Non imposée (plusieurs projets peuvent avoir le même nom)
2. **Suppression** : Toujours possible, même pour un projet complété
3. **Score** : Recalculé à chaque modification de réponse
4. **Status** : Peut revenir de `Completed` à `InProgress` si une réponse est modifiée

## Interface utilisateur

### Carte projet (liste)
```
┌─────────────────────────────────────┐
│ [Ranking]  Nom du projet            │
│            Description courte...    │
│                                     │
│ Status: En cours    Score: 65/100   │
│ Modifié le 02/02/2026               │
└─────────────────────────────────────┘
```

### Actions disponibles
- **Ouvrir** : Accéder au questionnaire
- **Éditer** : Modifier nom/description
- **Supprimer** : Avec confirmation

## Évolutions futures

- [ ] Duplication de projet (template)
- [ ] Export/Import de projets (JSON)
- [ ] Tags et catégorisation
- [ ] Recherche et filtres
- [ ] Archivage (soft delete)
- [ ] Backend de stockage cloud
- [ ] Partage de projet (lecture seule)
- [ ] Versioning des évaluations
