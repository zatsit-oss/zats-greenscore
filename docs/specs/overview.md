# Vue d'ensemble du projet

## Contexte

**zats-greenscore** est une application hybride web/desktop permettant d'évaluer le score d'éco-conception des projets digitaux, en particulier les APIs.

Ce projet s'inspire de l'initiative [API Green Score](https://github.com/API-Green-Score/APIGreenScore) et implémente leur questionnaire d'évaluation sous forme d'interface web interactive.

## Problème résolu

Le questionnaire original API Green Score est fourni sous forme de fichier Excel, ce qui limite :
- L'accessibilité pour les utilisateurs non techniques
- L'engagement et l'expérience utilisateur
- La possibilité de suivre plusieurs projets dans le temps
- La collaboration en équipe

## Solution

Une application web moderne et légère qui :
1. Transforme le questionnaire statique en interface dynamique
2. Calcule le score en temps réel
3. Permet de gérer plusieurs projets
4. Reste elle-même éco-conçue (cohérence avec la philosophie du projet)

## Objectifs

### Court terme
- [x] Interface de questionnaire interactive
- [x] Calcul du score en temps réel
- [x] Gestion de projets multiples (stockage local)
- [x] Application desktop avec Tauri
- [ ] Export PDF des résultats

### Long terme
- [ ] Support multi-langues
- [ ] Collaboration d'équipe
- [ ] Backend de stockage alternatif (cloud)
- [ ] Questionnaires personnalisables
- [ ] Analytics et suivi des améliorations

## Public cible

- **Développeurs d'APIs** souhaitant évaluer l'impact environnemental de leurs APIs
- **Architectes** cherchant à appliquer les bonnes pratiques d'éco-conception
- **Équipes DevOps/SRE** responsables de l'infrastructure
- **Product Owners** sensibilisés à l'impact environnemental du numérique

## Principes directeurs

1. **Lead by example** - L'application doit elle-même être éco-conçue
2. **Simplicité** - Interface claire et intuitive
3. **Légèreté** - Minimal footprint (pas de framework JS lourd)
4. **Offline-first** - Fonctionne sans connexion internet
5. **Open source** - Contribution communautaire encouragée
