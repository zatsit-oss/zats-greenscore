# ADR-002: Production hosting on Clever Cloud Cellar

## Status

**Accepted** - June 2026

## Context

The web application was hosted on **Google Cloud Platform** (Firebase Hosting for
PR previews, a GCS bucket for production). Two concerns motivated a change:

- **Sovereignty**: GCP is a US provider, subject to the US Cloud Act. For a tool
  that evaluates digital eco-design and responsibility, hosting data with an EU
  sovereign provider is more consistent.
- **Sobriety**: the app is a static site; a full application instance is
  oversized. We want pay-per-use, minimal-footprint hosting.

### Options considered

1. **Clever Cloud Cellar** - S3-compatible object storage (French), pay-per-use
2. **Clever Cloud Static runtime** - Native static app, but a paid instance
   (~16 €/month)
3. **Stay on GCP** - Rejected: does not address sovereignty
4. **Another sovereign static host** (Scaleway, OVHcloud…) - Reintroduces a
   different vendor; kept as a future fallback

## Decision

We host the production web app on a **Clever Cloud Cellar** bucket named after the
domain (`greenscore.zatsit.fr`), deployed via GitHub Actions. PR previews stay on
Firebase Hosting.

## Rationale

### Consistency with the project's philosophy

| Criterion | GCS / Firebase | Cellar Static runtime | **Cellar (bucket)** |
|-----------|----------------|-----------------------|---------------------|
| Sovereignty | ❌ US (Cloud Act) | ✅ FR | ✅ FR |
| Cost (static site) | instance/quota | ~16 €/month | **~0 € (pay-per-use)** |
| Model | object bucket | app instance | object bucket |

Cellar gives EU sovereignty and the lowest footprint (a few cents/month of
outbound traffic for our traffic profile), in line with the eco-design mission.

### Trade-offs handled

Cellar is raw object storage, not a web server. Two specifics had to be solved:

- **Flat routing**: Cellar serves the exact key only (no `.html` append, no
  bare→slash redirect), while Astro is a multi-page app (`/about` →
  `about/index.html`). Rather than change the app, the deploy script uploads an
  **extensionless alias object** for each route (`about`, `projects/view`, …)
  served as `text/html`. The application stays **100% standard Astro**; all
  host-specific logic lives in `scripts/deploy-cellar.sh`.
- **Custom-domain HTTPS**: the first TLS certificate is **generated manually by
  Clever Cloud support** (one ticket per domain), then auto-renews. This is not
  documented and was confirmed via a support ticket; an old blog post wrongly
  suggests automatic provisioning on bucket creation.

## Consequences

### Positive

- Sovereign (French) production hosting, HTTPS
- Near-zero monthly cost, minimal footprint
- App unchanged (no trailing-slash refactor, desktop untouched)
- Incremental, zero-downtime deploys with orphan pruning and cache headers

### Negative

- No web server: routing quirks handled in the deploy script (aliases)
- First TLS certificate requires a manual support ticket per domain
- Cellar is unsuitable for per-PR previews (a certificate per subdomain would
  need a manual generation each time) → Firebase kept for previews
- Outbound traffic is metered; no native billing cap confirmed (monitor
  consumption / ask support)

### Neutral

- Storage stays in LocalStorage (client-side); hosting only serves static files
- PR previews remain on Firebase Hosting for now

## Implementation

### Deployment

```bash
npm run deploy:cellar    # standard build + incremental sync + aliases + cache
```

- Script: `scripts/deploy-cellar.sh`
- CI: `.github/workflows/cellar-deploy.yml` (push to `main`, lint + tests gate)
- Secrets: `CELLAR_ADDON_KEY_ID`, `CELLAR_ADDON_KEY_SECRET`
- Details: see [docs/deployment.md](../../deployment.md)

### Cache strategy

- Hashed `/_astro/*` assets: `Cache-Control: public, max-age=31536000, immutable`
- HTML pages + aliases: `Cache-Control: public, max-age=0, must-revalidate`

## References

- [Issue #55 - Migrate hosting from GCP to Clever Cloud](https://github.com/zatsit-oss/zats-greenscore/issues/55)
- [PR #58 - feat: migrate production hosting to Clever Cloud Cellar](https://github.com/zatsit-oss/zats-greenscore/pull/58)
- [Clever Cloud Cellar documentation](https://www.clever.cloud/developers/doc/addons/cellar/)
- [docs/deployment.md](../../deployment.md)
