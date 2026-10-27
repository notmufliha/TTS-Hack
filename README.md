# TTSH ICH Smart Referral Triage

Referral triaging for the Tan Tock Seng Hospital Integrated Care Hub Patient Service Office (ICH PSO).

- **Automated readiness screening.** A PSA clicks *Start Screening* on a referral. The app reads the patient's latest medical history, imaging appointments due in the next 3 days, and swab results straight from the database. It applies the ICH readiness checklist and records the outcome. It also produces a PDF checklist, so no paper-to-Excel transcription is needed.
  - **Rejected:** any exclusion criterion is present (IV chemo/radiotherapy, dialysis, parenteral nutrition, psychiatric/behavioural issues, suicidal precaution, BIPAP/CPAP, or tracheostomy suctioning 4-hourly or more often).
  - **Escalated to clinician:** a vital is out of range or not recorded, or imaging is due within 3 days. The clinician then accepts or rejects in the app.
  - **Accepted:** all criteria are met. Swab results add isolation and swab-on-transfer-day recommendations.
- **Monthly report** (`/reports`): referral outcomes, referral-to-review and referral-to-decision turnaround times, rejection reasons, estimated staff time saved, and CSV export.

The app is a single Next.js app in `frontend/`. The API lives in Next.js route handlers under `frontend/src/app/api`, and the data is in PostgreSQL.

## Run locally

```bash
cd frontend
cp .env.example .env.local   # fill in your database details
npm install
npm run dev
```

## Deploy to Vercel

1. Import the GitHub repo in Vercel and set **Root Directory** to `frontend`.
2. Add `DATABASE_URL` (or the `DB_*` variables) under Project → Settings → Environment Variables.
3. Deploy.
