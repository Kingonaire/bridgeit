# OTP email delivery repair

Gmail rejected the initial OTP emails with SMTP error 550-5.7.26 because
`includemesurulere.world` failed both SPF and DKIM.

With user approval, the authoritative Namecheap BasicDNS records were updated:

- Existing SPF at `@` was merged to `v=spf1 ip4:162.213.255.79 include:spf.web-hosting.com include:spf.efwd.registrar-servers.com ~all`.
- Added TXT `default._domainkey` with the exact public DKIM key supplied by cPanel for this domain.

Both records were verified directly against `dns1.registrar-servers.com`.
The website records, mail forwarding configuration, and SMTP credentials were not changed.
A fresh OTP request is needed after DNS caches refresh; inbox delivery must be verified by the recipient.
