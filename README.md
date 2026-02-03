# Saree & Dhoti E-Commerce

Small frontend-first e-commerce with Firebase backend (Firestore + Auth + Storage) and a Firebase Cloud Function for Razorpay webhook verification.

Key features
- Admin product management (add/edit/delete + image upload to Firebase Storage)
- Real-time products with Firestore
- Cart & Checkout with Razorpay integration
- Order management & analytics for admins
- Razorpay webhook verification (Cloud Function)
- Firestore rules with RBAC for admin roles

Deployment notes (quick)
1. Add Firebase config to `js/firebase.js`.
2. Update `firestore.rules` owner email.
3. Deploy rules: `firebase deploy --only firestore:rules storage`.
4. Set Razorpay secret and deploy function:
   - `firebase functions:config:set razorpay.secret="YOUR_SECRET"`
   - `cd functions && npm install`
   - `firebase deploy --only functions:razorpayWebhook`

See `NOTES.md` and `functions/README.md` for more details.
