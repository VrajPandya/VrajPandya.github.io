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

1. Add the domain to Cloudflare.
2. In GoDaddy, replace the domain's nameservers with the two nameservers Cloudflare assigns.
3. In Cloudflare Pages, open the project and add the apex domain plus `www` under Custom domains.
4. Enable Web Analytics from the Pages project after the first deploy succeeds.

GoDaddy remains the registrar. Cloudflare handles DNS, TLS, hosting, and analytics.
