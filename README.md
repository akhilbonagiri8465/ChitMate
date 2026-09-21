# ChitMate Backend

ChitMate uses Supabase as its backend option.

## Why Supabase

- PostgreSQL for groups, cycles, members, payments, auctions, ledger entries, and reminders
- Supabase Auth for organizer, staff, and member access
- Row-level security for organization data isolation
- Storage for private KYC documents
- Realtime payment and collection updates
- Edge Functions or scheduled jobs for reminders and PDF generation

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase-schema.sql`.
3. Create an organization and membership for the first authenticated user.
4. Inject the browser-safe project URL and anon key before `supabase-client.js`:

```html
<script>
  window.CHITMATE_SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_PUBLIC_ANON_KEY'
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="backend/supabase-client.js"></script>
```

5. Load the React app after those scripts.

Never expose a Supabase service-role key in frontend code. Use an Edge Function for privileged operations such as bulk reminders, PDF generation, or administrator-only corrections.

## Planned Edge Functions

- `send-payment-reminders`: sends SMS, WhatsApp, or email reminders for pending payments.
- `generate-member-passbook`: creates a signed PDF passbook from payments and ledger entries.
- `settle-auction`: validates bid, commission, dividend, winner, and ledger entries in one transaction.
- `close-cycle`: verifies collections, creates the next cycle, and rolls advances or arrears forward.
