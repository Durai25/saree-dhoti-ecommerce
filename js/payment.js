import { db } from "./firebase.js";
import { addDoc, collection } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.payNow = async function(){
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(!cart.length) return alert('Cart is empty');

    const customerNameEl = document.getElementById('name');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');

    const customerName = customerNameEl?.value?.trim();
    const phone = phoneEl?.value?.trim();
    const address = addressEl?.value?.trim();

    if(!customerName || !phone || !address) return alert('Please fill all checkout fields');
    if(!/^[6-9]\d{9}$/.test(phone)) return alert('Invalid phone number');

    // Recalculate total from cart (do not trust client-provided total)
    const total = cart.reduce((s,p)=>s + Number(p.price || 0), 0);
    const amountPaise = total * 100;

    const options = {
      key: "RAZORPAY_KEY",
      amount: amountPaise,
      currency: "INR",
      name: "Saree & Dhoti Store",
      description: "Purchase",
      prefill: { name: customerName, contact: phone },
      handler: async function(res){
        if(!res || !res.razorpay_payment_id) return alert('Payment not verified');

        const order = {
          customerName,
          phone,
          address,
          items: cart,
          total,
          paymentId: res.razorpay_payment_id,
          paymentStatus: 'Paid',
          orderStatus: 'Pending',
          createdAt: new Date()
        };

        // Save order
        await addDoc(collection(db,"orders"), order);

        // Reduce stock for each item (best-effort)
        try {
          const { doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
          for(const item of cart){
            const ref = doc(db, 'products', item.id);
            const snap = await getDoc(ref);
            if(snap.exists()){
              const currentStock = Number(snap.data().stock || 0);
              if(currentStock > 0){
                await updateDoc(ref, { stock: currentStock - 1 });
              }
            }
          }
        } catch(e){ console.warn('Stock update failed', e); }

        localStorage.removeItem('cart');
        alert('Payment successful and order placed');
        location.href = 'index.html';
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(){ alert('Payment failed. Try again.'); });
    rzp.open();

  } catch (err) {
    console.error(err);
    alert('Something went wrong: ' + (err.message || err));
  }
};

/*
🔒 NOTE:
- NEVER save order before payment success
*/
