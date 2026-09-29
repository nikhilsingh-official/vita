# Project Vita

Website and point of sale for Project Vita's student-run food stalls. Nuxt, Firebase (Firestore and Auth), hosted on Firebase App Hosting.

- `/` and `/stall/:slug`: the public notice board, rendered on the server from published stalls.
- `/admin`: stalls, partners and the POS. Sign in with Google; access is limited to the emails in the `admins` collection. Works offline and syncs when the connection returns.

## Development

Needs Node 22.19+, pnpm and Java 21 (Firebase emulators).

```sh
pnpm install
cp .env.example .env   # add your email to ADMIN_EMAILS
pnpm emulators         # Auth + Firestore emulators, UI on http://127.0.0.1:4000
pnpm dev               # http://localhost:3000
```

The dev server fills an empty emulator from `scripts/seed/` on first request. `pnpm seed` does the same explicitly. In the emulator, "Sign in with Google" opens a test account picker; use an email from `ADMIN_EMAILS`.

The emulators run as the `demo-vita` project, so development never touches production.

## Data

| Collection | Contents |
|---|---|
| `stalls/{slug}` | Title, date, status (`upcoming` or `completed`), `published`, `pinned`, `sortOrder`, story, partner name, impact figures, menu (`name`, `category`, `costPrice`, `price`), photos |
| `stalls/{slug}/orders` | POS orders: items, total, payment, register session |
| `partners/{id}` | Partner name and description; `id` is the slugified name |
| `admins/{email}` | Who can use `/admin` |

Only one stall is pinned at a time; it is featured on the home page, otherwise the upcoming stall is. Stall photos live in `public/stalls/<slug>/`.

`firestore.rules`: anyone can read published stalls and partners, only admins can write.

`scripts/seed/stalls.json` was built from the original records with `pnpm import:data` (Python 3, `openpyxl`). The records in `sources/` are not committed.

## POS

Open `/admin/pos`, pick a stall with a priced menu and take orders on the register. Payments are cash or UPI; the receipt prints on a 58mm thermal printer through the browser's print dialog (margins off, scale 100%). Register totals start at zero for each session and survive a reload. Closing the register starts a new session.

## Testimonials

Images go in `public/testimonials`, with alt text in `app/data/testimonials.js`.

## Deploying

Project: `vita-35822` (`.firebaserc`), web config in `apphosting.yaml`.

- Rules: `pnpm exec firebase deploy --only firestore:rules`
- Add an admin: `ADMIN_EMAILS=name@example.com NUXT_PUBLIC_FIREBASE_PROJECT_ID=vita-35822 node scripts/seed-firestore.mjs --production` (needs `gcloud auth application-default login`)
- Hosting: connect the repository in Firebase console, App Hosting. Nuxt is detected automatically.
