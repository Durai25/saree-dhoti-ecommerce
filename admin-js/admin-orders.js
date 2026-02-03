import { db } from "../js/firebase.js";
import { collection, onSnapshot, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onSnapshot(collection(db, "orders"), snap => {
  orders.innerHTML = "";
  snap.forEach(o => {
    const d = o.data();
    orders.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin-bottom:8px">
        <b>${d.customerName}</b> | ₹${d.total}<br>
        ${d.phone}<br>
        Payment: ${d.paymentStatus || 'N/A'}<br>
        Status: ${d.orderStatus || 'Pending'}
        <br>
        <select onchange="updateStatus('${o.id}', this.value)">
          <option ${d.orderStatus==='Pending'?'selected':''}>Pending</option>
          <option ${d.orderStatus==='Packed'?'selected':''}>Packed</option>
          <option ${d.orderStatus==='Shipped'?'selected':''}>Shipped</option>
          <option ${d.orderStatus==='Delivered'?'selected':''}>Delivered</option>
        </select>
        <button onclick="downloadInvoice('${o.id}')">Download Invoice</button>
      </div>
    `;
  });
});

window.updateStatus = async function(id, status){
  await updateDoc(doc(db, "orders", id), { orderStatus: status });
};

window.downloadInvoice = async function(id){
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if(!snap.exists()) return alert('Order not found');
    const order = snap.data();
    const m = await import('../js/invoice.js');
    m.generateInvoice(order);
  } catch(e){ console.error(e); alert('Download failed'); }
};
