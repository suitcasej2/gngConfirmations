# gng-confirmations

Small **Next.js** service that reads the current harvest from **Airtable** and powers a **SquareSpace** RSVP thank-you experience. Prefer the **iframe embed** (`/embed/rsvp-thanks`): SquareSpace renders your page, while harvest details are **server-rendered on Vercel**—no `fetch()` or third-party scripts required on SquareSpace (avoids strict CSP). A **JSON/JSONP API** remains available for other hosts.

Because each page load queries Airtable (with `Cache-Control: no-store`), the content tracks whatever the CEO last published—no separate database or manual sync.

## API

`GET /api/public/harvest`

Returns:

```json
{
  "ok": true,
  "harvest": {
    "recordId": "rec…",
    "name": "Spring Greens Box",
    "startDate": "2026-05-15",
    "startTime": "10:00am",
    "endTime": "2:00pm",
    "headerImageUrl": "https://…"
  }
}
```

If nothing matches the configured filter, `harvest` is `null`.

### Specific harvest (recommended for form redirect)

`GET /api/public/harvest?recordId=recXXXXXXXX`

Use this when the thank-you URL includes the harvest record id (see **Airtable redirect** below) so subscribers always see the harvest they RSVPed for.

### JSONP (SquareSpace–friendly)

`GET /api/public/harvest?callback=YourGlobalFn`

Returns **JavaScript**: `YourGlobalFn({"ok":true,"harvest":{…}});` with `Content-Type: application/javascript`.

Some SquareSpace templates block **both** `fetch()` and external `<script src>`. Use the **iframe** embed instead of JSONP. The callback name must match `/^[a-zA-Z_$][a-zA-Z0-9_$]{0,63}$/`.

## Which row is “current”?

By default the service loads the single most recently modified harvest where **`Status` is `Sent`**, matching the live “sent” cycle in `gng-dashboard`. Override with `AIRTABLE_CURRENT_HARVEST_FILTER` if your base uses a different label.

If the API returns `"harvest": null`, no row is `Sent` yet, or the option text in Airtable does not match exactly (including spaces).

For RSVPs **before** a harvest is marked `Sent`, use **`/api/public/harvest?recordId=rec…`** (and the same query param on your SquareSpace thank-you URL) so the page still resolves a specific harvest.

## Environment variables

See `.env.example`. Use the same `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and harvest table name as `gng-dashboard`.

Optional:

- `AIRTABLE_CURRENT_HARVEST_FILTER` — custom `filterByFormula`

The public harvest API always sends `Access-Control-Allow-Origin: *` so SquareSpace and custom domains can call it without extra CORS configuration.

## Deploy

Typical: deploy this folder to [Vercel](https://vercel.com) as its own project. Set env vars in the project settings, then note the production URL (for example `https://gng-confirmations.vercel.app`).

## SquareSpace page (recommended)

1. Create a dedicated thank-you page.
2. Open `squarespace/confirmation-embed.html`, replace `YOUR_VERCEL_HOST` with your deployment hostname (e.g. `gng-confirmations.vercel.app`—keep the existing `https://` in the `src`).
3. Paste the **`<link>` preconnect lines and the iframe `<div>…</div>`** into a **Code** block (replace every `YOUR_VERCEL_HOST`). If SquareSpace strips `<link>` tags from Code blocks, add the same two lines under **Settings → Advanced → Code Injection → Header** for that page only.

The iframe loads **`/embed/rsvp-thanks`**, which reads Airtable on the server and returns HTML + CSS (celebration animation, optional **Header Image URL** hero). Response headers allow embedding from any parent (`Content-Security-Policy: frame-ancestors *`).

**Speed:** preconnect + `loading="eager"` on the iframe, a **loading skeleton** (`loading.tsx`), a **short server cache** for Airtable (default **45s**, `EMBED_CACHE_SECONDS`), and a **narrow `fields[]`** on the “current Sent harvest” query reduce wait time on repeat views and slightly on first load.

If your template still blocks iframes to external sites (rare), you must relax that in SquareSpace or use a **custom domain** on Vercel and try again.

## Airtable form redirect

In the form’s **Redirect to URL** setting, point to your SquareSpace thank-you page. To pass the harvest record:

- Prefer a URL that includes the record id, for example  
  `https://yourdomain.com/rsvp-thanks?recordId=recXXXXXXXX`
- How you obtain `recXXXXXXXX` depends on your base: hidden linked-record field, automation that writes a share URL, or a formula field exposed to the form. If the form is **per-harvest** (one form per harvest), you can paste the static `recordId` into that redirect URL.

If you omit `recordId`, the page uses the **latest** harvest matching the default filter—fine when only one harvest is open at a time.

## Local development

```bash
cd gng-confirmations
cp .env.example .env
# fill in Airtable vars
npm install
npm run dev
```

API: `http://localhost:3001/api/public/harvest`

## Middleware note

There is no write path and no long-lived cache: Airtable remains the source of truth. An Airtable **automation webhook** is optional; it would only help if you later add caching or edge revalidation. For the current design, publishing in Airtable is enough for the next page view to show updated details.
