import { db } from "../js/firebase.js";
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadDashboardSummary() {

  let totalSales = 0;
  let totalOrders = 0;
  let itemsSold = 0;
  let totalStock = 0;
  let totalCustomers = 0;

  // 🛍 Orders
  const ordersSnap = await getDocs(collection(db, "orders"));
  totalOrders = ordersSnap.size;

  ordersSnap.forEach(doc => {
    const order = doc.data();
    totalSales += Number(order.total || 0);

    if (Array.isArray(order.items)) {
      itemsSold += order.items.length;
    }
  });

  // 📦 Products (Stock)
  const productsSnap = await getDocs(collection(db, "products"));
  productsSnap.forEach(doc => {
    const p = doc.data();
    totalStock += Number(p.stock || 0);
  });

  // 👥 Customers
  const usersSnap = await getDocs(collection(db, "users"));
  totalCustomers = usersSnap.size;

  // 🔄 Update UI
  document.getElementById("totalSales").innerText = totalSales.toFixed(2);
  document.getElementById("totalOrders").innerText = totalOrders;
  document.getElementById("itemsSold").innerText = itemsSold;
  document.getElementById("totalCustomers").innerText = totalCustomers;
  document.getElementById("totalStock").innerText = totalStock;
}

// Load on page open
loadDashboardSummary();
