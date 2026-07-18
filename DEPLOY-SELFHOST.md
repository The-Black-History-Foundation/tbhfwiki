# Deploy TBHF Wiki on Oracle Cloud (Always Free)

Railway's MediaWiki template needs 3 persistent volumes, but Railway's free
plan caps a project at 1 volume — upgrading is the only fix on Railway
itself. This guide instead self-hosts on Oracle Cloud Infrastructure's
**Always Free** tier: a real VM with a real disk, no volume limit, and no
cost as long as you stay within the Always Free shapes. See
`DEPLOY-RAILWAY.md` for why that path was dropped.

A card is required for identity verification when you sign up, but Always
Free resources are never charged.

## 1. Create the VM

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/).
2. Console → **Compute → Instances → Create instance**.
3. Image: **Canonical Ubuntu 24.04**.
4. Shape: **VM.Standard.A1.Flex** (Always Free — Ampere ARM). Use 2 OCPUs /
   12 GB RAM; the Always Free allowance covers up to 4 OCPUs / 24 GB total,
   so this leaves headroom for a second instance later if you ever want one.
5. Add your SSH public key (or let Oracle generate a key pair and download
   the private key).
6. Under **Networking**, assign a public IPv4 address.
7. Create the instance, then reserve that IP as a **static** (not ephemeral)
   public IP: **Networking → IP Management → Reserved Public IPs**, so it
   survives a reboot.

## 2. Open the firewall (both layers)

OCI blocks inbound traffic at **two** independent layers — missing either
one is the single most common reason a fresh instance is unreachable.

**Layer 1 — the VCN Security List:**

Console → **Networking → Virtual Cloud Networks** → your VCN → **Security
Lists** → default security list → **Add Ingress Rules**:

| Source CIDR | Protocol | Destination Port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

(Port 22 for SSH is open by default.)

**Layer 2 — the instance's own firewall:**

```bash
ssh ubuntu@<your-static-ip>
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 3. Install the stack

```bash
sudo apt update
sudo apt install -y apache2 mariadb-server unzip \
  php php-mysqli php-xml php-mbstring php-intl php-apcu

sudo a2enmod rewrite
sudo systemctl enable --now apache2 mariadb
```

## 4. Create the database

```bash
sudo mysql -u root <<'SQL'
CREATE DATABASE mediawiki CHARACTER SET utf8mb4;
CREATE USER 'mediawiki'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON mediawiki.* TO 'mediawiki'@'localhost';
FLUSH PRIVILEGES;
SQL
```

Replace `CHANGE_THIS_PASSWORD` with a real generated password — you'll use
it again in Step 6.

## 5. Install MediaWiki core and the Citizen skin

```bash
cd /tmp
curl -LO https://releases.wikimedia.org/mediawiki/1.43/mediawiki-1.43.1.tar.gz
tar xzf mediawiki-1.43.1.tar.gz
sudo mv mediawiki-1.43.1 /var/www/html/w
sudo chown -R www-data:www-data /var/www/html/w

cd /var/www/html/w/skins
sudo git clone --branch REL1_43 https://github.com/StarCitizenTools/mediawiki-skins-citizen.git Citizen
sudo chown -R www-data:www-data Citizen
```

## 6. Run the non-interactive installer

This generates `LocalSettings.php` without needing the web setup wizard:

```bash
cd /var/www/html/w
sudo -u www-data php maintenance/install.php \
  --dbname=mediawiki \
  --dbserver=localhost \
  --dbuser=mediawiki \
  --dbpass='CHANGE_THIS_PASSWORD' \
  --scriptpath=/w \
  --server='http://<your-static-ip>' \
  --pass='CHOOSE_AN_ADMIN_PASSWORD' \
  "The Black History Foundation Wiki" WikiAdmin
```

## 7. Wire up the skin and this repo's config

Append to `/var/www/html/w/LocalSettings.php`:

```php
wfLoadSkin( 'Citizen' );
$wgDefaultSkin = 'citizen';
```

Then append the contents of this repo's `LocalSettings-snippet.php`
(install `InputBox` first — it ships with MediaWiki core, no extra
download needed):

```bash
cat LocalSettings-snippet.php | sudo tee -a /var/www/html/w/LocalSettings.php
```

## 8. Upload assets

Log in as `WikiAdmin` at `http://<your-static-ip>/w/index.php/Special:Upload`
and upload every file listed in `assets/README.md`, or use the CLI:

```bash
cd /var/www/html/w
sudo -u www-data php maintenance/importImages.php \
  /mnt/c/Users/Owner/TBHF-Wiki-Skin/assets/fonts \
  /mnt/c/Users/Owner/TBHF-Wiki-Skin/assets/logos
```

(Run `importImages.php` from a machine that can reach the asset files —
either copy the `assets/` folder to the VM first, or run this from WSL if
it has network access to the instance.)

Place the two logo files referenced by `LocalSettings-snippet.php` at
`/var/www/html/w/resources/assets/`:

```bash
sudo mkdir -p /var/www/html/w/resources/assets
sudo cp TBHF_Main_Text.png TBHF_Main_Icon.png /var/www/html/w/resources/assets/
```

## 9. Deploy the theme

Create a bot password first: `Special:BotPasswords` while logged in as
`WikiAdmin`, then run this repo's deploy script:

```bash
export MW_API_URL=http://<your-static-ip>/w/api.php
export MW_BOT_USER='WikiAdmin@tbhf-deploy'
export MW_BOT_PASSWORD='<bot password from Special:BotPasswords>'
node scripts/deploy-theme.mjs
```

## 10. Connect the main site

In the TBHF-1 Vercel project, set:

```
NEXT_PUBLIC_WIKI_URL=http://<your-static-ip>
```

Redeploy TBHF-1 on branch `feature/updates`.

## 11. HTTPS (once you have a domain)

Point a domain's A record at your static IP, then:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d wiki.yourdomain.org
```

Update `$wgServer` in `LocalSettings.php` and `NEXT_PUBLIC_WIKI_URL` on
Vercel to the `https://` domain once issued.

## Optional extensions

Same as the Railway path — install manually if wanted, both degrade
gracefully without them:

- **PageViewInfo** — homepage "Trending" column
- **TextExtracts** — research leads board excerpts
