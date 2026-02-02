# Fonctionnalité : Questionnaire d'audit

## Description

Le questionnaire d'audit est le cœur de l'application. Il permet d'évaluer l'éco-conception d'une API en répondant à une série de questions organisées par section.

## Source des données

Le questionnaire provient du fichier Excel officiel API Green Score (`48_CAT_Sustainable_API_GreenScore_V1-2.xlsx`) et est stocké dans `src/data/surveyQuestions.json`.

## Structure du questionnaire

### Sections

| Section | Nb questions | Focus |
|---------|--------------|-------|
| Architecture | 4 | Choix structurants (event-driven, déploiement, scalabilité) |
| Design | 11 | Conception de l'API (format, cache, tokens, filtres) |
| Usage | 7 | Exploitation (versioning, pagination, monitoring) |
| Logs | 1 | Gestion des logs |

**Total : 23 questions**

### Structure d'une question

```typescript
interface SurveyQuestion {
  id: string           // Ex: "AR01", "DE05"
  section: string      // Architecture, Design, Usage, Logs
  question: string     // Intitulé court
  description: string  // Description détaillée
  tooltip: string      // Explication et bonnes pratiques
  points: number       // Pondération (48 à 600 points)
  formula?: string     // Formule optionnelle pour questions numériques
}
```

### Types de réponses

1. **Questions booléennes** (majoritaires)
   - Oui = points attribués
   - Non = 0 points

2. **Questions avec formule** (US06, US07)
   - Valeur numérique saisie
   - Points calculés via la formule
   - Ex: US06 (Number of Consumers) : `(x * 50) - 50`
   - Ex: US07 (Error rate) : `(1 - (x / 100)) * 100`

## Parcours utilisateur

1. L'utilisateur sélectionne un projet existant ou en crée un nouveau
2. Le questionnaire s'affiche section par section
3. Pour chaque question :
   - Affichage de la question et description
   - Tooltip disponible pour plus de contexte
   - Réponse Oui/Non ou saisie numérique
4. Le score se met à jour en temps réel
5. À la fin, affichage du score final et du ranking

## Règles métier

### Calcul du score

```
Score = (Points obtenus / Points maximum) * 100
```

- Points maximum = somme de tous les `points` des questions
- Points obtenus = somme des points des réponses positives + points calculés via formules

### Détermination du ranking

| Score | Ranking |
|-------|---------|
| 80-100 | A |
| 60-79 | B |
| 40-59 | C |
| 20-39 | D |
| 0-19 | E |

## Questions clés par impact

### Plus fort impact (600 points)
- **DE01** : Format d'échange léger (JSON vs XML)
- **LO01** : Rétention des logs alignée sur le besoin métier

### Impact élevé (375 points)
- **AR01** : Architecture Event Driven
- **AR02** : API déployée proche du consommateur
- **AR03** : Éviter les APIs dupliquées
- **AR04** : Infrastructure scalable
- **US06** : Nombre de consommateurs (réutilisation)

## Évolutions futures

- [ ] Sauvegarde automatique des réponses en cours
- [ ] Mode "quick audit" avec questions essentielles uniquement
- [ ] Comparaison entre versions d'un même projet
- [ ] Recommandations personnalisées basées sur les réponses
