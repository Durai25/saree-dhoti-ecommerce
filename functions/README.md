Razorpay Webhook Function

Overview
- `razorpayWebhook` is an HTTPS Cloud Function that verifies Razorpay webhook signature using the secret set in Firebase Functions config.
- On verified `payment.captured` events it marks matching `orders` (where `paymentId` equals Razorpay payment id) as `paymentStatus: 'Paid'`.

Setup
1. Set functions config with your Razorpay secret:
   firebase functions:config:set razorpay.secret="YOUR_SECRET"

2. Install dependencies and deploy:
   cd functions
   npm install
   firebase deploy --only functions:razorpayWebhook

Security Notes
- Do NOT commit your Razorpay secret to the repo.
- Use `firebase functions:config:set` (or equivalent secret manager) to store it.

Testing
- You can simulate webhooks from Razorpay dashboard (Test mode) or send a signed payload to the function endpoint (verify signature generation with your secret).
