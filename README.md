# BRIDGEit rebuild

Recreated from https://csr.errandatech.com/ using its original client component,
stylesheet, local DM Sans and Manrope fonts, logo, card artwork, tutor photographs, icons, and 18 sign videos.

## Supabase

Connected project: `jddnstvkfvpkhiafuydd` (BridgeiT).
The existing `community_videos` table and `community-videos` storage bucket are
used by the original library and upload code. Configuration is in `.env.local`;
only a browser-safe publishable key is used. No service-role key is used.
The public read endpoint returned HTTP 200 with zero visible records at verification.
No test uploads or database changes were made. Upload permissions remain governed
by the existing project policies. Authentication now uses Supabase email OTP for both sign-in and account creation,
with 8-digit verification (matching the existing project configuration), a 60-second
resend cooldown, persistent sessions, and sign-out. No password or ChatGPT flow remains.
Profiles, pledges, and connections are saved in this browser under each user ID;
they do not sync to the cloud. Supabase handles identity and community video access.
No live test account was created, and no OTP emails were sent.

### Email configuration

Custom SMTP is enabled in Supabase. The Magic link or OTP and Confirm sign up
templates were saved with subject `Your BRIDGEit sign-in code` and numeric
`{{ .Token }}` content. The local `VITE_SUPABASE_EMAIL_OTP_READY` flag is enabled.
Code verification does not require redirect allowlist entries.
The template source is in `supabase/email-otp.html`; the saved live version uses
the same wording and token in a simpler HTML layout.
Inbox delivery has not been tested with a live recipient.

Never expose SMTP credentials or a service-role key in this frontend.

Auth regression checks: `node --test tests/auth.test.mjs tests/sites-worker.test.mjs`.

## Repair

The original video enhancement observer watched `preload` and rewrote that
attribute on every callback, causing an endless mutation loop. The rebuild only
writes a changed value. Video poster lookup now selects the enclosing card.
Unavailable optional MOV fallback URLs were removed; all 18 MP4 videos are local.

## Run

Install with npm install, then npm run dev -- --host 127.0.0.1 --port 4173.
Build with npm run build. A private deployment is not created by this local clone.
