# Cloudflare Pages

This Jekyll site is ready to deploy on Cloudflare Pages.

## Build settings

Use these settings when creating the Pages project:

```text
Framework preset: None
Production branch: main
Build command: bundle exec jekyll build
Build output directory: _site
Root directory: /
```

Cloudflare Pages reads `.ruby-version`, so builds should use Ruby 3.4.4.

## GitHub Actions sync

This repository includes `.github/workflows/deploy-cloudflare-pages.yml`, which
builds the Jekyll site and deploys `_site` to the `vrajpandya-github-io`
Cloudflare Pages project whenever `main` is pushed.

Add these repository secrets in GitHub before relying on the workflow:

```text
CLOUDFLARE_ACCOUNT_ID=28cdbde24558fbf9a719b4ff1d54078d
CLOUDFLARE_API_TOKEN=<Cloudflare API token with Cloudflare Pages edit access>
```

The current local Wrangler OAuth token can deploy from this machine, but GitHub
Actions needs its own API token stored as a GitHub secret.

## Domain setup

The Pages project has these custom domains attached:

```text
optimizationtendencies.com
www.optimizationtendencies.com
```

They remain pending until DNS points to Cloudflare.

1. Add `optimizationtendencies.com` as a Cloudflare zone.
2. In GoDaddy, replace the domain's nameservers with the two nameservers Cloudflare assigns.
3. After the zone is active, confirm that Cloudflare created Pages DNS records for the apex and `www`.
4. Use Cloudflare Bulk Redirects to redirect `www.optimizationtendencies.com/*` to `https://optimizationtendencies.com/:splat` with a `301`, preserving path suffix and query string.
5. Enable Web Analytics from the Pages project after the custom domain is active.

GoDaddy remains the registrar. Cloudflare handles DNS, TLS, hosting, and analytics.
