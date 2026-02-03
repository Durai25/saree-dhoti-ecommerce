import { db } from "../js/firebase.js";
import { collection, onSnapshot, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onSnapshot(collection(db, "orders"), snap => {
  orders.innerHTML = "";
  snap.forEach(o => {
    const d = o.data();
    const div = document.createElement('div');
    div.style.cssText = 'border:1px solid #ccc;padding:10px;margin-bottom:8px';
    
    const name = document.createElement('b');
    name.textContent = d.customerName || 'Unknown';
    
    const info = document.createElement('div');
    info.textContent = '₹' + (d.total || 0) + ' | ' + (d.phone || 'N/A');
    
    const payment = document.createElement('div');
    payment.textContent = 'Payment: ' + (d.paymentStatus || 'N/A');
    
    const statusLabel = document.createElement('div');
    statusLabel.textContent = 'Status: ' + (d.orderStatus || 'Pending');
    
    const select = document.createElement('select');
    ['Pending', 'Packed', 'Shipped', 'Delivered'].forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      opt.selected = (d.orderStatus === st);
      select.appendChild(opt);
    });
    select.onchange = (e) => updateStatus(o.id, e.target.value);
    
    const btn = document.createElement('button');
    btn.textContent = 'Download Invoice';
    btn.onclick = () => downloadInvoice(o.id);
    
    div.appendChild(name);
    div.appendChild(info);
    div.appendChild(payment);
    div.appendChild(statusLabel);
    div.appendChild(select);
    div.appendChild(btn);
    orders.appendChild(div);
  });
});

window.updateStatus = async function(id, status){
  try {
    await updateDoc(doc(db, "orders", id), { orderStatus: status });
  } catch(e) {
    console.error(e);
    alert('Failed to update status: ' + (e.message || 'Unknown error'));
  }
};

window.downloadInvoice = async function(id){
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if(!snap.exists()) return alert('Order not found');
    const order = snap.data();
    const m = await import('../js/invoice.js');
    m.generateInvoice(order);
  } catch(e){ 
    console.error(e); 
    alert('Download failed: ' + (e.message || 'Unknown error')); 
  }
};
