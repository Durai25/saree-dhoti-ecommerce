import { db } from "../js/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const GST_RATE = 5;

export async function loadAnalytics(){
  let revenue = 0;
  let gst = 0;
  let productCount = {};

  const snapshot = await getDocs(collection(db, "orders"));
  snapshot.forEach(doc => {
    const o = doc.data();
    revenue += o.total || 0;
    gst += (o.total || 0) * GST_RATE / 100;
    (o.items || []).forEach(p => {
      productCount[p.name] = (productCount[p.name] || 0) + 1;
    });
  });

  document.getElementById('revenue').innerText = revenue.toFixed(2);
  document.getElementById('ordersCount').innerText = snapshot.size;
  document.getElementById('gst').innerText = gst.toFixed(2);

  renderTopProducts(productCount);
}

function renderTopProducts(data){
  let sorted = Object.entries(data).sort((a,b)=>b[1]-a[1]);
  topProducts.innerHTML = "";
  sorted.slice(0,5).forEach(p => {
    topProducts.innerHTML += `<li>${p[0]} – ${p[1]} sold</li>`;
  });
}

// Run when loaded
loadAnalytics();
