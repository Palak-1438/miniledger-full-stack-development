# MiniLedger

MiniLedger is a small personal ledger for tracking money lent to friends. It includes a phone + mock OTP login flow, a dashboard for loan entries, repayment tracking, summary totals, overdue highlighting, and PostgreSQL persistence.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- PostgreSQL via `pg`
- Tailwind CSS 4
- Lucide icons

## Local development

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app expects a PostgreSQL connection string in `DATABASE_URL`. The `loans` table should include:

- `id`
- `phone`
- `friend_name`
- `amount`
- `due_date`
- `repaid_at`
- `receipt_url` (optional)

The phone login is intentionally a mock flow for development. In a production implementation, generate and verify an OTP on the server and deliver it through an SMS provider. Never rely on client-side OTP validation for real authentication.

## API

All endpoints are implemented in `app/api/loans/route.ts` and use parameterized PostgreSQL queries.

### List loans and summary

```http
GET /api/loans?phone=%2B15551234567
```

Returns the user's loan entries and:

- `totalLent`
- `totalRepaid`
- `overdueAmount`

### Add a loan

```http
POST /api/loans
Content-Type: application/json

{
  "phone": "+15551234567",
  "friendName": "Sam Lee",
  "amount": 125,
  "dueDate": "2026-12-01",
  "receiptUrl": null
}
```

### Mark a loan as repaid

```http
PATCH /api/loans
Content-Type: application/json

{
  "id": "loan-id",
  "phone": "+15551234567"
}
```

Inputs are validated on the server, including phone number, friend name length, positive amount, date format, and receipt URL length.

## Scripts

```bash
pnpm dev       # Start the development server
pnpm build     # Create a production build
pnpm start     # Start the production server
```

## Project structure

```text
app/
  api/loans/route.ts   # PostgreSQL-backed loan API
  layout.tsx           # Metadata and global layout
  page.tsx             # Login and ledger dashboard UI
  globals.css          # Tailwind and global styles
next.config.mjs        # Security headers and Next.js configuration
```

## Production considerations

Before shipping, replace the mock OTP with a server-side OTP service, add rate limiting and expiration for verification codes, use a real authentication/session strategy, and add automated API/database tests. Keep `DATABASE_URL` configured through the deployment platform's environment variables rather than committing secrets.
