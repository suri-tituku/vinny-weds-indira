# Deploy vinny-weds-indira.bfouru.com to GitHub Pages

This package is ready for GitHub Pages. The wedding invitation itself is in `public/` and is already static. You do not need `npm install` or a Node.js runtime on GitHub Pages. `server.js` is only for local testing.

## Step 1 - GitHub repository

1. Sign in to GitHub as the account whose GitHub Pages hostname is `suri-tituku.github.io` (the hostname shown in the GoDaddy DNS screenshot), or update the DNS target if using another account.
2. Create a **public** repository called `vinny-weds-indira` (GitHub Free Pages requires a public repository).
3. Extract this ZIP and upload the **contents** of `holy-wedding-invitation` to the root of that repository. The GitHub repository root must contain `public`, `.github`, `server.js`, and `package.json`. GitHub's Web UI may hide dot-folders in some upload workflows; a `git push` from VS Code reliably includes `.github/workflows/deploy-pages.yml`.
4. If pushing from the local extracted project:

   ```bash
   git init
   git add .
   git commit -m "Deploy Vinay and Indira wedding invitation"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/vinny-weds-indira.git
   git push -u origin main
   ```

## Step 2 - Enable GitHub Pages

In the new repository: Settings > Pages > Build and deployment > Source: **GitHub Actions**. If GitHub Actions workflow isn't visible yet, the `git push` above triggers it. Check the **Actions** tab for the deployment result.

## Step 3 - Attach the domain on GitHub

Settings > Pages > Custom domain: `vinny-weds-indira.bfouru.com` > Save. Do this **before** setting your DNS record, to avoid dangling CNAME risks. The `public/CNAME` file is included for consistency but does **not** replace this GitHub Settings step when publishing with GitHub Actions.

## Step 4 - GoDaddy DNS

GoDaddy > bfouru.com > DNS > Add New Record:

- Type: `CNAME`
- Name: `vinny-weds-indira`
- Value: `suri-tituku.github.io` (assuming that is the actual owner of the new repository)
- TTL: `1 Hour`

Do **not** change `@`, `www`, `ai`, `email`, or existing DNS records.

## Step 5 - Enable HTTPS and test

On GitHub > Settings > Pages: wait until GitHub verifies the domain and issues an SSL certificate, then enable **Enforce HTTPS**.

Windows PowerShell DNS check:

```powershell
Resolve-DnsName vinny-weds-indira.bfouru.com -Type CNAME
```

Open `https://vinny-weds-indira.bfouru.com/` and test the envelope animation, venue links, countdown, **Add to Calendar** download, and share button on your phone.

## Notes

- The website's content says **Vinay & Indira**; the subdomain says **vinny-weds-indira**. This is okay if Vinny is Vinay's nickname.
- Date in the site is **5 November 2026 at 10:30 AM IST**.
- The maps use name-based searches; exact venue pins should be checked before sharing with guests.
- Publishing the repository on GitHub Free makes the source public and the wedding invitation accessible to anyone with the URL.
- `server.js` and `npm start` are only for local development; the public website is static.
