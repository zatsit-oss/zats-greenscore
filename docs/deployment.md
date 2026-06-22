# Deployment

## Production — Clever Cloud Cellar

The web app is hosted on a **Clever Cloud Cellar** bucket (S3-compatible object
storage, French sovereign host). The bucket is named after the domain:
`greenscore.zatsit.fr`.

### Automatic deployment

The GitHub Actions workflow `.github/workflows/cellar-deploy.yml` deploys on each
`push` to `main` (lint + unit tests, then `npm run deploy:cellar`).

Required GitHub secrets (Settings → Secrets and variables → Actions):

| Secret | Source |
|--------|--------|
| `CELLAR_ADDON_KEY_ID` | Clever console → Cellar add-on → Configuration |
| `CELLAR_ADDON_KEY_SECRET` | same |

### Manual deployment

```bash
# Requires a configured ~/.s3cfg (s3cmd --configure) with the Cellar keys and
# host_base = host_bucket = cellar-c2.services.clever-cloud.com
npm run deploy:cellar
```

The `scripts/deploy-cellar.sh` script:

1. runs a standard Astro build;
2. uploads incrementally (zero downtime);
3. creates **extensionless aliases** for each route (`about`, `projects/view`,
   …) served as `text/html` — Cellar serves the exact key without appending
   `.html`, so the app's bare-path links (`/about`) must map to an `about`
   object;
4. prunes orphan objects (stale assets);
5. sets `Cache-Control` headers (hashed `/_astro/*` assets immutable for 1 year,
   HTML/aliases `must-revalidate`).

The application stays **100% standard Astro**: all Cellar-specific logic lives in
the deploy script.

### HTTPS on the custom domain

The first TLS certificate must be **generated manually by Clever Cloud support**
(one ticket per domain); it then auto-renews. The domain must already point to
Cellar (CNAME to `cellar-c2.services.clever-cloud.com`) for validation to
succeed.

## Pull request previews — Firebase Hosting

PR previews are still handled by Firebase Hosting
(`.github/workflows/firebase-hosting-deploy.yml`), which generates an ephemeral
URL per PR. Cellar is not suitable for previews (a per-subdomain certificate
would require a manual generation every time).

## Desktop

The desktop app (Tauri) is built separately
(`.github/workflows/release-desktop.yml`).
