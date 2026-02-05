import { db } from "./firebase.js";
import {
  collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const banner = document.getElementById("bannerContent");
let slides = [];
let index = 0;

async function loadBanner() {

  const q = query(
    collection(db, "products"),
    where("isFeatured", "==", true)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const p = doc.data();

    slides.push(`
      <div class="slide"
        style="background-image:url('${p.image}')">
        🔥 Best Seller<br>
        ${p.name}<br>
        ₹${p.price}
        ${p.discount ? `<br>${p.discount}% OFF` : ""}
      </div>
    `);
  });

  if (slides.length === 0) {
    banner.innerHTML = "No offers available";
    return;
  }

  banner.innerHTML = slides[0];
  setInterval(nextSlide, 4000);
}

function nextSlide() {
  index = (index + 1) % slides.length;
  banner.innerHTML = slides[index];
}

loadBanner();
