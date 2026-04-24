# Image Uploader PWA

A minimal Progressive Web App for uploading and previewing images. It works offline after the first load and can be installed on mobile or desktop.

## Files

- `index.html` — App shell and UI
- `styles.css` — Styling
- `app.js` — Upload logic, drag/drop, service worker registration
- `manifest.json` — PWA manifest (name, icons, theme, display)
- `service-worker.js` — Offline caching (cache-first for assets, network-first for navigations)
- `icons/` — Placeholder 192×192 and 512×512 icons

## Run locally

Service workers require HTTPS or `localhost`. Serve the folder with any static server:

```bash
# Python (built in on macOS)
python3 -m http.server 8080

# or Node
npx serve .
```

Then open http://localhost:8080 in your browser.

## Install as a PWA

1. Open the site in Chrome, Edge, or Safari.
2. Use the browser's "Install app" / "Add to Home Screen" option.
3. Launch from your home screen or app launcher — it runs standalone.

## Notes

- Max upload size is enforced client-side at 10 MB (tune in `app.js`).
- The icons are simple placeholders; replace the PNGs in `icons/` with your own brand assets before shipping.
- No backend is included — previews are created via `URL.createObjectURL` and never leave the device.
