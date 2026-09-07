# SmartProcure

SmartProcure is a Smart India Hackathon landing page concept for an AgriTech and GovTech procurement management platform for Indian farmers.

## Run locally

The project is a static HTML, CSS, and JavaScript site. From this folder, run:

```powershell
python -m http.server 4173
```

Open `http://localhost:4173/index.html` in a browser. You can also open `index.html` directly, but a local server is recommended for browser testing.

## Current build stage

This build is focused on Step 3: the Home page. It includes the hero, static farmer dashboard preview, six feature cards, and responsive navigation. Dashboard actions open separate detail-style views and return to Home with a back button. Login, booking, status, notifications, centers, and recommendations are frontend demo views only; the full Farmer Dashboard workflow is planned for the next step.

## Test the page

- Check the sticky header and responsive hamburger menu at a mobile width.
- Confirm the static dashboard appears directly below the hero.
- Click dashboard actions such as `Centers`, `How it works`, `Book Slot`, and `Notifications`.
- Use `Back to Home` to return to the landing page and dashboard preview.
- Verify that sample values are labeled as demo/example content before connecting live APIs.

## Backend integration points

The current page intentionally uses frontend demo data. Replace the static content in these areas with API responses later:

- `.map-preview` and `.center-card`: center coordinates, crop acceptance, status, hours, and waiting time.
- `.dash-token`, `.dash-stats`, and `.dash-status`: farmer token, appointment, queue, status, and payment state.
- `.impact-grid`: measured platform outcomes rather than example targets.
- `script.js` demo actions: connect `Find Centers Near Me` and `View on Map` to geolocation, center-search, and maps endpoints.

Keep API data in a separate module or service layer when the backend is added so the presentation markup remains reusable.