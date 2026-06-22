# Déploiement

## Production — Clever Cloud Cellar

Le site web est hébergé sur un bucket **Clever Cloud Cellar** (stockage objet
S3, hébergeur français, souverain). Le bucket porte le nom du domaine :
`greenscore.zatsit.fr`.

### Déploiement automatique

Le workflow GitHub Actions `.github/workflows/cellar-deploy.yml` déploie à
chaque `push` sur `main` (lint + tests unitaires, puis `npm run deploy:cellar`).

Secrets GitHub requis (Settings → Secrets and variables → Actions) :

| Secret | Source |
|--------|--------|
| `CELLAR_ADDON_KEY_ID` | Console Clever → add-on Cellar → Configuration |
| `CELLAR_ADDON_KEY_SECRET` | idem |

### Déploiement manuel

```bash
# Nécessite un ~/.s3cfg configuré (s3cmd --configure) avec les clés Cellar,
# host_base = host_bucket = cellar-c2.services.clever-cloud.com
npm run deploy:cellar
```

Le script `scripts/deploy-cellar.sh` :

1. build Astro standard ;
2. upload incrémental (zéro interruption) ;
3. crée des **alias sans extension** pour chaque route (`about`, `projects/view`,
   …) servis en `text/html` — Cellar sert la clé exacte sans ajouter `.html`,
   donc les liens de l'app (`/about`) doivent correspondre à un objet `about` ;
4. supprime les objets orphelins (anciens assets) ;
5. pose les en-têtes `Cache-Control` (assets hashés `/_astro/*` immutables 1 an,
   HTML/alias en `must-revalidate`).

L'application reste **100 % Astro standard** : toute la logique spécifique à
Cellar vit dans le script de déploiement.

### HTTPS sur le domaine personnalisé

Le premier certificat TLS doit être **généré manuellement par le support Clever
Cloud** (un ticket par domaine) ; il est ensuite renouvelé automatiquement. Le
domaine doit déjà pointer vers Cellar (CNAME vers
`cellar-c2.services.clever-cloud.com`) pour que la validation aboutisse.

## Previews de Pull Request — Firebase Hosting

Les previews par PR restent gérées par Firebase Hosting
(`.github/workflows/firebase-hosting-deploy.yml`), qui génère une URL éphémère
par PR. Cellar ne convient pas aux previews (un certificat par sous-domaine
nécessiterait une génération manuelle à chaque fois).

## Desktop

L'application desktop (Tauri) est construite séparément
(`.github/workflows/release-desktop.yml`).
