import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.trackOrder = async function(){
  const phone = document.getElementById('phone').value.trim();
  const orderId = document.getElementById('orderId').value.trim();
  let q;
  if(orderId) {
    q = query(collection(db, "orders"), where("paymentId","==",orderId));
  } else {
    q = query(collection(db, "orders"), where("phone","==",phone));
  }

  const snapshot = await getDocs(q);
  result.innerHTML = "";
  if(snapshot.empty){
    result.innerHTML = "❌ No order found";
    return;
  }

  snapshot.forEach(doc => renderOrder(doc.data()));
};

function renderOrder(o){
  let itemsHTML = "";
  (o.items||[]).forEach(p => itemsHTML += `<li>${p.name} - ₹${p.price}</li>`);

  result.innerHTML = `
    <div style="border:1px solid #ccc;padding:15px">
      <h3>Order ID: ${o.paymentId || 'N/A'}</h3>
      <p>Status: <b>${o.orderStatus || o.status || 'Pending'}</b></p>
      <p>Total: ₹${o.total}</p>
      <ul>${itemsHTML}</ul>
    </div>
  `;
}
