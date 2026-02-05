import { db } from "../js/firebase.js";
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tbody = document.getElementById("customers");

async function loadCustomers() {

  const snap = await getDocs(collection(db, "users"));

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='3'>No customers found</td></tr>";
    return;
  }

  snap.forEach(doc => {
    const u = doc.data();

tbody.innerHTML += `
  <tr style="cursor:pointer"
      onclick="viewOrders('${doc.id}', '${u.email}')">
    <td>${u.email}</td>
    <td>${u.createdAt?.toDate
      ? u.createdAt.toDate().toLocaleDateString()
      : "—"}</td>
    <td>${u.emailVerified ? "Yes" : "No"}</td>
  </tr>
`;
  });
}

loadCustomers();
window.viewOrders = function (userId, email) {
  window.location =
    `customer-orders.html?uid=${userId}&email=${encodeURIComponent(email)}`;
};
