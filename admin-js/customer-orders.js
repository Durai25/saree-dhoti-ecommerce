import { db } from "../js/firebase.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ordersDiv = document.getElementById("orders");
const emailEl = document.getElementById("customerEmail");

// Get URL params
const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");
const email = params.get("email");

emailEl.innerHTML = `<strong>Customer:</strong> ${email}`;

async function loadOrders() {

  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    ordersDiv.innerHTML = "<p>No orders found.</p>";
    return;
  }

  snap.forEach(doc => {
    const o = doc.data();

    let productsHTML = "";
    o.items.forEach(item => {
      productsHTML += `
        <li>${item.name} – ₹${item.price}</li>
      `;
    });

    ordersDiv.innerHTML += `
      <div style="border:1px solid #ccc; padding:15px; margin-bottom:15px">
        <p><strong>Order ID:</strong> ${doc.id}</p>
        <p><strong>Date:</strong>
          ${o.createdAt?.toDate
            ? o.createdAt.toDate().toLocaleString()
            : ""}
        </p>

        <p><strong>Products:</strong></p>
        <ul>${productsHTML}</ul>

        <p><strong>Total:</strong> ₹${o.total}</p>

        <p><strong>Shipping Address:</strong><br>
          ${o.address?.name || ""}<br>
          ${o.address?.addressLine || ""}<br>
          ${o.address?.city || ""} – ${o.address?.pincode || ""}<br>
          📞 ${o.address?.phone || ""}
        </p>
      </div>
    `;
  });
}

loadOrders();
