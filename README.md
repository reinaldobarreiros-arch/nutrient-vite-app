# Nutrient Web SDK + DWS Processor (React + Vite)

A React + Vite app that embeds the Nutrient Web SDK viewer (`@nutrient-sdk/viewer`) and calls
Nutrient DWS Processor API (`@nutrient-sdk/dws-client-typescript`) from the Vite server.

## Setup

```bash
npm install
cp .env.example .env.local   # then add your keys
npm run dev
```

Open http://localhost:5173/.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_NUTRIENT_LICENSE_KEY` | Browser | Web SDK license key. Without it the viewer runs in trial mode with a watermark. |
| `NUTRIENT_API_KEY` | Vite server only | DWS Processor API key. Never sent to the browser. |

## Features

- **Open PDF** (toolbar): open a PDF from your computer.
- **DWS dropdown** (toolbar): send the current document, including annotations, to DWS Processor
  and load the result: OCR, flatten annotations, compress, rotate.

## How DWS is wired

`server/dwsPlugin.ts` adds `POST /api/dws/:action` to the Vite dev and preview servers. To add an
operation, add it to `src/dws.ts` (toolbar label) and `server/dwsPlugin.ts` (DWS call).

The endpoint only exists in `npm run dev` and `npm run preview`. For production hosting, move the
handler in `server/dwsPlugin.ts` to your backend.
