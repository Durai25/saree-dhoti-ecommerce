const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp();

const app = express();
// capture raw body
app.use(bodyParser.raw({ type: '*/*' }));

app.post('/', async (req, res) => {
  const secret = functions.config().razorpay && functions.config().razorpay.secret;
  if (!secret) {
    console.error('Missing razorpay.secret in functions config');
    return res.status(500).send('Server not configured');
  }

  const signature = req.headers['x-razorpay-signature'];
  const generated = crypto.createHmac('sha256', secret).update(req.body).digest('hex');

  if (!signature || signature !== generated) {
    console.warn('Invalid signature', signature, generated);
    return res.status(400).send('Invalid signature');
  }

  let event;
  try { event = JSON.parse(req.body.toString()); } catch (e) { console.error('invalid json', e); return res.status(400).send('Invalid JSON'); }

  try {
    // For razorpay payment captured events
    if (event.event === 'payment.captured' || (event.payload && event.payload.payment && event.payload.payment.entity && event.payload.payment.entity.status === 'captured')) {
      const paymentId = event.payload.payment.entity.id;
      const db = admin.firestore();
      const snaps = await db.collection('orders').where('paymentId','==',paymentId).get();
      if (!snaps.empty) {
        const batch = db.batch();
        snaps.forEach(s => batch.update(s.ref, { paymentStatus: 'Paid', paymentCapturedAt: admin.firestore.FieldValue.serverTimestamp() }));
        await batch.commit();
        console.log('Orders updated for paymentId', paymentId);
      } else {
        console.log('No order found for paymentId', paymentId);
      }
    }
  } catch (e) {
    console.error('processing webhook failed', e);
    return res.status(500).send('Processing failed');
  }

  res.status(200).send('OK');
});

exports.razorpayWebhook = functions.https.onRequest(app);
