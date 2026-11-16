# English+

English course platform: a sales page, packages with monthly or yearly payment, a student area,
and a teacher admin panel.

- `web/`: Next.js frontend (TypeScript, Tailwind CSS)
- `api/`: Node.js backend (TypeScript, Express, PostgreSQL through Drizzle)

## Run it

Requires Node.js 20 or later.

```bash
npm install
```

Copy `api/.env.example` to `api/.env` and set `TEACHER_EMAIL` and `TEACHER_PASSWORD`. That account
is created the first time the API starts, and only if no teacher exists yet.

```bash
npm run dev
```

- Website: http://localhost:3000
- Teacher panel: http://localhost:3000/admin
- Student area: http://localhost:3000/aluno

With no `DATABASE_URL`, the API keeps a real Postgres database in `api/.data`. With no
`MP_ACCESS_TOKEN`, checkout is simulated and no money moves. Delete `api/.data` to start over.

```bash
npm test -w api
```

## Who can do what

The API enforces this on every request; the pages only reflect it.

- **Teacher:** everything under `/admin`: students, follow-up, groups, calendar, packages, courses
  and payments. Nobody can sign up as a teacher.
- **Student:** their own packages, classes, shared notes and the courses in their paid packages.

Follow-up notes are private unless the teacher ticks "Mostrar para o aluno".

## Going live

Set these on the API, which refuses to start in production without the first two:

| Variable          | Value                                          |
| ----------------- | ---------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection link                     |
| `MP_ACCESS_TOKEN` | Mercado Pago private access token              |
| `WEB_URL`         | Public website address                         |
| `API_URL`         | Public API address, for payment notifications  |
| `NODE_ENV`        | `production`                                   |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional, for picking YouTube videos |

Set `API_URL` on the website too, pointing at the API.

## Payments

Yearly plans are one Mercado Pago Checkout Pro payment. Monthly plans are a Mercado Pago
subscription (`/preapproval`) that charges automatically.

Notifications arrive at `POST /api/webhooks/mercadopago`. They are never trusted: each one only
triggers a fresh read from Mercado Pago with the private token, in `api/src/lib/subscriptions.ts`.
Mercado Pago's docs don't publish the signature format, so it isn't checked.

## YouTube videos

In a lesson, "Escolher do YouTube" lists the videos on your channel so you can pick one; students
then watch it inside the lesson. Access is read-only: nothing is ever posted to YouTube. Connect
or disconnect the channel under **Minha conta**. Without this setup you can still paste links.

Students can't watch **private** videos, so the list doesn't let you pick them. Use **unlisted**
for videos only your students should find.

One-time setup, in [Google Cloud Console](https://console.cloud.google.com/):

1. Create a project, then under **APIs & Services → Library** enable **YouTube Data API v3**.
2. Under **OAuth consent screen**, choose **External**, fill in the app name and your email, and
   add your own Google account under **Test users**.
3. Under **Credentials → Create credentials → OAuth client ID**, choose **Web application** and
   add this **Authorized redirect URI**: `http://localhost:3000/admin/youtube/retorno` (and
   `<WEB_URL>/admin/youtube/retorno` for the live site).
4. Put the client ID and secret in `api/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`,
   and restart `npm run dev`.

While the consent screen is in "Testing", Google asks you to reconnect every 7 days. Publishing it
stops that; for read-only access to your own channel this doesn't need Google's review.

## Changing the database

Edit `api/src/db/schema.ts`, then run this. Migrations apply when the API starts.

```bash
npm run db:generate -w api
```

## Still on Lovable

Photos on the sales page and the `/qual-serie` quiz are still hosted there; see `web/src/lib/site.ts`.
They stop working if that site is taken down.

## Sales page text

Everything the home page says lives in `web/src/lib/landing-content.ts`. Anything written as
`fill("...")` shows on the page as a highlighted **[PREENCHER]** box: replace each one with real
information before launch. Right now that's the three lesson videos.
