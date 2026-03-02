# Stage Coach – AI Speech Coach

Personal AI speech and presentation coaching app built with Next.js, Cloudflare, and Claude.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Auth**: Clerk
- **Database**: Cloudflare D1 (SQLite via REST API)
- **File Storage**: Cloudflare R2 (S3-compatible API)
- **Transcription**: Cloudflare Workers AI (Whisper)
- **AI Coaching**: Anthropic Claude API (claude-sonnet-4-6)
- **Charts**: Recharts
- **Icons**: Lucide React

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd "Stage Coach"
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |
| `CLOUDFLARE_ACCOUNT_ID` | Found in the Cloudflare dashboard URL or account overview |
| `CLOUDFLARE_API_TOKEN` | Create at dash.cloudflare.com/profile/api-tokens. Needs D1 Edit + R2 Edit + Workers AI permissions |
| `CLOUDFLARE_D1_DATABASE_ID` | The database ID from step 3 below |
| `CLOUDFLARE_R2_BUCKET_NAME` | The bucket name from step 4 below |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 API token Access Key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 API token Secret Access Key |
| `CLOUDFLARE_R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From your Clerk application dashboard |
| `CLERK_SECRET_KEY` | From your Clerk application dashboard |

### 3. Create Cloudflare D1 Database

```bash
npx wrangler d1 create stage-coach-db
```

Copy the `database_id` from the output into:
- `.env.local` as `CLOUDFLARE_D1_DATABASE_ID`
- `wrangler.toml` under `[[d1_databases]]`

Run the migration:

```bash
npm run db:migrate
```

For local testing:
```bash
npm run db:migrate:local
```

### 4. Create Cloudflare R2 Bucket

```bash
npx wrangler r2 bucket create stage-coach-recordings
```

Then create an R2 API token in the Cloudflare dashboard:
- Go to R2 → Manage R2 API Tokens
- Create token with "Object Read & Write" permission scoped to your bucket
- Copy the Access Key ID and Secret Access Key to `.env.local`

### 5. Set up Clerk

1. Create a free account at clerk.com
2. Create a new application
3. Copy the publishable key and secret key to `.env.local`
4. Set the redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### 6. Generate PWA icons

```bash
npm install canvas --save-dev
npm run generate-icons
```

### 7. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## App Structure

```
app/
  page.tsx              # Dashboard (/)
  onboarding/           # First-time setup flow
  session/
    new/                # Session setup
    record/             # Recording screen
    [id]/               # Scorecard
  history/              # Session history
  profile/              # User profile + badges
  api/
    user/               # GET/POST user profile
    sessions/           # GET sessions list + [id]
    upload/             # POST audio → R2 → Whisper → Claude → D1
    profile/            # PUT update profile
    badges/             # GET user badges

lib/
  types.ts              # Shared TypeScript types
  db.ts                 # Cloudflare D1 REST API wrapper
  r2.ts                 # Cloudflare R2 (S3) wrapper
  analyze-speech.ts     # Claude API + Workers AI Whisper
  xp.ts                 # XP calculation + level + streak logic
  check-badges.ts       # Badge checking + awarding

components/
  app-shell.tsx         # Page wrapper with nav
  nav/                  # Top nav (desktop) + Bottom nav (mobile)
  ui/                   # Score ring, level bar, badge cards
  onboarding/           # Multi-step onboarding flow
  session/              # Recorder, waveform, scorecard
  dashboard/            # Dashboard component
  history/              # History list + chart
  profile/              # Profile + badge grid
```

---

## Database Schema

Located in `migrations/001_create_tables.sql`. Three tables:
- `users` — profile, XP, streak, level
- `sessions` — recording metadata, scorecard data, transcript
- `badges` — earned badges with timestamps

---

## PWA

The app is installable on Android via Chrome. Requires:
- `/public/manifest.json` — Web App Manifest
- `/public/sw.js` — Service Worker (cache-first for assets, network-first for API)
- `/public/icons/icon-192.png` and `icon-512.png` — Generate with `npm run generate-icons`

---

## Local Dev Commands

```bash
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run lint             # ESLint
npm run generate-icons   # Generate PWA icons (requires canvas package)
npm run db:migrate       # Run D1 migration against remote database
npm run db:migrate:local # Run D1 migration against local wrangler dev DB
```
