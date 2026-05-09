# gng-confirmations

Small **Next.js** service that reads the current harvest from **Airtable** and exposes a **public JSON API** for a **SquareSpace** RSVP thank-you page. The SquareSpace page runs in the subscriber’s browser, calls this API, and shows harvest name, date, and time with a light celebration animation.

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
    "endTime": "2:00pm"
  }
}
```

If nothing matches the configured filter, `harvest` is `null`.

### Specific harvest (recommended for form redirect)

`GET /api/public/harvest?recordId=recXXXXXXXX`

Use this when the thank-you URL includes the harvest record id (see **Airtable redirect** below) so subscribers always see the harvest they RSVPed for.

## Which row is “current”?

By default the service loads the single most recently modified harvest where:

`OR({Status} = 'Publish', {Status} = 'Published')`

matching the mix of status labels used in `gng-dashboard`. Override with `AIRTABLE_CURRENT_HARVEST_FILTER` (a full Airtable formula).

## Environment variables

See `.env.example`. Use the same `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and harvest table name as `gng-dashboard`.

Optional:

- `AIRTABLE_CURRENT_HARVEST_FILTER` — custom `filterByFormula`
- `PUBLIC_ALLOWED_ORIGINS` — comma-separated list; if set, browser `Origin` must match one entry (curl without `Origin` still works)

## Deploy

Typical: deploy this folder to [Vercel](https://vercel.com) as its own project. Set env vars in the project settings, then note the production URL (for example `https://gng-confirmations.vercel.app`).

## SquareSpace page

1. Create a dedicated thank-you page.
2. Paste the contents of `squarespace/confirmation-embed.html` into a **Code** block.
3. Replace `https://YOUR-API-HOST-HERE` with your deployed API origin (no trailing slash).

Tune fonts and colors in the `<style>` block to match your site.

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
