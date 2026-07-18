# Deploy TBHF Wiki on Railway

> **Not the current deployment path.** Railway's MediaWiki template requires
> 3 persistent volumes, but a Railway project on the free plan is capped at
> 1 volume — the only fix on Railway itself is upgrading to a paid plan.
> This wiki deploys via **[DEPLOY-SELFHOST.md](DEPLOY-SELFHOST.md)** instead
> (Oracle Cloud's Always Free tier). Kept here in case Railway's limits
> change or a paid plan becomes an option later.

This wiki runs on **Railway** (not Vercel). The main site at [tbhfdn.org](https://tbhfdn.org) links to it via `NEXT_PUBLIC_WIKI_URL`.

## Prerequisites

- Railway account: `tech@tbhfdn.org`
- This repo cloned locally with theme assets in `assets/`

## 1. Create the Railway project

1. Open [Railway MediaWiki template](https://railway.com/deploy/mediawiki) (Taqasta image + MariaDB).
2. Create a new project and deploy the template.

## 2. Environment variables

Set these **before** the first successful boot:

| Variable | Value |
|----------|-------|
| `MW_ADMIN_USER` | `tech@tbhfdn.org` |
| `MW_ADMIN_PASS` | Strong password (store in Railway secrets) |
| `MW_SITE_NAME` | `The Black History Foundation Wiki` |
| `MW_SITE_SERVER` | `https://<your-service>.up.railway.app` *(set after first deploy)* |

After deploy, copy the public URL from **Settings → Networking → Public Networking** and update `MW_SITE_SERVER` to match exactly (including `https://`).

Enable the **Citizen** skin via Taqasta environment variables (see [Taqasta docs](https://github.com/WikiTeq/Taqasta)).

## 3. Healthcheck workaround

If deployment stalls on healthcheck or shows the Apache default page, set this **Custom Start Command** on the Taqasta service:

```bash
bash -c "rm -f /etc/apache2/sites-enabled/000-default.conf && rm -f /etc/apache2/sites-available/000-default.conf && rm -rf /var/www/html && /run-apache.sh"
```

## 4. Apply the theme

Once MediaWiki is live:

1. Log in as `tech@tbhfdn.org`.
2. Upload font and logo files from `assets/` (see `assets/README.md`).
3. Run the deploy script:

```bash
export MW_API_URL=https://<your-service>.up.railway.app/w/api.php
export MW_BOT_USER=tech@tbhfdn.org
export MW_BOT_PASSWORD=<bot-or-admin-password>
node scripts/deploy-theme.mjs
```

Or paste files manually per the root `README.md`.

4. Append `LocalSettings-snippet.php` to your wiki `LocalSettings.php` (or equivalent Taqasta config).

## 5. Connect the main site

In the TBHF-1 Vercel project, set:

```
NEXT_PUBLIC_WIKI_URL=https://<your-service>.up.railway.app
```

Redeploy TBHF-1 on branch `feature/updates`.

## Optional extensions

- **PageViewInfo** — homepage "Trending" column
- **TextExtracts** — research leads board excerpts

## Custom domain (later)

Attach a custom domain in Railway **Settings → Networking → Custom Domain**, then update `MW_SITE_SERVER` and `NEXT_PUBLIC_WIKI_URL` on Vercel.
