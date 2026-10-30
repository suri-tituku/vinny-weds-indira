# Vinay & Indira — Animated Holy Wedding Invitation 💒

A mobile-first wedding invitation website inspired by the supplied printed invitation, with a 3D envelope opening, floating flower petals, scroll-reveal animations, an IST wedding countdown, Google Maps directions, calendar download, and native mobile sharing.

## తెలుగులో — మీ కంప్యూటర్‌లో ఎలా ఓపెన్ చేయాలి?

1. ZIP file **Extract All** చేయండి.
2. **Node.js** install చేయండి: https://nodejs.org/
3. Extract చేసిన `holy-wedding-invitation` folder ని **VS Code** లో open చేయండి.
4. **Terminal → New Terminal** లో `npm start` command run చేయండి.
5. Browser లో **http://localhost:3000** open చేసి, **envelope** మీద click చేయండి.
6. Mobile లో చూడాలంటే PC, mobile రెండూ ఒకే Wi-Fi లో connect అయి ఉండాలి. Windows `ipconfig` లో PC Wi-Fi IPv4 address చూసి, mobile browser లో `http://PC-IP:3000` open చేయండి.
7. ఇతరులకు WhatsApp‌లో **public website link** పంపాలంటే `public` folder ని Netlify లేదా GitHub Pages లో host చేయాలి. `localhost` link మీ computer లో మాత్రమే పనిచేస్తుంది.

**మార్చాలనుకున్న details** `public/index.html` లో ఉన్నాయి. Colors, animations `public/styles.css` లో ఉన్నాయి.

## Start on Windows / Mac / Linux

1. Install **Node.js 18+** from https://nodejs.org/ if not installed.
2. Open this folder in **VS Code**.
3. Open **Terminal → New Terminal**.
4. Run:

   ```bash
   npm start
   ```

5. Open **http://localhost:3000** in Chrome (or on your PC).
6. Tap/click the envelope or **Open Invitation**.

**No npm install is needed:** the Node server uses built-in modules only.

## View on your mobile

Make sure your phone and computer are on the **same Wi-Fi**. On Windows, run `ipconfig`, find the computer's Wi-Fi **IPv4 Address**, and open `http://YOUR-PC-IP:3000` on the phone (e.g. `http://192.168.1.5:3000`). Allow Node.js through the firewall if prompted. This local link works only on your Wi-Fi network.

## Make a public invite link

For guests who are not on your Wi-Fi, put the website online. Since all UI files are static, you can also upload the contents of the **public** folder to **Netlify Drop, GitHub Pages, or Cloudflare Pages**, or host the entire Node.js project on a platform that supports Node.js (for example, Render). Then the Share Invitation button can share a public link.

## Files

- `server.js` — lightweight Node.js server (PORT environment variable supported)
- `public/index.html` — invitation content and SEO
- `public/styles.css` — mobile design, 3D envelope, animations
- `public/script.js` — opening, countdown, petals, reveals, share
- `public/wedding.ics` — calendar entries (ceremony and lunch)
- `public/assets/*.svg` — custom floral, church, and cross graphics
- `reference/original-invitation.jpg` — your uploaded invitation for reference (not used as the site background)

## Customize

- **Names / family / ceremony text**: edit `public/index.html`.
- **Date**: update the displayed date in `public/index.html`, the `weddingTime` value in `public/script.js`, and the events in `public/wedding.ics`.
- **Colors**: change `--burgundy`, `--gold`, etc. at the beginning of `public/styles.css`.
- **Map**: edit the two Google Maps search URLs in `public/index.html` to add exact venue pins once verified. Currently the directions buttons search by venue name and area.
- **Font**: The page requests Great Vibes, Cormorant Garamond, and DM Sans from Google Fonts. Fallback fonts are used without an internet connection.

## Notes

- Time for the wedding is **5 November 2026 at 10:30 AM IST**.
- The automatic countdown accounts for India's +05:30 time offset, regardless of the visitor's timezone.
- The `.ics` lunch event has a **provisional two-hour duration**, since the printed invitation only states lunch starts at 12:00 PM.
- `?preview=1` or `?open=1` opens the invitation directly for design preview; the standard homepage starts with the 3D envelope.
- Animations respect the user's system **reduced motion** preference.
