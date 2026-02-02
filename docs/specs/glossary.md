# Glossaire

Termes métier et techniques utilisés dans le projet.

## Termes API Green Score

### Green Score
Score global d'éco-conception d'une API, exprimé sur une échelle de 0 à 100. Plus le score est élevé, meilleure est l'éco-conception.

### Ranking (Classement)
Lettre de classement basée sur le score :
- **A** : Excellent (score élevé)
- **B** : Bon
- **C** : Moyen
- **D** : À améliorer
- **E** : Faible (score bas)

### Section
Catégorie regroupant plusieurs questions du questionnaire :
- **Architecture** : Choix architecturaux (event-driven, localisation, scalabilité)
- **Design** : Conception de l'API (format, cache, tokens, filtres)
- **Usage** : Utilisation et exploitation (versioning, pagination, monitoring)
- **Logs** : Gestion des logs (rétention, volumétrie)

### Points
Pondération d'une question dans le calcul du score. Chaque question a un nombre de points associé reflétant son importance dans l'éco-conception.

## Termes techniques

### Audit
Session d'évaluation d'un projet via le questionnaire. Un audit produit un score et un ranking.

### Projet
Entité représentant une API ou un système à évaluer. Contient les métadonnées et les réponses au questionnaire.

### Answer (Réponse)
Réponse à une question du questionnaire. Peut être :
- **Boolean** : Oui/Non (la pratique est-elle appliquée ?)
- **Numeric** : Valeur numérique (ex: taux d'erreur, nombre de consommateurs)

### Formula
Certaines questions utilisent une formule pour calculer les points en fonction de la valeur numérique saisie. Ex: `(x * 50) - 50` pour le nombre de consommateurs.

## Bonnes pratiques évaluées

### Event Driven Architecture (AR01)
Architecture basée sur les événements pour éviter le polling excessif.

### Cache
Mécanisme de mise en cache pour réduire les requêtes inutiles et préserver les ressources.

### Opaque Token
Token d'authentification opaque (vs JWT), plus léger et sécurisé.

### Pagination
Mécanisme permettant de limiter le volume de données retourné par requête.

### Filtering
Capacité à filtrer les données retournées pour ne récupérer que le nécessaire.
