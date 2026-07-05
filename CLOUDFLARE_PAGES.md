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

## Domain setup

1. Add the domain to Cloudflare.
2. In GoDaddy, replace the domain's nameservers with the two nameservers Cloudflare assigns.
3. In Cloudflare Pages, open the project and add the apex domain plus `www` under Custom domains.
4. Enable Web Analytics from the Pages project after the first deploy succeeds.

GoDaddy remains the registrar. Cloudflare handles DNS, TLS, hosting, and analytics.
