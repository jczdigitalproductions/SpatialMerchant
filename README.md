# Spatial Merchant

Spatial Merchant is a mixed-reality product showroom built with Next.js, React Three Fiber, Three.js, and WebXR. Alongside the Sora sculptural vase collection, it features protein and molecular design visualization, with potential applications in drug discovery research, education, and the development of models for 3D printing. A separate general showroom offers sample objects and a molecule-inspired collectible.

![Spatial Merchant showroom screenshot](demo/spatial-merchant-screenshot.png)

## Demo video

https://youtu.be/vOq6yf1K_Qg

https://spatial-merchant.vercel.app/

## Getting started

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Both `npm run dev` and `npm start` use port **3001**. The general catalog is available at [http://localhost:3001/showroom](http://localhost:3001/showroom).

To run a production build locally:

```bash
npm run build
npm start
```

If port 3001 is already occupied, stop the existing server before starting another one. If the temporary demo copy is still running on that port, stop it before launching this project.

## Pages

- `/` — Sora Sculptural Objects showroom. Select one of the three vase designs, change its finish, adjust scale, toggle dimensions and turntable rotation, or launch AR/VR on a supported device.
- `/showroom` — General product catalog with search, categories, procedural 3D previews, favorites, Amazon search links, and a demo shopping bag.

WebXR requires a compatible browser and device. Deployed sites must use HTTPS. Local development can use `localhost`.

## Molecule import

On `/`, choose **Design Custom Molecule in v0** to open the molecule bridge. The v0 editor link opens in a separate tab. The bridge does not connect to v0 or import its project automatically: to bring in atom coordinates, paste JSON in this shape:

```json
{
  "atoms": [
    { "id": "C1", "element": "C", "position": [0, 0, 0], "radius": 0.038 },
    { "id": "O1", "element": "O", "position": [0.1, 0, 0], "radius": 0.034 }
  ],
  "bonds": [[0, 1]]
}
```

Supported elements are `C`, `N`, `O`, `H`, `S`, `P`, `F`, and `Cl`. Bond pairs refer to atom-array indices. The bridge validates the input and limits imported structures to 200 atoms and 400 bonds. If no JSON is supplied, a sample lattice is used; a formula by itself does not generate a chemically accurate structure.

Imported molecules are added to the current page session and rendered as atom spheres connected by bonds. They are not saved to the catalog or database. The order endpoint records order details, not molecular coordinates.

## API

- `GET /api/catalog` returns the sample general showroom catalog.
- `GET /api/cart` loads a cart. `POST /api/cart` adds an item and `DELETE /api/cart` removes one. These endpoints require a valid `x-cart-id` request header.
- `POST /api/orders` records a Sora product or custom molecule order. Send JSON with `productId`, `name`, and `finish`. Sora product prices and finishes are checked against the catalog. Custom molecule orders use a fixed demo price of $340 and the supported custom finish names. The endpoint does not charge a payment method or place a fulfillment order.

## Optional Neon persistence

Without a database URL, carts and orders use in-process memory. This is suitable for a local demo only: data is temporary and may not be shared across serverless instances.

For Neon Postgres persistence, set `DATABASE_URL` in a private `.env.local` file:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The cart and order APIs create their tables when first used, so the database role must be allowed to create tables. Keep `.env.local` private and do not commit it.

## Catalog and commerce notes

The products are sample data and are not connected to Shopify. Amazon links open product search results; prices and availability are provided by Amazon and are not synchronized with this showroom. The general showroom's bag is a demo cart, and the Sora “Acquire” action records a demo order only. No payment, checkout, or fulfillment provider is configured.

## Commands

```bash
npm run dev        # Start the development server on port 3001
npm run build      # Create a production build
npm start          # Serve the production build on port 3001
npm run typecheck  # Run TypeScript checks
npm run lint       # Run ESLint
```

## Project structure

```text
app/
  api/catalog/route.ts  General showroom catalog endpoint
  api/cart/route.ts     Session cart API
  api/orders/route.ts   Sora and custom molecule demo orders
  showroom/page.tsx     General showroom route
  globals.css           Global and showroom styles
  layout.tsx            Root layout and metadata
  page.tsx              Sora collection home page
components/
  SoraCollectionPage.tsx  Sora collection UI and order controls
  Showroom.tsx            General catalog, HUD, and cart
  V0MoleculeBridge.tsx    Custom molecule import dialog
  xr/XRScene.tsx          General and Sora WebXR scenes
  xr/SoraVaseMesh.tsx     Procedural vase and atom/bond models
lib/
  catalog.ts              Product types and sample collections
  cart.ts                 Neon cart persistence and memory fallback
```


## Presentation demo video

The local [Spatial Merchant presentation demo](demo/Spatial-Merchant-Demo.mp4) is a 2-minute 27-second, narrated 1080p walkthrough using captured application screens. It covers the Sora collection, finishes, scale inspection, WebXR entry points, custom molecule import, catalog filtering, favorites, and the demo shopping bag.

The video is stored at `demo/Spatial-Merchant-Demo.mp4` and excluded from Git by `.gitignore`. It is a local presentation asset: fresh clones do not include it. The video explains device requirements for AR/VR and the demo-only commerce behavior.
